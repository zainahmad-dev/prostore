'use client';
import { Order } from "@/types";
const OrderDetailTable = ({order}:{order: Order }) => {
    return ( <>{order.id}</> );
}
 
export default OrderDetailTable;