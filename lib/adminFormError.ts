// Surfaces which specific field failed (and why) instead of a dead-end
// "check the fields" — admin API routes already return this via zod's
// flatten(), forms just weren't reading it.
export function describeApiError(data: unknown, fieldLabels: Record<string, string> = {}): string | null {
  if (!data || typeof data !== "object" || !("details" in data)) return null;
  const details = (data as { details?: { fieldErrors?: Record<string, string[]> } }).details;
  const fieldErrors = details?.fieldErrors;
  if (!fieldErrors) return null;

  const lines = Object.entries(fieldErrors)
    .filter(([, messages]) => messages && messages.length > 0)
    .map(([field, messages]) => `${fieldLabels[field] ?? field}: ${messages[0]}`);

  return lines.length > 0 ? lines.join(" — ") : null;
}
