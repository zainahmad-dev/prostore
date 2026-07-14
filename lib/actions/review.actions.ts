'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { revalidatePath } from 'next/cache';
import { formatError } from '../utils';
import { insertReviewSchema } from '../validator';

// Create or update a review, then recalculate the product's rating/numReviews
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error('User is not authenticated');

    const review = insertReviewSchema.parse({
      ...data,
      userId: session.user.id,
    });

    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });
    if (!product) throw new Error('Product not found');

    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: review.productId,
        order: { userId: review.userId, isPaid: true },
      },
    });
    const isVerifiedPurchase = !!purchase;

    await prisma.$transaction(async (tx) => {
      await tx.review.upsert({
        where: {
          userId_productId: {
            userId: review.userId,
            productId: review.productId,
          },
        },
        create: { ...review, isVerifiedPurchase },
        update: {
          title: review.title,
          description: review.description,
          rating: review.rating,
          isVerifiedPurchase,
        },
      });

      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating ?? 0,
          numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return { success: true, message: 'Review submitted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all reviews for a product
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return { data };
}

// Get the current user's own review for a product (for edit)
export async function getReviewByProductId({
  productId,
}: {
  productId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return await prisma.review.findFirst({
    where: {
      productId,
      userId: session.user.id,
    },
  });
}
