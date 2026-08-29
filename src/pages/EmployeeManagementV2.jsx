import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  BarChart3,
  Check,
  Download,
  AlertTriangle,
  FileText,
  Layers,
  Network,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import api from "../utils/api";
import CorporatePasswordField from "../components/CorporatePasswordField";

const emptyEmployee = { name: "", email: "", password: "", designation: "", department: "", skills: "", teamId: "" };
const defaultMessage = "Welcome to our learning platform! Your manager has invited you to join our team's professional development program. Welcome onboard!";
const emptySummary = {
  metrics: { totalEmployees: 0, activeLearners: 0, avgCompletion: 0, certificatesEarned: 0 },
  departmentProgress: [],
  skillsDistribution: [],
  recentActivity: [],
};

function employeeId(employee) {
  return String(employee?._id || employee?.id || "");
}

function progressFor(employee) {
  if (Number.isFinite(Number(employee.progress))) return Math.round(Number(employee.progress));
  const assigned = Number(employee.assignedCourses || 0);
  return assigned ? Math.round((Number(employee.completedCourses || 0) / assigned) * 100) : 0;
}

function apiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function downloadFile(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const seconds = Math.max(1, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function EmployeeManagementV2({ user }) {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [courses, setCourses] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [showBundles, setShowBundles] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newEmployee, setNewEmployee] = useState(emptyEmployee);
  const [bulkEmails, setBulkEmails] = useState("");
  const [customMessage, setCustomMessage] = useState(defaultMessage);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [employeesResponse, summaryResponse, coursesResponse, teamsResponse] = await Promise.all([
        api.get("/employees"),
        api.get("/employees/summary"),
        api.get("/employees/assignable-courses"),
        user?.role === "employer" ? api.get("/company/teams") : Promise.resolve({ data: { teams: [] } }),
      ]);
      setEmployees(employeesResponse.data || []);
      setSummary(summaryResponse.data || emptySummary);
      setCourses(coursesResponse.data || []);
      setTeams(teamsResponse.data?.teams || []);
    } catch (error) {
      setNotice({ tone: "error", text: apiMessage(error, "Unable to load the employer dashboard.") });
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setShowAddForm(false);
        setShowBulkInvite(false);
        setShowBundles(false);
        setDeleteTarget(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const departments = useMemo(() => [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort(), [employees]);
  const filteredEmployees = useMemo(() => employees.filter((employee) => {
    const query = searchTerm.trim().toLowerCase();
    return (!query || `${employee.name} ${employee.email} ${employee.designation || ""}`.toLowerCase().includes(query))
      && (filterDept === "all" || employee.department === filterDept)
      && (filterStatus === "all" || employee.status === filterStatus);
  }), [employees, filterDept, filterStatus, searchTerm]);

  const courseGroups = useMemo(() => courses.reduce((groups, course) => {
    const category = course.category || "General";
    return { ...groups, [category]: [...(groups[category] || []), course] };
  }, {}), [courses]);

  const handleAddEmployee = async (event) => {
    event.preventDefault();
    setWorking(true);
    try {
      await api.post("/employees", { ...newEmployee, skills: newEmployee.skills.split(",").map((skill) => skill.trim()).filter(Boolean) });
      setNewEmployee(emptyEmployee);
      setShowAddForm(false);
      setNotice({ tone: "success", text: "Employee added and invitation queued." });
      await loadData();
    } catch (error) {
      setNotice({ tone: "error", text: apiMessage(error, "Unable to add this employee.") });
    } finally {
      setWorking(false);
    }
  };

  const handleBulkInvite = async () => {
    const emails = bulkEmails.split(/[\n,]/).map((email) => email.trim()).filter(Boolean);
    if (!emails.length) {
      setNotice({ tone: "error", text: "Enter at least one employee email address." });
      return;
    }
    setWorking(true);
    try {
      const { data } = await api.post("/employees/invitations", { emails, message: customMessage });
      setBulkEmails("");
      setShowBulkInvite(false);
      const failures = data.errors?.length || 0;
      setNotice({ tone: failures ? "warning" : "success", text: `${data.employees?.length || 0} invitation(s) queued${failures ? `; ${failures} could not be sent.` : "."}` });
      await loadData();
    } catch (error) {
      const invalid = error?.response?.data?.invalidEmails;
      setNotice({ tone: "error", text: invalid?.length ? `Invalid email: ${invalid.join(", ")}` : apiMessage(error, "Unable to send invitations.") });
    } finally {
      setWorking(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteTarget || user?.role !== "employer") return;
    setWorking(true);
    try {
      const { data } = await api.delete(`/employees/${employeeId(deleteTarget)}`);
      setSelectedEmployees((current) => current.filter((id) => id !== employeeId(deleteTarget)));
      setDeleteTarget(null);
      setNotice({ tone: "success", text: data.message || `${deleteTarget.name} was removed from the organization.` });
      await loadData();
    } catch (error) {
      setNotice({ tone: "error", text: apiMessage(error, "Unable to remove this employee.") });
    } finally {
      setWorking(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: async ({ data, errors }) => {
        if (errors.length) {
          setNotice({ tone: "error", text: `CSV could not be read: ${errors[0].message}` });
          return;
        }
        const rows = data.map((row) => ({
          name: row.name || row["full name"],
          email: row.email || row["email address"],
          designation: row.designation || row["job title"] || "Employee",
          department: row.department,
          skills: row.skills || "",
        }));
        setWorking(true);
        try {
          const response = await api.post("/employees/bulk", { employees: rows });
          const failures = response.data.errors?.length || 0;
          setNotice({ tone: failures ? "warning" : "success", text: `${response.data.employees?.length || 0} employee(s) imported${failures ? `; ${failures} invalid row(s).` : "."}` });
          await loadData();
        } catch (error) {
          const rowErrors = error?.response?.data?.errors;
          setNotice({ tone: "error", text: rowErrors?.length ? `${rowErrors.length} row(s) failed validation. ${rowErrors[0].message}` : apiMessage(error, "Unable to import employees.") });
        } finally {
          setWorking(false);
        }
      },
    });
  };

  const downloadTemplate = () => downloadFile(
    "name,email,designation,department,skills\nJohn Doe,john@company.com,Developer,Engineering,React; Node.js\n",
    "text/csv;charset=utf-8",
    "welx-employee-template.csv",
  );

  const exportEmployees = () => {
    const csv = [
      ["Name", "Email", "Department", "Designation", "Assigned", "Completed", "Progress", "Status"].map(csvCell).join(","),
      ...employees.map((employee) => [employee.name, employee.email, employee.department, employee.designation, employee.assignedCourses, employee.completedCourses, `${progressFor(employee)}%`, employee.status].map(csvCell).join(",")),
    ].join("\n");
    downloadFile(csv, "text/csv;charset=utf-8", "welx-team-progress.csv");
    setNotice({ tone: "success", text: "Your organization report was downloaded." });
  };

  const toggleSelected = (setter, value) => setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

  const handleAssignBundles = async () => {
    if (!selectedEmployees.length || !selectedCourses.length) {
      setNotice({ tone: "error", text: "Select at least one employee and one course." });
      return;
    }
    setWorking(true);
    try {
      const { data } = await api.post("/employees/assign-bundles", { employeeIds: selectedEmployees, courseIds: selectedCourses });
      setNotice({ tone: "success", text: `${data.assignmentsCreated} new course assignment(s) added across ${data.employeesUpdated} employee(s).` });
      setSelectedEmployees([]);
      setSelectedCourses([]);
      setShowBundles(false);
      await loadData();
    } catch (error) {
      setNotice({ tone: "error", text: apiMessage(error, "Unable to assign course bundles.") });
    } finally {
      setWorking(false);
    }
  };

  const metrics = summary.metrics || emptySummary.metrics;

  return (
    <div className="employer-page employer-team-page">
      <div className="employer-shell">
        <header className="employer-page-header">
          <div><span className="employer-eyebrow">People and learning operations</span><h1>Team Management</h1><p>Invite and manage your team members</p></div>
          <div className="employer-header-actions">
            {user?.role === "employer" && <button type="button" className="employer-button employer-button-muted" onClick={() => navigate("/company-roles")}><Network /> Roles &amp; Teams</button>}
            <button type="button" className="employer-button employer-button-purple" onClick={() => setShowBulkInvite(true)}><Send /> Send Invitations</button>
            <button type="button" className="employer-button employer-button-blue" onClick={() => setShowAddForm(true)}><Plus /> Add Employee</button>
          </div>
        </header>

        <section className="employer-action-grid">
          <button type="button" className="employer-action-card tone-blue" onClick={() => setShowAddForm(true)}><i><UserPlus /></i><span><strong>Add Employee</strong><small>Manually add team members</small></span></button>
          <label className="employer-action-card tone-green" aria-disabled={working}><i><Upload /></i><span><strong>Bulk Upload</strong><small>Upload employee CSV file</small></span><input type="file" accept=".csv,text/csv" onChange={handleFileUpload} disabled={working} /></label>
          <button type="button" className="employer-action-card tone-purple" onClick={() => setShowBulkInvite(true)}><i><Mail /></i><span><strong>Send Invitations</strong><small>Bulk email invites</small></span></button>
          <button type="button" className="employer-action-card tone-orange" onClick={exportEmployees}><i><FileText /></i><span><strong>Export Reports</strong><small>Download progress data</small></span></button>
        </section>

        <section className="employer-team-hero employer-panel">
          <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&h=560&fit=crop" alt="Colleagues celebrating progress together" />
          <div>
            <article><strong className="tone-blue">{metrics.totalEmployees}</strong><span>Total Employees</span></article>
            <article><strong className="tone-green">{metrics.activeLearners}</strong><span>Active Learners</span></article>
            <article><strong className="tone-purple">{metrics.avgCompletion}%</strong><span>Avg Completion</span></article>
            <article><strong className="tone-orange">{metrics.certificatesEarned}</strong><span>Certificates Earned</span></article>
          </div>
        </section>

        <section className="employer-team-tools employer-panel">
          <div className="employer-search-field"><Search /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search employees..." /></div>
          <select value={filterDept} onChange={(event) => setFilterDept(event.target.value)} aria-label="Filter by department"><option value="all">All Departments</option>{departments.map((department) => <option key={department}>{department}</option>)}</select>
          <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} aria-label="Filter by status"><option value="all">All Statuses</option><option value="active">Active</option><option value="invited">Invited</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select>
          <button type="button" onClick={downloadTemplate}><Download /> CSV template</button>
          <button type="button" onClick={() => setShowBundles(true)}><Layers /> Assign bundles</button>
          {user?.role === "employer" && <button type="button" onClick={() => navigate("/employer-analytics")}><BarChart3 /> Analytics</button>}
          {user?.role === "employer" && <button type="button" onClick={() => navigate("/company-roles")}><Network /> Teams &amp; roles</button>}
        </section>

        <section className="employer-team-table employer-panel" aria-label="Employees">
          <div className="employer-table-scroll"><table><thead><tr><th>Employee</th><th>Team / Access</th><th>Department</th><th>Assigned</th><th>Completed</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {filteredEmployees.map((employee) => {
              const id = employeeId(employee);
              const progress = progressFor(employee);
              return <tr key={id}><td><strong>{employee.name}</strong><span>{employee.email}</span><small>{employee.designation || "Employee"}</small></td><td><strong>{employee.teamName || "Unassigned"}</strong><small className={`organization-role-${employee.organizationRole || "team_member"}`}>{employee.organizationRole === "team_leader" ? "Team leader" : "Team member"}</small></td><td><b>{employee.department}</b></td><td>{employee.assignedCourses || 0}</td><td>{employee.completedCourses || 0}</td><td><div className="employer-table-progress"><i><span style={{ width: `${progress}%` }} /></i><small>{progress}%</small></div></td><td><em className={`status-${employee.status}`}>{employee.status}</em></td><td><div className="employer-row-actions"><button className="employer-action-view" type="button" onClick={() => navigate(`/employee/${id}`)}>View</button><button className="employer-action-assign" type="button" onClick={() => navigate(`/assign-courses/${id}`)}>Assign</button>{user?.role === "employer" && <button className="employer-action-delete" type="button" onClick={() => setDeleteTarget(employee)} aria-label={`Delete ${employee.name}`}><Trash2 /> Delete</button>}</div></td></tr>;
            })}
          </tbody></table></div>
          {loading && <div className="employer-empty-state">Loading your team...</div>}
          {!loading && !filteredEmployees.length && <div className="employer-empty-state">No employees match your search and filters.</div>}
        </section>

        <section className="employer-panel employer-activity-panel employer-team-activity">
          <div className="employer-panel-heading"><div><span>Organization events</span><h2>Recent Activity</h2></div></div>
          <div className="employer-activity-list">
            {(summary.recentActivity || []).map((activity) => <article key={activity._id || `${activity.employeeName}-${activity.createdAt}`}><i className="tone-blue">{String(activity.employeeName || "T").split(" ").map((word) => word[0]).join("").slice(0, 2)}</i><p><strong>{activity.employeeName}</strong><span>{activity.description}</span></p><time>{relativeTime(activity.createdAt)}</time></article>)}
          </div>
          {!summary.recentActivity?.length && <div className="employer-empty-state">Team events will appear here as employees join, learn, and complete courses.</div>}
        </section>
      </div>

      {notice && <div className={`employer-toast tone-${notice.tone}`} role="status">{notice.text}</div>}

      {showAddForm && <div className="employer-modal-layer" onMouseDown={(event) => event.target === event.currentTarget && setShowAddForm(false)}><section className="employer-modal employer-add-modal" role="dialog" aria-modal="true" aria-labelledby="add-employee-title"><header><div><span>Send an account invitation</span><h2 id="add-employee-title">Add New Employee</h2></div><button type="button" onClick={() => setShowAddForm(false)} aria-label="Close"><X /></button></header><form onSubmit={handleAddEmployee}>
        <input type="text" placeholder="Employee name" value={newEmployee.name} onChange={(event) => setNewEmployee({ ...newEmployee, name: event.target.value })} required autoFocus />
        <input type="email" placeholder="Employee email" value={newEmployee.email} onChange={(event) => setNewEmployee({ ...newEmployee, email: event.target.value })} required />
        <CorporatePasswordField value={newEmployee.password} onChange={(password) => setNewEmployee({ ...newEmployee, password })} label="Corporate employee WEL.X password" />
        <input type="text" placeholder="Job title (optional)" value={newEmployee.designation} onChange={(event) => setNewEmployee({ ...newEmployee, designation: event.target.value })} />
        <select value={newEmployee.department} onChange={(event) => setNewEmployee({ ...newEmployee, department: event.target.value })} required><option value="">Select Department</option><option>Engineering</option><option>Marketing</option><option>Sales</option><option>HR</option><option>Finance</option><option>Operations</option><option>General</option></select>
        {user?.role === "employer" && <select value={newEmployee.teamId} onChange={(event) => { const team = teams.find((item) => item.id === event.target.value); setNewEmployee({ ...newEmployee, teamId: event.target.value, department: team?.department || newEmployee.department }); }}><option value="">No team yet</option>{teams.map((team) => <option value={team.id} key={team.id}>{team.name} · {team.department}</option>)}</select>}
        <input type="text" placeholder="Key skills (comma separated)" value={newEmployee.skills} onChange={(event) => setNewEmployee({ ...newEmployee, skills: event.target.value })} />
        <p className="company-modal-note"><UserPlus /> This corporate email and password become the employee's active WEL.X login. The credentials are also included in their onboarding email.</p>
        <footer><button type="submit" className="employer-button employer-button-blue" disabled={working}>{working ? "Adding..." : "Add & Send Credentials"}</button><button type="button" className="employer-button employer-button-muted" onClick={() => setShowAddForm(false)}>Cancel</button></footer>
      </form></section></div>}

      {deleteTarget && <div className="employer-modal-layer" onMouseDown={(event) => event.target === event.currentTarget && setDeleteTarget(null)}><section className="employer-modal employer-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-employee-title"><header><div><span>Employer-head action</span><h2 id="delete-employee-title">Remove employee?</h2></div><button type="button" onClick={() => setDeleteTarget(null)} aria-label="Close"><X /></button></header>
        <div className="employer-delete-identity"><i><AlertTriangle /></i><div><strong>{deleteTarget.name}</strong><span>{deleteTarget.email}</span><small>{deleteTarget.teamName || "Unassigned"} · {deleteTarget.organizationRole === "team_leader" ? "Team leader" : "Team member"}</small></div></div>
        <p>They will immediately lose access to this company's teams and learning assignments. Their standalone WEL.X account is preserved.</p>
        <footer><button type="button" className="employer-button employer-button-danger" onClick={handleDeleteEmployee} disabled={working}>{working ? "Removing..." : "Remove from company"}</button><button type="button" className="employer-button employer-button-muted" onClick={() => setDeleteTarget(null)}>Keep employee</button></footer>
      </section></div>}

      {showBulkInvite && <div className="employer-modal-layer" onMouseDown={(event) => event.target === event.currentTarget && setShowBulkInvite(false)}><section className="employer-modal employer-invite-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-invite-title"><header><div><span>Invite multiple learners</span><h2 id="bulk-invite-title">Send Bulk Invitations</h2></div><button type="button" onClick={() => setShowBulkInvite(false)} aria-label="Close"><X /></button></header>
        <label>Email Addresses <small>one per line or separated by commas</small><textarea value={bulkEmails} onChange={(event) => setBulkEmails(event.target.value)} placeholder={"employee@company.com\ncolleague@company.com"} rows="6" autoFocus /></label>
        <label>Custom Message<textarea value={customMessage} onChange={(event) => setCustomMessage(event.target.value)} rows="4" /></label>
        <footer><button type="button" className="employer-button employer-button-purple" onClick={handleBulkInvite} disabled={working}>{working ? "Sending..." : "Send Invitations"}</button><button type="button" className="employer-button employer-button-muted" onClick={() => setShowBulkInvite(false)}>Cancel</button></footer>
      </section></div>}

      {showBundles && <div className="employer-modal-layer" onMouseDown={(event) => event.target === event.currentTarget && setShowBundles(false)}><section className="employer-modal employer-bundle-modal" role="dialog" aria-modal="true" aria-labelledby="bundle-title"><header><div><span>Develop several learners at once</span><h2 id="bundle-title">Assign Course Bundles</h2></div><button type="button" onClick={() => setShowBundles(false)} aria-label="Close"><X /></button></header>
        <div className="employer-bundle-columns">
          <section><h3>Select Employees</h3><div className="employer-bundle-scroll">{employees.map((employee) => { const id = employeeId(employee); const checked = selectedEmployees.includes(id); return <label key={id} className={checked ? "is-selected" : ""}><input type="checkbox" checked={checked} onChange={() => toggleSelected(setSelectedEmployees, id)} /><i>{checked && <Check />}</i><span><strong>{employee.name}</strong><small>{employee.department} · {employee.email}</small></span></label>; })}</div></section>
          <section><h3>Course Bundles</h3><div className="employer-bundle-scroll">{Object.entries(courseGroups).map(([category, groupedCourses]) => <div className="employer-bundle-group" key={category}><h4>{category}</h4>{groupedCourses.map((course) => { const id = String(course._id || course.id); const checked = selectedCourses.includes(id); return <label key={id} className={checked ? "is-selected" : ""}><input type="checkbox" checked={checked} onChange={() => toggleSelected(setSelectedCourses, id)} /><i>{checked && <Check />}</i><span><strong>{course.title}</strong><small>{course.duration || "Self-paced"} · {course.level || "beginner"}</small></span></label>; })}</div>)}</div></section>
        </div>
        <div className="employer-bundle-summary"><span>{selectedEmployees.length} employee(s)</span><span>{selectedCourses.length} course(s)</span></div>
        <footer><button type="button" className="employer-button employer-button-blue" onClick={handleAssignBundles} disabled={working}>{working ? "Assigning..." : "Assign Selected Courses"}</button><button type="button" className="employer-button employer-button-muted" onClick={() => setShowBundles(false)}>Cancel</button></footer>
      </section></div>}
    </div>
  );
}
