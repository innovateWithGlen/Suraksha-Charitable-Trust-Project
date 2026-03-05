import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

type ReceiptPDFData = {
  trustName: string;
  urnUsed: string;
  certificateNumber: string;
  donorName: string;
  donorPan?: string;
  donationDate: Date;
  amount: number;
  transactionId: string;
};

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: "#0f172a" },
  heading: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subHeading: { fontSize: 11, marginBottom: 14, color: "#334155" },
  card: {
    border: "1 solid #cbd5e1",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: "#475569", fontSize: 10 },
  value: { fontSize: 11, fontWeight: 600 },
  clause: {
    marginTop: 10,
    border: "1 solid #e2e8f0",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f8fafc",
    fontSize: 10,
  },
});

function Receipt80GDocument({ data }: { data: ReceiptPDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>{data.trustName}, Sirsi</Text>
        <Text style={styles.subHeading}>Donation Receipt under Section 80G of Income Tax Act</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt Number</Text>
            <Text style={styles.value}>{data.certificateNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>URN</Text>
            <Text style={styles.value}>{data.urnUsed}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Donor Name</Text>
            <Text style={styles.value}>{data.donorName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAN (for Form 10BE)</Text>
            <Text style={styles.value}>{data.donorPan || "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Donation</Text>
            <Text style={styles.value}>
              {new Date(data.donationDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{data.transactionId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Donation Amount</Text>
            <Text style={styles.value}>INR {data.amount.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        <View style={styles.clause}>
          <Text>Eligible for 50% tax deduction under Section 80G of the IT Act.</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generate80GReceiptPDFBuffer(data: ReceiptPDFData): Promise<Buffer> {
  const doc = <Receipt80GDocument data={data} />;
  return renderToBuffer(doc);
}
