import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const otpRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const otpVerifySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Donor schemas
export const donorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export const donorUpdateSchema = donorSchema.partial();

// Donation schemas
export const donationSchema = z.object({
  donorName: z.string().min(2),
  donorEmail: z.string().email(),
  donorPhone: z.string().min(10),
  amount: z.number().min(100, "Minimum donation is ₹100"),
  requires80G: z.boolean().optional().default(false),
  method: z.enum(["upi", "card", "netbanking", "wallet", "other"]).default("other"),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.requires80G && data.amount < 5000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["amount"],
      message: "Minimum donation is ₹5,000 when 80G certificate is requested",
    });
  }
});

export const donationUpdateSchema = z.object({
  status: z.enum(["pending", "completed", "success", "failed", "refunded"]).optional(),
  notes: z.string().optional(),
});

// Content schemas
export const contentSchema = z.object({
  type: z.enum(["faq", "program", "hero", "testimonial", "partner", "about", "cta"]),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  image: z.string().url().optional().or(z.literal("")),
  icon: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
});

export const contentUpdateSchema = contentSchema.partial();

// Gallery schemas
export const galleryEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["education", "healthcare", "environment", "community", "events", "other"]),
  date: z.string().or(z.date()),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().optional(),
      })
    )
    .default([]),
  isActive: z.boolean().default(true),
});

export const galleryEventUpdateSchema = galleryEventSchema.partial();

// Contact schemas
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Settings schemas
export const settingsUpdateSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      category: z.enum(["general", "payment", "notification", "social", "other"]).optional(),
      description: z.string().optional(),
    })
  ),
});

export const csrProjectSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  category: z.enum(["Health", "Education", "Empowerment", "Environment"]),
  goalAmount: z.number().min(1, "Goal amount must be greater than 0"),
  raisedAmount: z.number().min(0).optional().default(0),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["Open", "Funded", "Closed"]).default("Open"),
  fiscalYear: z.string().optional().default("2025-26"),
  livesImpacted: z.number().min(0).optional().default(0),
  beneficiariesCount: z.number().min(0).optional().default(0),
  location: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  csr1Tracking: z.string().optional().default("CSR-1 Registered"),
  sponsoringCompanies: z.array(z.string()).optional().default([]),
});

export const csrProjectUpdateSchema = csrProjectSchema.partial();

export const corporateSponsorSchema = z.object({
  companyName: z.string().min(2),
  totalContributed: z.number().min(0).default(0),
  logoUrl: z.string().url().optional().or(z.literal("")),
  fiscalYear: z.string().optional().default("2025-26"),
  isActive: z.boolean().optional().default(true),
});

export const csrPledgeSchema = z.object({
  projectId: z.string().min(1),
  companyName: z.string().min(2),
  amount: z.number().min(1),
  status: z
    .enum(["pledged", "confirmed", "cancelled"])
    .optional()
    .default("pledged"),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  fiscalYear: z.string().optional().default("2025-26"),
});

// Certificate schemas
export const certificateGenerateSchema = z.object({
  donationId: z.string(),
  resendEmail: z.boolean().optional().default(true),
});

export const certificateResendSchema = z.object({
  certificateId: z.string(),
});

export const notificationUpdateSchema = z.object({
  type: z.enum(["donation", "inquiry"]),
  id: z.string(),
});

export const notificationClearAllSchema = z.object({
  action: z.literal("clearAll"),
});

export const inquiryUpdateSchema = z.object({
  status: z.enum(["new", "read", "replied"]).optional(),
  replyContent: z.string().min(10).optional(),
  sendEmail: z.boolean().optional().default(false),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});
