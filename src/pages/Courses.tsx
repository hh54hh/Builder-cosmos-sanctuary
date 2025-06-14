import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Construction } from "lucide-react";

export default function Courses() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الكورسات</h1>
          <p className="text-gray-600">إضافة وتعديل الكورسات التدريبية</p>
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
                صفحة إدارة الكورسات قيد التطوير. ستتمكن من إضافة وتعديل وحذف
                الكورسات التدريبية.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
