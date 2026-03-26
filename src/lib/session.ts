export function getSessionId(slug: string): string {
  const key = `fk_session_${slug}`;
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}
