import { OrderStatus } from "src/order/dto/update-order.dto";


export const validTransitions: Record<OrderStatus, OrderStatus[]> = {
PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED,],
PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
SHIPPED: [OrderStatus.DELIVERED],
DELIVERED: [],
CANCELLED: [],
};

export function isValidTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}