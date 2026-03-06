import dbConnect from "@/lib/mongodb";
import { Certificate, Donation, Donor } from "@/lib/models";
import { generateCertificateNumber } from "@/lib/certificate-generator";
import { send80GReceiptEmail } from "@/lib/email";
import { generate80GReceiptPDFBuffer } from "@/lib/services/certificate-pdf";

const TRUST_NAME = "Suraksha Charitable Trust";
const DEFAULT_URN = "80G/22AAATS0000A/S01";

export async function generateReceiptForDonation(
  donationId: string,
  options?: { resendEmail?: boolean; forceRegenerate?: boolean }
) {
  await dbConnect();

  const donation = await Donation.findById(donationId).lean();
  if (!donation) {
    throw new Error("Donation not found");
  }

  if (!donation.requires80G) {
    throw new Error("80G not requested for this donation");
  }

  const donor = await Donor.findById(donation.donorId).lean();

  const existingCertificate = await Certificate.findOne({ donationId: donation._id });

  const urnUsed = process.env.SURAKSHA_80G_URN || DEFAULT_URN;
  const certificateNumber =
    existingCertificate && !options?.forceRegenerate
      ? existingCertificate.certificateNumber
      : generateCertificateNumber();

  const pdfBuffer = await generate80GReceiptPDFBuffer({
    trustName: TRUST_NAME,
    urnUsed,
    certificateNumber,
    donorName: donation.donorName,
    donorPan: donor?.panNumber,
    donationDate: donation.createdAt,
    amount: donation.amount,
    transactionId: donation.transactionId,
  });

  const now = new Date();

  let certificate = existingCertificate;
  if (!certificate || options?.forceRegenerate) {
    certificate = await Certificate.findOneAndUpdate(
      { donationId: donation._id },
      {
        $set: {
          donorId: donation.donorId,
          certificateNumber,
          // Keep a non-empty placeholder to satisfy schema validation on upsert.
          pdfUrl: existingCertificate?.pdfUrl || "/api/certificates/pending",
          type: existingCertificate ? "manual" : "auto",
          donorName: donation.donorName,
          donorPan: donor?.panNumber,
          amount: donation.amount,
          donationDate: donation.createdAt,
          generatedAt: now,
          urnUsed,
          pdfBase64: pdfBuffer.toString("base64"),
        },
        $setOnInsert: {
          receiptSent: false,
          resendCount: 0,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true }
    );
  }

  if (!certificate) {
    throw new Error("Failed to create certificate record");
  }

  const receiptUrl = `/api/certificates/${String(certificate._id)}/download`;

  await Certificate.updateOne(
    { _id: certificate._id },
    {
      $set: {
        pdfUrl: receiptUrl,
        pdfBase64: pdfBuffer.toString("base64"),
      },
    }
  );

  let receiptSent = false;
  let emailError: string | null = null;
  if (options?.resendEmail !== false) {
    try {
      await send80GReceiptEmail({
        donor: { name: donation.donorName, email: donation.donorEmail },
        transactionId: donation.transactionId,
        amount: donation.amount,
        certificateNumber: certificate.certificateNumber,
        urnUsed,
        pdfUrl: receiptUrl,
        pdfBase64: pdfBuffer.toString("base64"),
      });
      receiptSent = true;

      await Certificate.updateOne(
        { _id: certificate._id },
        {
          $set: {
            receiptSent: true,
            receiptSentAt: now,
            lastResentAt: now,
          },
          $inc: { resendCount: existingCertificate ? 1 : 0 },
        }
      );
    } catch (error) {
      emailError = error instanceof Error ? error.message : "Failed to send email";
      await Certificate.updateOne(
        { _id: certificate._id },
        {
          $set: {
            receiptSent: false,
          },
        }
      );
    }
  }

  await Donation.updateOne(
    { _id: donation._id },
    {
      $set: {
        receiptGenerated: true,
        receiptSent,
        receiptSentAt: receiptSent ? now : undefined,
        receiptTimestamp: now,
        urnUsed,
        certificateUrl: receiptUrl,
      },
    }
  );

  return {
    donationId: String(donation._id),
    certificateId: String(certificate._id),
    certificateNumber: certificate.certificateNumber,
    urnUsed,
    receiptSent,
    emailError,
    pdfUrl: receiptUrl,
    timestamp: now,
  };
}

export async function resendReceiptEmail(certificateId: string) {
  await dbConnect();
  const certificate = await Certificate.findById(certificateId).lean();
  if (!certificate) throw new Error("Certificate not found");

  const donation = await Donation.findById(certificate.donationId).lean();
  if (!donation) throw new Error("Donation not found");

  await send80GReceiptEmail({
    donor: { name: donation.donorName, email: donation.donorEmail },
    transactionId: donation.transactionId,
    amount: donation.amount,
    certificateNumber: certificate.certificateNumber,
    urnUsed: certificate.urnUsed,
    pdfUrl: certificate.pdfUrl,
  });

  const now = new Date();
  await Certificate.updateOne(
    { _id: certificate._id },
    {
      $set: {
        receiptSent: true,
        receiptSentAt: now,
        lastResentAt: now,
      },
      $inc: { resendCount: 1 },
    }
  );

  await Donation.updateOne(
    { _id: donation._id },
    {
      $set: {
        receiptSent: true,
        receiptSentAt: now,
      },
    }
  );

  return {
    certificateId: String(certificate._id),
    certificateNumber: certificate.certificateNumber,
    sentAt: now,
  };
}
