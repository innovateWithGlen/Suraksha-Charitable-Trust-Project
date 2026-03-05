"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, Phone, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      {/* Top bar with contact info */}
      <div className="hidden md:block bg-primary">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-6 px-6 py-1.5 text-xs text-primary-foreground/80">
          <a href="tel:+919999900000" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
            <Phone className="size-3" />
            +91 99999-00000
          </a>
          <a href="mailto:SurakshaCharitableTrust@gmail.com" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
            <Mail className="size-3" />
            SurakshaCharitableTrust@gmail.com
          </a>
        </div>
      </div>

      {/* Main navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Suraksha Charitable Trust logo"
            width={48}
            height={48}
            className="size-10 md:size-12"
          />
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold leading-tight text-foreground">
              Suraksha
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground leading-tight">
              Charitable Trust
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-secondary",
                pathname === link.href
                  ? "text-secondary"
                  : "text-foreground/80"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Button
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
          >
            <Link href="/donate" className="flex items-center gap-2">
              Donate Now
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Image
                  src="/images/logo.png"
                  alt="Suraksha Charitable Trust logo"
                  width={32}
                  height={32}
                />
                Suraksha Trust
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-secondary"
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 px-3">
                <Button
                  asChild
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                >
                  <Link href="/donate" onClick={() => setOpen(false)} className="flex items-center gap-2">
                    Donate Now
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </nav>
            <div className="mt-auto border-t border-border px-4 py-4 text-xs text-muted-foreground">
              <a href="tel:+919999900000" className="flex items-center gap-2 mb-2">
                <Phone className="size-3" /> +91 99999-00000
              </a>
              <a href="mailto:SurakshaCharitableTrust@gmail.com" className="flex items-center gap-2">
                <Mail className="size-3" /> SurakshaCharitableTrust@gmail.com
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
