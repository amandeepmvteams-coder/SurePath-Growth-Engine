"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleQuestionMark, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils/utils";
import { NAV_GROUPS, isNavItemActive, type NavItem } from "@/lib/navigation";

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-neutral-900 text-white"
          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-52 shrink-0 flex-col border-r border-border bg-white md:flex">
      <Link
        href="/"
        className="flex h-16 shrink-0 items-center gap-2.5 px-5"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900">
          <TrendingUp className="size-4 text-white" strokeWidth={2.5} />
        </span>
        <span className="min-w-0.5">
          <span className="block text-[15px] font-bold leading-none tracking-tight text-neutral-900">
            SurePath
          </span>
          <span className="mt-1 block text-[10px] font-medium uppercase leading-none tracking-[0.14em] text-neutral-400">
            Growth AI
          </span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isNavItemActive(item.href, pathname)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <Link
          href="https://surepath-growth-uvjle.ondigitalocean.app/api/v1/docs#/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <CircleQuestionMark className="size-4 shrink-0" />
          API documentation
        </Link>
      </div>
    </aside>
  );
}
