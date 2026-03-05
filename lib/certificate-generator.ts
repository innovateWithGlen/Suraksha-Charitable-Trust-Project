// Server-side 80G certificate PDF generation
// Uses a simple HTML-to-buffer approach for serverless compatibility

export interface CertificateData {
  certificateNumber: string;
  donorName: string;
  donorPan?: string;
  amount: number;
  donationDate: Date;
  transactionId: string;
  trustName: string;
  trustRegistrationNumber: string;
  trustAddress: string;
  trustPan: string;
}

function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  if (num === 0) return "Zero";

  function convert(n: number): string {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  return convert(num) + " Rupees Only";
}

export function generateCertificateHTML(data: CertificateData): string {
  const formattedDate = new Date(data.donationDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedAmount = data.amount.toLocaleString("en-IN");
  const amountInWords = numberToWords(data.amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; padding: 0; font-family: 'Georgia', serif; color: #1a365d; }
        .certificate {
          width: 297mm; height: 210mm;
          padding: 15mm 20mm;
          box-sizing: border-box;
          position: relative;
          background: white;
        }
        .border-outer {
          border: 3px solid #1a365d;
          padding: 8mm;
          height: calc(100% - 30mm);
          position: relative;
        }
        .border-inner {
          border: 1px solid #c8a951;
          padding: 10mm;
          height: calc(100% - 16mm);
        }
        .header { text-align: center; margin-bottom: 8mm; }
        .header h1 {
          font-size: 28px; color: #1a365d; margin: 0;
          text-transform: uppercase; letter-spacing: 3px;
        }
        .header h2 {
          font-size: 18px; color: #c8a951; margin: 5px 0;
          font-weight: normal; letter-spacing: 2px;
        }
        .header .subtitle {
          font-size: 13px; color: #64748b; margin-top: 3mm;
        }
        .cert-number {
          text-align: right; font-size: 12px; color: #64748b;
          margin-bottom: 5mm;
        }
        .body { font-size: 14px; line-height: 2; margin: 5mm 0; }
        .body .highlight {
          font-weight: bold; color: #1a365d;
          border-bottom: 1px solid #c8a951;
          padding-bottom: 1px;
        }
        .amount-box {
          background: #f8fafc; border: 1px solid #e2e8f0;
          padding: 4mm 6mm; margin: 5mm 0;
          display: flex; justify-content: space-between;
          border-radius: 4px;
        }
        .footer {
          position: absolute; bottom: 15mm; left: 15mm; right: 15mm;
          display: flex; justify-content: space-between;
          align-items: flex-end; font-size: 11px;
        }
        .footer .trust-info { color: #64748b; }
        .footer .signature {
          text-align: center;
          border-top: 1px solid #1a365d;
          padding-top: 3mm; min-width: 50mm;
        }
        .watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 80px; color: rgba(26, 54, 93, 0.03);
          font-weight: bold; letter-spacing: 10px;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="border-outer">
          <div class="border-inner">
            <div class="watermark">SURAKSHA</div>
            
            <div class="header">
              <h1>${data.trustName}</h1>
              <h2>Certificate of Donation</h2>
              <div class="subtitle">
                Under Section 80G of the Income Tax Act, 1961<br>
                Registration No: ${data.trustRegistrationNumber} | PAN: ${data.trustPan}
              </div>
            </div>
            
            <div class="cert-number">
              Certificate No: <strong>${data.certificateNumber}</strong>
            </div>
            
            <div class="body">
              <p>
                This is to certify that <span class="highlight">${data.donorName}</span>
                ${data.donorPan ? `(PAN: <span class="highlight">${data.donorPan}</span>)` : ""}
                has made a voluntary donation to <strong>${data.trustName}</strong>
                on <span class="highlight">${formattedDate}</span>.
              </p>
              
              <div class="amount-box">
                <div>
                  <div style="color: #64748b; font-size: 12px;">Donation Amount</div>
                  <div style="font-size: 22px; font-weight: bold; color: #1a365d;">₹${formattedAmount}</div>
                </div>
                <div style="text-align: right;">
                  <div style="color: #64748b; font-size: 12px;">In Words</div>
                  <div style="font-size: 13px; color: #1a365d; font-style: italic;">${amountInWords}</div>
                </div>
              </div>
              
              <p style="font-size: 12px; color: #64748b;">
                Transaction Reference: ${data.transactionId}<br>
                The donor is entitled to claim deduction under Section 80G of the Income Tax Act, 1961.
              </p>
            </div>
            
            <div class="footer">
              <div class="trust-info">
                ${data.trustAddress}<br>
                Date of Issue: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div class="signature">
                Authorized Signatory<br>
                <strong>${data.trustName}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SCT/${year}-${month}/${random}`;
}
