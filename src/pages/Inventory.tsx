import { Card, CardContent } from "@/components/ui/card";
import { Package, Construction } from "lucide-react";

export default function Inventory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخزن</h1>
          <p className="text-gray-600">إدارة المنتجات والمبيعات</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <Construction className="h-16 w-16 text-amber-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                قيد التطوير
              </h3>
              <p className="text-gray-600 mt-2">
                صفحة إدارة المخزن قيد التطوير. ستتمكن من إدارة المنتجات
                والمبيعات والفواتير.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
