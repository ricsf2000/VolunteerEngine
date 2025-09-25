"use client";

import { usePathname } from "next/navigation";
import { SidebarLink } from "@/components/SidebarLink";
import { SignOutButton } from "@/components/SignOutButton";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="bg-black w-64 p-6 flex flex-col h-screen fixed left-0 top-0 z-10">
        <h3 className="px-4 py-2 font-bold mb-4">
          Volunteer<span className="text-blue-500">Engine</span>
        </h3>
        <nav className="space-y-2">
          <SidebarLink href="/volunteer" isActive={isActive("/volunteer")} activeColor="blue">
            Dashboard
          </SidebarLink>
          <SidebarLink href="/volunteer/profile" isActive={isActive("/volunteer/profile")} activeColor="blue">
            Profile
          </SidebarLink>
          <SidebarLink href="/volunteer/events" isActive={isActive("/volunteer/events")} activeColor="blue">
            Events
          </SidebarLink>
          <SidebarLink href="/volunteer/notifications" isActive={isActive("/volunteer/notifications")} activeColor="blue">
            Notifications
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