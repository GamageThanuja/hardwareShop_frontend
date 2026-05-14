// ─── Enums ───────────────────────────────────────────────────────────────────

export enum CommonStatus {
  Active = 1,
  Inactive = 2,
  Archived = 3,
  Pending = 4,
  Suspended = 5,
}

export enum CustomerType {
  Retail = 1,
  Wholesale = 2,
}

export enum InventoryTransactionType {
  Purchase = 1,
  Sale = 2,
  Adjustment = 3,
  Transfer = 4,
  Return = 5,
  Damage = 6,
  Opening = 7,
}

export enum PaymentMethod {
  Cash = 1,
  Card = 2,
  BankTransfer = 3,
  Cheque = 4,
  Online = 5,
}

export enum PaymentStatus {
  Unpaid = 1,
  Partial = 2,
  Paid = 3,
}

export enum PurchaseOrderStatus {
  Draft = 1,
  Pending = 2,
  Ordered = 3,
  Received = 4,
  Cancelled = 5,
}

export enum PurchaseReturnStatus {
  Pending = 1,
  Cancelled = 2,
}

export enum SalesOrderStatus {
  Draft = 1,
  Confirmed = 2,
  Processing = 3,
  Shipped = 4,
  Delivered = 5,
  Cancelled = 6,
}

export enum SalesReturnStatus {
  Pending = 1,
  Cancelled = 2,
}

export enum UnitOfMeasure {
  Piece = 1,
  Box = 2,
  Kg = 3,
  Litre = 4,
  Metre = 5,
  Pack = 6,
  Set = 7,
  Pair = 8,
}

// ─── Generic wrappers ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
  timestamp: string;
}

export interface PagedResult<T> {
  items: T[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PagedQuery {
  Page?: number;
  PageSize?: number;
  SortBy?: string;
  SortDescending?: boolean;
  Search?: string;
  [key: string]: unknown;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginDto {
  userName: string;
  password: string;
}

export interface RegisterDto {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  sessionId: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  roles: string[] | null;
}

export interface CreateUserDto {
  firstName?: string;
  lastName?: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive: boolean;
}

export interface AssignRolesDto {
  roles: string[];
}

export interface UpdateMyProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface SessionSummaryDto {
  sessionId: string | null;
  deviceName: string | null;
  clientType: string | null;
  ipAddress: string | null;
  createdUtc: string;
  lastUsedUtc: string | null;
  isCurrent: boolean;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: string;
  name: string | null;
  description: string | null;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  status: CommonStatus;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: string;
  status: CommonStatus;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: string;
  status: CommonStatus;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface CustomerDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  customerType: CustomerType;
  creditLimit: number;
  status: CommonStatus;
  createdAt: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  customerType: CustomerType;
  creditLimit: number;
}

export interface UpdateCustomerDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  customerType: CustomerType;
  creditLimit: number;
  status: CommonStatus;
}

// ─── Supplier ────────────────────────────────────────────────────────────────

export interface SupplierDto {
  id: string;
  name: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: CommonStatus;
  createdAt: string;
}

export interface CreateSupplierDto {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateSupplierDto {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  status: CommonStatus;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductDto {
  id: string;
  sku: string | null;
  name: string | null;
  description: string | null;
  barcode: string | null;
  categoryId: string;
  categoryName: string | null;
  supplierId: string | null;
  supplierName: string | null;
  unitPrice: number;
  costPrice: number;
  unit: UnitOfMeasure;
  reorderLevel: number;
  reorderQuantity: number;
  status: CommonStatus;
  createdAt: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  barcode?: string;
  categoryId: string;
  supplierId?: string;
  unitPrice: number;
  costPrice: number;
  unit: UnitOfMeasure;
  reorderLevel: number;
  reorderQuantity: number;
}

export interface UpdateProductDto {
  name: string;
  description?: string;
  barcode?: string;
  categoryId: string;
  supplierId?: string;
  unitPrice: number;
  costPrice: number;
  unit: UnitOfMeasure;
  reorderLevel: number;
  reorderQuantity: number;
  status: CommonStatus;
}

// ─── Warehouse ───────────────────────────────────────────────────────────────

export interface WarehouseDto {
  id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: CommonStatus;
  createdAt: string;
}

export interface CreateWarehouseDto {
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateWarehouseDto {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  status: CommonStatus;
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export interface StockItemDto {
  id: string;
  productId: string;
  productName: string | null;
  productSKU: string | null;
  warehouseId: string;
  warehouseName: string | null;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
}

export interface InventoryTransactionDto {
  id: string;
  productId: string;
  productName: string | null;
  warehouseId: string;
  warehouseName: string | null;
  transactionType: InventoryTransactionType;
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateInventoryTransactionDto {
  productId: string;
  warehouseId: string;
  transactionType: InventoryTransactionType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

export interface TransferStockDto {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  notes?: string;
}

export interface StockTransferResultDto {
  transferOut: InventoryTransactionDto;
  transferIn: InventoryTransactionDto;
}

// ─── Purchase Order ───────────────────────────────────────────────────────────

export interface PurchaseOrderItemDto {
  id: string;
  productId: string;
  productName: string | null;
  productSKU: string | null;
  quantity: number;
  unitCost: number;
  receivedQuantity: number;
  subTotal: number;
}

export interface PurchaseOrderDto {
  id: string;
  poNumber: string | null;
  supplierId: string;
  supplierName: string | null;
  orderDate: string;
  expectedDeliveryDate: string | null;
  status: PurchaseOrderStatus;
  totalAmount: number;
  notes: string | null;
  items: PurchaseOrderItemDto[] | null;
  createdAt: string;
}

export interface CreatePurchaseOrderItemDto {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items: CreatePurchaseOrderItemDto[];
}

export interface UpdatePurchaseOrderStatusDto {
  status: PurchaseOrderStatus;
}

export interface ReceivePurchaseOrderItemDto {
  purchaseOrderItemId: string;
  receivedQuantity: number;
}

// ─── Sales Order ──────────────────────────────────────────────────────────────

export interface SalesOrderItemDto {
  id: string;
  productId: string;
  productName: string | null;
  productSKU: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  subTotal: number;
}

export interface SalesOrderDto {
  id: string;
  orderNumber: string | null;
  customerId: string | null;
  customerName: string | null;
  orderDate: string;
  status: SalesOrderStatus;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  balance: number;
  notes: string | null;
  items: SalesOrderItemDto[] | null;
  createdAt: string;
}

export interface CreateSalesOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export interface CreateSalesOrderDto {
  customerId?: string;
  orderDate: string;
  notes?: string;
  items: CreateSalesOrderItemDto[];
}

export interface UpdateSalesOrderStatusDto {
  status: SalesOrderStatus;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentDto {
  id: string;
  salesOrderId: string;
  orderNumber: string | null;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  referenceNumber: string | null;
  notes: string | null;
  createdByUserId: string | null;
  isVoided: boolean;
  voidedAt: string | null;
  voidedByUserId: string | null;
  voidReason: string | null;
  createdAt: string;
}

export interface RecordPaymentDto {
  salesOrderId: string;
  amount: number;
  method: PaymentMethod;
  paymentDate?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface VoidPaymentDto {
  reason?: string;
}

// ─── Purchase Return ──────────────────────────────────────────────────────────

export interface PurchaseReturnItemDto {
  id: string;
  productId: string;
  productName: string | null;
  productSKU: string | null;
  quantity: number;
  unitCost: number;
  notes: string | null;
}

export interface PurchaseReturnDto {
  id: string;
  returnNumber: string | null;
  purchaseOrderId: string;
  poNumber: string | null;
  supplierName: string | null;
  warehouseId: string;
  returnDate: string;
  reason: string | null;
  notes: string | null;
  status: PurchaseReturnStatus;
  items: PurchaseReturnItemDto[] | null;
  createdAt: string;
}

export interface CreatePurchaseReturnItemDto {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreatePurchaseReturnDto {
  purchaseOrderId: string;
  warehouseId: string;
  returnDate?: string;
  reason?: string;
  notes?: string;
  items: CreatePurchaseReturnItemDto[];
}

// ─── Sales Return ─────────────────────────────────────────────────────────────

export interface SalesReturnItemDto {
  id: string;
  productId: string;
  productName: string | null;
  productSKU: string | null;
  quantity: number;
  notes: string | null;
}

export interface SalesReturnDto {
  id: string;
  returnNumber: string | null;
  salesOrderId: string;
  orderNumber: string | null;
  warehouseId: string;
  returnDate: string;
  reason: string | null;
  notes: string | null;
  status: SalesReturnStatus;
  items: SalesReturnItemDto[] | null;
  createdAt: string;
}

export interface CreateSalesReturnItemDto {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateSalesReturnDto {
  salesOrderId: string;
  warehouseId: string;
  returnDate?: string;
  reason?: string;
  notes?: string;
  items: CreateSalesReturnItemDto[];
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface InventorySummaryDto {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalWarehouses: number;
  totalCustomers: number;
}

export interface SalesSummaryDto {
  orderCount: number;
  totalAmount: number;
}

export interface LowStockAlertDto {
  productId: string;
  sku: string | null;
  productName: string | null;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseName: string | null;
}

export interface RecentOrderDto {
  id: string;
  orderNumber: string | null;
  customerName: string | null;
  grandTotal: number;
  status: number;
  orderDate: string;
}

export interface DashboardDto {
  inventory: InventorySummaryDto;
  todaySales: SalesSummaryDto;
  monthSales: SalesSummaryDto;
  pendingPurchaseOrders: number;
  draftPurchaseOrders: number;
  lowStockAlerts: LowStockAlertDto[] | null;
  recentSalesOrders: RecentOrderDto[] | null;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface SalesStatusSummaryDto {
  status: SalesOrderStatus;
  count: number;
  totalAmount: number;
}

export interface PaymentMethodSummaryDto {
  method: PaymentMethod;
  count: number;
  totalAmount: number;
}

export interface TopProductDto {
  productId: string;
  sku: string | null;
  productName: string | null;
  quantitySold: number;
  revenue: number;
}

export interface SalesReportDto {
  dateFrom: string;
  dateTo: string;
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscount: number;
  totalAmountPaid: number;
  totalOutstanding: number;
  byStatus: SalesStatusSummaryDto[] | null;
  byPaymentMethod: PaymentMethodSummaryDto[] | null;
  topProducts: TopProductDto[] | null;
}

export interface InventoryValuationItemDto {
  productId: string;
  sku: string | null;
  productName: string | null;
  categoryName: string | null;
  totalUnits: number;
  costPrice: number;
  totalValue: number;
}

export interface InventoryValuationDto {
  totalProducts: number;
  totalUnits: number;
  totalValue: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: InventoryValuationItemDto[] | null;
}

export interface PurchaseStatusSummaryDto {
  status: PurchaseOrderStatus;
  count: number;
  totalAmount: number;
}

export interface SupplierSpendDto {
  supplierId: string;
  supplierName: string | null;
  orderCount: number;
  totalAmount: number;
}

export interface PurchaseReportDto {
  dateFrom: string;
  dateTo: string;
  totalOrders: number;
  totalAmount: number;
  byStatus: PurchaseStatusSummaryDto[] | null;
  bySupplier: SupplierSpendDto[] | null;
}
