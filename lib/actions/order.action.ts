"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject} from '../utils';
import { formatError } from "../utils";
import { getMyCart } from "./cart.actions";
import { auth } from "@/auth";
import { getUserById } from "./user.actions";
import { prisma } from "@/db/prisma";
import { CartItem, Order } from "@/types";
import {
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
} from "@/lib/email";
import { insertOrderSchema } from "../validator";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';
import { requireAdmin } from "@/lib/auth-guard";
// Create Order and order items

export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");
    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }

    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }
      // Re-check stock at checkout time - the cart may have been sitting around
      // while other buyers drained the inventory.
      const cartItems = cart.items as CartItem[];
      const productsInCart = await prisma.product.findMany({
        where: { id: { in: cartItems.map((item) => item.productId) } },
        select: { id: true, name: true, stock: true },
      });

      for (const item of cartItems) {
        const product = productsInCart.find((p) => p.id === item.productId);

        if (!product) {
          return {
            success: false,
            message: `${item.name} is no longer available`,
            redirectTo: '/cart',
          };
        }
        if (product.stock < item.qty) {
          return {
            success: false,
            message: `Not enough stock for ${product.name} (${product.stock} left)`,
            redirectTo: '/cart',
          };
        }
      }

      // Create order object
      const order = insertOrderSchema.parse({
        userId: user.id,
        shippingAddress: user.address,
        paymentMethod: user.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      });

      // If payment method is CashOnDelivery, treat the order as paid
      const isCOD = user.paymentMethod === 'CashOnDelivery';

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order (mark as paid immediately for COD)
      const insertedOrder = await tx.order.create({
        data: {
          ...order,
          isPaid: isCOD,
          paidAt: isCOD ? new Date() : null,
        },
      });
      // Create order items from the cart items and draw down the inventory.
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });

        // Conditional update: if another order consumed the stock between the
        // check above and here, this matches no rows and we abort the whole
        // transaction rather than overselling.
        const { count } = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty } },
        });

        if (count === 0) {
          throw new Error(`Not enough stock for ${item.name}`);
        }
      }
      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Order not created');

    // Send the buyer an order-confirmation email. Never let an email failure
    // break order placement.
    try {
      const fullOrder = await getOrderById(insertedOrderId);
      if (fullOrder) {
        await sendOrderConfirmationEmail(fullOrder as unknown as Order);
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email', emailError);
    }

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// Get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItem: true,
      user: { select: { name: true, email: true } },
    },
  });

  return convertToPlainObject(data);
}

// Get user's orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();
  if (!session) return redirect('/sign-in');

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  // Get monthly sales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  // Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
}
// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  await requireAdmin();

  const queryFilter: Prisma.OrderWhereInput =
    query && query !== 'all'
      ? {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            } as Prisma.StringFilter,
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });

  // Count has to use the same filter as the query, otherwise the pagination
  // reports the page count for *all* orders while a search is active.
  const dataCount = await prisma.order.count({ where: { ...queryFilter } });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}
// Delete an order
export async function deleteOrder(id: string) {
  await requireAdmin();
  try {
    await prisma.order.delete({ where: { id } });

    revalidatePath('/admin/orders');

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
// Update COD order to paid
export async function updateOrderToPaidCOD(orderId: string) {
  await requireAdmin();
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    await prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true, paidAt: new Date() },
    });

    // Send the buyer a payment-confirmation email now the order is paid.
    try {
      const fullOrder = await getOrderById(orderId);
      if (fullOrder) {
        await sendPaymentConfirmationEmail(fullOrder as unknown as Order);
      }
    } catch (emailError) {
      console.error('Failed to send payment confirmation email', emailError);
    }

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: 'Order marked as paid' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update COD order to delivered
export async function deliverOrder(orderId: string) {
  await requireAdmin();
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error('Order not found');
    if (!order.isPaid) throw new Error('Order is not paid');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order has been marked delivered',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}