import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock all mongoose & model imports before importing the module ──────────────
vi.mock("mongoose", () => {
  const ObjectId = function (id: string) {
    return id;
  };
  ObjectId.prototype.toString = function () { return this; };
  return {
    default: { Types: { ObjectId } },
    Types: { ObjectId },
  };
});

const mockPledgeAggregate = vi.fn();
const mockProjectFindById = vi.fn();
const mockProjectFindByIdAndUpdate = vi.fn();
const mockExpenseAggregate = vi.fn();
const mockSponsorFindOneAndUpdate = vi.fn();

vi.mock("@/lib/models", () => ({
  CSRPledge: {
    aggregate: (...args: any[]) => mockPledgeAggregate(...args),
  },
  CSRProject: {
    findById: (...args: any[]) => mockProjectFindById(...args),
    findByIdAndUpdate: (...args: any[]) => mockProjectFindByIdAndUpdate(...args),
  },
  CSRExpense: {
    aggregate: (...args: any[]) => mockExpenseAggregate(...args),
  },
  CorporateSponsor: {
    findOneAndUpdate: (...args: any[]) => mockSponsorFindOneAndUpdate(...args),
  },
}));

import {
  recomputeProjectRaisedAmount,
  recomputeProjectUtilizedAmount,
  upsertCorporateSponsorContribution,
} from "@/lib/csr-helpers";

const PROJECT_ID = "507f1f77bcf86cd799439011";

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── recomputeProjectRaisedAmount ─────────────────────────────────────────────

describe("recomputeProjectRaisedAmount", () => {
  it("sets project status to Funded when raisedAmount >= goalAmount", async () => {
    mockPledgeAggregate.mockResolvedValue([{ total: 600000 }]);
    mockProjectFindById.mockReturnValue({ lean: () => Promise.resolve({ goalAmount: 500000, status: "Open" }) });
    mockProjectFindByIdAndUpdate.mockResolvedValue({});

    await recomputeProjectRaisedAmount(PROJECT_ID);

    expect(mockProjectFindByIdAndUpdate).toHaveBeenCalledWith(
      PROJECT_ID,
      { $set: { raisedAmount: 600000, status: "Funded" } }
    );
  });

  it("keeps project as Open when raisedAmount < goalAmount", async () => {
    mockPledgeAggregate.mockResolvedValue([{ total: 200000 }]);
    mockProjectFindById.mockReturnValue({ lean: () => Promise.resolve({ goalAmount: 500000, status: "Open" }) });
    mockProjectFindByIdAndUpdate.mockResolvedValue({});

    await recomputeProjectRaisedAmount(PROJECT_ID);

    expect(mockProjectFindByIdAndUpdate).toHaveBeenCalledWith(
      PROJECT_ID,
      { $set: { raisedAmount: 200000, status: "Open" } }
    );
  });

  it("keeps project as Closed if it was already Closed", async () => {
    mockPledgeAggregate.mockResolvedValue([{ total: 100000 }]);
    mockProjectFindById.mockReturnValue({ lean: () => Promise.resolve({ goalAmount: 500000, status: "Closed" }) });
    mockProjectFindByIdAndUpdate.mockResolvedValue({});

    await recomputeProjectRaisedAmount(PROJECT_ID);

    expect(mockProjectFindByIdAndUpdate).toHaveBeenCalledWith(
      PROJECT_ID,
      { $set: { raisedAmount: 100000, status: "Closed" } }
    );
  });

  it("uses 0 when there are no confirmed pledges", async () => {
    mockPledgeAggregate.mockResolvedValue([]); // empty aggregate result
    mockProjectFindById.mockReturnValue({ lean: () => Promise.resolve({ goalAmount: 500000, status: "Open" }) });
    mockProjectFindByIdAndUpdate.mockResolvedValue({});

    await recomputeProjectRaisedAmount(PROJECT_ID);

    expect(mockProjectFindByIdAndUpdate).toHaveBeenCalledWith(
      PROJECT_ID,
      { $set: { raisedAmount: 0, status: "Open" } }
    );
  });

  it("does nothing if project not found", async () => {
    mockPledgeAggregate.mockResolvedValue([{ total: 0 }]);
    mockProjectFindById.mockReturnValue({ lean: () => Promise.resolve(null) });

    await recomputeProjectRaisedAmount(PROJECT_ID);

    expect(mockProjectFindByIdAndUpdate).not.toHaveBeenCalled();
  });
});

// ─── recomputeProjectUtilizedAmount ──────────────────────────────────────────

describe("recomputeProjectUtilizedAmount", () => {
  it("aggregates all expense amounts and saves utilizedAmount", async () => {
    mockExpenseAggregate.mockResolvedValue([{ total: 75000 }]);
    mockProjectFindByIdAndUpdate.mockResolvedValue({});

    await recomputeProjectUtilizedAmount(PROJECT_ID);

    expect(mockProjectFindByIdAndUpdate).toHaveBeenCalledWith(
      PROJECT_ID,
      { $set: { utilizedAmount: 75000 } }
    );
  });

  it("sets utilizedAmount to 0 when there are no expenses", async () => {
    mockExpenseAggregate.mockResolvedValue([]);
    mockProjectFindByIdAndUpdate.mockResolvedValue({});

    await recomputeProjectUtilizedAmount(PROJECT_ID);

    expect(mockProjectFindByIdAndUpdate).toHaveBeenCalledWith(
      PROJECT_ID,
      { $set: { utilizedAmount: 0 } }
    );
  });
});

// ─── upsertCorporateSponsorContribution ──────────────────────────────────────

describe("upsertCorporateSponsorContribution", () => {
  it("calls findOneAndUpdate with correct upsert payload", async () => {
    mockSponsorFindOneAndUpdate.mockResolvedValue({ companyName: "Infosys", totalContributed: 500000 });

    await upsertCorporateSponsorContribution({
      companyName: "Infosys",
      fiscalYear: "2025-26",
      amount: 500000,
    });

    expect(mockSponsorFindOneAndUpdate).toHaveBeenCalledWith(
      { companyName: "Infosys", fiscalYear: "2025-26" },
      expect.objectContaining({
        $inc: { totalContributed: 500000 },
      }),
      { upsert: true, new: true }
    );
  });

  it("trims company name before matching", async () => {
    mockSponsorFindOneAndUpdate.mockResolvedValue({});

    await upsertCorporateSponsorContribution({
      companyName: "  Wipro  ",
      fiscalYear: "2025-26",
      amount: 200000,
    });

    expect(mockSponsorFindOneAndUpdate).toHaveBeenCalledWith(
      { companyName: "Wipro", fiscalYear: "2025-26" },
      expect.anything(),
      expect.anything()
    );
  });

  it("uses $setOnInsert defaults including isActive: true", async () => {
    mockSponsorFindOneAndUpdate.mockResolvedValue({});

    await upsertCorporateSponsorContribution({
      companyName: "HCL",
      fiscalYear: "2025-26",
      amount: 100000,
    });

    const callArgs = mockSponsorFindOneAndUpdate.mock.calls[0][1];
    expect(callArgs.$setOnInsert).toMatchObject({
      isActive: true,
      fiscalYear: "2025-26",
    });
  });
});
