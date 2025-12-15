"use client";

import { CartItem, Cart } from "@/types";
import { addItemToCart, removeItemFromCart} from "@/lib/actions/cart.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { useTransition } from "react";


const AddToCart = ({ cart, item }: {cart?: Cart, item: CartItem }) => {
  const router = useRouter();

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(`${item.name} added to cart`, {
      action: {
        label: "Go to Cart",
        onClick: () => router.push("/cart"),
      },
    });
  };
// check if item exit in cart


  return (
    <button
      onClick={handleAddToCart}
      className="px-4 py-2 bg-primary text-white rounded-md"
    >
     <Plus/> Add to Cart
    </button>
  );
};

export default AddToCart;
