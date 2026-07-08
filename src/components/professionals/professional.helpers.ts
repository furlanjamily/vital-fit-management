import {
  formatBirthDate,
  formatBirthDateFromIso,
  parseBirthDateToIso,
} from "@/components/members/member.helpers";

export { formatBirthDate, formatBirthDateFromIso, parseBirthDateToIso };

const CREF_MAX_LENGTH = 12;

export function stripCref(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^0-9A-Z/-]/g, "")
    .slice(0, CREF_MAX_LENGTH);
}

export function formatCref(value: string): string {
  const raw = stripCref(value);
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  const suffix = raw.slice(digits.length).replace(/^-/, "");

  if (!digits) return suffix.startsWith("-") ? suffix.slice(1) : suffix;
  if (!suffix) return digits;

  return `${digits}-${suffix}`;
}

export function isValidCref(value: string): boolean {
  const normalized = stripCref(value);
  return /^[0-9]{6}-[A-Z]\/[A-Z]{2}$/.test(normalized);
}
