"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "@/components/SidebarLink";
import { SignOutButton } from "@/components/SignOutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin/events" && (pathname === "/admin" || pathname === "/admin/events")) {
      return true;
    }
    return pathname === path;
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="bg-black w-64 p-6 flex flex-col h-screen fixed left-0 top-0 z-10">
        <h3 className="px-4 py-2 font-bold mb-4">
          Volunteer<span className="text-green-500">Engine</span>
        </h3>
        <nav className="space-y-2">
          <SidebarLink href="/admin/events" isActive={isActive("/admin/events")} activeColor="green">
            Events
          </SidebarLink>
          <SidebarLink href="/admin/notifications" isActive={isActive("/admin/notifications")} activeColor="green">
            Notifications
          </SidebarLink>
          <SidebarLink href="/admin/volunteer-history" isActive={isActive("/admin/volunteer-history")} activeColor="green">
            Volunteer History
          </SidebarLink>
          <SidebarLink href="/admin/volunteer-matching" isActive={isActive("/admin/volunteer-matching")} activeColor="green">
            Volunteer Matching
          </SidebarLink>
          <SidebarLink href="/admin/report-generation" isActive={isActive("/admin/report-generation")} activeColor="green">
            Report Generation
          </SidebarLink>
        </nav>

        <div className="flex-grow"></div>        
        <SignOutButton />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 min-h-screen">{children}</div>
    </div>
  );
}