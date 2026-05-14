import { Boxes, Building2, Package, ShoppingCart, Tag, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardDto } from "@/lib/api/types";

export function KpiCards({ data }: { data: DashboardDto }) {
  const { inventory, pendingPurchaseOrders, draftPurchaseOrders } = data;

  const cards = [
    { title: "Total Products", value: inventory.totalProducts, icon: Package, sub: `${inventory.activeProducts} active` },
    { title: "Categories", value: inventory.totalCategories, icon: Tag, sub: "product categories" },
    { title: "Warehouses", value: inventory.totalWarehouses, icon: Building2, sub: "storage locations" },
    { title: "Suppliers", value: inventory.totalSuppliers, icon: Boxes, sub: "active suppliers" },
    { title: "Customers", value: inventory.totalCustomers, icon: Users, sub: "registered customers" },
    {
      title: "Purchase Orders",
      value: pendingPurchaseOrders,
      icon: ShoppingCart,
      sub: `${draftPurchaseOrders} draft`,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
