"use client"

import { useEffect, useState } from "react"
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { WhatsAppConnect } from "@/components/whatsapp-connect"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const fallbackContactDetails = [
  {
    icon: Phone,
    title: "Phone",
    value: "+91 99999-00000",
    href: "tel:+919999900000",
  },
  {
    icon: Mail,
    title: "Email",
    value: "SurakshaCharitableTrust@gmail.com",
    href: "mailto:SurakshaCharitableTrust@gmail.com",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "Suraksha Charitable Trust, India",
    href: null,
  },
  {
    icon: Clock,
    title: "Working Hours",
    value: "Mon - Sat: 9:00 AM - 6:00 PM",
    href: null,
  },
]

const fallbackFaqs = [
  {
    question: "Is my donation tax-deductible?",
    answer:
      "Yes, all donations to Suraksha Charitable Trust are eligible for tax deduction under Section 80G of the Income Tax Act. You will receive a tax receipt via email after your donation is processed.",
  },
  {
    question: "How are the funds used?",
    answer:
      "We maintain complete transparency in fund utilization. Over 85% of all donations go directly to our programs in education, healthcare, environment, and community welfare. The remaining covers essential administrative and operational costs. Detailed financial reports are published annually.",
  },
  {
    question: "Can I volunteer with Suraksha Trust?",
    answer:
      "Absolutely! We welcome volunteers from all backgrounds. You can contribute your time and skills in various areas including teaching, healthcare support, event management, and community outreach. Fill out the contact form or email us to learn about current volunteering opportunities.",
  },
  {
    question: "How can I track the impact of my donation?",
    answer:
      "We send regular impact reports to our donors detailing how their contributions have made a difference. You can also visit our programs in person by scheduling a visit through our office.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, credit/debit cards, net banking, and bank transfers through our secure payment gateway powered by Razorpay. All transactions are encrypted and fully secure.",
  },
  {
    question: "Can I donate in someone's name or in memory of someone?",
    answer:
      "Yes, you can make a donation in honor or memory of a loved one. Simply mention the details in the notes section during the donation process, and we will send an acknowledgement to the person or family.",
  },
  {
    question: "Do you accept international donations?",
    answer:
      "Currently, we accept donations from within India. We are working on setting up FCRA registration to accept international contributions. Please contact us for more details.",
  },
  {
    question: "How do I get a receipt for my donation?",
    answer:
      "A donation receipt is automatically sent to your registered email address within 24 hours of a successful transaction. If you do not receive it, please contact us at SurakshaCharitableTrust@gmail.com.",
  },
]

const normalizeFaqKey = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, " ")

const mergeFaqs = (
  defaults: Array<{ question: string; answer: string }>,
  incoming: Array<{ question: string; answer: string }>
) => {
  const merged = [...defaults]
  const seen = new Set(defaults.map((faq) => normalizeFaqKey(faq.question)))

  for (const faq of incoming) {
    const key = normalizeFaqKey(faq.question)
    if (!key || seen.has(key)) continue
    seen.add(key)
    merged.push(faq)
  }

  return merged
}

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [faqs, setFaqs] = useState(fallbackFaqs)
  const [contactDetails, setContactDetails] = useState(fallbackContactDetails)

  useEffect(() => {
    let mounted = true

    const loadFaqs = async () => {
      try {
        const response = await fetch("/api/content?type=faq&active=true")
        if (!response.ok) return

        const data = await response.json()
        const apiFaqs = (data.content || [])
          .map((item: { title?: string; content?: string }) => ({
            question: item.title || "",
            answer: item.content || "",
          }))
          .filter((item: { question: string; answer: string }) => item.question && item.answer)

        if (mounted) {
          setFaqs(mergeFaqs(fallbackFaqs, apiFaqs))
        }
      } catch {
        return
      }
    }

    loadFaqs()

    const loadContactDetails = async () => {
      try {
        const response = await fetch("/api/settings/public")
        if (!response.ok) return

        const data = await response.json()
        const settings = data.settings || {}

        const phone = settings.orgPhone || "+91 99999-00000"
        const email = settings.orgEmail || "SurakshaCharitableTrust@gmail.com"
        const address = settings.orgAddress || "Suraksha Charitable Trust, India"
        const workingHours = settings.workingHours || "Mon - Sat: 9:00 AM - 6:00 PM"
        const sanitizedPhone = String(phone).replace(/[^\d+]/g, "")

        if (!mounted) return

        setContactDetails([
          {
            icon: Phone,
            title: "Phone",
            value: phone,
            href: `tel:${sanitizedPhone}`,
          },
          {
            icon: Mail,
            title: "Email",
            value: email,
            href: `mailto:${email}`,
          },
          {
            icon: MapPin,
            title: "Address",
            value: address,
            href: null,
          },
          {
            icon: Clock,
            title: "Working Hours",
            value: workingHours,
            href: null,
          },
        ])
      } catch {
        return
      }
    }

    loadContactDetails()

    return () => {
      mounted = false
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })

      if (res.ok) {
        setSubmitted(true)
        setFormState({ name: "", email: "", subject: "", message: "" })
        setTimeout(() => setSubmitted(false), 4000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero banner */}
      <section className="relative flex items-center overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-20"
            crossOrigin="anonymous"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <span className="text-sm font-medium text-accent">
            / Get In Touch /
          </span>
          <h1 className="mt-2 text-balance text-4xl font-bold text-primary-foreground sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/70 leading-relaxed">
            Have questions or want to get involved? We would love to hear from
            you. Reach out and let us make a difference together.
          </p>
        </div>
      </section>

      {/* Contact Cards + Form */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Contact info column */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div>
                <span className="text-sm font-medium text-secondary">
                  / Contact Details /
                </span>
                <h2 className="mt-2 text-2xl font-bold text-foreground">
                  Reach Out to Us
                </h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  We are here to answer any questions you may have about our
                  programs, donation process, or volunteering opportunities.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <WhatsAppConnect
                  className="justify-center"
                  number="919353678546"
                  label="WhatsApp Us"
                  message="Hi Glen Monteiro, I have an inquiry from the Suraksha website contact page."
                />
                {contactDetails.map((detail) => {
                  const Icon = detail.icon
                  const content = (
                    <Card
                      key={detail.title}
                      className="bg-card border-border transition-shadow hover:shadow-sm"
                    >
                      <CardContent className="flex items-start gap-4 py-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                          <Icon className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {detail.title}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {detail.value}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )

                  if (detail.href) {
                    return (
                      <a
                        key={detail.title}
                        href={detail.href}
                        className="block"
                      >
                        {content}
                      </a>
                    )
                  }
                  return <div key={detail.title}>{content}</div>
                })}
              </div>
            </div>

            {/* Contact form column */}
            <div className="lg:col-span-3">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-foreground">
                    Send Us a Message
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill out the form below and we will get back to you within 24
                    hours.
                  </p>

                  {submitted && (
                    <div className="mt-4 rounded-lg bg-secondary/10 p-4 text-sm text-secondary font-medium">
                      Thank you for your message! We will get back to you soon.
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="mt-6 flex flex-col gap-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          required
                          value={formState.name}
                          onChange={(e) =>
                            setFormState((s) => ({
                              ...s,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={formState.email}
                          onChange={(e) =>
                            setFormState((s) => ({
                              ...s,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What is this regarding?"
                        required
                        value={formState.subject}
                        onChange={(e) =>
                          setFormState((s) => ({
                            ...s,
                            subject: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Write your message here..."
                        rows={5}
                        required
                        value={formState.message}
                        onChange={(e) =>
                          setFormState((s) => ({
                            ...s,
                            message: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold sm:w-auto"
                    >
                      <Send className="mr-2 size-4" />
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <span className="text-sm font-medium text-secondary">
              / FAQs /
            </span>
            <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
              Find answers to common questions about donations, volunteering,
              and how we operate.
            </p>
          </div>

          <div className="mt-12">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left text-foreground">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
