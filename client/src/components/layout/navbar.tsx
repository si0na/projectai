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
          return "User";
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
      <nav className="bg-gradient-to-r from-blue-50 via-white to-blue-100 border-b border-gray-200 sticky top-0 z-50 shadow-md rounded-b-2xl">
        <div className="px-6 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between h-20">
            {/* Left section - Logo and app name */}
            <div className="flex items-center gap-4 min-w-[320px]">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2 hover:bg-blue-100 rounded-full border border-gray-200 shadow-sm"
                onClick={onSidebarToggle}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5 text-blue-500" />
              </Button>

              {/* Company Logo and Project Name */}
              <div className="flex items-center gap-4 pl-0" style={{ marginLeft: '-2.5rem' }}>
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2HHwkYvOPnMpkzNNI0LlEDMhXMIeG5vWBcI3IwmNBusGWFddIr_r71xFDJvbknY3Phbo&usqp=CAU"
                  className="object-contain h-14 w-14 rounded-2xl border border-blue-100 shadow-lg bg-white"
                  style={{ objectFit: "contain" }}
                  loading="eager"
                />
                <div className="flex flex-col justify-center">
                  <span style={{ fontFamily: 'Montserrat, Poppins, Inter, sans-serif', fontWeight: 900, fontSize: '1.5rem', color: '#1a237e', letterSpacing: '0.04em', lineHeight: 1, marginBottom: '0.1em', textShadow: '0 2px 8px rgba(26,35,126,0.08)' }}>
                    Reflections
                  </span>
                </div>
              </div>
            </div>

            {/* Right section - User controls */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex hover:bg-blue-100 rounded-full border border-gray-200 shadow-sm"
              >
                <HelpCircle className="h-5 w-5 text-blue-400" />
              </Button>

              <Button variant="ghost" size="icon" className="relative hover:bg-blue-100 rounded-full border border-gray-200 shadow-sm">
                <Bell className="h-5 w-5 text-blue-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-blue-100 rounded-full border border-gray-200 shadow-sm px-2">
                    <Avatar className="h-9 w-9 border-2 border-blue-200 shadow">
                      <AvatarFallback className="bg-blue-500 text-white text-lg font-bold">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex md:flex-col md:items-start">
                      <span className="text-sm font-semibold text-gray-700">
                        {user?.username || "User"}
                      </span>
                      <Badge
                        variant={getRoleBadgeVariant(user?.role || "")}
                        className="text-xs font-medium mt-0.5"
                      >
                        {getRoleDisplayName(user?.role || "")}
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl shadow-lg border border-blue-100 mt-2" align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">
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
                    <Link href="/profile" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-blue-400" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4 text-blue-400" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50 rounded-lg">
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
