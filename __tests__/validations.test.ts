import { describe, it, expect } from "vitest";
import {
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  donorSchema,
  donationSchema,
  contactSchema,
  csrProjectSchema,
  csrPledgeSchema,
  csrExpenseSchema,
  galleryEventSchema,
  contentSchema,
} from "@/lib/validations";

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "admin@trust.org", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects short password (<6 chars)", () => {
    const result = loginSchema.safeParse({ email: "admin@trust.org", password: "abc" });
    expect(result.success).toBe(false);
    const issues = (result as any).error.issues;
    expect(issues[0].path).toContain("password");
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "secret123" });
    expect(result.success).toBe(false);
  });
});

describe("otpRequestSchema", () => {
  it("accepts valid email", () => {
    expect(otpRequestSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(otpRequestSchema.safeParse({ email: "bad" }).success).toBe(false);
  });
});

describe("otpVerifySchema", () => {
  it("accepts valid 6-digit OTP", () => {
    expect(otpVerifySchema.safeParse({ email: "user@example.com", otp: "123456" }).success).toBe(true);
  });

  it("rejects OTP shorter than 6 digits", () => {
    const result = otpVerifySchema.safeParse({ email: "user@example.com", otp: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects OTP longer than 6 digits", () => {
    const result = otpVerifySchema.safeParse({ email: "user@example.com", otp: "1234567" });
    expect(result.success).toBe(false);
  });
});

// ─── Donor Schema ─────────────────────────────────────────────────────────────

describe("donorSchema", () => {
  const validDonor = {
    name: "Ravi Kumar",
    email: "ravi@example.com",
    phone: "9876543210",
  };

  it("accepts a minimal valid donor", () => {
    expect(donorSchema.safeParse(validDonor).success).toBe(true);
  });

  it("accepts donor with valid PAN number", () => {
    const result = donorSchema.safeParse({ ...validDonor, panNumber: "ABCDE1234F" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid PAN format", () => {
    const result = donorSchema.safeParse({ ...validDonor, panNumber: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("accepts donor with valid Passport + idProofType", () => {
    const result = donorSchema.safeParse({
      ...validDonor,
      idProofType: "passport",
      idProofNumber: "A1234567",
    });
    expect(result.success).toBe(true);
  });

  it("accepts donor with valid Voter ID + idProofType", () => {
    const result = donorSchema.safeParse({
      ...validDonor,
      idProofType: "voterId",
      idProofNumber: "ABC1234567",
    });
    expect(result.success).toBe(true);
  });

  it("rejects providing idProofType without idProofNumber", () => {
    const result = donorSchema.safeParse({ ...validDonor, idProofType: "passport" });
    expect(result.success).toBe(false);
  });

  it("rejects providing idProofNumber without idProofType", () => {
    const result = donorSchema.safeParse({ ...validDonor, idProofNumber: "A1234567" });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = donorSchema.safeParse({ ...validDonor, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects phone shorter than 10 digits", () => {
    const result = donorSchema.safeParse({ ...validDonor, phone: "12345" });
    expect(result.success).toBe(false);
  });
});

// ─── Donation Schema ──────────────────────────────────────────────────────────

describe("donationSchema", () => {
  const validDonation = {
    donorName: "Priya Sharma",
    donorEmail: "priya@example.com",
    donorPhone: "9123456789",
    amount: 500,
    method: "upi" as const,
  };

  it("accepts a valid donation", () => {
    expect(donationSchema.safeParse(validDonation).success).toBe(true);
  });

  it("rejects amount below ₹100", () => {
    const result = donationSchema.safeParse({ ...validDonation, amount: 50 });
    expect(result.success).toBe(false);
    const issues = (result as any).error.issues;
    expect(issues.some((i: any) => i.path.includes("amount"))).toBe(true);
  });

  it("rejects 80G request with amount below ₹5000", () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      amount: 1000,
      requires80G: true,
      panNumber: "ABCDE1234F",
    });
    expect(result.success).toBe(false);
    const issues = (result as any).error.issues;
    expect(issues.some((i: any) => i.path.includes("amount"))).toBe(true);
  });

  it("rejects 80G request without PAN or ID proof", () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      amount: 5000,
      requires80G: true,
    });
    expect(result.success).toBe(false);
    const issues = (result as any).error.issues;
    expect(issues.some((i: any) => i.path.includes("panNumber") || i.path.includes("idProofNumber"))).toBe(true);
  });

  it("accepts 80G request with PAN and sufficient amount", () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      amount: 5000,
      requires80G: true,
      panNumber: "ABCDE1234F",
    });
    expect(result.success).toBe(true);
  });

  it("accepts 80G with Voter ID when PAN is absent", () => {
    const result = donationSchema.safeParse({
      ...validDonation,
      amount: 5000,
      requires80G: true,
      idProofType: "voterId",
      idProofNumber: "ABC1234567",
    });
    expect(result.success).toBe(true);
  });

  it("defaults method to 'other' when not provided", () => {
    const result = donationSchema.safeParse({
      donorName: "Test",
      donorEmail: "test@example.com",
      donorPhone: "9000000000",
      amount: 200,
    });
    expect(result.success).toBe(true);
    expect((result as any).data.method).toBe("other");
  });

  it("rejects invalid payment method", () => {
    const result = donationSchema.safeParse({ ...validDonation, method: "bitcoin" as any });
    expect(result.success).toBe(false);
  });
});

// ─── Contact Schema ───────────────────────────────────────────────────────────

describe("contactSchema", () => {
  const valid = {
    name: "Suresh Nair",
    email: "suresh@example.com",
    subject: "Donation inquiry",
    message: "I would like to know more about your programs.",
  };

  it("accepts a valid contact submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional phone field", () => {
    expect(contactSchema.safeParse({ ...valid, phone: "9000000000" }).success).toBe(true);
  });

  it("rejects subject shorter than 3 characters", () => {
    expect(contactSchema.safeParse({ ...valid, subject: "Hi" }).success).toBe(false);
  });

  it("rejects message shorter than 10 characters", () => {
    expect(contactSchema.safeParse({ ...valid, message: "Short" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "not-email" }).success).toBe(false);
  });
});

// ─── CSR Project Schema ───────────────────────────────────────────────────────

describe("csrProjectSchema", () => {
  const valid = {
    title: "Rural Health Camp",
    description: "Providing free medical checkups in rural areas.",
    category: "Health" as const,
    goalAmount: 500000,
  };

  it("accepts a valid CSR project", () => {
    expect(csrProjectSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults status to Open", () => {
    const result = csrProjectSchema.safeParse(valid);
    expect((result as any).data.status).toBe("Open");
  });

  it("defaults raisedAmount to 0", () => {
    const result = csrProjectSchema.safeParse(valid);
    expect((result as any).data.raisedAmount).toBe(0);
  });

  it("defaults utilizedAmount to 0", () => {
    const result = csrProjectSchema.safeParse(valid);
    expect((result as any).data.utilizedAmount).toBe(0);
  });

  it("rejects title shorter than 3 characters", () => {
    expect(csrProjectSchema.safeParse({ ...valid, title: "Hi" }).success).toBe(false);
  });

  it("rejects description shorter than 10 characters", () => {
    expect(csrProjectSchema.safeParse({ ...valid, description: "Short" }).success).toBe(false);
  });

  it("rejects goalAmount of 0", () => {
    expect(csrProjectSchema.safeParse({ ...valid, goalAmount: 0 }).success).toBe(false);
  });

  it("rejects negative goalAmount", () => {
    expect(csrProjectSchema.safeParse({ ...valid, goalAmount: -1000 }).success).toBe(false);
  });

  it("rejects invalid category", () => {
    expect(csrProjectSchema.safeParse({ ...valid, category: "Sports" as any }).success).toBe(false);
  });

  it("accepts all valid categories", () => {
    const cats = ["Health", "Education", "Empowerment", "Environment"] as const;
    for (const category of cats) {
      expect(csrProjectSchema.safeParse({ ...valid, category }).success).toBe(true);
    }
  });

  it("accepts all valid statuses", () => {
    for (const status of ["Open", "Funded", "Closed"] as const) {
      expect(csrProjectSchema.safeParse({ ...valid, status }).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(csrProjectSchema.safeParse({ ...valid, status: "Pending" as any }).success).toBe(false);
  });
});

// ─── CSR Pledge Schema ────────────────────────────────────────────────────────

describe("csrPledgeSchema", () => {
  const valid = {
    projectId: "507f1f77bcf86cd799439011",
    companyName: "Tata Consultancy Services",
    amount: 1000000,
  };

  it("accepts a valid CSR pledge", () => {
    expect(csrPledgeSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults status to pledged", () => {
    const result = csrPledgeSchema.safeParse(valid);
    expect((result as any).data.status).toBe("pledged");
  });

  it("accepts optional contactEmail and contactPhone", () => {
    const result = csrPledgeSchema.safeParse({
      ...valid,
      contactEmail: "csr@tcs.com",
      contactPhone: "9000000000",
    });
    expect(result.success).toBe(true);
  });

  it("accepts status: confirmed", () => {
    expect(csrPledgeSchema.safeParse({ ...valid, status: "confirmed" }).success).toBe(true);
  });

  it("accepts status: cancelled", () => {
    expect(csrPledgeSchema.safeParse({ ...valid, status: "cancelled" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(csrPledgeSchema.safeParse({ ...valid, status: "approved" as any }).success).toBe(false);
  });

  it("rejects missing projectId", () => {
    expect(csrPledgeSchema.safeParse({ companyName: "Infosys", amount: 500000 }).success).toBe(false);
  });

  it("rejects missing companyName", () => {
    expect(csrPledgeSchema.safeParse({ projectId: "abc123", amount: 500000 }).success).toBe(false);
  });

  it("rejects zero amount", () => {
    expect(csrPledgeSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
  });

  it("rejects invalid contactEmail format", () => {
    expect(csrPledgeSchema.safeParse({ ...valid, contactEmail: "not-email" }).success).toBe(false);
  });
});

// ─── CSR Expense Schema ───────────────────────────────────────────────────────

describe("csrExpenseSchema", () => {
  const valid = {
    projectId: "507f1f77bcf86cd799439011",
    amountPaid: 25000,
    details: "Medical equipment purchase for rural camp",
    date: "2025-04-01",
  };

  it("accepts a valid expense", () => {
    expect(csrExpenseSchema.safeParse(valid).success).toBe(true);
  });

  it("coerces date string to Date object", () => {
    const result = csrExpenseSchema.safeParse(valid);
    expect((result as any).data.date).toBeInstanceOf(Date);
  });

  it("accepts a Date object directly", () => {
    const result = csrExpenseSchema.safeParse({ ...valid, date: new Date("2025-04-01") });
    expect(result.success).toBe(true);
  });

  it("rejects missing projectId", () => {
    expect(csrExpenseSchema.safeParse({ amountPaid: 100, details: "Test", date: "2025-01-01" }).success).toBe(false);
  });

  it("rejects amountPaid of 0", () => {
    expect(csrExpenseSchema.safeParse({ ...valid, amountPaid: 0 }).success).toBe(false);
  });

  it("rejects details shorter than 3 characters", () => {
    expect(csrExpenseSchema.safeParse({ ...valid, details: "Hi" }).success).toBe(false);
  });

  it("rejects invalid date string", () => {
    const result = csrExpenseSchema.safeParse({ ...valid, date: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("accepts optional billDocumentUrl", () => {
    const result = csrExpenseSchema.safeParse({
      ...valid,
      billDocumentUrl: "https://storage.example.com/bill.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string for billDocumentUrl", () => {
    const result = csrExpenseSchema.safeParse({ ...valid, billDocumentUrl: "" });
    expect(result.success).toBe(true);
  });
});

// ─── Gallery Event Schema ─────────────────────────────────────────────────────

describe("galleryEventSchema", () => {
  const valid = {
    title: "Health Camp 2025",
    category: "healthcare" as const,
    date: "2025-03-15",
    location: "Sirsi, Karnataka",
  };

  it("accepts a valid gallery event", () => {
    expect(galleryEventSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title, ...rest } = valid;
    expect(galleryEventSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid category", () => {
    expect(galleryEventSchema.safeParse({ ...valid, category: "sports" as any }).success).toBe(false);
  });

  it("accepts all valid categories", () => {
    const cats = ["education", "healthcare", "environment", "community", "events", "other"] as const;
    for (const category of cats) {
      expect(galleryEventSchema.safeParse({ ...valid, category }).success).toBe(true);
    }
  });

  it("defaults images to empty array", () => {
    const result = galleryEventSchema.safeParse(valid);
    expect((result as any).data.images).toEqual([]);
  });
});

// ─── Content Schema ───────────────────────────────────────────────────────────

describe("contentSchema", () => {
  const valid = {
    type: "faq" as const,
    title: "What is Suraksha Trust?",
    content: "A charitable trust based in Karnataka.",
  };

  it("accepts a valid content item", () => {
    expect(contentSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing content", () => {
    const { content, ...rest } = valid;
    expect(contentSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(contentSchema.safeParse({ ...valid, type: "unknown" as any }).success).toBe(false);
  });

  it("accepts optional image URL", () => {
    expect(contentSchema.safeParse({ ...valid, image: "https://example.com/img.png" }).success).toBe(true);
  });

  it("rejects invalid image URL", () => {
    expect(contentSchema.safeParse({ ...valid, image: "not-a-url" }).success).toBe(false);
  });

  it("defaults isActive to true", () => {
    const result = contentSchema.safeParse(valid);
    expect((result as any).data.isActive).toBe(true);
  });

  it("defaults order to 0", () => {
    const result = contentSchema.safeParse(valid);
    expect((result as any).data.order).toBe(0);
  });
});
