import {
  ChartNoAxesColumn,
  LayoutGrid,
  Store,
  SunDim,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  /** Rendered as the sidebar section heading and as the header context label. */
  label: string;
  items: NavItem[];
};

/**
 * Single source of truth for the sidebar. The header derives its context label
 * from the same data, so the two can never drift apart.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Sales", href: "/sales", icon: ChartNoAxesColumn },
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { label: "Merchants", href: "/merchants", icon: Store },
      { label: "Pipeline", href: "/pipeline", icon: Waypoints },
    ],
  },
  {
    label: "Configuration",
    items: [{ label: "Settings", href: "/settings", icon: SunDim }],
  },
];

/** Matches the item itself and any nested route, e.g. /merchants/18264. */
export function isNavItemActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveGroup(pathname: string): NavGroup | undefined {
  return NAV_GROUPS.find((group) =>
    group.items.some((item) => isNavItemActive(item.href, pathname)),
  );
}
