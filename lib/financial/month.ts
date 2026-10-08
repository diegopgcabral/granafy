const monthPattern = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function getCurrentMonthReference(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function isMonthReference(value: string | null): value is string {
  return value !== null && monthPattern.test(value);
}

export function addMonths(month: string, amount: number) {
  if (!isMonthReference(month)) {
    throw new Error("Invalid month reference.");
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthReference(month: string) {
  if (!isMonthReference(month)) {
    throw new Error("Invalid month reference.");
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));

  return formatted.replace(/^./, (character) => character.toUpperCase());
}
