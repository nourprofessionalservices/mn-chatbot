import fs from "fs";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBED_MODEL = process.env.EMBED_MODEL || "text-embedding-3-small";
const urls = (process.env.SITE_URLS || "").split(",").map(s => s.trim()).filter(Boolean);

function cleanText(html) {
  const $ = cheerio.load(html);
  $("script,style,noscript,svg,iframe").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

function chunk(text, size = 900, overlap = 120) {
  const words = text.split(" ");
  const out = [];
  for (let i = 0; i < words.length; i += (size - overlap)) {
    const part = words.slice(i, i + size).join(" ").trim();
    if (part.length > 100) out.push(part);
  }
  return out;
}

async function embedBatch(texts) {
  const res = await openai.embeddings.create({ model: EMBED_MODEL, input: texts });
  return res.data.map(d => d.embedding);
}

(async () => {
  if (!urls.length) { console.error("No SITE_URLS provided"); process.exit(1); }
  const store = [];
  for (const url of urls) {
    const html = await (await fetch(url)).text();
    const parts = chunk(cleanText(html));
    const vectors = parts.length ? await embedBatch(parts) : [];
    parts.forEach((content, i) => store.push({ id: `${url}#${i}`, url, content, embedding: vectors[i] }));
    console.log(`Indexed ${url} → ${parts.length} chunks`);
  }
  fs.writeFileSync("store.json", JSON.stringify(store));
  console.log("Saved store.json");
})();
