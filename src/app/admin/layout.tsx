import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signOutAction } from "@/server/actions/auth";
import { site } from "@/content/site";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-sterile">
      {session && (
        <header className="border-b border-manifest-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-baseline gap-8">
              <Link href="/admin" className="font-display text-lg text-manifest-900">
                {site.name}
              </Link>
              <nav className="flex gap-6 text-sm">
                <Link href="/admin" className="text-manifest-600 hover:text-manifest-900">
                  Inventory
                </Link>
                <Link href="/admin/orders" className="text-manifest-600 hover:text-manifest-900">
                  Orders
                </Link>
                <Link href="/" className="text-manifest-600 hover:text-manifest-900">
                  View site
                </Link>
              </nav>
            </div>

            <form action={signOutAction} className="flex items-center gap-4">
              <span className="text-sm text-manifest-400">{session.email}</span>
              <button
                type="submit"
                className="text-sm font-medium text-manifest-800 underline underline-offset-4"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
