import {
  BarChart3,
  CornerUpLeft,
  CornerUpRight,
  CreditCard,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  Package,
  Receipt,
  ShoppingCart,
  Tag,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Inventory",
    items: [
      {
        title: "Products",
        url: "/dashboard/products",
        icon: Package,
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: Tag,
      },
      {
        title: "Warehouses",
        url: "/dashboard/warehouses",
        icon: Warehouse,
      },
      {
        title: "Stock",
        url: "/dashboard/stock",
        icon: Layers,
      },
    ],
  },
  {
    id: 3,
    label: "Procurement",
    items: [
      {
        title: "Suppliers",
        url: "/dashboard/suppliers",
        icon: Truck,
      },
      {
        title: "Purchase Orders",
        url: "/dashboard/purchase-orders",
        icon: ShoppingCart,
      },
      {
        title: "Purchase Returns",
        url: "/dashboard/purchase-returns",
        icon: CornerUpLeft,
      },
    ],
  },
  {
    id: 4,
    label: "Sales",
    items: [
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
      },
      {
        title: "Sales Orders",
        url: "/dashboard/sales-orders",
        icon: Receipt,
      },
      {
        title: "Sales Returns",
        url: "/dashboard/sales-returns",
        icon: CornerUpRight,
      },
      {
        title: "Payments",
        url: "/dashboard/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    id: 5,
    label: "Analytics",
    items: [
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    id: 6,
    label: "Admin",
    items: [
      {
        title: "Users",
        url: "/dashboard/users",
        icon: UserCog,
      },
    ],
  },
];
