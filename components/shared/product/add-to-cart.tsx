"use client";

import { CartItem, Cart } from "@/types";
import { addItemToCart, removeItemFromCart} from "@/lib/actions/cart.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { useTransition } from "react";
import { Button } from '@/components/ui/button';

const AddToCart = ({ cart, item }: {cart?: Cart, item: CartItem }) => {
  const router = useRouter();
 const [isPending, startTransition] = useTransition();
  const handleAddToCart = async () => {
    startTransition(async() =>{
const res = await addItemToCart(item);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
 // Handle success add to cart
    toast.success(`${item.name} added to cart`, {
      action: {
        label: "Go to Cart",
        onClick: () => router.push("/cart"),
      },
    });
  
    })
  };
     // Handle remove from cart
   const handleRemoveFromCart = async () => {
  startTransition(async () => {
    const res = await removeItemFromCart(item.productId);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  });
};

// check if item exit in cart
const existItem =
    cart && cart.items.find((x) => x.productId === item.productId);
 return existItem ? (
    <div>
      <Button type='button' variant='outline' onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Minus className='w-4 h-4' />
        )}
      </Button>
      <span className='px-2'>{existItem.qty}</span>
      <Button type='button' variant='outline' onClick={handleAddToCart}>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Plus className='w-4 h-4' />
        )}
      </Button>
    </div>
  ) : (
    <Button className='w-full' type='button' onClick={handleAddToCart}>
      {isPending ? (
        <Loader className='w-4 h-4 animate-spin' />
      ) : (
        <Plus className='w-4 h-4' />
      )}{' '}
      Add To Cart
    </Button>
  );
};

export default AddToCart;
