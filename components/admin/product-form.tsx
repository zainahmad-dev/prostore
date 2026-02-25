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
const ProductForm = ({
  type,
  product,
}: {
  type: "Create" | "Update";
  product?: Product;
}) => {
  const schema = insertProductSchema;
  type ProductFormValues = z.infer<typeof insertProductSchema>;

  const defaultValues: ProductFormValues =
    product && type === 'Update'
      ? {
          name: product.name,
          slug: product.slug,
          category: product.category,
          brand: product.brand,
          description: product.description,
          stock: product.stock,
          images: product.images,
          isFeatured: product.isFeatured,
          banner: product.banner,
          price: product.price,
        }
      : {
          name: productDefaultValues.name,
          slug: productDefaultValues.slug,
          category: productDefaultValues.category,
          brand: productDefaultValues.brand,
          description: productDefaultValues.description,
          stock: productDefaultValues.stock,
          images: productDefaultValues.images,
          isFeatured: productDefaultValues.isFeatured,
          banner: productDefaultValues.banner,
          price: productDefaultValues.price,
        };
  
   const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return <Form {...form}>
    <form className="space-y-8"></form>
    <div className="flex flex-col md:flex-row gap-5">
      {/*Name*/}
      <FormField
            control={form.control}
            name='name'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
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
                z.infer<typeof insertProductSchema>,
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
                z.infer<typeof insertProductSchema>,
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
                z.infer<typeof insertProductSchema>,
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
                z.infer<typeof insertProductSchema>,
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
                z.infer<typeof insertProductSchema>,
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
    <div className=" upload-field flex flex-col md:flex-row gap-5">
      {/*image*/}
      
    </div>
    
  </Form>;
};

export default ProductForm;
