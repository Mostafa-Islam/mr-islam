// Egyptian mobile numbers are 11 digits starting 01, or the same number
// written internationally as +20 followed by the 10 digits after the 0.
// Students will type both. Store one form only, or the same person
// creates two accounts and neither can log into the other.
export function normalizePhone(input: string): string {
  // Strip everything that isn't a digit: spaces, dashes, brackets, the +
  const digits = input.replace(/\D/g, "");

  // 01224457318 → 201224457318
  if (digits.startsWith("0") && digits.length === 11) {
    return "+20" + digits.slice(1);
  }

  // 201224457318 → +201224457318
  if (digits.startsWith("20") && digits.length === 12) {
    return "+" + digits;
  }

  // Anything else: return as-is and let validation reject it.
  return "+" + digits;
}