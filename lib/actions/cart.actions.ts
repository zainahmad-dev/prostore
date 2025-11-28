'use server';

import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { convertToPlainObject,formatError } from "../utils"
import { auth } from "@/auth";
import { prisma } from '@/db/prisma';
import { cartItemSchema } from "../validator";


export async function addItemToCart(data: CartItem){
  //check for cart cookie
  
  try {
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if(!sessionCartId)throw new Error("CartSession not found");
  //Get Session and UserId
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  //Get Cart
  const cart = await getMyCart();

  //Praise and validate item data
  const item = cartItemSchema.parse(data);

  //Find Product in Database
  const product = await prisma.product.findFirst({
     where: {id: item.productId},
  })

  //Testing purpose
  console.log({
    'sessionCartId': sessionCartId,
    'userId': userId,
    'Item Requested': item,
    'product Found': product,
    
  })
    return{
  success: true,
message: "Item added to cart successfully",  
};
    
  } catch (error) {
    return{
      success: false,
      message: formatError(error)
    }
  }

}

export async function getMyCart(){
 
 //check for cart cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
   if(!sessionCartId)throw new Error("CartSession not found");

  //Get Session and UserId
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

   // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}