"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Flag, 
  Activity, 
  BarChart3, 
  Filter, 
  Users, 
  Key, 
  Settings 
} from "lucide-react";

const NAV = (projectId: string) => [
  {
    href: `/project/${projectId}/home`,
    label: "Home",
    icon: <Home size={16} strokeWidth={2} />,
  },
  {
    href: `/project/${projectId}/flags`,
    label: "Flags",
    icon: <Flag size={16} strokeWidth={2} />,
  },
  {
    label: "Events",
    href: `/project/${projectId}/events`,
    icon: <Activity size={16} strokeWidth={2} />,
  },
  {
    label: "Metrics",
    href: `/project/${projectId}/metrics`,
    icon: <BarChart3 size={16} strokeWidth={2} />,
  },
  {
    label: "Funnels",
    href: `/project/${projectId}/funnels`,
    icon: <Filter size={16} strokeWidth={2} />,
  },
  {
    label: "Retention",
    href: `/project/${projectId}/retention`,
    icon: <Users size={16} strokeWidth={2} />,
  },
  {
    href: `/project/${projectId}/api-keys`,
    label: "API Keys",
    icon: <Key size={16} strokeWidth={2} />,
  },
  {
    href: `/project/${projectId}/settings`,
    label: "Settings",
    icon: <Settings size={16} strokeWidth={2} />,
  },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const params = useParams();
  const projectId = (params?.projectId as string) || "default";

  const navItems = NAV(projectId);

  return (
    <nav className="sidebar-nav">
      <p className="nav-section-label">Workspace</p>
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item${active ? " nav-item-active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
