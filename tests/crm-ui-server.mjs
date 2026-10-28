// Local visual-test fixture only. Never a production backend; no payment, mail or storage emulation.
// Uses an empty, isolated PostgreSQL database with one synthetic admin.
import { createServer } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
if (!process.env.CRM_PGLITE_PATH)
  throw new Error("CRM_PGLITE_PATH is required");
const root = process.env.CRM_PGLITE_PATH;
const { PGlite } = await import(
  pathToFileURL(path.join(root, "dist/index.js")).href
);
const { pgcrypto } = await import(
  pathToFileURL(path.join(root, "dist/contrib/pgcrypto.js")).href
);
const db = new PGlite({ extensions: { pgcrypto } }),
  uid = "10000000-0000-4000-8000-000000000001";
await db.exec(
  `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text); alter table storage.objects enable row level security;`,
);
await db.exec(
  await fs.readFile(
    new URL("../supabase/service_orders.sql", import.meta.url),
    "utf8",
  ),
);
await db.exec(
  await fs.readFile(
    new URL("../supabase/migrations/202610280001_crm_v1.sql", import.meta.url),
    "utf8",
  ),
);
await db.query("insert into auth.users values($1)", [uid]);
await db.query(
  "insert into crm_members(user_id,name,role) values($1,'Équipe locale de validation','admin')",
  [uid],
);
let chain = Promise.resolve();
createServer((req, res) => {
  chain = chain.then(async () => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      let body = "";
      for await (const chunk of req) body += chunk;
      const data = body ? JSON.parse(body) : {};
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      if (url.pathname === "/auth/v1/token") {
        res.end(JSON.stringify({ access_token: "local-visual-session" }));
        return;
      }
      if (url.pathname === "/auth/v1/user") {
        res.end(JSON.stringify({ id: uid }));
        return;
      }
      if (url.pathname === "/auth/v1/logout") {
        res.statusCode = 204;
        res.end();
        return;
      }
      await db.exec("reset role");
      if (req.headers.authorization === "Bearer local-visual-session") {
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
          uid,
        ]);
        await db.exec("set role authenticated");
      }
      if (url.pathname.startsWith("/rest/v1/rpc/")) {
        const name = url.pathname.split("/").pop();
        if (!/^crm_[a-z_]+$/.test(name)) throw new Error("Invalid RPC");
        const keys = Object.keys(data);
        if (keys.some((k) => !/^p_[a-z_]+$/.test(k)))
          throw new Error("Invalid parameter");
        const params = keys.map((k) =>
          typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k],
        );
        const rows = (
          await db.query(
            `select ${name}(${keys.map((k, i) => `${k}=>$${i + 1}`).join(",")}) as value`,
            params,
          )
        ).rows;
        res.end(JSON.stringify(rows[0]?.value ?? null));
        return;
      }
      const table = url.pathname.split("/").pop();
      if (!/^(crm_[a-z_]+|service_orders)$/.test(table) || req.method !== "GET")
        throw new Error("Not implemented in local visual fixture");
      // Empty application tables require no embedded relation rendering. Membership/config use normal SQL.
      const result = await db.query(`select * from ${table} limit 100`);
      res.end(JSON.stringify(result.rows));
    } catch {
      res.statusCode = 503;
      res.end(
        JSON.stringify({
          message: "Local visual fixture does not implement this operation.",
        }),
      );
    }
  });
}).listen(3199, "127.0.0.1", () =>
  console.log(
    "Isolated visual-test PostgreSQL fixture: http://127.0.0.1:3199 (no external providers)",
  ),
);
