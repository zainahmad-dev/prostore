'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createOrder } from '@/lib/actions/order.action';

const PlaceOrderForm = () => {
  const router = useRouter();
  // useFormStatus() only reports progress for a form's `action`, not for a
  // manual onSubmit handler - it stayed false here, leaving the button live and
  // letting an impatient double-click create two orders.
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const res = await createOrder();

      // Surface the reason instead of silently doing nothing.
      if (!res.success) {
        toast.error(res.message);
      }

      if (res.redirectTo) {
        router.push(res.redirectTo);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className='w-full'>
      <Button type='submit' disabled={isPending} className='w-full'>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Check className='w-4 h-4' />
        )}{' '}
        Place Order
      </Button>
    </form>
  );
};

export default PlaceOrderForm;