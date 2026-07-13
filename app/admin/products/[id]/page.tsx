import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/product-form';
import { requireAdmin } from '@/lib/auth-guard';
import { getProductById } from '@/lib/actions/product.actions';

export const metadata: Metadata = {
  title: 'Update Product',
};

const UpdateProductPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  await requireAdmin();

  const { id } = await props.params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <>
      <h2 className='h2-bold'>Update Product</h2>
      <div className='my-8'>
        <ProductForm type='Update' product={product} />
      </div>
    </>
  );
};

export default UpdateProductPage;
