/**
 * Bulk update script to add 80G identity to transactions via API
 * 
 * Usage: npx tsx scripts/bulk-update-80g-identity.ts
 * 
 * Note: Make sure the development server is running on http://localhost:3000
 */

const API_BASE_URL = "http://localhost:3000";

const transactionIds = [
  "RAND12L-202603-40-1772728327508",
  "RAND12L-202603-28-1772728327508",
  "MANUAL-80G-20260307-1-1772728050471",
  "MANUAL-80G-20260307-2-1772728050471",
  "demo_pay_1772797505380",
  "demo_pay_1772735931343",
  "demo_pay_1772735915962",
  "MCA-DEMO-001",
  "MCA-DEMO-002",
  "RAND12L-202602-12-1772728327508",
  "RAND12L-202602-3-1772728327508",
  "RAND12L-202602-35-1772728327508",
  "RAND12L-202512-21-1772728327508",
  "RAND12L-202510-36-1772728327508",
  "RAND12L-202505-7-1772728327508",
];

// Sample 80G identity data (test values)
const SAMPLE_PAN = "SURAT0001A";
const SAMPLE_AADHAAR = "254178901234"; // 12-digit Aadhaar
const SAMPLE_AADHAAR_FORMATTED = "2541-7890-1234"; // For display

interface Donation {
  _id: string;
  donorId: string;
  donorName: string;
  transactionId: string;
}

async function getDonationByTransactionId(transactionId: string): Promise<Donation | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/donations?transactionId=${transactionId}`);
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.donations?.[0] || null;
  } catch (error) {
    console.error(`Error fetching donation for ${transactionId}:`, error);
    return null;
  }
}

async function updateDonorWith80GIdentity(donorId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        panNumber: SAMPLE_PAN,
        idProofType: "aadhaar",
        idProofNumber: SAMPLE_AADHAAR,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("API returned error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error updating donor ${donorId}:`, error);
    return false;
  }
}

async function main() {
  try {
    console.log("🚀 Starting bulk update of 80G identity for 15 transactions...\n");
    console.log(`ℹ️  Connecting to API at ${API_BASE_URL}\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const transactionId of transactionIds) {
      try {
        // Get donation by transactionId
        const donation = await getDonationByTransactionId(transactionId);

        if (!donation) {
          console.log(`✗ Transaction not found: ${transactionId}`);
          failureCount++;
          continue;
        }

        // Update donor with 80G identity
        const updateSuccess = await updateDonorWith80GIdentity(donation.donorId);

        if (updateSuccess) {
          console.log(
            `✓ Updated: ${transactionId} (Donor: ${donation.donorName}, PAN: ${SAMPLE_PAN}, Aadhaar: ${SAMPLE_AADHAAR_FORMATTED})`
          );
          successCount++;
        } else {
          console.log(`✗ Failed to update donor for transaction: ${transactionId}`);
          failureCount++;
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.log(
          `✗ Error processing ${transactionId}:`,
          error instanceof Error ? error.message : error
        );
        failureCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✓ Successfully updated: ${successCount}`);
    console.log(`✗ Failed: ${failureCount}`);
    console.log(`📝 Total: ${transactionIds.length}`);

    if (successCount === transactionIds.length) {
      console.log(`\n✨ All 15 transactions updated successfully!`);
      console.log(
        `ℹ️  Admin should now see "80G Identity: Ready" badge for all transactions.`
      );
      process.exit(0);
    } else if (successCount > 0) {
      console.log(
        `\n⚠️  Partial success: ${successCount}/${transactionIds.length} updated`
      );
      process.exit(1);
    } else {
      console.log(`\n❌ No transactions were updated`);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Script error:", error);
    process.exit(1);
  }
}

main();
