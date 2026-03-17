import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Transaction = {
  id: string;
  date: string;
  type: "pledge" | "expense";
  projectName: string;
  entity: string;
  amount: number;
  status?: string;
  billDocumentUrl?: string;
};

type Props = {
  transactions: Transaction[];
};

export function TransactionLog({ transactions }: Props) {
  if (!transactions.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No CSR transactions yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Bill</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(item.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </TableCell>
            <TableCell>
              <Badge
                className={
                  item.type === "pledge"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                }
              >
                {item.type === "pledge" ? `Pledge (${item.status || "pending"})` : "Expense"}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{item.projectName}</TableCell>
            <TableCell>{item.entity}</TableCell>
            <TableCell className={item.amount >= 0 ? "text-emerald-700" : "text-rose-700"}>
              {item.amount >= 0 ? "+" : "-"}₹{Math.abs(item.amount).toLocaleString("en-IN")}
            </TableCell>
            <TableCell>
              {item.billDocumentUrl ? (
                <a
                  href={item.billDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  View Bill
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
