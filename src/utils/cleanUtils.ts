/**
 * Utility for sanitizing names and textual identifiers across operations.
 */

/**
 * Strips special characters, bracketed/parenthetical suffixes, and abnormal symbols from engineer names.
 * Ensures clean alphanumeric names with standard single spacing.
 * 
 * Example: "Amit Sharma (South)" -> "Amit Sharma"
 * Example: "Vishal_Joshi - Lead" -> "Vishal Joshi Lead"
 * Example: "@Rahul Verma#" -> "Rahul Verma"
 */
export function cleanEngineerName(name: string): string {
  if (!name) return '';
  return name
    .replace(/\([^)]*\)/g, '')       // Remove parenthesized annotations like (South), (West), (Lead)
    .replace(/\[[^\]]*\]/g, '')      // Remove bracketed annotations like [Lead], [Tech]
    .replace(/[^a-zA-Z0-9\s]/g, ' ') // Replace any special characters with space
    .replace(/\s+/g, ' ')            // Normalize multiple spaces into a single space
    .trim();
}

/**
 * Validates whether a zone value is a legitimate geographical zone name.
 * Strictly filters out pure numbers, phone numbers, postal codes, ticket IDs,
 * and the literal word "Number" or "Sender Number".
 *
 * Example invalid: "1", "2", "9820012345", "+91 98000 00000", "Number", "Sender Number"
 * Example valid: "West Zone", "North Zone", "South Zone", "East Zone", "Central Zone"
 */
export function isValidZone(zone: unknown): boolean {
  if (!zone || typeof zone !== 'string') return false;
  const trimmed = zone.trim();
  if (!trimmed) return false;

  // Must contain alphabetic characters (eliminates pure numbers, phone numbers, symbols)
  if (!/[a-zA-Z]/.test(trimmed)) return false;

  // Exclude if it's purely a number with punctuation or spaces (e.g. "+91-9876543210")
  const stripped = trimmed.replace(/[^a-zA-Z0-9]/g, '');
  if (/^\d+$/.test(stripped)) return false;

  const lower = trimmed.toLowerCase();

  // Exclude generic placeholder tokens or keywords
  if (
    lower === 'number' ||
    lower === 'numbers' ||
    lower === 'no' ||
    lower === 'no.' ||
    lower === 'n/a' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === '-' ||
    lower === '--'
  ) {
    return false;
  }

  // Exclude metadata column names mistakenly picked up as zones
  if (
    lower.includes('number') ||
    lower.includes('phone') ||
    lower.includes('mobile') ||
    lower.includes('serial') ||
    lower.includes('ticket id')
  ) {
    return false;
  }

  return true;
}

/**
 * Formats and cleans zone names.
 */
export function cleanZoneName(zone: string): string {
  if (!isValidZone(zone)) return '';
  return zone.trim();
}
