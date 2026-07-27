'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { deliverOrder, updateOrderToPaidCOD } from '@/lib/actions/order.action';

type Props = {
  order: Order;
  isAdmin?: boolean;
};

// Admin-only actions. Both were previously stubbed out with console.log, which
// left updateOrderToPaidCOD/deliverOrder unreachable from the UI.
const MarkAsPaidButton = ({ id }: { id: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type='button'
      disabled={isPending}
      className='w-full'
      onClick={() =>
        startTransition(async () => {
          const res = await updateOrderToPaidCOD(id);
          if (res.success) toast.success(res.message);
          else toast.error(res.message);
        })
      }
    >
      {isPending ? 'Processing...' : 'Mark as paid'}
    </Button>
  );
};

const MarkAsDeliveredButton = ({ id }: { id: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type='button'
      disabled={isPending}
      className='w-full'
      onClick={() =>
        startTransition(async () => {
          const res = await deliverOrder(id);
          if (res.success) toast.success(res.message);
          else toast.error(res.message);
        })
      }
    >
      {isPending ? 'Processing...' : 'Mark as delivered'}
    </Button>
  );
};

const OrderDetailTable = ({ order, isAdmin = false }: Props) => {
  const {
    id,
    shippingAddress,
    orderItem,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  return (
    <>
      <h1 className='py-4 text-2xl'>Order {formatId(id)}</h1>
      <div className='grid md:grid-cols-3 md:gap-5'>
        <div className='md:col-span-2 overflow-x-auto space-y-4'>
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Payment Method</h2>
              <p className='mb-2'>{paymentMethod}</p>
              {isPaid && paidAt ? (
                <Badge variant='secondary'>
                  Paid at {formatDateTime(paidAt).dateTime}
                </Badge>
              ) : (
                <Badge variant='destructive'>Not paid</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p className='mb-2'>
                {shippingAddress.streetAddress}, {shippingAddress.city}{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
              {isDelivered && deliveredAt ? (
                <Badge variant='secondary'>
                  Delivered at {formatDateTime(deliveredAt).dateTime}
                </Badge>
              ) : (
                <Badge variant='destructive'>Not delivered</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className='text-center'>Quantity</TableHead>
                    <TableHead className='text-right'>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItem.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className='flex items-center'
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          />
                          <span className='px-2'>{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='px-2'>{item.qty}</span>
                      </TableCell>
                      <TableCell className='text-right'>
                        {formatCurrency(item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className='p-4 gap-4 space-y-4'>
              <div className='flex justify-between'>
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className='flex justify-between font-bold'>
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>

              {/* Cash On Delivery */}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                <MarkAsPaidButton id={id} />
              )}
              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton id={id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailTable;
