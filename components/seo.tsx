interface OrganizationSchemaProps {
  page?: "home" | "about" | "donate" | "contact" | "what-we-do" | "gallery" | "csr" | "adopt-project" | "impact"
}

export function OrganizationSchema({ page = "home" }: OrganizationSchemaProps) {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "Suraksha Charitable Trust",
    alternateName: ["Suraksha Trust", "Suraksha Charitable Trust Sirsi", "Suraksha NGO"],
    url: "https://www.surakshatrustin.org",
    logo: "https://www.surakshatrustin.org/icon-512x512.png",
    image: "https://www.surakshatrustin.org/icon-512x512.png",
    description:
      "Suraksha Charitable Trust (R) is a registered charitable trust under Indian Trust Act, 1882. Approved under Section 80G & 12A. CSR-1 registered NGO serving India through education, healthcare, relief to the poor, women empowerment, child welfare, and cultural development.",
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
      "Charitable Trust in India",
      "NGO India",
      "Education for Underprivileged",
      "Healthcare for Poor",
      "80G Tax Donation",
      "12A Registered NGO",
      "CSR-1 Registered Trust",
      "CSR Projects India",
      "Community Development",
      "Women Empowerment",
      "Child Welfare",
      "Relief to Poor",
      "Indian Trust Act 1882",
      "Donate Online India",
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
    "adopt-project": {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Adopt a CSR Project — Suraksha Charitable Trust",
      description:
        "Corporate partners can adopt open CSR projects in education, healthcare, environment, and empowerment. CSR-1 registered trust under Companies Act, 2013.",
      url: "https://www.surakshatrustin.org/adopt-project",
      isPartOf: baseOrganization,
    },
    impact: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Public Impact Dashboard — Suraksha Charitable Trust",
      description:
        "Transparent CSR fund utilization dashboard. View lives impacted, active projects, and corporate sponsorships.",
      url: "https://www.surakshatrustin.org/impact",
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
        "Yes, all donations to Suraksha Charitable Trust are eligible for tax deduction under Section 80G of the Income Tax Act. We are also registered under Section 12A. You will receive a donation receipt and 80G certificate after your donation is processed. This makes your donation to one of the best charitable trusts in India tax-efficient.",
    },
    {
      question: "How can I donate to Suraksha Charitable Trust?",
      answer:
        "You can donate online via UPI, credit/debit cards, net banking, or bank transfer through our secure Razorpay payment gateway. Visit surakshatrustin.org/donate to make a donation. Suraksha Charitable Trust is a registered NGO under Indian Trust Act, 1882, and all donations are eligible for 80G tax benefits.",
    },
    {
      question: "What programs does Suraksha Charitable Trust run?",
      answer:
        "Suraksha Charitable Trust runs programs in education development, medical relief, relief to the poor, women empowerment, child welfare, environmental protection, and cultural activities across India. We are a CSR-1 registered trust that also partners with corporations for social responsibility projects.",
    },
    {
      question: "Where is Suraksha Charitable Trust located?",
      answer:
        "Suraksha Charitable Trust (R) is located at 1st Cross Marikamba Nagar, Sirsi, Karnataka 581401, India. Contact us at +91 7892351129 or savermonteiro@gmail.com. We serve communities across India from our base in Karnataka.",
    },
    {
      question: "Can companies partner with Suraksha Charitable Trust for CSR?",
      answer:
        "Yes, Suraksha Charitable Trust is CSR-1 registered under the Companies Act, 2013. Companies can adopt our projects or partner with us for corporate social responsibility initiatives. We offer education, healthcare, environment, and empowerment projects for corporate sponsorship. Visit surakshatrustin.org/adopt-project for details.",
    },
    {
      question: "What makes Suraksha Charitable Trust different from other NGOs?",
      answer:
        "Suraksha Charitable Trust is a registered trust under Indian Trust Act, 1882, approved under both Section 80G and 12A of the Income Tax Act, and is CSR-1 registered. We focus on holistic community development including education, healthcare, women empowerment, child welfare, and cultural activities — all without any profit motive.",
    },
    {
      question: "How can I verify the registration of Suraksha Charitable Trust?",
      answer:
        "Suraksha Charitable Trust (R) was registered on 3rd January 2022 under the Indian Trust Act, 1882. We hold valid 80G, 12A, and CSR-1 registrations. You can verify our credentials by contacting us or visiting our About page at surakshatrustin.org/about.",
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

export function LocalBusinessSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NonprofitType",
          name: "Suraksha Charitable Trust",
          alternateName: "Suraksha Trust",
          url: "https://www.surakshatrustin.org",
          logo: "https://www.surakshatrustin.org/icon-512x512.png",
          image: "https://www.surakshatrustin.org/icon-512x512.png",
          description:
            "Suraksha Charitable Trust (R) is a registered charitable trust under Indian Trust Act, 1882. Approved under Section 80G & 12A. CSR-1 registered NGO serving India.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "1st Cross Marikamba Nagar",
            addressLocality: "Sirsi",
            addressRegion: "Karnataka",
            postalCode: "581401",
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 14.6191,
            longitude: 74.8413,
          },
          telephone: "+91-7892351129",
          email: "savermonteiro@gmail.com",
          areaServed: {
            "@type": "Country",
            name: "India",
          },
          foundingDate: "2022-01-03",
          nonprofitStatus: "Registered Charitable Trust",
        }),
      }}
    />
  )
}
