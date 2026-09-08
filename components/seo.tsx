interface OrganizationSchemaProps {
  page?: "home" | "about" | "donate" | "contact" | "what-we-do" | "gallery" | "csr"
}

export function OrganizationSchema({ page = "home" }: OrganizationSchemaProps) {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "Suraksha Charitable Trust",
    alternateName: "Suraksha Trust",
    url: "https://www.surakshatrustin.org",
    logo: "https://www.surakshatrustin.org/icon-512x512.png",
    image: "https://www.surakshatrustin.org/icon-512x512.png",
    description:
      "Suraksha Charitable Trust (R) is a registered NGO under Indian Trust Act, 1882. We serve all humanity through education, healthcare, relief to the poor, and cultural development.",
    foundingDate: "2022-01-03",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1st Cross Marikamba Nagar",
      addressLocality: "Sirsi",
      addressRegion: "Karnataka",
      postalCode: "581401",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-7892351129",
      contactType: "customer service",
      email: "savermonteiro@gmail.com",
      availableLanguage: ["English", "Kannada", "Hindi"],
    },
    sameAs: [],
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    knowsAbout: [
      "Charitable Trust",
      "NGO India",
      "Education for Underprivileged",
      "Healthcare for Poor",
      "80G Tax Donation",
      "CSR Projects India",
      "Community Development",
      "Women Empowerment",
      "Child Welfare",
    ],
    potentialAction: {
      "@type": "DonateAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.surakshatrustin.org/donate",
      },
      accepts: "INR",
    },
  }

  const pageSchemas: Record<string, object> = {
    home: {
      ...baseOrganization,
      "@type": ["NGO", "Organization"],
    },
    about: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Suraksha Charitable Trust",
      description:
        "Learn about Suraksha Charitable Trust — registered on 3rd January 2022 under Indian Trust Act, 1882. Our mission, vision, team, and activities.",
      url: "https://www.surakshatrustin.org/about",
      mainEntity: baseOrganization,
    },
    donate: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Donate to Suraksha Charitable Trust",
      description:
        "Make a tax-deductible donation under Section 80G. Support education, healthcare, and community development.",
      url: "https://www.surakshatrustin.org/donate",
      about: baseOrganization,
      potentialAction: {
        "@type": "DonateAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.surakshatrustin.org/donate",
        },
        accepts: "INR",
      },
    },
    "what-we-do": {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "What We Do — Suraksha Charitable Trust Programs",
      description:
        "Explore our programs in education development, medical relief, community welfare, and cultural activities.",
      url: "https://www.surakshatrustin.org/what-we-do",
      isPartOf: baseOrganization,
    },
    contact: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Suraksha Charitable Trust",
      description:
        "Get in touch with Suraksha Charitable Trust. Phone, email, address, and working hours.",
      url: "https://www.surakshatrustin.org/contact",
      mainEntity: baseOrganization,
    },
    gallery: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Gallery & Events — Suraksha Charitable Trust",
      description:
        "View photos and events from our education, healthcare, and community programs.",
      url: "https://www.surakshatrustin.org/gallery",
      isPartOf: baseOrganization,
    },
    csr: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "CSR Projects — Suraksha Charitable Trust",
      description:
        "Explore our CSR-registered projects. Adopt a project and make a corporate social responsibility impact.",
      url: "https://www.surakshatrustin.org/csr",
      isPartOf: baseOrganization,
    },
  }

  const schema = pageSchemas[page] || baseOrganization

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema() {
  const faqs = [
    {
      question: "Is my donation to Suraksha Charitable Trust tax-deductible?",
      answer:
        "Yes, all donations are eligible for tax deduction under Section 80G of the Income Tax Act. You will receive a donation receipt and 80G certificate after your donation is processed.",
    },
    {
      question: "How can I donate to Suraksha Charitable Trust?",
      answer:
        "You can donate via UPI, credit/debit cards, net banking, or bank transfer through our secure Razorpay payment gateway. Visit surakshatrustin.org/donate to make a donation.",
    },
    {
      question: "What programs does Suraksha Charitable Trust run?",
      answer:
        "We run programs in education development, medical relief, relief to the poor, women empowerment, child welfare, and cultural activities across India.",
    },
    {
      question: "Where is Suraksha Charitable Trust located?",
      answer:
        "Suraksha Charitable Trust is located at 1st Cross Marikamba Nagar, Sirsi, Karnataka, India. Contact us at +91 7892351129 or savermonteiro@gmail.com.",
    },
    {
      question: "Can companies partner with Suraksha Charitable Trust for CSR?",
      answer:
        "Yes, we are CSR-1 registered. Companies can adopt our projects or partner with us for corporate social responsibility initiatives. Visit our CSR page for details.",
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }),
      }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `https://www.surakshatrustin.org${item.url}`,
          })),
        }),
      }}
    />
  )
}
