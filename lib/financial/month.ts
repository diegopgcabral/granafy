const monthPattern = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function getCurrentMonthReference(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getCurrentCycleReference(date = new Date(), startDay = 1) {
  if (!Number.isInteger(startDay) || startDay < 1 || startDay > 31) {
    throw new Error("Invalid financial cycle.");
  }
  const currentMonth = getCurrentMonthReference(date);
  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  return date.getDate() >= Math.min(startDay, lastDay)
    ? addMonths(currentMonth, 1)
    : currentMonth;
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

export function getMonthDateRange(month: string) {
  if (!isMonthReference(month)) {
    throw new Error("Invalid month reference.");
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1));

  return {
    startsOn: `${month}-01`,
    endsBefore: `${nextMonth.getUTCFullYear()}-${String(
      nextMonth.getUTCMonth() + 1,
    ).padStart(2, "0")}-01`,
  };
}

export function getCycleDateRange(month: string, startDay: number) {
  if (
    !isMonthReference(month) ||
    !Number.isInteger(startDay) ||
    startDay < 1 ||
    startDay > 31
  ) {
    throw new Error("Invalid financial cycle.");
  }

  if (startDay === 1) return getMonthDateRange(month);

  const [year, monthNumber] = month.split("-").map(Number);
  const dateInMonth = (monthOffset: number) => {
    const lastDay = new Date(
      Date.UTC(year, monthNumber + monthOffset, 0),
    ).getUTCDate();
    return new Date(
      Date.UTC(
        year,
        monthNumber - 1 + monthOffset,
        Math.min(startDay, lastDay),
      ),
    );
  };
  const endsBefore = dateInMonth(0);
  const startsOn = dateInMonth(-1);
  const asDate = (date: Date) =>
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

  return { startsOn: asDate(startsOn), endsBefore: asDate(endsBefore) };
}

export function formatCycleReference(month: string, startDay: number) {
  const { startsOn, endsBefore } = getCycleDateRange(month, startDay);
  const end = new Date(`${endsBefore}T12:00:00`);
  end.setDate(end.getDate() - 1);
  const format = (date: Date) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
      .format(date)
      .replace(".", "");
  return `${format(new Date(`${startsOn}T12:00:00`))} – ${format(end)} ${end.getFullYear()}`;
}
