import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCertificate,
  downloadCertificate,
} from "../services/certificate.service";
import { Award, Download, ArrowLeft, Sparkles, AlertCircle, CheckCircle2, FileText } from "lucide-react";

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
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-12 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        
        {/* Back Link */}
        <Link 
          to="/my-courses" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-orange-500 transition-colors uppercase tracking-wider bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Learning
        </Link>

        {/* Header Section */}
        <div className="text-center md:text-left space-y-3 border-b border-neutral-900 pb-8">
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-4 h-4" /> LEARNING ACHIEVEMENT
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Your Course <span className="text-orange-500">Certificate</span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Credential ID: <span className="text-neutral-300">{certificateId}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">

          <button 
            type="button" 
            className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 font-semibold px-8 py-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg" 
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 text-orange-500" /> Download PDF
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Certificate Details Preview Box */}
        {certificate && (
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                {certificate.title ||
                  certificate.courseName ||
                  "Certificate Details"}
              </h2>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Verified Credential
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl overflow-x-auto">
              <pre className="text-xs text-orange-400 font-mono leading-relaxed">
                {JSON.stringify(certificate, null, 2)}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Certificate;