import { Home, DollarSign, CheckSquare, Heart, UtensilsCrossed, FileText, Calendar, Settings, BookOpen, Plane, Gift, Camera } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { authUtils, hasPermission } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const user = authUtils.getAuth();
  const role = user?.role || "guest";

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home, permission: null },
    { title: "Finance", url: "/finance", icon: DollarSign, permission: "finance" },
    { title: "Tasks & Rewards", url: "/tasks", icon: CheckSquare, permission: "tasks" },
    { title: "Health", url: "/health", icon: Heart, permission: "health" },
    { title: "Kitchen", url: "/kitchen", icon: UtensilsCrossed, permission: "meals" },
    { title: "Education", url: "/study", icon: BookOpen, permission: "study" },
    { title: "Documents", url: "/documents", icon: FileText, permission: "docs" },
    { title: "Calendar", url: "/calendar", icon: Calendar, permission: null },
    { title: "Trips", url: "/trips", icon: Plane, permission: "trips" },
    { title: "Wishlist", url: "/wishlist", icon: Gift, permission: null },
    { title: "Memories", url: "/memories", icon: Camera, permission: null },
  ];

  const settingsItems = [
    { title: "Settings", url: "/settings", icon: Settings, permission: "settings" },
  ];

  const isCollapsed = state === "collapsed";

  const filterByPermission = (items: typeof mainItems) => {
    return items.filter((item) => {
      if (!item.permission) return true;
      return hasPermission(role, item.permission as any);
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FamilyHub
              </span>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByPermission(mainItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByPermission(settingsItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
