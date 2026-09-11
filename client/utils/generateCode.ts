// utils/generateCode.ts

// Looks at existing codes (e.g. "CUS004"), picks the highest numeric suffix,
// and suggests the next one using the same prefix and zero-padding.
export function suggestNextCode(existingCodes: string[], fallback: string): string {
  let best: { prefix: string; num: number; width: number } | null = null;

  for (const code of existingCodes) {
    const match = code.match(/^(.*?)(\d+)$/);
    if (!match) continue;

    const [, prefix, digits] = match;
    const num = parseInt(digits, 10);

    if (!best || num > best.num) {
      best = { prefix, num, width: digits.length };
    }
  }

  if (!best) return fallback;

  const nextNum = best.num + 1;
  return `${best.prefix}${String(nextNum).padStart(best.width, "0")}`;
}

// Derives a short, unique customer-code prefix from a partner's name (e.g.
// "prakash" -> "P"), extending to more letters when the shorter candidate is
// already taken by another partner (e.g. two "Kumar ..." partners -> "K"/"KU").
export function suggestCustomerCodePrefix(
  name: string,
  existingPrefixes: string[]
): string {
  const normalized = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalized) return "";

  const used = new Set(existingPrefixes.map((p) => p.toUpperCase()));

  for (let len = 1; len <= normalized.length; len++) {
    const candidate = normalized.slice(0, len);
    if (!used.has(candidate)) return candidate;
  }

  let n = 2;
  while (used.has(`${normalized}${n}`)) n++;
  return `${normalized}${n}`;
}
