import { z } from 'zod';

/**
 * One schema, used by the form for instant feedback and by the route handler as
 * the actual gate. Section 8 of the brief sets every limit here.
 *
 * The client copy is a convenience. The server never trusts it.
 */

export const TOPICS = ['internship', 'project', 'other'] as const;
export type Topic = (typeof TOPICS)[number];

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  // 254 is the longest a mail address can legally be.
  email: z.email().max(254),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  topic: z.enum(TOPICS),
  message: z.string().trim().min(10).max(5000),

  /**
   * Hidden field. A human never sees it, so anything in it means a bot filled
   * the form in.
   *
   * Deliberately permissive. Requiring it to be empty here made a filled
   * honeypot fail validation and return 400, which tells a bot exactly which
   * field gave it away. Section 8 wants the opposite: let it through the schema
   * and have the route answer with a plain success while sending nothing.
   */
  website: z.string().max(200).optional(),

  turnstileToken: z.string().min(1).max(2048).optional(),

  /** Which language the visitor was reading, included in the email. */
  locale: z.string().min(2).max(5),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Bodies larger than this are refused before parsing. Section 8. */
export const MAX_BODY_BYTES = 20 * 1024;

/**
 * Field-level errors for the client, keyed by field name. Deliberately returns
 * which field failed and nothing else: no messages from the server, no stack
 * traces, and the client renders its own localised text.
 */
export function fieldErrors(error: z.ZodError): Record<string, true> {
  const out: Record<string, true> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string') out[key] = true;
  }
  return out;
}
