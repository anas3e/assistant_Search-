module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const q = String((req.body && req.body.q) || "").slice(0, 250);
  if (!q) return res.status(400).json({ error: "q" });
  const u = new URL("https://api.openalex.org/works");
  u.searchParams.set("search", q);
  u.searchParams.set("per-page", "20");
  u.searchParams.set("select", "title,display_name,publication_year,doi,authorships,primary_location,abstract_inverted_index");
  u.searchParams.set("api_key", process.env.OPENALEX_API_KEY);
  const r = await fetch(u);
  res.status(r.status).setHeader("Content-Type", "application/json").send(await r.text());
};
