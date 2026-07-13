'use server';
import {prisma} from  '@/db/prisma';
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from 'next/cache';
import { insertProductSchema, updateProductSchema } from '../validator';
import { requireAdmin } from '../auth-guard';
import { Prisma } from '@prisma/client';
import z from 'zod';

//Get Latest Products

  export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: 'desc' },
  });

  return convertToPlainObject(data);
}

// Get Single product by it's slug

export async function getProductBySlug(slug: string) {
    return await prisma.product.findFirst({
where: {
    slug: slug,
},
    });

}

// Get single product by it's id

export async function getProductById(id: string) {
  const data = await prisma.product.findFirst({
    where: { id },
  });

  return convertToPlainObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  sort?: string;
})  {
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== 'all'
      ? {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              } as Prisma.StringFilter,
            },
            {
              description: {
                contains: query,
                mode: 'insensitive',
              } as Prisma.StringFilter,
            },
          ],
        }
      : {};

  const categoryFilter: Prisma.ProductWhereInput =
    category && category !== 'all' ? { category } : {};

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price-asc'
      ? { price: 'asc' }
      : sort === 'price-desc'
      ? { price: 'desc' }
      : sort === 'rating'
      ? { rating: 'desc' }
      : { createdAt: 'desc' };

  const where: Prisma.ProductWhereInput = {
    ...queryFilter,
    ...categoryFilter,
  };

  const data = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count({ where });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Get distinct product categories
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { _count: { category: 'desc' } },
  });

  return data;
}
// Delete a product
export async function deleteProduct(id: string) {
  await requireAdmin();
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) throw new Error('Product not found');

    await prisma.product.delete({ where: { id } });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  await requireAdmin();
  try {
    const product = insertProductSchema.parse(data);
    await prisma.product.create({ data : product });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product created successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  await requireAdmin();
  try {
    const product = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExists) throw new Error('Product not found');

    await prisma.product.update({
      where: { id: product.id },
      data: product,
    });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}