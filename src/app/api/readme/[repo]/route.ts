import { getReadme } from "@/lib/github";

const VALID_REPO = /^[A-Za-z0-9._-]{1,100}$/;

/** GET /api/readme/:repo → the repo's rendered README (cached via `getReadme`). */
export async function GET(_req: Request, { params }: { params: Promise<{ repo: string }> }) {
  const { repo } = await params;
  if (!VALID_REPO.test(repo)) {
    return Response.json({ status: "not-found" }, { status: 404 });
  }

  const result = await getReadme(repo);
  const code = result.status === "ok" || result.status === "missing" ? 200 : result.status === "not-found" ? 404 : 502;
  return Response.json(result, {
    status: code,
    headers: code === 200 ? { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } : {},
  });
}
