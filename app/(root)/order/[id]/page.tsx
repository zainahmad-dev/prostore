import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.action";
import { notFound } from "next/navigation";
import OrderDetailTable from "./order-details-table";
import { ShippingAddress, Order } from "@/types";


export const metadata: Metadata = {
    title: "Order Detail",
    
};
const OrderDetailPage = async (props: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await props.params;
    const  order = await getOrderById(id);
    if (!order) {
        notFound();
    }
    

    return <OrderDetailTable order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress
    } as Order}/>

};
 
export default OrderDetailPage;