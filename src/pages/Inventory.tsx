import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Package,
  Plus,
  Trash2,
  Search,
  Save,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Archive,
  Printer,
  Edit,
  AlertTriangle,
} from "lucide-react";
import { Product, Sale } from "@/lib/types";
import {
  getProducts,
  saveProduct,
  deleteProduct,
  updateProductQuantity,
  getSales,
  saveSale,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState<Sale | null>(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    quantity: "",
    price: "",
  });

  // Sale form state
  const [saleForm, setSaleForm] = useState({
    buyerName: "",
    productId: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getProducts());
    setSales(getSales());
  };

  const filteredProducts =
    products?.filter((product) =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // Product Management
  const validateProductForm = () => {
    const newErrors: Record<string, string> = {};

    if (!productForm.name.trim()) {
      newErrors.productName = "اسم المنتج مطلوب";
    }

    if (!productForm.quantity || parseInt(productForm.quantity) <= 0) {
      newErrors.productQuantity = "يجب إدخال كمية صحيحة";
    }

    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      newErrors.productPrice = "يجب إدخال سعر صحيح";
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).filter((key) => key.startsWith("product"))
        .length === 0
    );
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProductForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const productData: Product = {
        id: Date.now().toString(),
        name: productForm.name.trim(),
        quantity: parseInt(productForm.quantity),
        price: parseFloat(productForm.price),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      saveProduct(productData);
      loadData();
      setProductForm({ name: "", quantity: "", price: "" });
      setErrors({});
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      loadData();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Sales Management
  const validateSaleForm = () => {
    const newErrors: Record<string, string> = {};

    if (!saleForm.buyerName.trim()) {
      newErrors.buyerName = "اسم المشتري مطلوب";
    }

    if (!saleForm.productId) {
      newErrors.productId = "يجب اختيار المنتج";
    }

    if (!saleForm.quantity || parseInt(saleForm.quantity) <= 0) {
      newErrors.saleQuantity = "يجب إدخال كمية صحيحة";
    } else {
      const product = products?.find((p) => p.id === saleForm.productId);
      if (product && parseInt(saleForm.quantity) > product.quantity) {
        newErrors.saleQuantity = "الكمية المطلوبة أكبر من المتوفرة";
      }
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).filter((key) => !key.startsWith("product"))
        .length === 0
    );
  };

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSaleForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const product = products.find((p) => p.id === saleForm.productId);
      if (!product) {
        setErrors({ productId: "المنتج غير موجود" });
        return;
      }

      const quantity = parseInt(saleForm.quantity);
      const totalPrice = quantity * product.price;

      // Update product quantity
      const success = updateProductQuantity(product.id, -quantity);
      if (!success) {
        setErrors({ saleQuantity: "فشل في تحديث الكمية" });
        return;
      }

      // Create sale record
      const saleData: Sale = {
        id: Date.now().toString(),
        buyerName: saleForm.buyerName.trim(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.price,
        totalPrice: totalPrice,
        createdAt: new Date(),
      };

      saveSale(saleData);
      loadData();
      setSaleForm({ buyerName: "", productId: "", quantity: "" });
      setErrors({});
      setSaleSuccess(saleData);

      // Clear success message after 3 seconds
      setTimeout(() => setSaleSuccess(null), 3000);
    } catch (error) {
      console.error("Error processing sale:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintInvoice = (sale: Sale) => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة بيع - ${sale.id}</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px; }
          .logo { color: #f97316; font-size: 28px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { color: #666; font-size: 16px; }
          .invoice-info { margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 8px; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          .total { font-size: 18px; font-weight: bold; color: #f97316; border-top: 2px solid #f97316; padding-top: 10px; margin-top: 20px; }
          .footer { margin-top: 50px; text-align: center; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">صالة حسام لكمال الأجسام والرشاقة</div>
          <div class="subtitle">فاتورة بيع رقم: ${sale.id}</div>
        </div>

        <div class="invoice-info">
          <div class="row">
            <span class="label">اسم المشتري:</span>
            <span class="value">${sale.buyerName}</span>
          </div>
          <div class="row">
            <span class="label">اسم المنتج:</span>
            <span class="value">${sale.productName}</span>
          </div>
          <div class="row">
            <span class="label">الكمية:</span>
            <span class="value">${sale.quantity}</span>
          </div>
          <div class="row">
            <span class="label">سعر الوحدة:</span>
            <span class="value">${sale.unitPrice} ريال</span>
          </div>
          <div class="row total">
            <span class="label">المجموع الكلي:</span>
            <span class="value">${sale.totalPrice} ريال</span>
          </div>
        </div>

        <div class="footer">
          <div>تاريخ البيع: ${new Date(sale.createdAt).toLocaleDateString("ar-SA")}</div>
          <div>شكراً لتسوقكم معنا</div>
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

  const getSelectedProduct = () => {
    return products?.find((p) => p.id === saleForm.productId);
  };

  const calculateTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.totalPrice, 0);
  };

  const getLowStockProducts = () => {
    return products.filter((product) => product.quantity <= 5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخزن</h1>
          <p className="text-gray-600">إدارة المنتجات والمبيعات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Archive className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateTotalRevenue().toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">عدد المبيعات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sales.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مخزون منخفض</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getLowStockProducts().length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {saleSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">
                    تمت عملية البيع بنجاح!
                  </h3>
                  <p className="text-sm text-green-700">
                    تم بيع {saleSuccess.quantity} من {saleSuccess.productName}
                    بمبلغ {saleSuccess.totalPrice} ريال
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrintInvoice(saleSuccess)}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                <Printer className="h-4 w-4 mr-2" />
                طباعة الفاتورة
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {getLowStockProducts().length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-900">
                  تنبيه: مخزون منخفض
                </h3>
                <p className="text-sm text-yellow-700">
                  يوجد {getLowStockProducts().length} منتجات بمخزون منخفض (5 قطع
                  أو أقل)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Product Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-orange-600" />
                  إضافة منتج جديد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName" className="text-right block">
                      اسم المنتج *
                    </Label>
                    <Input
                      id="productName"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="أدخل اس�� المنتج"
                      className={cn(
                        "text-right",
                        errors.productName && "border-red-500",
                      )}
                    />
                    {errors.productName && (
                      <p className="text-sm text-red-600 text-right">
                        {errors.productName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="productQuantity"
                      className="text-right block"
                    >
                      الكمية *
                    </Label>
                    <Input
                      id="productQuantity"
                      type="number"
                      value={productForm.quantity}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      placeholder="عدد القطع"
                      min="1"
                      className={cn(
                        "text-right",
                        errors.productQuantity && "border-red-500",
                      )}
                    />
                    {errors.productQuantity && (
                      <p className="text-sm text-red-600 text-right">
                        {errors.productQuantity}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productPrice" className="text-right block">
                      السعر (ريال) *
                    </Label>
                    <Input
                      id="productPrice"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="سعر الوحدة"
                      min="0.01"
                      className={cn(
                        "text-right",
                        errors.productPrice && "border-red-500",
                      )}
                    />
                    {errors.productPrice && (
                      <p className="text-sm text-red-600 text-right">
                        {errors.productPrice}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        إضافة المنتج
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Products List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث في المنتجات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 text-right"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {products.length === 0
                        ? "لا توجد منتجات حتى الآن"
                        : "لم يتم العثور على نتائج"}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {products.length === 0
                        ? "ابدأ بإضافة أول منتج للمخزن"
                        : "جرب تغيير كلمات البحث"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className={cn(
                        "hover:shadow-lg transition-shadow duration-200",
                        product.quantity <= 5 &&
                          "border-yellow-300 bg-yellow-50",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-right">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              أضيف في{" "}
                              {new Date(product.createdAt).toLocaleDateString(
                                "ar-SA",
                              )}
                            </p>
                          </div>
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              الكمية:
                            </span>
                            <Badge
                              variant={
                                product.quantity <= 5
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={
                                product.quantity <= 5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {product.quantity} قطعة
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              السعر:
                            </span>
                            <span className="font-medium text-gray-900">
                              {product.price} ريال
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            حذف
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sale Form */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  تسجيل عملية بيع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSale} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyerName" className="text-right block">
                      اسم المشتري *
                    </Label>
                    <Input
                      id="buyerName"
                      value={saleForm.buyerName}
                      onChange={(e) =>
                        setSaleForm((prev) => ({
                          ...prev,
                          buyerName: e.target.value,
                        }))
                      }
                      placeholder="أدخل اسم المشتري"
                      className={cn(
                        "text-right",
                        errors.buyerName && "border-red-500",
                      )}
                    />
                    {errors.buyerName && (
                      <p className="text-sm text-red-600 text-right">
                        {errors.buyerName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productSelect" className="text-right block">
                      المنتج *
                    </Label>
                    <Select
                      value={saleForm.productId}
                      onValueChange={(value) =>
                        setSaleForm((prev) => ({ ...prev, productId: value }))
                      }
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {(products || [])
                          .filter((product) => product?.quantity > 0)
                          .map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="text-right">
                                <div className="font-medium">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  متوفر: {product.quantity} - السعر:{" "}
                                  {product.price} ريال
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.productId && (
                      <p className="text-sm text-red-600 text-right">
                        {errors.productId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saleQuantity" className="text-right block">
                      الكمية *
                    </Label>
                    <Input
                      id="saleQuantity"
                      type="number"
                      value={saleForm.quantity}
                      onChange={(e) =>
                        setSaleForm((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      placeholder="عدد القطع المراد بيعها"
                      min="1"
                      max={getSelectedProduct()?.quantity || 1}
                      className={cn(
                        "text-right",
                        errors.saleQuantity && "border-red-500",
                      )}
                    />
                    {errors.saleQuantity && (
                      <p className="text-sm text-red-600 text-right">
                        {errors.saleQuantity}
                      </p>
                    )}
                    {getSelectedProduct() && (
                      <p className="text-xs text-gray-500 text-right">
                        متوفر: {getSelectedProduct()!.quantity} قطعة
                      </p>
                    )}
                  </div>

                  {/* Total Price Preview */}
                  {getSelectedProduct() && saleForm.quantity && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">المجموع:</span>
                        <span className="font-bold text-green-600">
                          {(
                            getSelectedProduct()!.price *
                            parseInt(saleForm.quantity || "0")
                          ).toLocaleString()}{" "}
                          ريال
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      (products || []).filter((p) => p?.quantity > 0).length ===
                        0
                    }
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        جاري البيع...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        تأكيد البيع
                      </>
                    )}
                  </Button>

                  {(products || []).filter((p) => p?.quantity > 0).length ===
                    0 && (
                    <p className="text-sm text-red-600 text-center">
                      لا توجد منتجات متاحة للبيع
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Sales History */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    سجل المبيعات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sales.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">
                        لا توجد مبيعات حتى الآن
                      </h3>
                      <p className="text-gray-600 mt-1">
                        ستظهر عمليات البيع هنا
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {sales
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )
                        .map((sale) => (
                          <div
                            key={sale.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1 text-right">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {sale.buyerName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {sale.productName} × {sale.quantity}
                                  </div>
                                </div>
                                <div className="text-left">
                                  <div className="font-bold text-green-600">
                                    {sale.totalPrice.toLocaleString()} ريال
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(
                                      sale.createdAt,
                                    ).toLocaleDateString("ar-SA")}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrintInvoice(sale)}
                              className="mr-3"
                            >
                              <Printer className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              حذف المنتج
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف المنتج "{productToDelete?.name}"؟ لا يمكن
              التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
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
