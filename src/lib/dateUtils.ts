// Utility functions for handling dates consistently across the application
// Fixes timezone issues when working with date-only values

/**
 * Safely parses a date string as a local date (without timezone conversion)
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object representing the local date
 */
export function parseLocalDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  try {
    // Handle YYYY-MM-DD format (most common from API)
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed in JS
    }

    // Handle ISO datetime strings - extract date part only
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      const datePart = dateStr.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    // Fallback for other formats
    return new Date(dateStr);
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}`, error);
    return null;
  }
}

/**
 * Formats a date string as DD/MM/YYYY (Brazilian format)
 * @param dateStr - Date string to format
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateBR(dateStr: string | null | undefined): string {
  const date = parseLocalDate(dateStr);
  if (!date) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats a date string for HTML input[type="date"] (YYYY-MM-DD)
 * @param dateStr - Date string to format
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateForInput(dateStr: string | null | undefined): string {
  const date = parseLocalDate(dateStr);
  if (!date) return '';

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date is overdue (before today)
 * @param dateStr - Date string to check
 * @returns true if the date is overdue, false otherwise
 */
export function isDateOverdue(dateStr: string | null | undefined): boolean {
  const date = parseLocalDate(dateStr);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0); // Reset time to start of day

  return checkDate < today;
}

/**
 * Gets the number of days until a date (positive for future, negative for past)
 * @param dateStr - Date string to check
 * @returns Number of days or null if invalid date
 */
export function getDaysUntilDate(dateStr: string | null | undefined): number | null {
  const date = parseLocalDate(dateStr);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const diffTime = checkDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
