// Placeholder for utility functions or classes
export function someUtilFunction(): void {
  // TODO: Implement utility function
}

export class HeuristicJsonDecoder {
  // Attempts to decode a JSON string, with a fallback for escaped backslashes
  decodeJsonString(raw: string): any {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // Fallback: replace double backslashes with single backslash and try again
      raw = raw.replace(/\\/g, '\\');
      return JSON.parse(raw);
    }
  }
} 