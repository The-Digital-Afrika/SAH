export type WordPressCacheValue = { cacheable: true; value: unknown } | { cacheable: false };
const MAX_CACHE_BYTES = 1_900_000;

export function compactWordPressPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(compactWordPressPayload);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const compact = Object.fromEntries(Object.entries(record)
    .filter(([key]) => !["_links", "guid", "image_meta"].includes(key) && !key.startsWith("aioseo_") && !key.startsWith("yoast_head"))
    .map(([key, field]) => [key, compactWordPressPayload(field)]));
  // Magazine covers use these two SEO fields; retain them without caching the full schema graph.
  const images = record.aioseo_head_json && typeof record.aioseo_head_json === "object"
    ? record.aioseo_head_json as Record<string, unknown> : {};
  const coverMetadata: Record<string, string> = {};
  for (const key of ["twitter:image", "og:image"]) {
    if (typeof images[key] === "string") coverMetadata[key] = images[key];
    else if (typeof record.aioseo_head === "string") {
      const tag = record.aioseo_head.match(new RegExp(`<meta\\b[^>]*(?:name|property)=["']${key}["'][^>]*>`, "i"))?.[0];
      const content = tag?.match(/content=["']([^"']+)["']/i)?.[1];
      if (content) coverMetadata[key] = content;
    }
  }
  if (Object.keys(coverMetadata).length) compact.aioseo_head_json = coverMetadata;
  return compact;
}

export function prepareWordPressCacheValue(raw: unknown): WordPressCacheValue {
  const result: WordPressCacheValue = { cacheable: true, value: compactWordPressPayload(raw) };
  // Next caches a JSON string inside a JSON record. Count escaping and UTF-8 bytes too.
  const serialized = JSON.stringify({ kind: "FETCH", data: { body: JSON.stringify(result) } });
  return new TextEncoder().encode(serialized).byteLength <= MAX_CACHE_BYTES ? result : { cacheable: false };
}

export async function resolveWordPressCacheValue(cached: WordPressCacheValue, loadUncached: () => Promise<unknown>) {
  return cached.cacheable ? cached.value : compactWordPressPayload(await loadUncached());
}
