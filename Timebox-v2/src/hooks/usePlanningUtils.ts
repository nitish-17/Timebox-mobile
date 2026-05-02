import { parse, format, isValid } from 'date-fns';

export interface TimeRange {
  start: string; // HH:mm
  end: string;   // HH:mm
}

/**
 * Parses a string to extract time ranges.
 * Robustly handles various formats like:
 * - 09:00 10:00
 * - 9:00am to 10:30am
 * - 14:00 - 15:00
 */
export function parseTimeRanges(text: string): TimeRange[] {
  const lines = text.split('\n');
  const ranges: TimeRange[] = [];
  
  // Regex to match times like 9:00, 09:00, 9:00am, 21:00, etc.
  const timeRegex = /\b((?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\s?(?:[AaPp][Mm])?)\b/g;

  for (const line of lines) {
    const matches = line.match(timeRegex);
    if (matches && matches.length >= 2) {
      const startStr = matches[0];
      const endStr = matches[1];

      const start = normalizeTimeTo24h(startStr);
      const end = normalizeTimeTo24h(endStr);

      if (start && end && isValidRange(start, end)) {
        ranges.push({ start, end });
      }
    }
  }

  return ranges;
}

/**
 * Converts various time formats (9:00am, 14:00, 9:00:00) to HH:mm
 */
function normalizeTimeTo24h(timeStr: string): string | null {
  const clean = timeStr.trim().toLowerCase();
  
  // Try formats
  const formats = [
    'H:mm', 'HH:mm', 'h:mm a', 'hh:mm a', 'h:mma', 'hh:mma',
    'H:mm:ss', 'HH:mm:ss', 'h:mm:ss a', 'hh:mm:ss a'
  ];

  for (const f of formats) {
    const parsed = parse(clean, f, new Date());
    if (isValid(parsed)) {
      return format(parsed, 'HH:mm');
    }
  }

  return null;
}

function isValidRange(start: string, end: string): boolean {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  
  // Beyond 24:00 check (though normalization usually handles this)
  if (sh >= 24 || eh >= 24) return false;
  
  const startTotal = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  
  // End must be after start
  return endTotal > startTotal;
}

/**
 * Calculates duration in minutes between two HH:mm strings
 */
export function calculateDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}
