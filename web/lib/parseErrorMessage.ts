export default function parseErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error != null && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }

    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
  }

  return fallback;
}
