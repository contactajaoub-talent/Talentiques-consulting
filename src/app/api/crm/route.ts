import { NextResponse } from "next/server";
import { requireSession } from "@/lib/crm/auth";
import {
  addBusinessHours,
  CrmError,
  text,
  uuid,
  validateHours,
  type BusinessHours,
} from "@/lib/crm/core";
import { rows, rpc } from "@/lib/crm/db";
import { failure, json, sameOrigin } from "@/lib/crm/http";
import { businessHours } from "@/lib/crm/uploads";

export async function GET(request: Request) {
  try {
    const { token, member } = await requireSession(),
      p = new URL(request.url).searchParams;
    const section = p.get("section") || "dashboard",
      id = p.get("id");
    const page = Math.min(10000, Math.max(0, Number(p.get("page")) || 0)),
      search = text(p.get("search"), 100).replace(/[^\p{L}\p{N}@ ._-]/gu, ""),
      status = text(p.get("status"), 40).replace(/[^a-z_]/g, "");
    const paging = `&order=created_at.desc&limit=26&offset=${page * 25}`;
    let data: unknown;
    if (section === "search") {
      data = await rpc("crm_search", { p_query: search }, token);
    } else if (section === "dashboard") {
      const from =
          p.get("from") || new Date(Date.now() - 30 * 86400000).toISOString(),
        to = p.get("to") || new Date().toISOString();
      if (
        !Number.isFinite(Date.parse(from)) ||
        !Number.isFinite(Date.parse(to))
      )
        throw new CrmError("Période invalide.");
      const [metrics, tasks, activity, notifications] = await Promise.all([
        rpc("crm_dashboard", { p_from: from, p_to: to }, token),
        rows(
          "crm_tasks",
          `status=eq.open&or=(due_at.lte.${encodeURIComponent(`${new Date().toISOString().slice(0, 10)}T23:59:59.999Z`)},due_at.is.null)&order=due_at.asc.nullslast&limit=12`,
          token,
        ),
        rows("crm_activity_logs", "order=created_at.desc&limit=12", token),
        rows(
          "crm_notifications",
          "read_at=is.null&order=created_at.desc&limit=12",
          token,
        ),
      ]);
      data = { metrics, tasks, activity, notifications };
    } else if (section === "requests") {
      let filter = "";
      if (search) {
        const contacts = await rows(
          "crm_contacts",
          `select=id&or=(name.ilike.${encodeURIComponent(`*${search}*`)},email.ilike.${encodeURIComponent(`*${search}*`)})&limit=100`,
          token,
        );
        const contactIds = contacts.map((c: { id: string }) => c.id);
        filter = `or=(objective.ilike.${encodeURIComponent(`*${search}*`)}${contactIds.length ? `,contact_id.in.(${contactIds.join(",")})` : ""})&`;
      }
      data = id
        ? await detail(uuid(id), token, member.role)
        : await rows(
            "crm_requests",
            `select=*,contact:crm_contacts(id,name,email)&${status ? `status=eq.${status}&` : ""}${filter}id=not.is.null${paging}`,
            token,
          );
    } else if (section === "cases") {
      if (id) {
        const item = await rpc("crm_case_context", { p_id: uuid(id) }, token);
        if (!item) throw new CrmError("Dossier inaccessible.", 404);
        const [documents, tasks, activity] = await Promise.all([
          rows(
            "crm_documents",
            `request_id=eq.${item.request_id}&deleted_at=is.null&order=created_at.desc&limit=100`,
            token,
          ),
          rows(
            "crm_tasks",
            `case_id=eq.${id}&order=created_at.asc&limit=50`,
            token,
          ),
          rows(
            "crm_activity_logs",
            `case_id=eq.${id}&order=created_at.desc&limit=50`,
            token,
          ),
        ]);
        data = { item, documents, tasks, activity };
      } else
        data = await rpc(
          "crm_case_summaries",
          { p_offset: page * 25, p_search: search, p_status: status },
          token,
        );
    } else if (section === "sales") {
      if (member.role === "production")
        throw new CrmError("Accès refusé.", 403);
      const [proposals, orders] = await Promise.all([
        rows(
          "crm_proposals",
          `select=*,request:crm_requests(id,contact:crm_contacts(name,email))${status ? `&status=eq.${status}` : ""}${paging}`,
          token,
        ),
        rows(
          "service_orders",
          `select=id,service_name,amount,currency,status,customer_name,crm_request_id,paid_at,created_at&crm_request_id=not.is.null${paging}`,
          token,
        ),
      ]);
      data = { proposals, orders };
    } else if (section === "communications") {
      if (member.role === "production")
        throw new CrmError("Accès refusé.", 403);
      data = await rows(
        "crm_outbox",
        `select=*${status ? `&status=eq.${status}` : ""}${paging}`,
        token,
      );
    } else if (section === "contact") {
      const contactId = uuid(id);
      const contacts = await rows(
        "crm_contacts",
        `id=eq.${contactId}&limit=1`,
        token,
      );
      if (!contacts[0]) throw new CrmError("Contact inaccessible.", 404);
      const requests = await rows(
        "crm_requests",
        `contact_id=eq.${contactId}&order=created_at.desc&limit=50`,
        token,
      );
      const cases = await rpc(
        "crm_case_summaries",
        { p_contact: contactId },
        token,
      );
      const requestIds = [
        ...new Set([
          ...requests.map((r: { id: string }) => r.id),
          ...cases.map((c: { request_id: string }) => c.request_id),
        ]),
      ];
      const filter = `request_id=in.(${requestIds.join(",")})`;
      const [proposals, documents, activity] = requestIds.length
        ? await Promise.all([
            member.role !== "production"
              ? rows(
                  "crm_proposals",
                  `${filter}&order=created_at.desc&limit=50`,
                  token,
                )
              : [],
            rows(
              "crm_documents",
              `${filter}&deleted_at=is.null&limit=100`,
              token,
            ),
            rows(
              "crm_activity_logs",
              `${filter}&order=created_at.desc&limit=50`,
              token,
            ),
          ])
        : [[], [], []];
      data = {
        contact: contacts[0],
        requests,
        cases,
        proposals,
        documents,
        activity,
      };
    } else if (section === "settings") {
      if (member.role !== "admin") throw new CrmError("Accès refusé.", 403);
      data = {
        settings: await businessHours(),
        integrations: {
          supabase: true,
          email: Boolean(
            process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL,
          ),
          paypal: Boolean(
            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
            process.env.PAYPAL_CLIENT_SECRET &&
            process.env.PAYPAL_MERCHANT_ID,
          ),
          scheduler: Boolean(process.env.CRON_SECRET),
        },
      };
    } else throw new CrmError("Section inconnue.", 404);
    const members = await rows(
      "crm_members",
      "select=user_id,name,role,active&order=name&limit=100",
      token,
    );
    return NextResponse.json(
      { data, members },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
async function detail(id: string, token: string, role: string) {
  const item = (
    await rows(
      "crm_requests",
      `select=*,contact:crm_contacts(id,name,email,phone,linkedin)&id=eq.${id}&limit=1`,
      token,
    )
  )[0];
  if (!item) throw new CrmError("Demande inaccessible.", 404);
  const [documents, activity, proposals] = await Promise.all([
    rows(
      "crm_documents",
      `request_id=eq.${id}&deleted_at=is.null&order=created_at.desc&limit=100`,
      token,
    ),
    rows(
      "crm_activity_logs",
      `request_id=eq.${id}&order=created_at.desc&limit=50`,
      token,
    ),
    role !== "production"
      ? rows(
          "crm_proposals",
          `request_id=eq.${id}&order=created_at.desc&limit=50`,
          token,
        )
      : [],
  ]);
  return { item, documents, activity, proposals };
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const current = await requireSession(),
      body = await json(request, 30000);
    const action = text(body.action, 50),
      id = body.id ? uuid(body.id) : null;
    let data =
      body.data && typeof body.data === "object" && !Array.isArray(body.data)
        ? (body.data as Record<string, unknown>)
        : {};
    if (action === "settings_save")
      data = validateHours(
        data as unknown as BusinessHours,
      ) as unknown as Record<string, unknown>;
    if (action === "case_ready") {
      const settings = await businessHours();
      data = {
        ...data,
        due_at: addBusinessHours(
          new Date(),
          settings.production_hours,
          settings,
        ).toISOString(),
      };
    }
    return NextResponse.json(
      await rpc(
        "crm_action",
        { p_action: action, p_id: id, p_data: data },
        current.token,
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
