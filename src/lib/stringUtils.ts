/**
 * Converts a string to Turkish uppercase correctly.
 * Handles the 'i' -> 'İ' and 'ı' -> 'I' cases.
 */
export function toTurkishUppercase(text: string | undefined): string {
  if (!text) return '';
  return text.toLocaleUpperCase('tr-TR');
}
