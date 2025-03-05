
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, LayoutDashboard, BarChart3, Settings, Upload, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/",
    },
    {
      name: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/analytics",
    },
    {
      name: "Upload",
      icon: <Upload size={20} />,
      path: "/upload",
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  const getInitials = () => {
    if (!user) return "?";
    
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 h-screen w-64 glass border-r border-border shadow-sm z-10">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ChevronRight className="text-white" size={16} />
            </div>
            GazeMetrics
          </h1>
        </div>
        
        <div className="flex-1 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 px-4",
                      isActive(item.path)
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-secondary"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.name}
                    </span>
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-6">
          {user ? (
            <div className="flex items-center gap-3 p-3 glass rounded-lg">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass rounded-lg p-4 text-sm">
              <p className="font-medium mb-1">Sign In</p>
              <p className="text-muted-foreground text-xs mb-3">Sign in to access all features</p>
              <Link to="/auth">
                <Button size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
