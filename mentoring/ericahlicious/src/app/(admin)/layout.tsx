import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string })?.role || "SUPERVISOR";
  const userName = session.user.name || "User";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <span className="font-bold text-lg text-gray-900">
                Ericahlicious
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <nav className="flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/menu"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Menu
                </Link>
                <Link
                  href="/ingredients"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Inventory
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Orders
                </Link>
              </nav>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="sm">
                    <span className="text-xs">
                      {userName} ({role})
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="text-xs">
                    {session.user.email}
                  </DropdownMenuItem>
                  <form
                    action={async () => {
                      "use server";
                      await logout();
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Logout
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
