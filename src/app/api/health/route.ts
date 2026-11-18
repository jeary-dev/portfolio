import { connection } from "next/server";

/** Liveness check for Docker's healthcheck and `make status`. Never cached. */
export async function GET() {
  await connection();
  return Response.json(
    {
      status: "ok",
      version: process.env.APP_VERSION || "dev",
      uptime: Math.round(process.uptime()),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
