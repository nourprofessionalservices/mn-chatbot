import express from "express";
import cors from "cors";
import fs from "fs";
import OpenAI from "openai";

const app = express();
app.use(cors({ origin: true })); // tighten later to your domain
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.MODEL || "gpt-4o-mini";
const EMBED_MODEL = process.env.EMBED_MODEL || "text-embedding-3-small";
const WHATSAPP_URL = process.env.WHATSAPP_URL;
const INTAKE_URL = process.env.INTAKE_URL;

const store = fs.existsSync("store.json") ? JSON.parse(fs.readFileSync("store.json", "utf-8")) : [];

function cosSim(a,b){ let dot=0, na=0, nb=0; for (let i=0;i<a.length;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; } return dot/(Math.sqrt(na)*Math.sqrt(nb)); }

async function retrieve(query, k=5) {
  if (!store.length) return { context: "", citations: [] };
  const q = await openai.embeddings.create({ model: EMBED_MODEL, input: query });
  const qvec = q.data[0].embedding;
  const scored = store.map(r => ({...r, score: cosSim(qvec, r.embedding)})).sort((x,y)=>y.score-x.score).slice(0,k);
  const context = scored.map(r => `Source: ${r.url}\n${r.content}`).join("\n---\n").slice(0, 6000);
  const citations = [...new Set(scored.map(r => r.url))].slice(0,3);
  return { context, citations };
}

const SYSTEM = (wa, intake) => `
You are a concise assistant for a GTA creative director (Mo).
Answer ONLY from the provided context. If info isn't present, say you're not sure and route to contact.
Style: friendly, brief, confident (<=120 words).
Always end with:
- WhatsApp: ${wa}
- Intake form: ${intake}
If helpful, include up to 3 "Learn more" links from the site sources.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const user = (req.body?.message || "").slice(0, 2000);
    const { context, citations } = await retrieve(user);
    const messages = [
      { role: "system", content: SYSTEM(WHATSAPP_URL, INTAKE_URL) },
      { role: "user", content:
`User question: ${user}

===== REFERENCE CONTEXT (from site) =====
${context}

Instructions:
- Be factual and only use info from the context.
- If pricing/offer isn't explicit, propose WhatsApp or Intake form for a tailored quote.
- End with both links.
- Optionally include "Learn more" links: ${citations.join(", ")}
` }
    ];
    const completion = await openai.chat.completions.create({ model: MODEL, messages, temperature: 0.4 });
    const reply = completion.choices?.[0]?.message?.content?.trim()
      || `I can help over WhatsApp (${WHATSAPP_URL}) or via the intake form (${INTAKE_URL}).`;
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ reply: `Something went wrong. Message me on WhatsApp (${WHATSAPP_URL}) or use the intake form (${INTAKE_URL}).` });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Chat API on :" + port));
