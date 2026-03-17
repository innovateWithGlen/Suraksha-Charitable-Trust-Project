export const TRUST_FACTS = {
  assistantName: "Suraksha Sahayaka",
  trustName: "Suraksha Charitable Trust (R)",
  location: "Door No. 45, 1st Cross, Marikamba Nagar, Sirsi - 581401, Uttar Kannada District, Karnataka.",
  supportEmail: "support@surakshatrustsirsi.org",
  supportPhone: "+91-93536-78546",
  supportHours: "Mon-Sat, 9:00 AM to 5:00 PM",
  foundedDate: "January 3, 2025",
  urn80G: "80G/22AAATS0000A/S01",
  urn12A: "22AAATS0000A1Z1",
  csrRegistrationNumber: "CSR00045678",
  pan: "AABTS0000X",
  validity: "Assessment Years 2023-24 to 2027-28.",
  bankDetails: {
    accountName: "Suraksha Charitable Trust",
    bankName: "State Bank of India (SBI), Sirsi Main Branch",
    accountNumber: "310000001234",
    ifscCode: "SBIN0000000",
    upiId: "surakshatrust@sbi",
  },
  donationProofRequirement:
    "Donors must email their payment screenshot and PAN card copy to support@surakshatrustsirsi.org to receive the 80G tax exemption receipt (Form 10BE).",
  settlor: "Mr. Rajesh Hegde",
  trustees: [
    "Mr. Rajesh Hegde (Managing Trustee)",
    "Mrs. Lakshmi Bhat",
    "Dr. Kiran Nayak"
  ],
  contactPersons: [
    {
      name: "Mr. Rajesh Hegde",
      role: "Managing Trustee & Settlor",
      scope: "Legal, administrative, and CSR partnership inquiries",
    },
    {
      name: "Mrs. Lakshmi Bhat",
      role: "Trustee",
      scope: "Local volunteer coordination and event management",
    },
  ],
  initiatives: [
    {
      name: "Women Skill Development Workshop",
      summary:
        "Provides tailoring and computer literacy training to rural women in Uttara Kannada to improve long-term financial independence.",
      fundingNeed:
        "Funding is required for trainer stipends, sewing machines, computer access, and expansion to more village batches.",
    },
    {
      name: "Child Nutrition Program",
      summary:
        "Distributes monthly nutritional kits to undernourished children in local government schools around Sirsi.",
      fundingNeed:
        "Support is needed for nutrition kits, health supplements, logistics, and regular growth-monitoring support.",
    },
    {
      name: "Community Clean Water Initiative",
      summary:
        "Installs RO water purifiers in remote villages of the Western Ghats to improve access to safe drinking water.",
      fundingNeed:
        "Funds are needed for purifier installation, maintenance contracts, filter replacement, and village-level upkeep teams.",
    },
  ],
} as const;

export const TRUST_MISSION =
  "We focus on community upliftment in and around Sirsi through practical social initiatives.";

export function buildAuthoritativeContext(): string {
  return [
    "[Official Trust Facts Summary]",
    `Assistant Name: ${TRUST_FACTS.assistantName}`,
    `Trust Name: ${TRUST_FACTS.trustName}`,
    `Founded: ${TRUST_FACTS.foundedDate}`,
    `Location: ${TRUST_FACTS.location}`,
    `Official Email: ${TRUST_FACTS.supportEmail}`,
    `Official Phone: ${TRUST_FACTS.supportPhone}`,
    `Phone Availability: ${TRUST_FACTS.supportHours}`,
    `Settlor (Founder): ${TRUST_FACTS.settlor}`,
    `Board of Trustees: ${TRUST_FACTS.trustees.join(", ")}`,
    "Primary Contact Persons:",
    ...TRUST_FACTS.contactPersons.map(
      (person, index) =>
        `${index + 1}. ${person.name} (${person.role}) - ${person.scope}`
    ),
    `80G URN: ${TRUST_FACTS.urn80G}`,
    `12A URN: ${TRUST_FACTS.urn12A}`,
    `CSR Registration Number: ${TRUST_FACTS.csrRegistrationNumber}`,
    `PAN: ${TRUST_FACTS.pan}`,
    `Validity: ${TRUST_FACTS.validity}`,
    "Donation & Bank Details:",
    `Account Name: ${TRUST_FACTS.bankDetails.accountName}`,
    `Bank Name: ${TRUST_FACTS.bankDetails.bankName}`,
    `Account Number: ${TRUST_FACTS.bankDetails.accountNumber}`,
    `IFSC Code: ${TRUST_FACTS.bankDetails.ifscCode}`,
    `UPI ID: ${TRUST_FACTS.bankDetails.upiId}`,
    `80G Document Requirement: ${TRUST_FACTS.donationProofRequirement}`,
    "CSR Partnership Process:",
    `For CSR partnerships, email ${TRUST_FACTS.supportEmail} with subject line \"CSR Partnership Inquiry\" and include company name, CSR goals, and budget. Response time is within 2 business days.`,
    `Mission: ${TRUST_MISSION}`,
    "Current Active Initiatives (Funding Required):",
    ...TRUST_FACTS.initiatives.map(
      (initiative, index) =>
        `${index + 1}. ${initiative.name}\n   About: ${initiative.summary}\n   Funding Need: ${initiative.fundingNeed}`
    ),
  ].join("\n");
}
