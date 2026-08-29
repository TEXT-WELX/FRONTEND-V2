import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Crown, Plus, Search, TrendingUp, UserPlus, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import CorporatePasswordField from "../components/CorporatePasswordField";

const emptyMember = { name: "", email: "", designation: "", skills: "", password: "" };

export default function LeaderDashboard({ user }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [member, setMember] = useState(emptyMember);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/company/leader-dashboard");
      setDashboard(data);
    } catch (error) {
      setNotice({ tone: "error", text: error?.response?.data?.message || "Unable to load your leader dashboard." });
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const employees = useMemo(() => (dashboard?.employees || []).filter((employee) => `${employee.name} ${employee.email} ${employee.designation}`.toLowerCase().includes(search.trim().toLowerCase())), [dashboard, search]);
  const metrics = dashboard?.summary?.metrics || {};

  const addMember = async (event) => {
    event.preventDefault();
    setWorking(true);
    try {
      const { data } = await api.post(`/company/teams/${dashboard.team.id}/members`, { ...member, skills: member.skills.split(",").map((skill) => skill.trim()).filter(Boolean) });
      setMember(emptyMember);
      setShowAdd(false);
      setNotice({ tone: data.notification?.status === "failed" ? "warning" : "success", text: `Team member onboarded. Email notification ${data.notification?.status || "queued"}.` });
      await load();
    } catch (error) {
      setNotice({ tone: "error", text: error?.response?.data?.message || "Unable to onboard this employee." });
    } finally {
      setWorking(false);
    }
  };

  if (!dashboard) return <div className="employer-page"><div className="employer-shell employer-not-found"><Crown /><h1>Loading leader dashboard...</h1></div>{notice && <div className="employer-toast tone-error">{notice.text}</div>}</div>;

  const cards = [
    ["Team Members", metrics.totalEmployees || 0, Users, "blue"],
    ["Active Learners", metrics.activeLearners || 0, BookOpen, "green"],
    ["Average Completion", `${metrics.avgCompletion || 0}%`, TrendingUp, "purple"],
    ["Certificates Earned", metrics.certificatesEarned || 0, Award, "orange"],
  ];

  return (
    <div className="employer-page leader-dashboard-page">
      <div className="employer-shell">
        <header className="employer-page-header"><div><span className="employer-eyebrow"><Crown /> Team-leader workspace</span><h1>Leader Dashboard — {dashboard.team.department} Department</h1><p>Manage the {dashboard.team.name} team, onboard members, and assign their learning.</p></div><button type="button" className="employer-button employer-button-blue" onClick={() => setShowAdd(true)}><UserPlus /> Add Team Member</button></header>

        <section className="leader-identity employer-panel"><i>{(user?.name || dashboard.leader?.name || "L").charAt(0)}</i><div><span>Team leader</span><h2>{dashboard.leader?.name || user?.name}</h2><p>{dashboard.leader?.email} · {dashboard.team.name}</p></div><aside><small>Your management scope</small><strong>{dashboard.team.memberCount || 0} member(s)</strong></aside></section>

        <section className="employer-metric-grid">{cards.map(([label, value, Icon, tone]) => <article key={label} className={`employer-metric-card tone-${tone}`}><div><span>{label}</span><strong>{value}</strong></div><i><Icon /></i></article>)}</section>

        <section className="employer-team-tools employer-panel leader-tools"><div className="employer-search-field"><Search /><input type="search" placeholder="Search your team..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><button type="button" onClick={() => setShowAdd(true)}><Plus /> Onboard member</button></section>

        <section className="employer-team-table employer-panel"><div className="employer-table-scroll"><table><thead><tr><th>Employee</th><th>Role</th><th>Assigned</th><th>Completed</th><th>Progress</th><th>Status</th><th>Actions</th></tr></thead><tbody>{employees.map((employee) => <tr key={employee.id}><td><strong>{employee.name}</strong><span>{employee.email}</span></td><td><b>{employee.designation || "Corporate Employee"}</b></td><td>{employee.assignedCourses || 0}</td><td>{employee.completedCourses || 0}</td><td><div className="employer-table-progress"><i><span style={{ width: `${employee.progress || 0}%` }} /></i><small>{employee.progress || 0}%</small></div></td><td><em className={`status-${employee.status}`}>{employee.status}</em></td><td><button type="button" onClick={() => navigate(`/employee/${employee.id}`)}>View</button><button type="button" onClick={() => navigate(`/assign-courses/${employee.id}`)}>Assign</button></td></tr>)}</tbody></table></div>{!employees.length && <div className="employer-empty-state">No members match this search. Add the first person to your team.</div>}</section>

        <section className="employer-panel employer-activity-panel"><div className="employer-panel-heading"><div><span>Only events from your team</span><h2>Recent Team Activity</h2></div></div><div className="employer-activity-list">{(dashboard.summary?.recentActivity || []).map((activity) => <article key={activity._id}><i className="tone-blue">{activity.employeeName?.charAt(0)}</i><p><strong>{activity.employeeName}</strong><span>{activity.description}</span></p><time>{new Date(activity.createdAt).toLocaleDateString()}</time></article>)}</div>{!dashboard.summary?.recentActivity?.length && <div className="employer-empty-state">Team learning events will appear here.</div>}</section>
      </div>

      {notice && <div className={`employer-toast tone-${notice.tone}`} role="status">{notice.text}</div>}
      {showAdd && <div className="employer-modal-layer" onMouseDown={(event) => event.target === event.currentTarget && setShowAdd(false)}><section className="employer-modal" role="dialog" aria-modal="true"><header><div><span>{dashboard.team.name}</span><h2>Add Team Member</h2></div><button type="button" onClick={() => setShowAdd(false)} aria-label="Close"><X /></button></header><form onSubmit={addMember}>
        <input type="text" placeholder="Employee name" value={member.name} onChange={(event) => setMember({ ...member, name: event.target.value })} required autoFocus />
        <input type="email" placeholder="Corporate email" value={member.email} onChange={(event) => setMember({ ...member, email: event.target.value })} required />
        <CorporatePasswordField value={member.password} onChange={(password) => setMember({ ...member, password })} label="Team member WEL.X password" />
        <input type="text" placeholder="Job title (optional)" value={member.designation} onChange={(event) => setMember({ ...member, designation: event.target.value })} />
        <input type="text" placeholder="Skills (comma separated)" value={member.skills} onChange={(event) => setMember({ ...member, skills: event.target.value })} />
        <p className="company-modal-note"><UserPlus /> The employee receives their corporate email and the exact password entered above. They are automatically mapped to your team dashboard.</p>
        <footer><button className="employer-button employer-button-blue" disabled={working}>{working ? "Onboarding..." : "Add & Send Credentials"}</button><button type="button" className="employer-button employer-button-muted" onClick={() => setShowAdd(false)}>Cancel</button></footer>
      </form></section></div>}
    </div>
  );
}
