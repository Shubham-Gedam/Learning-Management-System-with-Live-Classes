import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCertificate,
  downloadCertificate,
} from "../services/certificate.service";

function Certificate() {
  const { certificateId } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify() {
    try {
      setLoading(true);
      setError("");
      setCertificate(null);

      const response = await getCertificate(certificateId);
      setCertificate(response.data?.data ?? response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load certificate.");
    } finally {
      setLoading(false);
    }
  }
  async function handleDownload() {
    try {
      const response = await downloadCertificate(certificateId);

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to download certificate PDF.",
      );
    }
  }

  return (
    <main className="hero">
      <span className="eyebrow">LEARNING ACHIEVEMENT</span>

      <h1>
        Your Course
        <br />
        <span>Certificate</span>
      </h1>

      <p>Certificate ID: {certificateId}</p>

      <div className="hero-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Loading..." : "View Certificate"}
        </button>
        <button type="button" className="primary-btn" onClick={handleDownload}>
          Download PDF
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      {certificate && (
        <section>
          <h2>
            {certificate.title ||
              certificate.courseName ||
              "Certificate Details"}
          </h2>
          <pre>{JSON.stringify(certificate, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}

export default Certificate;
