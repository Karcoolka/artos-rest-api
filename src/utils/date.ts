export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  return new Date(Date.UTC(year, month - 1, day));
}

export function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
