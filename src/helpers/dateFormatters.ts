/**
 * Formats a Date object to YYYY-MM-DD string for HTML date inputs
 * Uses UTC components to avoid timezone conversion issues
 */
export const formatDateForInput = (date: Date): string => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string to YYYY/MM/DD for display
 * Uses UTC components to avoid timezone conversion issues
 */
export const formatDateForDisplay = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * Formats a Date object to a long format string (e.g., "January 15, 2024")
 * Uses UTC components to avoid timezone conversion issues
 */
export const formatDateForDisplayLong = (date: Date | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const day = d.getUTCDate();
  return `${month} ${day}, ${year}`;
};