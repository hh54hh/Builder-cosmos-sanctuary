import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Apple,
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  Utensils,
  Users,
  Calendar,
  Heart,
} from "lucide-react";
import { DietPlan } from "@/lib/types";
import {
  getDietPlans,
  saveDietPlan,
  deleteDietPlan,
  getMembers,
} from "@/lib/storage";

export default function DietPlans() {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDietPlan, setEditingDietPlan] = useState<DietPlan | null>(null);
  const [dietPlanToDelete, setDietPlanToDelete] = useState<DietPlan | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDietPlans();
  }, []);

  const loadDietPlans = () => {
    setDietPlans(getDietPlans());
  };

  const filteredDietPlans = dietPlans.filter(
    (diet) =>
      diet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (diet.description &&
        diet.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const openAddDialog = () => {
    setEditingDietPlan(null);
    setFormData({ name: "", description: "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (dietPlan: DietPlan) => {
    setEditingDietPlan(dietPlan);
    setFormData({
      name: dietPlan.name,
      description: dietPlan.description || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم النظام الغذائي مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dietPlanData: DietPlan = {
        id: editingDietPlan ? editingDietPlan.id : Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        createdAt: editingDietPlan ? editingDietPlan.createdAt : new Date(),
      };

      saveDietPlan(dietPlanData);
      loadDietPlans();
      setDialogOpen(false);
      setFormData({ name: "", description: "" });
      setEditingDietPlan(null);
    } catch (error) {
      console.error("Error saving diet plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDietPlan = (dietPlan: DietPlan) => {
    setDietPlanToDelete(dietPlan);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dietPlanToDelete) {
      deleteDietPlan(dietPlanToDelete.id);
      loadDietPlans();
      setDeleteDialogOpen(false);
      setDietPlanToDelete(null);
    }
  };

  const getFollowersCount = (dietPlanId: string) => {
    const members = getMembers() || [];
    return members.filter((member) => member.dietPlans?.includes(dietPlanId))
      .length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
            <Apple className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              الأنظمة الغذائية
            </h1>
            <p className="text-gray-600">إدارة الأنظمة الغذائية للأعضاء</p>
          </div>
        </div>

        <Button
          onClick={openAddDialog}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة نظام غذائي جديد
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="البحث في الأنظمة الغذائية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Utensils className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الأنظمة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dietPlans.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">المتابعين الحاليين</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dietPlans.reduce(
                    (total, diet) => total + getFollowersCount(diet.id),
                    0,
                  )}
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

      {/* Diet Plans List */}
      {filteredDietPlans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            {dietPlans.length === 0 ? (
              <div className="space-y-4">
                <Apple className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    لا توجد أنظمة غذائية حتى الآن
                  </h3>
                  <p className="text-gray-600 mt-1">
                    ابدأ بإضافة أول نظام غذائي
                  </p>
                </div>
                <Button
                  onClick={openAddDialog}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة نظام غذائي جديد
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
          {filteredDietPlans.map((dietPlan) => {
            const followersCount = getFollowersCount(dietPlan.id);

            return (
              <Card
                key={dietPlan.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 text-right">
                        {dietPlan.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        أضيف في{" "}
                        {new Date(dietPlan.createdAt).toLocaleDateString(
                          "ar-SA",
                        )}
                      </p>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                      <Apple className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  {dietPlan.description && (
                    <div>
                      <p className="text-sm text-gray-600 text-right line-clamp-3">
                        {dietPlan.description}
                      </p>
                    </div>
                  )}

                  {/* Followers Count */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={followersCount > 0 ? "default" : "secondary"}
                      className={
                        followersCount > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      {followersCount} متابع
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => openEditDialog(dietPlan)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-2"
                      onClick={() => handleDeleteDietPlan(dietPlan)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingDietPlan
                ? "تعديل النظام الغذائي"
                : "إضافة نظام غذائي جديد"}
            </DialogTitle>
            <DialogDescription className="text-right">
              {editingDietPlan
                ? "تعديل بيانات النظام الغذائي"
                : "إضافة نظام غذائي جديد للصالة"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right block">
                اسم النظام الغذائي *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="أدخل اسم النظام الغذائي"
                className="text-right"
              />
              {errors.name && (
                <p className="text-sm text-red-600 text-right">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right block">
                الوصف (اختياري)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="وصف مختصر للنظام الغذائي"
                className="text-right min-h-[80px]"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingDietPlan ? "تحديث" : "حفظ"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              حذف النظام الغذائي
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف النظام الغذائي "{dietPlanToDelete?.name}"؟ لا
              يمكن التراجع عن هذا الإجراء.
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
