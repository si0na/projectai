import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Settings,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { USER_ROLES } from "@/lib/constants";

type NavbarProps = {
  onSidebarToggle: () => void;
};

export function Navbar({ onSidebarToggle }: NavbarProps) {
  const { user } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "Admin";
      case USER_ROLES.DELIVERY_MANAGER:
        return "Delivery Manager";
      case USER_ROLES.PROJECT_MANAGER:
        return "Project Manager";
      default:
        return "Employee";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "destructive";
      case USER_ROLES.DELIVERY_MANAGER:
        return "default";
      case USER_ROLES.PROJECT_MANAGER:
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <nav className="bg-gradient-to-r from-[#393f43] to-[#2eb05a] border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Logo and app name */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2 hover:bg-gray-100 rounded-full"
              onClick={onSidebarToggle}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Company Logo and Project Name */}
            <div className="flex items-center pl-2">
              <div className="h-20 w-40 flex items-center justify-center">
                <img
                  src="https://trm.onreflections.com/assets/img/logoNew.png"
                  alt="Logo"
                  className="object-contain h-20 w-40"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* Right section - User controls */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex hover:bg-gray-100 rounded-full"
            >
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </Button>

            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 rounded-full px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex md:flex-col md:items-start">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.username || "User"} - {getRoleDisplayName(user?.role || "")}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded shadow-lg border border-gray-200 mt-2 bg-white" align="end">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                  <Badge
                    variant={getRoleBadgeVariant(user?.role || "")}
                    className="text-xs mt-1"
                  >
                    {getRoleDisplayName(user?.role || "")}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer text-gray-700">
                    <User className="mr-2 h-4 w-4 text-gray-600" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full cursor-pointer text-gray-700">
                    <Settings className="mr-2 h-4 w-4 text-gray-600" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 cursor-pointer hover:bg-gray-100 rounded">
                  <LogOut className="mr-2 h-4 w-4 text-red-400" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}