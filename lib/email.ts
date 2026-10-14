import { Resend } from 'resend';
import type { ContactInput } from './validation';

/**
 * Sends one message to Ishaan's inbox. Section 8 of the brief.
 *
 * No auto-reply to the visitor: that would let anyone use this form to send
 * mail to a stranger. Nothing is stored anywhere.
 */

/** Escapes everything a visitor typed before it goes near the HTML part. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TOPIC_LABELS: Record<ContactInput['topic'], string> = {
  internship: 'Internship opportunity',
  project: 'Question about a project',
  other: 'Other',
};

export async function sendContactEmail(input: ContactInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    throw new Error('Mail is not configured');
  }

  const topic = TOPIC_LABELS[input.topic];
  const company = input.company?.trim() || '—';

  const lines = [
    `From:     ${input.name} <${input.email}>`,
    `Company:  ${company}`,
    `Topic:    ${topic}`,
    `Language: ${input.locale}`,
    '',
    input.message,
  ];

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    to,
    // Until a custom domain is verified in Resend, this is the only usable
    // sender. Reply-To carries the visitor's address, so replying from Gmail
    // reaches them directly.
    from: 'Portfolio <onboarding@resend.dev>',
    replyTo: input.email,
    subject: `[Portfolio] ${topic} from ${input.name}`,
    text: lines.join('\n'),
    html: `
      <div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6">
        <p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(input.name)}
          &lt;${escapeHtml(input.email)}&gt;</p>
        <p style="margin:0 0 4px"><strong>Company:</strong> ${escapeHtml(company)}</p>
        <p style="margin:0 0 4px"><strong>Topic:</strong> ${escapeHtml(topic)}</p>
        <p style="margin:0 0 16px"><strong>Language:</strong> ${escapeHtml(input.locale)}</p>
        <hr style="border:none;border-top:1px solid #ddd;margin:16px 0">
        <p style="white-space:pre-wrap;margin:0">${escapeHtml(input.message)}</p>
      </div>
    `.trim(),
  });

  if (error) {
    // Logged for Ishaan, never returned to the browser.
    console.error('Resend refused the message:', error.name, error.message);
    throw new Error('Mail provider rejected the message');
  }
}
