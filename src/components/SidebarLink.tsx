import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  isActive: boolean;
  activeColor: 'blue' | 'green';
  disabled?: boolean;
  children: React.ReactNode;
}

export function SidebarLink({ href, isActive, activeColor, disabled = false, children }: SidebarLinkProps) {
  const activeClass = activeColor === 'blue' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white';
  const hoverClass = activeColor === 'blue' ? 'hover:bg-blue-600/30' : 'hover:bg-green-600/30';
  const disabledClass = 'text-gray-500 cursor-not-allowed';
  
  if (disabled) {
    return (
      <span className={`block px-4 py-2 rounded-lg ${disabledClass}`}>
        {children}
      </span>
    );
  }
  
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