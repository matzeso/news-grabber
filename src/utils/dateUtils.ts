export interface YearMonth {
  year: number;
  month: number;
}

export function parseTimeInput(input: string): YearMonth[] {
  const yearOnlyRegex = /^\d{4}$/;
  const yearMonthRegex = /^\d{4}-\d{2}$/;

  if (yearOnlyRegex.test(input)) {
    const year = parseInt(input);
    return generateMonthsForYear(year);
  } else if (yearMonthRegex.test(input)) {
    const [year, month] = input.split('-').map(Number);
    return [{ year, month }];
  } else {
    throw new Error('Invalid time format. Use YYYY or YYYY-MM');
  }
}

export function generateMonthsForYear(year: number): YearMonth[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

  const maxMonth = (year === currentYear) ? currentMonth : 12;

  const months: YearMonth[] = [];
  for (let month = 1; month <= maxMonth; month++) {
    months.push({ year, month });
  }

  return months;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function generateDaysForMonth(year: number, month: number): Date[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const isCurrentMonth = (year === currentYear && month === currentMonth);
  const maxDay = isCurrentMonth ? currentDay : getDaysInMonth(year, month);

  const days: Date[] = [];
  for (let day = 1; day <= maxDay; day++) {
    days.push(new Date(year, month - 1, day));
  }

  return days;
}

export function formatDateForUrl(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}
