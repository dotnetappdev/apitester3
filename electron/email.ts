// Make SendGrid optional so `npm install` doesn't fail when it's not installed.
// We dynamically require it and gracefully handle absence.
let sgMail: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sgMail = require('@sendgrid/mail');
} catch (err) {
  // Not installed — we'll handle at runtime.
  sgMail = null;
}

export interface EmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export function configureSendGrid(apiKey: string) {
  if (!apiKey) return;
  if (!sgMail) {
    console.warn('SendGrid package not installed. Email sending will be disabled until @sendgrid/mail is installed.');
    return;
  }
  sgMail.setApiKey(apiKey);
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!sgMail) {
    const msg = `Attempted to send email but @sendgrid/mail is not installed. To enable email sending install @sendgrid/mail and restart.`;
    console.warn(msg);
    return { success: false, error: msg };
  }

  try {
    const msg = {
      to: options.to,
      from: options.from,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    await sgMail.send(msg as any);
    return { success: true };
  } catch (error) {
    console.error('SendGrid send error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
