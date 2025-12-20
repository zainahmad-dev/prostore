"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { ShippingAddress } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { shippingAddressSchema } from "@/lib/validator";
import { shippingAddressDefaultValues } from "@/lib/constants";


const ShippingAddressForm = ({ address }: { address: ShippingAddress }) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const [isPending, startTransition] = useTransition();

  return <>
  <div className="max-w-md mx-auto space-y-4">
    <div className="h2-bold mt-4">Shipping Address</div>
    </div>
    </>;
};

export default ShippingAddressForm;
