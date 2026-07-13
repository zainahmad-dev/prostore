"use client";

import { insertProductSchema } from "@/lib/validator";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { productDefaultValues } from '@/lib/constants';
import { ControllerRenderProps, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import {  z } from "zod";
import { Button } from "../ui/button";
import slugify from "slugify";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";
import { X } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
const ProductForm = ({
  type,
  product,
}: {
  type: "Create" | "Update";
  product?: Product;
}) => {
  const router = useRouter();
  const productId = product?.id;
  type ProductFormInput = z.input<typeof insertProductSchema>;
  type ProductFormOutput = z.output<typeof insertProductSchema>;

  const defaultValues: ProductFormInput =
    product && type === 'Update'
      ? {
          name: product.name,
          slug: product.slug,
          category: product.category,
          images: product.images,
          brand: product.brand,
          description: product.description,
          stock: product.stock,
          price: product.price,
          isFeatured: product.isFeatured,
          banner: product.banner,
        }
      : {
          name: productDefaultValues.name,
          slug: productDefaultValues.slug,
          category: productDefaultValues.category,
          images: productDefaultValues.images,
          brand: productDefaultValues.brand,
          description: productDefaultValues.description,
          stock: productDefaultValues.stock,
          price: productDefaultValues.price,
          isFeatured: productDefaultValues.isFeatured,
          banner: productDefaultValues.banner,
        };

   const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(insertProductSchema),
    defaultValues,
  });

  const images = form.watch('images');
  const isFeatured = form.watch('isFeatured');
  const banner = form.watch('banner');

const onSubmit = async (values: ProductFormOutput) => {
    // On Create
    if (type === 'Create') {
      const res = await createProduct(values);

      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        router.push('/admin/products');
      }
    }

    // On Update
    if (type === 'Update') {
      if (!productId) {
        router.push('/admin/products');
        return;
      }

      const res = await updateProduct({ ...values, id: productId });

      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        router.push('/admin/products');
      }
    }
  };
  return <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
    <div className="flex flex-col md:flex-row gap-5">
      {/*Name*/}
      <FormField
            control={form.control}
            name='name'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                ProductFormInput,
                'name'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      {/*Slug*/}
      <FormField
            control={form.control}
            name='slug'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                ProductFormInput,
                'slug'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input placeholder='Enter slug' {...field} />
                    <Button
                      type='button'
                      className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2'
                      onClick={() => {
                        form.setValue(
                          'slug',
                          slugify(form.getValues('name'), { lower: true })
                        );
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
    </div>
    <div className="flex flex-col md:flex-row gap-5">
      {/*Category*/}
       <FormField
            control={form.control}
            name='category'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                ProductFormInput,
                'category'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder='Enter category' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      {/*Brand*/}
       <FormField
            control={form.control}
            name='brand'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                ProductFormInput,
                'brand'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder='Enter brand' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
    </div>
    <div className="flex flex-col md:flex-row gap-5">
      {/*Price*/}
       <FormField
            control={form.control}
            name='price'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                ProductFormInput,
                'price'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product price' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
      {/*Stock*/}
                <FormField
            control={form.control}
            name='stock'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                ProductFormInput,
                'stock'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input placeholder='Enter stock' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

    </div>
    <div className="upload-field flex flex-col md:flex-row gap-5">
      {/*Images*/}
      <FormField
        control={form.control}
        name='images'
        render={() => (
          <FormItem className='w-full'>
            <FormLabel>Images</FormLabel>
            <Card>
              <CardContent className='space-y-2 mt-2 min-h-48'>
                <div className='flex-start space-x-2 flex-wrap gap-2'>
                  {images.map((image: string) => (
                    <div key={image} className='relative'>
                      <Image
                        src={image}
                        alt='product image'
                        className='w-20 h-20 object-cover object-center rounded-sm'
                        width={80}
                        height={80}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          form.setValue(
                            'images',
                            images.filter((img) => img !== image)
                          )
                        }
                        className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ))}
                  <FormControl>
                    <UploadButton
                      endpoint='imageUploader'
                      onClientUploadComplete={(res) => {
                        form.setValue('images', [
                          ...images,
                          ...res.map((file) => file.ufsUrl),
                        ]);
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`ERROR! ${error.message}`);
                      }}
                    />
                  </FormControl>
                </div>
              </CardContent>
            </Card>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
    <div className="upload-field">
      {/*isFeatured*/}
      Featured Product
      <Card>
        <CardContent className='space-y-2 mt-2'>
          <FormField
            control={form.control}
            name='isFeatured'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Is Featured?</FormLabel>
              </FormItem>
            )}
          />
          {isFeatured && banner && (banner.startsWith('/') || banner.startsWith('http')) && (
            <Image
              src={banner}
              alt='banner image'
              className='w-full object-cover object-center rounded-sm'
              width={1920}
              height={680}
            />
          )}
          {isFeatured && (!banner || !(banner.startsWith('/') || banner.startsWith('http'))) && (
            <UploadButton
              endpoint='imageUploader'
              onClientUploadComplete={(res) => {
                form.setValue('banner', res[0].ufsUrl);
              }}
              onUploadError={(error: Error) => {
                toast.error(`ERROR! ${error.message}`);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
     <div>
          {/* Description */}
          <FormField
            control={form.control}
            name='description'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                ProductFormInput,
                'description'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter product description'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button
            type='submit'
            size='lg'
            disabled={form.formState.isSubmitting}
            className='button col-span-2 w-full'
          >
            {form.formState.isSubmitting ? 'Submitting' : `${type} Product`}
          </Button>
        </div>
    </form>
  </Form>;
};

export default ProductForm;
