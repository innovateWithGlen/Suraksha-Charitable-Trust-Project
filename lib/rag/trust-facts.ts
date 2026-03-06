export const TRUST_FACTS = {
  assistantName: "Suraksha Sahayaka",
  trustName: "Suraksha Charitable Trust (R)",
  location: "1st Cross, Marikamba Nagar, Sirsi - 581401, Karnataka.",
  urn80G: "80G/22AAATS0000A/S01",
  urn12A: "22AAATS0000A1Z1",
  pan: "AABTS0000X",
  validity: "Assessment Years 2023-24 to 2027-28.",
  settlor: "Mr. Rajesh Hegde",
  trustees: [
    "Mr. Rajesh Hegde (Managing Trustee)",
    "Mrs. Lakshmi Bhat",
    "Dr. Kiran Nayak"
  ],
  initiatives: [
    "Women Skill Development Workshop",
    "Child Nutrition Program",
    "Community Clean Water Initiative",
  ],
} as const;

export const TRUST_MISSION =
  "We focus on community upliftment in and around Sirsi through practical social initiatives.";

export function buildAuthoritativeContext(): string {
  return [
    "[Official Trust Facts Summary]",
    `Assistant Name: ${TRUST_FACTS.assistantName}`,
    `Trust Name: ${TRUST_FACTS.trustName}`,
    `Location: ${TRUST_FACTS.location}`,
    `Settlor (Founder): ${TRUST_FACTS.settlor}`,
    `Board of Trustees: ${TRUST_FACTS.trustees.join(", ")}`,
    `80G URN: ${TRUST_FACTS.urn80G}`,
    `12A URN: ${TRUST_FACTS.urn12A}`,
    `PAN: ${TRUST_FACTS.pan}`,
    `Validity: ${TRUST_FACTS.validity}`,
    `Mission: ${TRUST_MISSION}`,
    "Current Initiatives:",
    ...TRUST_FACTS.initiatives.map((initiative, index) => `${index + 1}. ${initiative}`),
  ].join("\n");
}
