"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Key, LogOut, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UpdatePasswordDialog from "../auth/update-password-dialog";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_GROUPS, isNavItemActive, findActiveGroup } from "@/lib/navigation";
import { useAuth } from "@/features/auth/context/auth.context";
import { toast } from "sonner";

export function Topbar() {
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { user, isLoading, logout } = useAuth();

  const activeGroup = findActiveGroup(pathname);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const handleSignOut = async () => {
    try {
      await logout();

      toast.success("Signed out successfully");

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      toast.error("Failed to sign out");
    }
  };
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-md hover:bg-neutral-100 md:hidden"
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-64 p-0"
          >
            <SheetHeader className="h-16 border-b px-4 py-0">
              <SheetTitle asChild>
                <Link
                  href="/"
                  className="flex h-16 items-center gap-2"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-900">
                    <TrendingUp
                      className="size-3.5 text-white"
                      strokeWidth={2.5}
                    />
                  </span>

                  <span>
                    <span className="block text-sm font-bold leading-none tracking-tight text-neutral-900">
                      SurePath
                    </span>

                    <span className="mt-1 block text-[9px] font-medium uppercase leading-none tracking-[0.12em] text-neutral-400">
                      Growth AI
                    </span>
                  </span>
                </Link>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-5 px-3 py-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    {group.label}
                  </p>

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isNavItemActive(item.href, pathname);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                            active
                              ? "bg-neutral-900 text-white"
                              : "text-neutral-700 hover:bg-neutral-100"
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Page title */}
        <span className="text-sm text-neutral-600">
          {activeGroup?.label}
        </span>
      </div>

      <DropdownMenu
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors cursor-pointer hover:bg-neutral-100"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
              {isLoading
                ? "..."
                : user?.display_name?.charAt(0).toUpperCase()}
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight text-neutral-900">
                {isLoading ? "Loading..." : user?.username}
              </span>

              <span className="block text-xs leading-tight text-neutral-500">
                {user?.role}
              </span>
            </span>

            <ChevronDown
              className={`size-4 shrink-0 text-neutral-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""
                }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-55 p-0"
        >
          {/* User info */}
          <DropdownMenuLabel className="px-4 py-2.5 font-normal">
            <p className="text-sm font-semibold">
              {user?.username}
            </p>

            <p className="mt-1 text-xs font-normal text-muted-foreground">
              {user?.role}
            </p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Update password */}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setIsPasswordDialogOpen(true);
            }}
            className="gap-2 px-4 py-2.5 cursor-pointer">
            <Key className="size-4 rotate-270 text-muted-foreground" />
            Update password
          </DropdownMenuItem>

          {/* Sign out */}
          <DropdownMenuItem
            onClick={handleSignOut}
            className="gap-2 px-4 py-2.5 cursor-pointer">
            <LogOut className="size-4 text-muted-foreground" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdatePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </header>
  );
}
