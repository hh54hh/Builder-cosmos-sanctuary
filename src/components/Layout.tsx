import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  GraduationCap,
  Apple,
  Package,
  LogOut,
  Dumbbell,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/lib/storage";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "الأعضاء", href: "/dashboard", icon: Users },
  { name: "إضافة مشترك", href: "/dashboard/add-member", icon: UserPlus },
  { name: "الكورسات", href: "/dashboard/courses", icon: GraduationCap },
  { name: "الأنظمة الغذائية", href: "/dashboard/diet-plans", icon: Apple },
  { name: "المخزن", href: "/dashboard/inventory", icon: Package },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActivePath = (href: string) => {
    if (href === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname === "/dashboard/members"
      );
    }
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">صالة حسام</h1>
                <p className="text-sm text-gray-600">لكمال الأجسام والرشاقة</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                        : "text-gray-700 hover:text-orange-600 hover:bg-orange-50",
                    )}
                    onClick={() => navigate(item.href)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sm font-medium",
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                        : "text-gray-700 hover:text-orange-600 hover:bg-orange-50",
                    )}
                    onClick={() => {
                      navigate(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}
              <div className="pt-2 border-t border-gray-200">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
