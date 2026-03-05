import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Donation, Donor } from "@/lib/models";

// GET /api/dashboard - Aggregated stats for admin dashboard
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

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
        { $match: { status: "completed" } },
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
      // Monthly donation trend (last 12 months)
      Donation.aggregate([
        { $match: { status: "completed" } },
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
        { $match: { status: "completed" } },
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

    const now = new Date();
    const anchorMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthSeries = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(anchorMonth);
      date.setUTCMonth(anchorMonth.getUTCMonth() - (11 - index));
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
