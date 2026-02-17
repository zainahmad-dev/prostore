'use client';
import * as React from 'react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
    order: Order;
    isAdmin?: boolean;
    onMarkPaid?: (id: string) => Promise<void> | void;
    onMarkDelivered?: (id: string) => Promise<void> | void;
};

const MarkAsPaidButton = ({ id, onMarkPaid }: { id: string; onMarkPaid?: (id: string) => Promise<void> | void }) => {
    return (
        <Button
            variant="secondary"
            onClick={() => {
                if (onMarkPaid) return onMarkPaid(id);
                // fallback placeholder action
                void Promise.resolve().then(() => console.log('mark as paid', id));
            }}
        >
            Mark as paid
        </Button>
    );
};

const MarkAsDeliveredButton = ({ id, onMarkDelivered }: { id: string; onMarkDelivered?: (id: string) => Promise<void> | void }) => {
    return (
        <Button
            variant="default"
            onClick={() => {
                if (onMarkDelivered) return onMarkDelivered(id);
                void Promise.resolve().then(() => console.log('mark as delivered', id));
            }}
        >
            Mark as delivered
        </Button>
    );
};

const OrderDetailTable = ({ order, isAdmin = false, onMarkPaid, onMarkDelivered }: Props) => {
    const paymentMethod = (order as unknown as { paymentMethod?: string }).paymentMethod;
    const { isPaid, isDelivered } = order;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Order {order.id}</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Cash On Delivery */}
                {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                    <MarkAsPaidButton id={order.id} onMarkPaid={onMarkPaid} />
                )}
                {isAdmin && isPaid && !isDelivered && (
                    <MarkAsDeliveredButton id={order.id} onMarkDelivered={onMarkDelivered} />
                )}
            </CardContent>
        </Card>
    );
};

export default OrderDetailTable;