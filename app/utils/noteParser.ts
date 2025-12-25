/* Legacy function for old data of plain text */

export interface ParsedNote {
  matchup?: string;
  whatWentWell?: string;
  whatWentPoorly?: string;
}

export function parseNoteText(text: string): ParsedNote {
  const result: ParsedNote = {};

  if (!text) return result;

  // Split text into lines for easier parsing
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  // Look for matchup information (usually at the beginning)
  // Common patterns: "Playing X vs Y", "X vs Y", "Champion matchup: X vs Y"
  const matchupPatterns = [
    /^(?:Playing\s+)?(.+?)\s+vs\s+(.+)$/i,
    /^Matchup:\s*(.+?)\s+vs\s+(.+)$/i,
    /^(.+?)\s*\([^)]*\)\s*vs\s*(.+?)\s*\([^)]*\)$/i,
  ];

  for (const pattern of matchupPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.matchup = match[1].trim() + " vs " + match[2].trim();
      break;
    }
  }

  // Look for "What went well" section
  const wellPatterns = [
    /^What went well[:\-]?\s*(.+)$/im,
    /^Positives[:\-]?\s*(.+)$/im,
    /^Good[:\-]?\s*(.+)$/im,
  ];

  for (const pattern of wellPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract everything after the header until the next section or end
      const startIndex = match.index! + match[0].length;
      const remainingText = text.slice(startIndex);

      // Find where this section ends (next section header or end of text)
      const nextSectionMatch = remainingText.match(
        /^(?:What went poorly|What went wrong|Negatives|Improvements|Areas for improvement)[:\-]?/im
      );
      const endIndex = nextSectionMatch
        ? nextSectionMatch.index
        : remainingText.length;

      result.whatWentWell = remainingText.slice(0, endIndex).trim();
      break;
    }
  }

  // Look for "What went poorly" section
  const poorlyPatterns = [
    /^What went (?:poorly|wrong)[:\-]?\s*(.+)$/im,
    /^Negatives[:\-]?\s*(.+)$/im,
    /^Improvements[:\-]?\s*(.+)$/im,
    /^Areas for improvement[:\-]?\s*(.+)$/im,
  ];

  for (const pattern of poorlyPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract everything after the header until end of text
      const startIndex = match.index! + match[0].length;
      const remainingText = text.slice(startIndex);

      result.whatWentPoorly = remainingText.trim();
      break;
    }
  }

  // If no structured sections found, try to extract matchup from the first line
  if (!result.matchup && lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.includes("vs") && firstLine.length < 100) {
      result.matchup = firstLine;
    }
  }

  return result;
}
