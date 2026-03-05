import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dbConnect from "@/lib/mongodb";
import { CSRProject, CorporateSponsor, CSRPledge } from "@/lib/models";

async function getImpactData() {
  await dbConnect();

  const totalCSRFund = 80000000;
  const [projects, sponsors, pledges] = await Promise.all([
    CSRProject.find({ fiscalYear: "2025-26" }).lean(),
    CorporateSponsor.find({ fiscalYear: "2025-26", isActive: true }).lean(),
    CSRPledge.find({ fiscalYear: "2025-26" }).lean(),
  ]);

  const utilizedFunds = projects.reduce((sum, project) => sum + (project.raisedAmount || 0), 0);

  return {
    totalCSRFund,
    utilizedFunds,
    remainingFunds: Math.max(totalCSRFund - utilizedFunds, 0),
    topSponsors: sponsors,
    impact: {
      livesImpacted: projects.reduce((sum, project) => sum + (project.livesImpacted || 0), 0),
      beneficiariesCount: projects.reduce((sum, project) => sum + (project.beneficiariesCount || 0), 0),
      activeProjects: projects.filter((project) => project.status === "Open").length,
      fundedProjects: projects.filter((project) => project.status === "Funded").length,
      pledgesCount: pledges.length,
    },
  };
}

export default async function ImpactPage() {
  const data = await getImpactData();

  const kpis = [
    {
      label: "Total CSR Fund",
      value: `₹${(data?.totalCSRFund || 0).toLocaleString("en-IN")}`,
    },
    {
      label: "Funds Utilized",
      value: `₹${(data?.utilizedFunds || 0).toLocaleString("en-IN")}`,
    },
    {
      label: "Lives Impacted",
      value: (data?.impact?.livesImpacted || 0).toLocaleString("en-IN"),
    },
    {
      label: "Beneficiaries Reached",
      value: (data?.impact?.beneficiariesCount || 0).toLocaleString("en-IN"),
    },
    {
      label: "Active Projects",
      value: (data?.impact?.activeProjects || 0).toString(),
    },
  ];

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Public Impact Dashboard</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Fiscal Year 2025-26 impact and utilization snapshot for Suraksha CSR initiatives.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">80G Certified</Badge>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">12A Compliant</Badge>
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">CSR-1 Registered</Badge>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex justify-between"><span>Total Budget</span><span className="font-semibold">₹{(data?.totalCSRFund || 0).toLocaleString("en-IN")}</span></p>
              <p className="flex justify-between"><span>Utilized Funds</span><span className="font-semibold">₹{(data?.utilizedFunds || 0).toLocaleString("en-IN")}</span></p>
              <p className="flex justify-between"><span>Remaining Funds</span><span className="font-semibold">₹{(data?.remainingFunds || 0).toLocaleString("en-IN")}</span></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Engagement Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Corporate Volunteer Days at community centers.</p>
              <p>Mentorship sessions for rural youth and women entrepreneurs.</p>
              <p>Skill-based volunteering in digital literacy and legal awareness drives.</p>
              <p>Field immersion programs with healthcare and environment projects.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
