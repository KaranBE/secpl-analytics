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
