/**
 * Delivers buy requests and enquiries to the team's inbox by email.
 * Runs on the server only. The address never reaches the browser.
 *
 * Mail goes through FormSubmit, which needs no account. The first message sent
 * to a new address triggers a one-time activation email; until that link is
 * clicked, FormSubmit holds messages, so every request is also written to the
 * server log as a backup.
 */

const INBOX = process.env.ORDER_INBOX || "danny8arr@gmail.com";

export type InboxMessage = {
  subject: string;
  replyTo: string;
  fields: Record<string, string | number | undefined>;
};

export async function sendToInbox(message: InboxMessage): Promise<{ delivered: boolean; detail: string }> {
  const body: Record<string, string> = {
    _subject: message.subject,
    _template: "table",
    _captcha: "false",
    _replyto: message.replyTo,
  };
  for (const [key, value] of Object.entries(message.fields)) {
    if (value !== undefined && value !== "") body[key] = String(value);
  }

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${INBOX}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: process.env.NEXT_PUBLIC_SITE_URL || "https://hanger22.vercel.app",
        Referer: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hanger22.vercel.app"}/`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    });
    const result = (await response.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
    const delivered = response.ok && String(result.success) === "true";
    return { delivered, detail: result.message ?? `status ${response.status}` };
  } catch (error) {
    return { delivered: false, detail: error instanceof Error ? error.message : "network error" };
  }
}
