import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { APP_NAME } from '@/lib/constants';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import type { Order } from '@/types';

type Props = { order: Order };

export default function PaymentConfirmationEmail({ order }: Props) {
  const paidAt = order.paidAt ? formatDateTime(order.paidAt).dateTime : '—';

  return (
    <Html>
      <Head />
      <Preview>We&apos;ve received your payment</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{APP_NAME}</Heading>
          <Text style={paragraph}>Hi {order.user.name},</Text>
          <Text style={paragraph}>
            Good news — we&apos;ve received your payment and your order is now
            confirmed as paid. Thank you!
          </Text>

          <Section style={metaSection}>
            <Row>
              <Column style={metaLabel}>Order</Column>
              <Column style={metaValue}>#{formatId(order.id)}</Column>
            </Row>
            <Row>
              <Column style={metaLabel}>Paid on</Column>
              <Column style={metaValue}>{paidAt}</Column>
            </Row>
            <Row>
              <Column style={metaLabel}>Method</Column>
              <Column style={metaValue}>{order.paymentMethod}</Column>
            </Row>
            <Row>
              <Column style={metaLabel}>Amount</Column>
              <Column style={metaValue}>{formatCurrency(order.totalPrice)}</Column>
            </Row>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            {APP_NAME} · This is an automated message, please do not reply.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '24px',
  maxWidth: '560px',
  borderRadius: '8px',
};

const heading = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#333333',
  margin: '0 0 12px',
};

const metaSection = { margin: '8px 0' };
const metaLabel = { fontSize: '13px', color: '#888888', width: '90px' };
const metaValue = { fontSize: '13px', color: '#333333' };

const hr = { borderColor: '#e6e6e6', margin: '16px 0' };
const footer = { fontSize: '12px', color: '#999999', margin: '0' };
