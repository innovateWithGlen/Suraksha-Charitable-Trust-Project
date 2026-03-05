"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  IndianRupee,
  Users,
  FileEdit,
  ImageIcon,
  Settings,
  LogOut,
  Menu,
  Search,
  MessageSquare,
  FileText,
  ArrowLeft,
  Handshake,
  ClipboardCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { NotificationBell } from "./components/notification-bell"

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/donations", label: "Donations", icon: IndianRupee },
  { href: "/admin/donors", label: "Donors", icon: Users },
  { href: "/admin/content", label: "Content", icon: FileEdit },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/csr", label: "CSR Projects", icon: Handshake },
  { href: "/admin/csr/requests", label: "80G Requests", icon: ClipboardCheck },
  { href: "/admin/tax-documentation", label: "Tax Documentation", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Admin navigation">
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <link.icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  // Don't show admin layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "A"
  const userName = session?.user?.name || "Admin"
  const userEmail = session?.user?.email || ""

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        {/* Sidebar header */}
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
          <Image
            src="/images/logo.png"
            alt="Suraksha Trust"
            width={32}
            height={32}
            className="size-8"
          />
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">Suraksha</p>
            <p className="text-[10px] text-sidebar-foreground/50">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <SidebarNav />
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="border-b border-sidebar-border px-4 py-4">
                  <SheetTitle className="flex items-center gap-2 text-sm">
                    <Image
                      src="/images/logo.png"
                      alt="Suraksha Trust"
                      width={24}
                      height={24}
                    />
                    Suraksha Admin
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <SidebarNav onItemClick={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-64 pl-9 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={userName}
                      width={32}
                      height={32}
                      className="size-8 rounded-full"
                    />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {userInitial}
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground font-normal">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="size-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
