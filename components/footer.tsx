import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin } from "lucide-react"

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/what-we-do", label: "Our Programs" },
  { href: "/donate", label: "Donate" },
  { href: "/contact", label: "Contact" },
]

const programs = [
  "Education Support",
  "Healthcare Outreach",
  "Environmental Care",
  "Community Welfare",
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Suraksha Charitable Trust logo"
                width={40}
                height={40}
                className="size-10 rounded-md bg-primary-foreground/10 p-1"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight">Suraksha</span>
                <span className="text-xs text-primary-foreground/60 leading-tight">
                  Charitable Trust
                </span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Empowering lives through education, healthcare, protection, and
              community support across India.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2" aria-label="Footer quick links">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-primary-foreground/60 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Programs */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Our Programs
            </h3>
            <ul className="flex flex-col gap-2">
              {programs.map((program) => (
                <li
                  key={program}
                  className="text-sm text-primary-foreground/60"
                >
                  {program}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/90">
              Contact Us
            </h3>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/60">
              <a
                href="tel:+917892351129"
                className="flex items-start gap-2 transition-colors hover:text-accent"
              >
                <Phone className="mt-0.5 size-4 shrink-0" />
                +91 7892351129
              </a>
              <a
                // href="mailto:savermonteiro@gmail.com"
                href="mailto:savermonteiro@gmail.com?subject=Inquiry%20from%20Website"
                className="flex items-start gap-2 transition-colors hover:text-accent"
              >
                <Mail className="mt-0.5 size-4 shrink-0" />
                savermonteiro@gmail.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
          <p>
            &copy; {new Date().getFullYear()} Suraksha Charitable Trust. All rights reserved. 
            <a href="https://www.linkedin.com/in/glen-monteiro/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-accent">
              Designed by Glen Monteiro
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
