import { createElement, type ReactElement } from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import { APP_NAME } from '@/lib/constants';
import { formatId } from '@/lib/utils';
import type { Order } from '@/types';
import OrderConfirmationEmail from './templates/order-confirmation';
import PaymentConfirmationEmail from './templates/payment-confirmation';

// Resend is only instantiated when an API key is present. Without one (e.g. local
// dev with no account), sendEmail logs the message instead of throwing so the rest
// of the flow keeps working.
const resendApiKey = process.env.RESEND_API_KEY;
const sender = process.env.EMAIL_SENDER || `${APP_NAME} <onboarding@resend.dev>`;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: ReactElement;
}) {
  const html = await render(body);

  if (!resend) {
    console.log(
      `\n[email] RESEND_API_KEY not set — email not sent.\n  to: ${to}\n  subject: ${subject}\n`
    );
    return;
  }

  const { error } = await resend.emails.send({ from: sender, to, subject, html });

  if (error) {
    throw new Error(typeof error === 'string' ? error : error.message);
  }
}

// Sent to the buyer as soon as an order is created.
export async function sendOrderConfirmationEmail(order: Order) {
  await sendEmail({
    to: order.user.email,
    subject: `${APP_NAME} — order confirmation #${formatId(order.id)}`,
    body: createElement(OrderConfirmationEmail, { order }),
  });
}

// Sent to the buyer when an order transitions to paid.
export async function sendPaymentConfirmationEmail(order: Order) {
  await sendEmail({
    to: order.user.email,
    subject: `${APP_NAME} — payment received for order #${formatId(order.id)}`,
    body: createElement(PaymentConfirmationEmail, { order }),
  });
}
