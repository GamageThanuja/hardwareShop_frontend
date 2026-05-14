import {
  CommonStatus,
  CustomerType,
  InventoryTransactionType,
  PaymentMethod,
  PaymentStatus,
  PurchaseOrderStatus,
  PurchaseReturnStatus,
  SalesOrderStatus,
  SalesReturnStatus,
  UnitOfMeasure,
} from "./types";

export const commonStatusLabels: Record<CommonStatus, string> = {
  [CommonStatus.Active]: "Active",
  [CommonStatus.Inactive]: "Inactive",
  [CommonStatus.Archived]: "Archived",
  [CommonStatus.Pending]: "Pending",
  [CommonStatus.Suspended]: "Suspended",
};

export const customerTypeLabels: Record<CustomerType, string> = {
  [CustomerType.Retail]: "Retail",
  [CustomerType.Wholesale]: "Wholesale",
};

export const inventoryTransactionTypeLabels: Record<InventoryTransactionType, string> = {
  [InventoryTransactionType.Purchase]: "Purchase",
  [InventoryTransactionType.Sale]: "Sale",
  [InventoryTransactionType.Adjustment]: "Adjustment",
  [InventoryTransactionType.Transfer]: "Transfer",
  [InventoryTransactionType.Return]: "Return",
  [InventoryTransactionType.Damage]: "Damage",
  [InventoryTransactionType.Opening]: "Opening",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: "Cash",
  [PaymentMethod.Card]: "Card",
  [PaymentMethod.BankTransfer]: "Bank Transfer",
  [PaymentMethod.Cheque]: "Cheque",
  [PaymentMethod.Online]: "Online",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.Unpaid]: "Unpaid",
  [PaymentStatus.Partial]: "Partial",
  [PaymentStatus.Paid]: "Paid",
};

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Draft]: "Draft",
  [PurchaseOrderStatus.Pending]: "Pending",
  [PurchaseOrderStatus.Ordered]: "Ordered",
  [PurchaseOrderStatus.Received]: "Received",
  [PurchaseOrderStatus.Cancelled]: "Cancelled",
};

export const purchaseReturnStatusLabels: Record<PurchaseReturnStatus, string> = {
  [PurchaseReturnStatus.Pending]: "Pending",
  [PurchaseReturnStatus.Cancelled]: "Cancelled",
};

export const salesOrderStatusLabels: Record<SalesOrderStatus, string> = {
  [SalesOrderStatus.Draft]: "Draft",
  [SalesOrderStatus.Confirmed]: "Confirmed",
  [SalesOrderStatus.Processing]: "Processing",
  [SalesOrderStatus.Shipped]: "Shipped",
  [SalesOrderStatus.Delivered]: "Delivered",
  [SalesOrderStatus.Cancelled]: "Cancelled",
};

export const salesReturnStatusLabels: Record<SalesReturnStatus, string> = {
  [SalesReturnStatus.Pending]: "Pending",
  [SalesReturnStatus.Cancelled]: "Cancelled",
};

export const unitOfMeasureLabels: Record<UnitOfMeasure, string> = {
  [UnitOfMeasure.Piece]: "Piece",
  [UnitOfMeasure.Box]: "Box",
  [UnitOfMeasure.Kg]: "Kg",
  [UnitOfMeasure.Litre]: "Litre",
  [UnitOfMeasure.Metre]: "Metre",
  [UnitOfMeasure.Pack]: "Pack",
  [UnitOfMeasure.Set]: "Set",
  [UnitOfMeasure.Pair]: "Pair",
};
