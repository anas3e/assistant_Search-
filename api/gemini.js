const MAX_BODY = 200000;
const TIMEOUT_MS = 55000;

async function callGemini(model, body, apiKey, signal) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body,
      signal,
    }
  );
}

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY غير موجود" });
  }

  const body = JSON.stringify(req.body || {});
  if (body.length > MAX_BODY) {
    return res.status(413).json({ error: "too large" });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let r;
    for (let attempt = 0; attempt < 2; attempt++) {
      r = await callGemini(model, body, apiKey, controller.signal);
      if (![429, 500, 503].includes(r.status)) break;
      await new Promise((ok) => setTimeout(ok, 1500));
    }
    const text = await r.text();
    res.status(r.status).setHeader("Content-Type", "application/json").send(text);
  } catch (e) {
    if (e.name === "AbortError") {
      return res.status(504).json({
        error: "انتهت مهلة Gemini. قلّل عدد الصفحات أو قسّم الطلب.",
      });
    }
    res.status(502).json({ error: "تعذّر الاتصال بـ Gemini" });
  } finally {
    clearTimeout(timer);
  }
};

handler.config = { maxDuration: 60 };
module.exports = handler;