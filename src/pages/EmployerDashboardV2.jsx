import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Award, BookOpen, ChevronDown, Crown, FileDown, Network, TrendingUp, UserPlus, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { jsPDF } from "jspdf";
import api from "../utils/api";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const emptySummary = { metrics: { totalEmployees: 0, activeLearners: 0, certificatesEarned: 0, avgCompletion: 0 }, departmentProgress: [], skillsDistribution: [], recentActivity: [] };

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
  return date.toLocaleDateString();
}

function downloadBlob(content, filename) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function EmployerDashboardV2({ user }) {
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const [summary, setSummary] = useState(emptySummary);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/company/dashboard"), api.get("/employees")])
      .then(([summaryResponse, employeeResponse]) => {
        setSummary(summaryResponse.data || emptySummary);
        setEmployees(employeeResponse.data || []);
      })
      .catch((requestError) => setError(requestError?.response?.data?.message || "Unable to load analytics."));
  }, []);

  const departmentData = summary.departmentProgress || [];
  const skillData = useMemo(() => (summary.skillsDistribution || []).map((skill, index) => ({ ...skill, color: colors[index % colors.length] })), [summary.skillsDistribution]);
  const metricCards = [
    { label: "Company Teams", value: summary.companyMetrics?.totalTeams || 0, icon: Network, tone: "blue" },
    { label: "Team Leaders", value: summary.companyMetrics?.teamLeaders || 0, icon: Crown, tone: "purple" },
    { label: "Total Employees", value: summary.metrics?.totalEmployees || 0, icon: Users, tone: "blue" },
    { label: "Active Learners", value: summary.metrics?.activeLearners || 0, icon: BookOpen, tone: "green" },
    { label: "Certificates", value: summary.metrics?.certificatesEarned || 0, icon: Award, tone: "purple" },
    { label: "Completion Rate", value: `${summary.metrics?.avgCompletion || 0}%`, icon: TrendingUp, tone: "orange" },
  ];

  const downloadCsv = async () => {
    const response = await api.get("/company/report", { responseType: "blob" });
    downloadBlob(response.data, "welx-company-report.csv");
  };

  const downloadPdf = () => {
    const report = new jsPDF();
    report.setTextColor(30, 64, 175);
    report.setFontSize(22);
    report.text("WELX Employer Report", 18, 22);
    report.setTextColor(55, 65, 81);
    report.setFontSize(11);
    report.text(user?.company || user?.name || "Organization", 18, 31);
    report.setFontSize(13);
    report.text(`${summary.metrics?.totalEmployees || 0} Total Employees | ${summary.metrics?.activeLearners || 0} Active Learners`, 18, 48);
    report.text(`${summary.metrics?.certificatesEarned || 0} Certificates | ${summary.metrics?.avgCompletion || 0}% Average Completion`, 18, 58);
    report.setFontSize(12);
    report.text("Department Progress", 18, 76);
    departmentData.forEach((row, index) => report.text(`${row.department}: ${row.completed}/${row.assigned} courses completed`, 22, 87 + index * 9));
    report.save("welx-employer-report.pdf");
  };

  const handleReport = async (format) => {
    setReportOpen(false);
    if (format === "csv") await downloadCsv();
    else downloadPdf();
  };

  return (
    <div className="employer-page employer-dashboard-page">
      <div className="employer-shell">
        <header className="employer-page-header"><div><span className="employer-eyebrow">Organization workspace</span><h1>Employer Dashboard</h1><p>Monitor your team&apos;s learning progress and workforce readiness.</p></div><div className="employer-header-actions">
          <div className="employer-report-control"><button type="button" className="employer-button employer-button-blue" onClick={() => setReportOpen((open) => !open)} aria-expanded={reportOpen}><FileDown /> Generate Report <ChevronDown className={reportOpen ? "is-rotated" : ""} /></button>{reportOpen && <div className="employer-report-menu"><button type="button" onClick={() => handleReport("csv")}>Download CSV</button><button type="button" onClick={() => handleReport("pdf")}>Download PDF</button></div>}</div>
          <button type="button" className="employer-button employer-button-muted" onClick={() => navigate("/company-roles")}><Network /> Roles &amp; Teams</button>
          <button type="button" className="employer-button employer-button-green" onClick={() => navigate("/employee-management")}><UserPlus /> Manage people</button>
        </div></header>

        {error && <div className="employer-toast tone-error" role="alert">{error}</div>}
        <section className="employer-metric-grid" aria-label="Organization learning metrics">{metricCards.map(({ label, value, icon: Icon, tone }) => <article key={label} className={`employer-metric-card tone-${tone}`}><div><span>{label}</span><strong>{value}</strong></div><i><Icon /></i></article>)}</section>

        <section className="employer-chart-grid">
          <article className="employer-panel employer-chart-panel"><div className="employer-panel-heading"><div><span>Assigned vs completion</span><h2>Department Progress</h2></div><small>Live organization data</small></div><div className="employer-chart-canvas"><ResponsiveContainer width="100%" height="100%"><BarChart data={departmentData} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e6eaf2" /><XAxis dataKey="department" tick={{ fill: "#69738a", fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#8991a4", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f4f7fb" }} /><Legend iconType="circle" /><Bar dataKey="assigned" fill="#3b82f6" name="Assigned" radius={[6, 6, 0, 0]} /><Bar dataKey="completed" fill="#10b981" name="Completed" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>{!departmentData.length && <div className="employer-empty-state">Department data will appear after employees receive courses.</div>}</article>
          <article className="employer-panel employer-chart-panel"><div className="employer-panel-heading"><div><span>Capability coverage</span><h2>Skills Distribution</h2></div><small>Across your team</small></div><div className="employer-chart-canvas employer-pie-canvas"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={skillData} dataKey="value" nameKey="skill" cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={2} label={({ skill, value }) => `${skill}: ${value}%`}>{skillData.map((entry) => <Cell key={entry.skill} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => `${value}%`} /></PieChart></ResponsiveContainer></div>{!skillData.length && <div className="employer-empty-state">Add employee skills to populate this chart.</div>}</article>
        </section>

        <section className="employer-panel employer-activity-panel"><div className="employer-panel-heading"><div><span>Live organization feed</span><h2>Recent Activity</h2></div><button type="button" onClick={() => navigate("/employee-management")}>View team <ArrowRight /></button></div><div className="employer-activity-list">{(summary.recentActivity || []).map((activity) => <article key={activity._id}><i className="tone-blue">{String(activity.employeeName || "T").split(" ").map((word) => word[0]).join("").slice(0, 2)}</i><p><strong>{activity.employeeName}</strong><span>{activity.description}</span></p><time>{relativeTime(activity.createdAt)}</time></article>)}</div>{!summary.recentActivity?.length && <div className="employer-empty-state">Recent team events will appear here.</div>}</section>
      </div>
    </div>
  );
}
