/** Máscara CPF: 000.000.000-00 */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Máscara data: DD/MM/YYYY */
export function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Valor monetário pt-BR (sem prefixo R$). */
export function formatCurrencyBrl(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type MembershipPaymentDisplayStatus = "Pendente" | "Em dia";

/** Data local YYYY-MM-DD (sem UTC) para comparar vencimentos. */
export function toLocalIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Status visual da mensalidade com base no vencimento.
 * Se next_due_date < hoje → Pendente (inadimplente), mesmo com payment_status true.
 */
export function getPaymentStatus(
  nextDueDate: string | null,
  paymentStatus: boolean,
  referenceDate: Date = new Date(),
): MembershipPaymentDisplayStatus {
  void paymentStatus;

  if (!nextDueDate) return "Pendente";

  const today = toLocalIsoDate(referenceDate);
  if (nextDueDate < today) return "Pendente";

  return "Em dia";
}

export function isMembershipPaymentCurrent(
  nextDueDate: string | null,
  paymentStatus: boolean,
  referenceDate: Date = new Date(),
): boolean {
  return getPaymentStatus(nextDueDate, paymentStatus, referenceDate) === "Em dia";
}

/** Formata YYYY-MM-DD → DD/MM/YYYY. */
export function formatIsoDateToDisplay(isoDate: string): string {
  return formatBirthDateFromIso(isoDate);
}

export function stripCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Converte DD/MM/YYYY → YYYY-MM-DD (ISO date para Postgres). */
export function parseBirthDateToIso(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Converte YYYY-MM-DD (ou ISO) → DD/MM/YYYY para exibição. */
export function formatBirthDateFromIso(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");
  if (!year || !month || !day) return isoDate;

  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}
