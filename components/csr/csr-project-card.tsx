import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CSRProjectCardProps = {
  project: {
    _id: string;
    title: string;
    description: string;
    category: "Health" | "Education" | "Empowerment" | "Environment";
    goalAmount: number;
    raisedAmount: number;
    coverImageUrl?: string;
    status: "Open" | "Funded" | "Closed";
  };
  onPledge?: (projectId: string) => void;
};

export function CSRProjectCard({ project, onPledge }: CSRProjectCardProps) {
  const goalAmount = Number(project.goalAmount || 0);
  const raisedAmount = Number(project.raisedAmount || 0);
  const progress =
    goalAmount > 0
      ? Math.min(100, Math.round((raisedAmount / goalAmount) * 100))
      : 0;

  const statusStyles: Record<string, string> = {
    Open: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Funded: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    Closed: "bg-slate-200 text-slate-700 hover:bg-slate-200",
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="relative h-44 w-full bg-muted">
        {project.coverImageUrl ? (
          <Image
            src={project.coverImageUrl}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No Cover Image
          </div>
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">{project.category}</Badge>
          <Badge className={statusStyles[project.status]}>{project.status}</Badge>
        </div>
        <CardTitle className="text-lg">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm text-muted-foreground">{project.description}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Raised: ₹{raisedAmount.toLocaleString("en-IN")}</span>
            <span>Goal: ₹{goalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-secondary" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs font-medium text-foreground">{progress}% funded</p>
        </div>

        {onPledge ? (
          <Button
            className="mt-auto"
            disabled={project.status !== "Open"}
            onClick={() => onPledge(project._id)}
          >
            Adopt This Project
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
