module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  const body = JSON.stringify(req.body || {});
  if (body.length > 200000) return res.status(413).json({ error: "too large" });
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY }, body }
  );
  res.status(r.status).setHeader("Content-Type", "application/json").send(await r.text());
};
