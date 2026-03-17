/**
 * Tests for PUT /api/csr-pledges/[id]  (admin: approve / cancel a pledge)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mongodb", () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/csr-helpers", () => ({
  recomputeProjectRaisedAmount: vi.fn().mockResolvedValue(undefined),
  upsertCorporateSponsorContribution: vi.fn().mockResolvedValue(undefined),
}));

const mockPledgeSave = vi.fn();
const mockPledgeFindById = vi.fn();

vi.mock("@/lib/models", () => ({
  CSRPledge: {
    findById: (...args: any[]) => mockPledgeFindById(...args),
  },
}));

import { PUT } from "@/app/api/csr-pledges/[id]/route";
import { auth } from "@/lib/auth";
import { upsertCorporateSponsorContribution } from "@/lib/csr-helpers";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockUpsert = upsertCorporateSponsorContribution as ReturnType<typeof vi.fn>;

function makePutRequest(id: string, body: unknown): [Request, { params: Promise<{ id: string }> }] {
  const req = new Request(`http://localhost/api/csr-pledges/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return [req, { params: Promise.resolve({ id }) }];
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PUT /api/csr-pledges/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const [req, ctx] = makePutRequest("pledgeId", { status: "confirmed" });
    const response = await PUT(req, ctx);
    expect(response.status).toBe(401);
  });

  it("returns 404 when pledge not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    mockPledgeFindById.mockResolvedValue(null);

    const [req, ctx] = makePutRequest("nonexistent", { status: "confirmed" });
    const response = await PUT(req, ctx);
    expect(response.status).toBe(404);
  });

  it("returns 400 for invalid status value", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    mockPledgeFindById.mockResolvedValue({
      _id: "p1",
      status: "pledged",
      companyName: "TCS",
      projectId: "proj1",
      amount: 500000,
      save: mockPledgeSave,
    });

    const [req, ctx] = makePutRequest("p1", { status: "approved" });
    const response = await PUT(req, ctx);
    expect(response.status).toBe(400);
  });

  it("sets confirmationDate when transitioning to confirmed", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    const pledge: any = {
      _id: "p1",
      status: "pledged",
      companyName: "TCS",
      projectId: "proj1",
      amount: 500000,
      fiscalYear: "2025-26",
      confirmationDate: undefined,
      save: mockPledgeSave.mockResolvedValue(undefined),
    };
    mockPledgeFindById.mockResolvedValue(pledge);

    const [req, ctx] = makePutRequest("p1", { status: "confirmed" });
    const response = await PUT(req, ctx);
    expect(response.status).toBe(200);
    expect(pledge.status).toBe("confirmed");
    expect(pledge.confirmationDate).toBeInstanceOf(Date);
    expect(mockUpsert).toHaveBeenCalledOnce();
  });

  it("clears confirmationDate when reverting from confirmed", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    const pledge: any = {
      _id: "p1",
      status: "confirmed",
      companyName: "TCS",
      projectId: "proj1",
      amount: 500000,
      fiscalYear: "2025-26",
      confirmationDate: new Date("2025-01-01"),
      save: mockPledgeSave.mockResolvedValue(undefined),
    };
    mockPledgeFindById.mockResolvedValue(pledge);

    const [req, ctx] = makePutRequest("p1", { status: "cancelled" });
    const response = await PUT(req, ctx);
    expect(response.status).toBe(200);
    expect(pledge.confirmationDate).toBeUndefined();
  });

  it("updates notes field when notes is provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    const pledge: any = {
      _id: "p1",
      status: "pledged",
      companyName: "TCS",
      projectId: "proj1",
      amount: 500000,
      notes: "",
      save: mockPledgeSave.mockResolvedValue(undefined),
    };
    mockPledgeFindById.mockResolvedValue(pledge);

    const [req, ctx] = makePutRequest("p1", { notes: "Awaiting cheque" });
    await PUT(req, ctx);
    expect(pledge.notes).toBe("Awaiting cheque");
  });

  it("does NOT call upsertCorporateSponsor when transition is not to confirmed", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin1" } });
    const pledge: any = {
      _id: "p1",
      status: "pledged",
      companyName: "TCS",
      projectId: "proj1",
      amount: 500000,
      save: mockPledgeSave.mockResolvedValue(undefined),
    };
    mockPledgeFindById.mockResolvedValue(pledge);

    const [req, ctx] = makePutRequest("p1", { status: "cancelled" });
    await PUT(req, ctx);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
