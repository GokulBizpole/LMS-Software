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
