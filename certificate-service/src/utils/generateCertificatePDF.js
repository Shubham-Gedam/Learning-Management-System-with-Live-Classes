import PDFDocument from "pdfkit";

export default function generateCertificatePDF(certificate, res) {
  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
    margins: {
      top: 40,
      bottom: 40,
      left: 50,
      right: 50,
    },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${certificate.certificateId}.pdf"`
  );

  doc.pipe(res);

  // Background
  doc.rect(0, 0, 842, 595).fill("#ffffff");

  // Decorative border
  doc
    .lineWidth(5)
    .strokeColor("#183153")
    .rect(22, 22, 798, 551)
    .stroke();

  doc
    .lineWidth(1)
    .strokeColor("#c5a44d")
    .rect(34, 34, 774, 527)
    .stroke();

  // Heading
  doc
    .fillColor("#183153")
    .font("Helvetica-Bold")
    .fontSize(30)
    .text("CERTIFICATE OF COMPLETION", 55, 100, {
      align: "center",
      width: 732,
    });

  doc
    .fillColor("#555555")
    .font("Helvetica")
    .fontSize(14)
    .text("This certificate is proudly presented to", 55, 175, {
      align: "center",
      width: 732,
    });

  // Student name
  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(certificate.studentName, 55, 215, {
      align: "center",
      width: 732,
    });

  doc
    .moveTo(220, 258)
    .lineTo(622, 258)
    .lineWidth(1)
    .strokeColor("#c5a44d")
    .stroke();

  // Course name
  doc
    .fillColor("#555555")
    .font("Helvetica")
    .fontSize(14)
    .text("For successfully completing the course", 55, 285, {
      align: "center",
      width: 732,
    });

  doc
    .fillColor("#183153")
    .font("Helvetica-Bold")
    .fontSize(21)
    .text(certificate.courseName, 70, 320, {
      align: "center",
      width: 702,
    });

  // Issue date
  const issueDate = new Date(certificate.issuedAt).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }
  );

  doc
    .fillColor("#555555")
    .font("Helvetica")
    .fontSize(12)
    .text(`Date of issue: ${issueDate}`, 55, 390, {
      align: "center",
      width: 732,
    });

  // Certificate ID
  doc
    .fontSize(10)
    .text(`Certificate ID: ${certificate.certificateId}`, 55, 430, {
      align: "center",
      width: 732,
    });

  // Issuer
  doc
    .fillColor("#183153")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Learning Management System", 55, 475, {
      align: "center",
      width: 732,
    });

  doc.end();
}