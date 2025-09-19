import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  isActive: boolean;
  activeColor: 'blue' | 'green';
  children: React.ReactNode;
}

export function SidebarLink({ href, isActive, activeColor, children }: SidebarLinkProps) {
  const activeClass = activeColor === 'blue' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white';
  const hoverClass = activeColor === 'blue' ? 'hover:bg-blue-600/30' : 'hover:bg-green-600/30';
  
  return (
    <Link
      href={href}
      className={`block px-4 py-2 rounded-lg ${
        isActive ? activeClass : hoverClass
      }`}
    >
      {children}
    </Link>
  );
}