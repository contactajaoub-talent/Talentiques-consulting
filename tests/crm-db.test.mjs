// Isolated PostgreSQL validation. No production connection and no app dependency.
// Set CRM_PGLITE_PATH to the temporary @electric-sql/pglite package directory.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

test(
  "CRM migration and real PostgreSQL authorization / transaction boundaries",
  { skip: !process.env.CRM_PGLITE_PATH },
  async (t) => {
    const root = process.env.CRM_PGLITE_PATH;
    const { PGlite } = await import(
      pathToFileURL(path.join(root, "dist/index.js")).href
    );
    const { pgcrypto } = await import(
      pathToFileURL(path.join(root, "dist/contrib/pgcrypto.js")).href
    );
    const db = new PGlite({ extensions: { pgcrypto } });
    const admin = randomUUID(),
      sales = randomUUID(),
      worker = randomUUID(),
      other = randomUUID();
    const q = async (sql, params = []) => (await db.query(sql, params)).rows;
    const privileged = async () =>
      db.exec("reset role; reset request.jwt.claim.sub;");
    const as = async (user) => {
      await db.exec("reset role");
      await q("select set_config('request.jwt.claim.sub',$1,false)", [user]);
      await db.exec("set role authenticated");
    };
    const action = async (name, id, data = {}) =>
      (
        await q("select crm_action($1,$2,$3::jsonb) as value", [
          name,
          id,
          JSON.stringify(data),
        ])
      )[0].value;
    let requestId, secondRequest, orderId, caseId, proposalId;
    try {
      await db.exec(
        `create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon,service_role; grant execute on function auth.uid() to authenticated,anon,service_role; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;`,
      );
      await db.exec(
        await fs.readFile(
          new URL("../supabase/service_orders.sql", import.meta.url),
          "utf8",
        ),
      );
      await t.test(
        "additive migration applies atomically on PostgreSQL",
        async () => {
          await db.exec(
            await fs.readFile(
              new URL(
                "../supabase/migrations/202610280001_crm_v1.sql",
                import.meta.url,
              ),
              "utf8",
            ),
          );
        },
      );
      for (const [id, name, role] of [
        [admin, "Admin", "admin"],
        [sales, "Commercial", "sales"],
        [worker, "Production", "production"],
        [other, "Other", "production"],
      ]) {
        await q("insert into auth.users values($1)", [id]);
        await q("insert into crm_members(user_id,name,role) values($1,$2,$3)", [
          id,
          name,
          role,
        ]);
      }
      async function intake(kind, email) {
        const upload = randomUUID();
        await q(
          "insert into crm_uploads(id,token_hash,path,payload) values($1,$2,$3,$4)",
          [
            upload,
            upload,
            upload + "/cv.pdf",
            JSON.stringify({
              name: "Candidate",
              email,
              phone: "",
              linkedin: "",
              kind,
              service_id: kind === "service" ? "professional-profile" : null,
              market: "fr",
              current_status: "En poste",
              objective: "Objectif de carrière",
              markets: ["France"],
              notes: "",
              privacy: true,
              marketing: false,
              filename: "cv.pdf",
              mime: "application/pdf",
              size: 200,
              consent_version: "test",
            }),
          ],
        );
        return (
          await q(
            "select crm_commit_intake($1,$2,now()+interval '3 hours',$3) as v",
            [upload, upload, "checkout-hash"],
          )
        )[0].v;
      }
      await t.test(
        "intake atomically records contact, private document, consent, task, receipt and pending order",
        async () => {
          const result = await intake("service", "test@example.com");
          requestId = result.requestId;
          orderId = result.orderId;
          secondRequest = (await intake("diagnostic", "test@example.com"))
            .requestId;
          assert.equal(
            (await q("select count(*)::int as n from crm_contacts"))[0].n,
            1,
          );
          assert.equal(
            (await q("select count(*)::int as n from crm_cases"))[0].n,
            0,
          );
          assert.equal(
            (await q("select public from storage.buckets"))[0].public,
            false,
          );
          assert.equal(
            (await q("select count(*)::int as n from crm_consents"))[0].n,
            2,
          );
        },
      );
      await t.test(
        "anonymous users cannot read PII or call internal workflows",
        async () => {
          await db.exec("set role anon");
          await assert.rejects(q("select * from crm_contacts"));
          await assert.rejects(
            q("select crm_confirm_payment($1,$2,$3)", [
              orderId,
              "bad",
              "capture",
            ]),
          );
          await privileged();
        },
      );
      await t.test(
        "private storage fence blocks legacy permissive policies without changing other buckets",
        async () => {
          await db.exec(
            "grant usage on schema storage to authenticated; grant select on storage.objects to authenticated; create policy legacy_all_files on storage.objects for select to authenticated using(true); insert into storage.objects(bucket_id,name) values('crm-documents','cv.pdf'),('existing-public-bucket','logo.svg');",
          );
          await as(sales);
          const files = await q("select name from storage.objects");
          assert.deepEqual(
            files.map((f) => f.name),
            ["logo.svg"],
          );
          await privileged();
        },
      );
      await t.test(
        "unassigned members cannot read or mutate guessed request ids",
        async () => {
          await as(sales);
          assert.equal((await q("select * from crm_requests")).length, 0);
          await assert.rejects(
            action("request_save", requestId, { status: "analyzing" }),
          );
          await assert.rejects(q("update crm_members set role='admin'"));
          await privileged();
        },
      );
      await t.test(
        "admin assigns diagnostic; commercial sees only authorized record and contact",
        async () => {
          await as(admin);
          await action("request_save", requestId, {
            owner_id: sales,
            status: "assigned",
          });
          await as(sales);
          assert.equal((await q("select * from crm_requests")).length, 1);
          assert.equal((await q("select * from crm_contacts")).length, 1);
          await assert.rejects(
            action("request_save", secondRequest, { status: "closed" }),
          );
          await privileged();
        },
      );
      await t.test(
        "report requires PDF approval; production/commercial cannot approve; no generic proposal is generated",
        async () => {
          await as(sales);
          await action("report_save", requestId, {
            text: "Human controlled report",
          });
          await assert.rejects(action("report_send", requestId));
          await assert.rejects(action("report_approve", requestId));
          await privileged();
          await q(
            "insert into crm_documents(request_id,kind,name,path,mime,size) values($1,'report','report.pdf','report-test.pdf','application/pdf',200)",
            [requestId],
          );
          await as(admin);
          await action("report_approve", requestId);
          await action("report_send", requestId);
          await action("report_send", requestId);
          await privileged();
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_outbox where category='report'",
              )
            )[0].n,
            1,
          );
          assert.equal(
            (await q("select count(*)::int as n from crm_proposals"))[0].n,
            0,
          );
        },
      );
      await t.test(
        "provider acceptance advances report and creates one commercial task",
        async () => {
          const id = (
            await q("select id from crm_outbox where category='report'")
          )[0].id;
          await q(
            "select crm_finish_message($1,'accepted','provider-id',null)",
            [id],
          );
          await q(
            "select crm_finish_message($1,'accepted','provider-id',null)",
            [id],
          );
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_tasks where dedupe_key like 'proposal:%'",
              )
            )[0].n,
            1,
          );
          assert.equal(
            (
              await q("select status from crm_requests where id=$1", [
                requestId,
              ])
            )[0].status,
            "report_sent",
          );
        },
      );
      await t.test(
        "custom proposal cannot be approved by sales; student eligibility is mandatory",
        async () => {
          await as(sales);
          proposalId = (
            await action("proposal_create", requestId, {
              service_id: "student-jobseeker",
              amount: 30,
              currency: "EUR",
              inclusions: "Deliverables",
              message: "Personalized proposal",
              conditions: "Conditions",
              student_evidence: "",
              reminder_opt_in: true,
            })
          ).id;
          await assert.rejects(action("proposal_approve", proposalId));
          await as(admin);
          await assert.rejects(action("proposal_approve", proposalId));
          await privileged();
          await q(
            "update crm_proposals set student_evidence='Verified student card' where id=$1",
            [proposalId],
          );
          await as(admin);
          await action("proposal_approve", proposalId);
          await action("proposal_send", proposalId, {
            site_url: "https://attacker.example",
          });
          await privileged();
          const mail = (
            await q("select body from crm_outbox where category='proposal'")
          )[0].body;
          assert.match(mail, /https:\/\/talentiques.com\/paiement-service/);
          assert.doesNotMatch(mail, /attacker/);
        },
      );
      await t.test(
        "confirmed payment creates exactly one case and five tasks across duplicate and distinct events",
        async () => {
          for (const event of ["capture:one", "capture:one", "webhook:two"])
            caseId = (
              await q("select crm_confirm_payment($1,$2,$3) as id", [
                orderId,
                event,
                "capture-one",
              ])
            )[0].id;
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_cases where order_id=$1",
                [orderId],
              )
            )[0].n,
            1,
          );
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_tasks where case_id=$1",
                [caseId],
              )
            )[0].n,
            5,
          );
          assert.equal(
            (
              await q("select status from service_orders where id=$1", [
                orderId,
              ])
            )[0].status,
            "paid",
          );
        },
      );
      await t.test(
        "production sees assigned context and private CV only, without prices or other clients",
        async () => {
          await as(admin);
          await action("case_save", caseId, {
            owner_id: worker,
            status: "missing_info",
          });
          await as(worker);
          assert.equal((await q("select * from crm_cases")).length, 1);
          assert.equal((await q("select * from service_orders")).length, 0);
          assert.equal((await q("select * from crm_proposals")).length, 0);
          assert.equal((await q("select * from crm_requests")).length, 0);
          assert.equal(
            (await q("select * from crm_documents where kind='cv'")).length,
            1,
          );
          const ctx = (await q("select crm_case_context($1) as v", [caseId]))[0]
            .v;
          assert.equal(ctx.objective, "Objectif de carrière");
          assert.equal(ctx.amount, undefined);
          await as(other);
          assert.equal((await q("select * from crm_cases")).length, 0);
          assert.equal((await q("select * from crm_documents")).length, 0);
          assert.equal(
            (await q("select crm_case_context($1) as v", [caseId]))[0].v,
            null,
          );
          await privileged();
        },
      );
      await t.test(
        "quality gate rejects incomplete delivery and requires admin approval of all deliverables",
        async () => {
          await as(worker);
          await assert.rejects(action("case_submit", caseId));
          await assert.rejects(
            action("case_ready", caseId, { due_at: new Date().toISOString() }),
          );
          await as(admin);
          await action("case_ready", caseId, {
            due_at: new Date(Date.now() + 86400000).toISOString(),
          });
          await privileged();
          for (const kind of [
            "cv_word",
            "cv_pdf",
            "letter",
            "linkedin",
            "tracker",
          ])
            await q(
              "insert into crm_documents(request_id,case_id,kind,name,path,mime,size) values($1,$2,$3,$3,$4,'application/pdf',200)",
              [requestId, caseId, kind, "delivery/" + kind],
            );
          await as(worker);
          await action("case_submit", caseId);
          await assert.rejects(action("case_approve", caseId));
          await assert.rejects(action("case_deliver", caseId));
          await as(admin);
          await action("case_approve", caseId);
          await action("case_deliver", caseId);
          await action("case_deliver", caseId);
          await privileged();
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_outbox where category='delivery'",
              )
            )[0].n,
            1,
          );
        },
      );
      await t.test(
        "failed sends do not mark a case delivered; manual sends require a real reference",
        async () => {
          const mail = (
            await q("select id from crm_outbox where category='delivery'")
          )[0].id;
          await q("select crm_finish_message($1,'failed',null,'error')", [
            mail,
          ]);
          assert.equal(
            (
              await q("select delivered_at from crm_cases where id=$1", [
                caseId,
              ])
            )[0].delivered_at,
            null,
          );
          await as(admin);
          await assert.rejects(
            action("message_manual", mail, { reference: "short" }),
          );
          await action("message_manual", mail, {
            reference: "Actual mail reference 12345",
          });
          await privileged();
          assert.equal(
            (await q("select status from crm_cases where id=$1", [caseId]))[0]
              .status,
            "completed",
          );
        },
      );
      await t.test(
        "reminders respect consent and cease after payment/refusal; sweeps do not duplicate alerts",
        async () => {
          await q("select crm_sweep()");
          await q("select crm_sweep()");
          const dup = await q(
            "select dedupe_key,count(*) from crm_notifications group by dedupe_key having count(*)>1",
          );
          assert.equal(dup.length, 0);
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_outbox where category='reminder'",
              )
            )[0].n,
            0,
          );
        },
      );
      await t.test(
        "scheduled reminders require per-request marketing consent, deduplicate, and cancel on payment; student production requires eligibility evidence",
        async () => {
          await privileged();
          const p = (
            await q(
              "insert into crm_proposals(request_id,service_id,amount,currency,inclusions,message,conditions,status,sent_at,reminder_opt_in) values($1,'student-jobseeker',35,'EUR','Services','Message','Conditions','proposal_sent',now()-interval '5 days',true) returning id",
              [secondRequest],
            )
          )[0].id;
          await q("select crm_sweep()");
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_outbox where category='reminder' and proposal_id=$1",
                [p],
              )
            )[0].n,
            0,
          );
          await q(
            "update crm_consents set marketing=true where request_id=$1",
            [secondRequest],
          );
          await q("select crm_sweep()");
          await q("select crm_sweep()");
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_outbox where category='reminder' and proposal_id=$1",
                [p],
              )
            )[0].n,
            1,
          );
          const o = (
            await q(
              "insert into service_orders(service_id,market,service_name,amount,currency,crm_request_id,crm_proposal_id) values('student-jobseeker','fr','Student',35,'EUR',$1,$2) returning id",
              [secondRequest, p],
            )
          )[0].id;
          const c = (
            await q(
              "select crm_confirm_payment($1,'student-payment','capture-student') as id",
              [o],
            )
          )[0].id;
          assert.equal(
            (
              await q(
                "select status from crm_outbox where category='reminder' and proposal_id=$1",
                [p],
              )
            )[0].status,
            "cancelled",
          );
          await as(admin);
          await assert.rejects(
            action("case_ready", c, { due_at: new Date().toISOString() }),
          );
          await action("case_ready", c, {
            due_at: new Date(Date.now() + 86400000).toISOString(),
            student_evidence: "Verified student card reference",
          });
          await privileged();
        },
      );
      await t.test(
        "completed cases reopen for corrections with a new delivery revision and a fresh quality gate",
        async () => {
          await as(admin);
          await action("case_reopen", caseId);
          await privileged();
          const item = (
            await q(
              "select status,revision,approved_at from crm_cases where id=$1",
              [caseId],
            )
          )[0];
          assert.equal(item.status, "corrections");
          assert.equal(item.revision, 2);
          assert.equal(item.approved_at, null);
          await as(admin);
          await assert.rejects(action("case_deliver", caseId));
          await privileged();
        },
      );
      await t.test(
        "outbox claims never overlap and ambiguous sends older than the provider idempotency window require manual reconciliation",
        async () => {
          await privileged();
          const first = await q("select id from crm_claim_messages()"),
            second = await q("select id from crm_claim_messages()");
          assert.equal(
            first.some((a) => second.some((b) => a.id === b.id)),
            false,
          );
          if (first.length) {
            await q(
              "update crm_outbox set status='failed',locked_at=now()-interval '25 hours' where id=$1",
              [first[0].id],
            );
            await q("select * from crm_claim_messages()");
            assert.equal(
              (
                await q("select status from crm_outbox where id=$1", [
                  first[0].id,
                ])
              )[0].status,
              "manual",
            );
          }
        },
      );
      await t.test(
        "global marketing withdrawal preserves historical consent evidence and stops reminders",
        async () => {
          await privileged();
          const contact = (
            await q("select contact_id from crm_requests where id=$1", [
              requestId,
            ])
          )[0].contact_id;
          await as(sales);
          await action("contact_optout", contact);
          assert.equal((await q("select * from crm_members")).length, 1);
          await privileged();
          assert.ok(
            (
              await q(
                "select marketing_opted_out_at from crm_contacts where id=$1",
                [contact],
              )
            )[0].marketing_opted_out_at,
          );
          assert.equal(
            (
              await q(
                "select marketing from crm_consents where request_id=$1",
                [secondRequest],
              )
            )[0].marketing,
            true,
          );
          await q("select crm_sweep()");
          assert.equal(
            (
              await q(
                "select count(*)::int as n from crm_outbox where category='reminder' and status in ('queued','failed','manual')",
              )
            )[0].n,
            0,
          );
        },
      );
      await t.test(
        "member revocation invalidates existing user sessions at RLS boundary",
        async () => {
          await as(admin);
          await action("member_save", worker, {
            name: "Production",
            role: "production",
            active: false,
          });
          await as(worker);
          assert.equal((await q("select * from crm_cases")).length, 0);
          await assert.rejects(action("case_submit", caseId));
          await privileged();
        },
      );
      await t.test(
        "refund is idempotent, cancels production and cannot be followed by a paid replay",
        async () => {
          await q("select crm_refund_payment($1,$2)", [
            "capture-one",
            "refund-event",
          ]);
          await q("select crm_refund_payment($1,$2)", [
            "capture-one",
            "refund-event",
          ]);
          assert.equal(
            (await q("select status from crm_cases where id=$1", [caseId]))[0]
              .status,
            "cancelled",
          );
          await assert.rejects(
            q("select crm_confirm_payment($1,$2,$3)", [
              orderId,
              "capture:replay",
              "capture-one",
            ]),
          );
        },
      );
    } finally {
      await db.close();
    }
  },
);
