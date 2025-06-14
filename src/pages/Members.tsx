import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Search,
  Edit,
  Trash2,
  Eye,
  Printer,
  Plus,
  UserPlus,
  Calendar,
  Weight,
  Ruler,
  AlertCircle,
} from "lucide-react";
import { Member } from "@/lib/types";
import {
  getMembers,
  deleteMember,
  getCourses,
  getDietPlans,
} from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    const membersData = getMembers();
    setMembers(membersData);
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeleteMember = (member: Member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
      loadMembers();
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handlePrintMember = (member: Member) => {
    const courses = getCourses();
    const dietPlans = getDietPlans();

    const memberCourses = member.courses
      .map(
        (courseId) => courses.find((c) => c.id === courseId)?.name || courseId,
      )
      .join(", ");

    const memberDietPlans = member.dietPlans
      .map((dietId) => dietPlans.find((d) => d.id === dietId)?.name || dietId)
      .join(", ");

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>بيانات المشترك - ${member.name}</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px; }
          .logo { color: #f97316; font-size: 28px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { color: #666; font-size: 16px; }
          .content { margin: 30px 0; }
          .field { margin: 15px 0; padding: 10px; background: #f9f9f9; border-right: 4px solid #f97316; }
          .field-label { font-weight: bold; color: #333; }
          .field-value { margin-top: 5px; color: #666; }
          .section { margin: 25px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #f97316; border-bottom: 1px solid #f97316; padding-bottom: 5px; margin-bottom: 15px; }
          .footer { margin-top: 50px; text-align: center; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">صالة حسام لكمال الأجسام والرشاقة</div>
          <div class="subtitle">بيانات المشترك</div>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">المعلومات الشخصية</div>
            <div class="field">
              <div class="field-label">الاسم:</div>
              <div class="field-value">${member.name}</div>
            </div>
            <div class="field">
              <div class="field-label">العمر:</div>
              <div class="field-value">${member.age} سنة</div>
            </div>
            <div class="field">
              <div class="field-label">الطول:</div>
              <div class="field-value">${member.height} سم</div>
            </div>
            <div class="field">
              <div class="field-label">الوزن:</div>
              <div class="field-value">${member.weight} كيلو</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">الكورسات المسجل بها</div>
            <div class="field">
              <div class="field-value">${memberCourses || "لم يتم تسجيل أي كورسات"}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">الأنظمة الغذائية</div>
            <div class="field">
              <div class="field-value">${memberDietPlans || "لم يتم تحديد أي أنظمة غذائية"}</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div>تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA")}</div>
          <div>صالة حسام - نظام إدارة الأعضاء</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الأعضاء</h1>
            <p className="text-gray-600">عرض وإدارة جميع أعضاء الصالة</p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/dashboard/add-member")}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة عضو جديد
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث عن عضو بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members Count */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الأعضاء</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الأعضاء النشطون</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredMembers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">اليوم</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Date().toLocaleDateString("ar-SA")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            {members.length === 0 ? (
              <div className="space-y-4">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    لا يوجد أعضاء حتى الآن
                  </h3>
                  <p className="text-gray-600 mt-1">
                    ابدأ بإضافة أول عضو في الصالة
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/dashboard/add-member")}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة عضو جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Search className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    لم يتم العثور على نتائج
                  </h3>
                  <p className="text-gray-600 mt-1">جرب تغيير كلمات البحث</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const courses = getCourses();
            const dietPlans = getDietPlans();

            return (
              <Card
                key={member.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 text-right">
                        {member.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        عضو منذ{" "}
                        {new Date(member.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                      </div>
                      <div className="font-medium text-gray-900">
                        {member.age}
                      </div>
                      <div className="text-gray-500 text-xs">سنة</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Ruler className="h-3 w-3 text-gray-500" />
                      </div>
                      <div className="font-medium text-gray-900">
                        {member.height}
                      </div>
                      <div className="text-gray-500 text-xs">سم</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Weight className="h-3 w-3 text-gray-500" />
                      </div>
                      <div className="font-medium text-gray-900">
                        {member.weight}
                      </div>
                      <div className="text-gray-500 text-xs">كيلو</div>
                    </div>
                  </div>

                  {/* Courses */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      الكورسات:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.courses.length > 0 ? (
                        member.courses.slice(0, 2).map((courseId) => {
                          const course = courses.find((c) => c.id === courseId);
                          return (
                            <Badge
                              key={courseId}
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-700"
                            >
                              {course?.name || courseId}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-500">
                          لا يوجد كورسات
                        </span>
                      )}
                      {member.courses.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.courses.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Diet Plans */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      الأنظمة الغذائية:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.dietPlans.length > 0 ? (
                        member.dietPlans.slice(0, 2).map((dietId) => {
                          const diet = dietPlans.find((d) => d.id === dietId);
                          return (
                            <Badge
                              key={dietId}
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700"
                            >
                              {diet?.name || dietId}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-500">
                          لا يوجد أنظمة غذائية
                        </span>
                      )}
                      {member.dietPlans.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.dietPlans.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() =>
                        navigate(`/dashboard/add-member?edit=${member.id}`)
                      }
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => handlePrintMember(member)}
                    >
                      <Printer className="h-3 w-3 mr-1" />
                      طباعة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-2"
                      onClick={() => handleDeleteMember(member)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              حذف العضو
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف العضو "{memberToDelete?.name}"؟ لا يمكن
              التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
