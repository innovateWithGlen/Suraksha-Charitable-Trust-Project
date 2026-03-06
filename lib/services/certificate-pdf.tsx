import React from "react";
import path from "node:path";
import { promises as fs } from "node:fs";
import { Document, Page, Text, View, StyleSheet, Image, renderToBuffer } from "@react-pdf/renderer";

type ReceiptPDFData = {
  trustName: string;
  urnUsed: string;
  certificateNumber: string;
  donorName: string;
  donorPan?: string;
  donationDate: Date;
  amount: number;
  transactionId: string;
  logoDataUri?: string;
  trusteeName?: string;
};

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: "#0f172a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: { width: 42, height: 42, borderRadius: 4 },
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
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureBlock: {
    width: 220,
    borderTop: "1 solid #94a3b8",
    paddingTop: 6,
    alignItems: "center",
  },
  signatureScript: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 2,
  },
  signatureMeta: {
    fontSize: 9,
    color: "#475569",
    textAlign: "center",
  },
});

function Receipt80GDocument({ data }: { data: ReceiptPDFData }) {
  const trusteeName = data.trusteeName || "Managing Trustee";
  const signedAt = new Date().toISOString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {data.logoDataUri ? <Image src={data.logoDataUri} style={styles.logo} /> : null}
            <View>
              <Text style={styles.heading}>{data.trustName}, Sirsi</Text>
            </View>
          </View>
        </View>
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

        <View style={styles.footer}>
          <Text style={{ fontSize: 9, color: "#64748b", maxWidth: 280 }}>
            This is a system-generated 80G receipt issued by Suraksha Charitable Trust.
          </Text>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureScript}>{trusteeName}</Text>
            <Text style={styles.signatureMeta}>Digitally Signed by Trustee</Text>
            <Text style={styles.signatureMeta}>Signed at: {signedAt}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

async function getLogoDataUri(): Promise<string | undefined> {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
    const logoBuffer = await fs.readFile(logoPath);
    return `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function generate80GReceiptPDFBuffer(data: ReceiptPDFData): Promise<Buffer> {
  const logoDataUri = await getLogoDataUri();
  const trusteeName = process.env.TRUSTEE_SIGNATORY_NAME || "Rajesh Hegde";
  const doc = <Receipt80GDocument data={{ ...data, logoDataUri, trusteeName }} />;
  return renderToBuffer(doc);
}
