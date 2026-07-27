import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import  { redirect } from "next/navigation";
import  { ShippingAddress } from "@/types";
import ShippingAddressForm from "./shipping-address-form";
import CheckoutSteps from "@/components/shared/checkout-steps";
export const metadata: Metadata = {
    title: 'Shipping Address',

};
const shippingAddressPage = async () => {
    const cart = await getMyCart();
     if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();

  const userId = session?.user?.id;

  // Middleware already gates this route; this is the belt-and-braces path so a
  // signed-out visitor gets the sign-in page rather than a 500.
  if (!userId) redirect('/sign-in?callbackUrl=/shipping-address');

  const user = await getUserById(userId);

    return <>
    <CheckoutSteps current={1} />
    <ShippingAddressForm address={user.address as ShippingAddress}/>
    </>
}
    
 
export default shippingAddressPage;