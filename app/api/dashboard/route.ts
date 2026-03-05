import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Donation, Donor } from "@/lib/models";

// GET /api/dashboard - Aggregated stats for admin dashboard
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "1Y";

    const rangeToMonths: Record<string, number | null> = {
      "1M": 1,
      "3M": 3,
      "6M": 6,
      "1Y": 12,
      "3Y": 36,
      MAX: null,
    };

    const selectedMonths = rangeToMonths[range] ?? 12;
    const now = new Date();
    const startDate =
      selectedMonths === null
        ? new Date(0)
        : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (selectedMonths - 1), 1));

    const completedStatuses = ["completed", "success"];

    // Run all aggregations in parallel
    const [
      totalDonationsResult,
      totalDonorsCount,
      activeDonorsCount,
      recentDonations,
      monthlyDonations,
      monthlyDonors,
      statusBreakdown,
    ] = await Promise.all([
      // Total donations (completed only)
      Donation.aggregate([
        { $match: { status: { $in: completedStatuses }, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
            avgDonation: { $avg: "$amount" },
          },
        },
      ]),
      // Total donors
      Donor.countDocuments(),
      // Active donors
      Donor.countDocuments({ status: "active" }),
      // Recent donations (last 10)
      Donation.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      // Monthly donation trend (selected range)
      Donation.aggregate([
        { $match: { status: { $in: completedStatuses }, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      // Monthly donor growth (unique donors with completed donations per month)
      Donation.aggregate([
        { $match: { status: { $in: completedStatuses }, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              donorId: "$donorId",
            },
          },
        },
        {
          $group: {
            _id: {
              year: "$_id.year",
              month: "$_id.month",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      // Status breakdown
      Donation.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const stats = totalDonationsResult[0] || {
      total: 0,
      count: 0,
      avgDonation: 0,
    };

    // Format monthly data for charts in strict month order (last 12 months)
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const donationByMonth = new Map<
      string,
      { total: number; count: number }
    >();
    for (const month of monthlyDonations) {
      const key = `${month._id.year}-${String(month._id.month).padStart(2, "0")}`;
      donationByMonth.set(key, { total: month.total, count: month.count });
    }

    const donorsByMonth = new Map<string, number>();
    for (const month of monthlyDonors) {
      const key = `${month._id.year}-${String(month._id.month).padStart(2, "0")}`;
      donorsByMonth.set(key, month.count);
    }

    const anchorDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const anchorMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    let rangeMonths = selectedMonths;

    if (selectedMonths === null) {
      const allMonthKeys = [...monthlyDonations, ...monthlyDonors].map((item) => ({
        year: item._id.year,
        month: item._id.month,
      }));
      const earliest = allMonthKeys.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })[0];

      if (earliest) {
        rangeMonths = (now.getUTCFullYear() - earliest.year) * 12 + (now.getUTCMonth() + 1 - earliest.month) + 1;
      } else {
        rangeMonths = 12;
      }
    }

    const safeRangeMonths = Math.max(rangeMonths || 12, 1);
    const monthSeries = Array.from({ length: safeRangeMonths }, (_, index) => {
      const date = new Date(anchorDate);
      date.setUTCMonth(anchorMonth.getUTCMonth() - (safeRangeMonths - 1 - index));
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      return { year, month, key };
    });

    const donationTrend = monthSeries.map(({ year, month, key }) => {
      const donation = donationByMonth.get(key);
      return {
        month: `${months[month - 1]} ${String(year).slice(-2)}`,
        total: donation?.total || 0,
        count: donation?.count || 0,
      };
    });

    const donorGrowth = monthSeries.map(({ year, month, key }) => ({
      month: `${months[month - 1]} ${String(year).slice(-2)}`,
      count: donorsByMonth.get(key) || 0,
    }));

    return NextResponse.json({
      metrics: {
        totalDonations: stats.total,
        totalDonationCount: stats.count,
        totalDonors: totalDonorsCount,
        activeDonors: activeDonorsCount,
        avgDonation: Math.round(stats.avgDonation || 0),
      },
      recentDonations,
      donationTrend,
      donorGrowth,
      selectedRange: range,
      statusBreakdown: statusBreakdown.reduce(
        (acc: Record<string, unknown>, s: any) => {
          acc[s._id] = { count: s.count, total: s.total };
          return acc;
        },
        {}
      ),
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
