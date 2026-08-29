import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Award,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { certificateAPI } from "../utils/enhancedApi";
import { API_BASE } from "../utils/enhancedApiUpdated";

export default function CertificateEnhanced({ user }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (user) {
      loadCertificate();
      loadCourse();
    } else {
      navigate("/login");
    }
  }, [user, courseId]);

  const loadCertificate = async () => {
    try {
      const response = await certificateAPI.getUserCertificates();
      const courseCertificate = response.data.find(
        (cert) => cert.courseId === courseId
      );

      if (courseCertificate) {
        setCertificate(courseCertificate);
      }
    } catch (error) {
      console.error("Error loading certificate:", error);
    }
  };

  const loadCourse = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      }
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await certificateAPI.generateCertificate({ courseId });
      setCertificate(response.data.certificate);
    } catch (error) {
      console.error("Error generating certificate:", error);
      setError(
        error.response?.data?.message || "Failed to generate certificate"
      );
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificate) return;

    try {
      const response = await certificateAPI.downloadCertificate(
        certificate.certificateId
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${
        course?.title?.replace(/\s+/g, "-") || "course"
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  const shareOnLinkedIn = () => {
    if (!certificate) return;

    const text = `I just completed "${course?.title}" and earned a certificate! 🎉`;
    const url = `${window.location.origin}/verify-certificate/${certificate.verificationCode}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}&title=${encodeURIComponent(text)}`;

    window.open(linkedInUrl, "_blank", "width=600,height=400");
  };

  const copyVerificationLink = () => {
    if (!certificate) return;

    const url = `${window.location.origin}/verify-certificate/${certificate.verificationCode}`;
    navigator.clipboard.writeText(url);
    alert("Verification link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-96 bg-gray-300 rounded mb-6"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Course Not Found
          </h2>
          <p className="text-red-600 mb-4">
            The course you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Certificate</h1>
        <p className="text-gray-600">
          Verify and download your course completion certificate
        </p>
      </div>

      {!certificate ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <Award className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
            No Certificate Found
          </h2>
          <p className="text-yellow-700 mb-6">
            You haven't completed this course yet. Complete all modules and pass
            the final quiz to earn your certificate.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
            >
              Continue Course
            </button>
            <button
              onClick={generateCertificate}
              disabled={generating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Certificate"}
            </button>
          </div>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Certificate Preview */}
          <div className="bg-white border-8 border-blue-800 rounded-lg p-8 shadow-2xl">
            <div className="text-center">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-blue-800 mb-2">
                  Certificate of Completion
                </h2>
                <div className="w-32 h-1 bg-blue-800 mx-auto"></div>
              </div>

              <p className="text-xl text-gray-700 mb-8">
                This is to certify that
              </p>

              <h3 className="text-5xl font-bold text-blue-800 mb-8">
                {certificate.userName}
              </h3>

              <p className="text-xl text-gray-700 mb-4">
                has successfully completed the course
              </p>

              <h4 className="text-3xl font-bold text-blue-800 mb-8">
                {certificate.courseTitle}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
                <div>
                  <p className="text-gray-600">Instructor:</p>
                  <p className="text-lg font-semibold">
                    {certificate.instructorName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Completion Date:</p>
                  <p className="text-lg font-semibold">
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Final Score:</p>
                  <p className="text-lg font-semibold">
                    {certificate.finalScore}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Certificate ID:</p>
                  <p className="text-lg font-semibold font-mono">
                    {certificate.certificateId}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-600">Issued by:</p>
                    <p className="text-lg font-semibold">
                      {certificate.issuedBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Verification Code:</p>
                    <p className="text-lg font-semibold font-mono">
                      {certificate.verificationCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={downloadCertificate}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Certificate</span>
            </button>

            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Back to Course</span>
            </button>
          </div>

          {/* Share Options */}
          {showShareOptions && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Share Your Achievement
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={shareOnLinkedIn}
                  className="flex items-center justify-center space-x-2 bg-blue-700 text-white px-4 py-3 rounded-lg hover:bg-blue-800"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share on LinkedIn</span>
                </button>

                <button
                  onClick={copyVerificationLink}
                  className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
                >
                  <Award className="w-5 h-5" />
                  <span>Copy Verification Link</span>
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Verification:</strong> Anyone can verify this
                  certificate using the verification code or by visiting the
                  verification link.
                </p>
              </div>
            </div>
          )}

          {/* Certificate Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Certificate Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Certificate ID:</span>
                <p className="font-mono">{certificate.certificateId}</p>
              </div>
              <div>
                <span className="text-gray-600">Verification Code:</span>
                <p className="font-mono">{certificate.verificationCode}</p>
              </div>
              <div>
                <span className="text-gray-600">Issue Date:</span>
                <p>
                  {new Date(certificate.completionDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Final Score:</span>
                <p>{certificate.finalScore}%</p>
              </div>
              {certificate.skills && certificate.skills.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">Skills Gained:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {certificate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
