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

export default function OrderConfirmationEmail({ order }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your {APP_NAME} order is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{APP_NAME}</Heading>
          <Text style={paragraph}>Hi {order.user.name},</Text>
          <Text style={paragraph}>
            Thanks for your order! We&apos;ve received it and it&apos;s now being
            processed. Here&apos;s a summary of what you bought.
          </Text>

          <Section style={metaSection}>
            <Row>
              <Column style={metaLabel}>Order</Column>
              <Column style={metaValue}>#{formatId(order.id)}</Column>
            </Row>
            <Row>
              <Column style={metaLabel}>Placed</Column>
              <Column style={metaValue}>
                {formatDateTime(order.createdAt).dateOnly}
              </Column>
            </Row>
            <Row>
              <Column style={metaLabel}>Payment</Column>
              <Column style={metaValue}>
                {order.paymentMethod} — {order.isPaid ? 'Paid' : 'Awaiting payment'}
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {order.orderItem.map((item) => (
            <Row key={item.slug} style={itemRow}>
              <Column style={itemName}>
                {item.name} × {item.qty}
              </Column>
              <Column style={itemPrice}>
                {formatCurrency(Number(item.price) * item.qty)}
              </Column>
            </Row>
          ))}

          <Hr style={hr} />

          <Row style={summaryRow}>
            <Column style={summaryLabel}>Items</Column>
            <Column style={summaryValue}>{formatCurrency(order.itemsPrice)}</Column>
          </Row>
          <Row style={summaryRow}>
            <Column style={summaryLabel}>Shipping</Column>
            <Column style={summaryValue}>
              {formatCurrency(order.shippingPrice)}
            </Column>
          </Row>
          <Row style={summaryRow}>
            <Column style={summaryLabel}>Tax</Column>
            <Column style={summaryValue}>{formatCurrency(order.taxPrice)}</Column>
          </Row>
          <Row style={summaryRow}>
            <Column style={totalLabel}>Total</Column>
            <Column style={totalValue}>{formatCurrency(order.totalPrice)}</Column>
          </Row>

          <Hr style={hr} />

          <Text style={addressHeading}>Shipping to</Text>
          <Text style={addressText}>
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.streetAddress}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </Text>

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

const itemRow = { margin: '4px 0' };
const itemName = { fontSize: '14px', color: '#333333' };
const itemPrice = {
  fontSize: '14px',
  color: '#333333',
  textAlign: 'right' as const,
};

const summaryRow = { margin: '2px 0' };
const summaryLabel = { fontSize: '13px', color: '#666666' };
const summaryValue = {
  fontSize: '13px',
  color: '#333333',
  textAlign: 'right' as const,
};
const totalLabel = { fontSize: '15px', fontWeight: 'bold' as const };
const totalValue = {
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textAlign: 'right' as const,
};

const addressHeading = {
  fontSize: '13px',
  color: '#888888',
  margin: '0 0 4px',
};
const addressText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#333333',
  margin: '0',
};

const hr = { borderColor: '#e6e6e6', margin: '16px 0' };
const footer = { fontSize: '12px', color: '#999999', margin: '0' };
