"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SidebarLink } from "@/components/SidebarLink";
import { SignOutButton } from "@/components/SignOutButton";
import { getProfileStatus } from "@/app/lib/userActions";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Check if profile is completed
  useEffect(() => {
    const checkProfile = async () => {
      const status = await getProfileStatus();
      setIsProfileComplete(status.isComplete);
    };
    checkProfile();
  }, [pathname]); // Re-check when pathname changes

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="bg-black w-64 p-6 flex flex-col h-screen fixed left-0 top-0 z-10">
        <h3 className="px-4 py-2 font-bold mb-4">
          Volunteer<span className="text-blue-500">Engine</span>
        </h3>
        <nav className="space-y-2">
          <SidebarLink 
            href="/volunteer" 
            isActive={isActive("/volunteer")} 
            activeColor="blue"
            disabled={!isProfileComplete}
          >
            Dashboard
          </SidebarLink>
          <SidebarLink href="/volunteer/profile" isActive={isActive("/volunteer/profile")} activeColor="blue">
            Profile
          </SidebarLink>
          <SidebarLink 
            href="/volunteer/events" 
            isActive={isActive("/volunteer/events")} 
            activeColor="blue"
            disabled={!isProfileComplete}
          >
            Events
          </SidebarLink>
          <SidebarLink 
            href="/volunteer/notifications" 
            isActive={isActive("/volunteer/notifications")} 
            activeColor="blue"
            disabled={!isProfileComplete}
          >
            Notifications
          </SidebarLink>
        </nav>
        
        <div className="flex-grow"></div>
        <SignOutButton />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 min-h-screen">
        {!isProfileComplete && pathname !== "/volunteer/profile" ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
              <p className="text-gray-400 mb-6">
                Please complete your profile before accessing other features.
              </p>
              <a 
                href="/volunteer/profile"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Go to Profile
              </a>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}