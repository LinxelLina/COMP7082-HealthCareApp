// utils/week.ts

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const day = d.getDay(); // Sun=0
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diffToMonday);

  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);

  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    const month = start.toLocaleDateString(undefined, { month: "short" });
    return `${month} ${start.getDate()} – ${end.getDate()}`;
  }

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return `${fmt(start)} – ${fmt(end)}`;
}
