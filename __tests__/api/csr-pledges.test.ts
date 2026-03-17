/**
 * Tests for POST /api/csr-pledges  (public pledge creation) and
 *          GET /api/csr-pledges   (admin list, requires auth).
 *
 * All external dependencies (DB, auth, helpers, email) are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock dependencies ─────────────────────────────────────────────────────────

vi.mock("@/lib/mongodb", () => ({ default: vi.fn().mockResolvedValue(undefined) }));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

const mockPledgeCreate = vi.fn();
const mockPledgeFind = vi.fn();
const mockPledgeCountDocuments = vi.fn();
const mockProjectFindById = vi.fn();

vi.mock("@/lib/models", () => ({
  CSRPledge: {
    create: (...args: any[]) => mockPledgeCreate(...args),
    find: (...args: any[]) => ({
      sort: () => ({
        skip: () => ({
          limit: () => ({
            populate: () => ({
              lean: () => mockPledgeFind(...args),
            }),
          }),
        }),
      }),
    }),
    countDocuments: (...args: any[]) => mockPledgeCountDocuments(...args),
  },
  CSRProject: {
    findById: (...args: any[]) => ({
      lean: () => mockProjectFindById(...args),
    }),
  },
}));

vi.mock("@/lib/csr-helpers", () => ({
  recomputeProjectRaisedAmount: vi.fn().mockResolvedValue(undefined),
  upsertCorporateSponsorContribution: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email", () => ({
  sendCSRPledgeAdminNotification: vi.fn().mockResolvedValue(undefined),
}));

// ── Import route handlers after mocks are set up ─────────────────────────────
import { GET, POST } from "@/app/api/csr-pledges/route";
import { auth } from "@/lib/auth";

const mockAuth = auth as ReturnType<typeof vi.fn>;

function makeRequest(body?: unknown, method = "POST"): Request {
  if (body) {
    return new Request("http://localhost/api/csr-pledges", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  return new Request("http://localhost/api/csr-pledges", { method });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── POST (public pledge creation) ───────────────────────────────────────────

describe("POST /api/csr-pledges", () => {
  const validBody = {
    projectId: "507f1f77bcf86cd799439011",
    companyName: "Infosys Limited",
    amount: 1000000,
    contactEmail: "csr@infosys.com",
    contactPhone: "9000000000",
  };

  it("creates a pledge and returns 201 for valid Open project", async () => {
    mockProjectFindById.mockResolvedValue({ _id: "507f1f77bcf86cd799439011", status: "Open", title: "Health Camp", goalAmount: 2000000 });
    mockPledgeCreate.mockResolvedValue({ ...validBody, _id: "pledgeId", status: "pledged" });

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json.pledge).toBeDefined();
  });

  it("returns 404 when project does not exist", async () => {
    mockProjectFindById.mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toMatch(/not found/i);
  });

  it("returns 400 when project is not Open", async () => {
    mockProjectFindById.mockResolvedValue({ _id: "123", status: "Closed", title: "Old Camp", goalAmount: 1000000 });

    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toMatch(/not open/i);
  });

  it("returns 400 when required fields are missing (Zod validation)", async () => {
    const response = await POST(makeRequest({ amount: 1000 })); // missing projectId, companyName
    expect(response.status).toBe(400);
  });

  it("returns 400 when amount is 0", async () => {
    mockProjectFindById.mockResolvedValue({ _id: "123", status: "Open", title: "Camp", goalAmount: 500000 });
    const response = await POST(makeRequest({ ...validBody, amount: 0 }));
    expect(response.status).toBe(400);
  });

  it("returns 400 when amount is negative", async () => {
    mockProjectFindById.mockResolvedValue({ _id: "123", status: "Open", title: "Camp", goalAmount: 500000 });
    const response = await POST(makeRequest({ ...validBody, amount: -100 }));
    expect(response.status).toBe(400);
  });
});

// ─── GET (admin list, requires auth) ─────────────────────────────────────────

describe("GET /api/csr-pledges", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/csr-pledges"));
    expect(response.status).toBe(401);
  });

  it("returns paginated pledges when authenticated", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    mockPledgeFind.mockResolvedValue([
      { _id: "p1", companyName: "TCS", amount: 500000, status: "pledged" },
    ]);
    mockPledgeCountDocuments.mockResolvedValue(1);

    const response = await GET(new Request("http://localhost/api/csr-pledges"));
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.pledges).toHaveLength(1);
    expect(json.pagination.total).toBe(1);
  });

  it("filters pledges by status query param", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    mockPledgeFind.mockResolvedValue([]);
    mockPledgeCountDocuments.mockResolvedValue(0);

    const response = await GET(new Request("http://localhost/api/csr-pledges?status=confirmed"));
    expect(response.status).toBe(200);
  });

  it("returns empty list when no pledges exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    mockPledgeFind.mockResolvedValue([]);
    mockPledgeCountDocuments.mockResolvedValue(0);

    const response = await GET(new Request("http://localhost/api/csr-pledges"));
    const json = await response.json();
    expect(json.pledges).toEqual([]);
    expect(json.pagination.total).toBe(0);
  });
});
