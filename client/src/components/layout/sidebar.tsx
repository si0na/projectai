import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

import {
  BarChart3,
  FolderOpen,
  FileText,
  ClipboardCheck,
  TrendingUp,
  Bot,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    roles: ["project_manager", "delivery_manager", "admin"],
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderOpen,
    roles: ["project_manager", "delivery_manager", "admin"],
  },
  {
    name: "Weekly Reports",
    href: "/weekly-reports",
    icon: FileText,
    roles: ["project_manager", "delivery_manager", "admin"],
  },
  {
    name: "Technical Reviews",
    href: "/technical-reviews",
    icon: ClipboardCheck,
    roles: ["project_manager", "delivery_manager", "admin"],
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    roles: ["delivery_manager", "admin"],
  },
  {
    name: "LLM Configuration",
    href: "/llm-config",
    icon: Bot,
    roles: ["delivery_manager", "admin"],
  },
];

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  toggleCollapse: () => void;
}

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
  toggleCollapse,
}: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-white shadow-xl border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-64",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* Header with Logo */}
        <div
          className={cn(
            "border-b border-gray-100 flex items-center justify-center",
            isCollapsed ? "h-20 px-0" : "h-28 px-4 flex-col"
          )}
        >
          {isCollapsed ? (
            <div className="w-16 h-16 flex items-center justify-center">
              <BarChart3 className="h-14 w-14 text-blue-600" />
            </div>
          ) : (
            <div className="w-full h-24 flex flex-col items-center justify-center mt-4">
              <BarChart3 className="h-20 w-20 text-blue-600 mb-2" />
              <h1 className="text-3xl font-bold text-gray-900">
                Project Review
              </h1>
              <p className="text-lg text-gray-500">Management Tool</p>
            </div>
          )}

          {/* Collapse + Close Buttons */}
          <div className="absolute right-2 top-2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex hover:bg-gray-100"
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary border-l-4 border-primary"
                      : "text-gray-600 hover:bg-gray-50",
                    isCollapsed ? "justify-center px-0 mx-2" : "space-x-3 pl-3"
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-gray-500"
                    )}
                  />
                  {!isCollapsed && <span className="text-sm">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div
          className={cn(
            "p-3 border-t border-gray-100",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          <Link href="/logout">
            <div
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors",
                isCollapsed ? "justify-center px-0 mx-2" : "space-x-3"
              )}
            >
              <LogOut className="h-5 w-5 text-gray-500" />
              {!isCollapsed && <span className="text-sm">Sign Out</span>}
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
