import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AuthProvider } from "@/features/auth/context/auth.context";
export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
     <AuthProvider>
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="min-w-0 flex-1 overflow-y-auto bg-neutral-50">
            <div className="mx-auto w-full max-w-315 px-4 py-6 sm:px-5 sm:py-8 md:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
 </AuthProvider>
  );
}