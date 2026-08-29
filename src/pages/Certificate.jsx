import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Share, Award } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Certificate({ user }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizResult, setQuizResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef();

  const courses = {
    1: { title: "React.js Complete Course", instructor: "John Doe" },
    2: { title: "Data Science Fundamentals", instructor: "Jane Smith" },
    3: {
      title: "Business Strategy & Management",
      instructor: "Robert Johnson",
    },
  };

  const course = courses[courseId];
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `certificate-${course?.title.replace(/\s+/g, "-").toLowerCase()}.pdf`
      );
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Error generating certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const shareCertificate = async () => {
    try {
      if (navigator.share && navigator.canShare) {
        await navigator.share({
          title: "My Course Certificate",
          text: `I just completed ${courses[courseId]?.title} on Wel.x!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Certificate link copied to clipboard!");
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Certificate link copied to clipboard!");
      } catch (clipboardError) {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Certificate link copied to clipboard!");
      }
    }
  };

  const shareToLinkedIn = () => {
    const certificateId = `WEL${courseId}X${Date.now().toString().slice(-6)}`;
    const issueDate = new Date().toISOString().split("T")[0];
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const params = new URLSearchParams({
      name: course.title,
      organizationName: "Wel.x",
      issueYear: new Date().getFullYear(),
      issueMonth: new Date().getMonth() + 1,
      certId: certificateId,
      certUrl: window.location.href,
      expirationYear: new Date().getFullYear() + 1,
      expirationMonth: new Date().getMonth() + 1,
    });

    const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&${params.toString()}`;
    window.open(linkedinUrl, "_blank", "width=600,height=600");
  };

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Certificate Not Found
        </h1>
        <p className="text-gray-600 mt-2">
          The requested certificate does not exist.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Course Certificate
        </h1>
        <p className="text-gray-600">
          Congratulations on completing your course!
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div
          ref={certificateRef}
          className="bg-gradient-to-br from-blue-50 to-purple-50 border-8 border-blue-200 p-12 text-center"
          style={{ minHeight: "600px" }}
        >
          <div className="mb-8">
            <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-blue-900 mb-2">
              Certificate of Completion
            </h2>
            <div className="w-32 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="mb-8">
            <p className="text-lg text-gray-700 mb-4">
              This is to certify that
            </p>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {user?.name || "Student Name"}
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              has successfully completed the course
            </p>
            <h4 className="text-2xl font-semibold text-blue-800 mb-6">
              {course.title}
            </h4>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-gray-600">Instructor</p>
              <p className="font-semibold text-gray-900">{course.instructor}</p>
            </div>
            <div>
              <p className="text-gray-600">Completion Date</p>
              <p className="font-semibold text-gray-900">{currentDate}</p>
            </div>
          </div>

          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">Instructor Signature</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
              <p className="text-sm text-gray-600">
                Certificate ID: WEL{courseId}X{Date.now().toString().slice(-6)}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Verify this certificate at wel-x.com/verify
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 flex-wrap gap-2">
        <button
          onClick={downloadCertificate}
          disabled={downloading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={20} />
          {downloading ? "Generating..." : "Download PDF"}
        </button>
        <button
          onClick={shareCertificate}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Share size={20} />
          Share Certificate
        </button>
        <button
          onClick={shareToLinkedIn}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 flex items-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Share on LinkedIn
        </button>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
