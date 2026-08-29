import { Award, BookOpen, Building2, Clock, Mail, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";

function courseId(assignment) {
  return String(assignment.course || assignment._id || assignment.id || "");
}

export default function EmployeeDashboard({ user, companyProfile }) {
  const employee = companyProfile?.employee;
  const team = companyProfile?.team;
  const assignments = employee?.courseAssignments || [];
  const completed = assignments.filter((course) => course.completedAt || Number(course.progress) >= 100);
  const inProgress = assignments.filter((course) => !course.completedAt && Number(course.progress) < 100);
  const stats = [
    ["Assigned Courses", employee?.assignedCourses || 0, BookOpen, "blue"],
    ["Completed", employee?.completedCourses || 0, Target, "green"],
    ["Certificates", employee?.certificatesEarned || 0, Award, "purple"],
    ["Learning Hours", employee?.learningHours || 0, Clock, "orange"],
  ];

  if (!companyProfile?.access) {
    return <div className="corporate-page"><div className="corporate-shell"><section className="corporate-empty"><Building2 /><h1>Corporate Employee Dashboard</h1><p>Your WELX account is active, but your email has not yet been assigned to a company team. Ask your employer or talent-acquisition head to add this email to their Roles &amp; Teams panel.</p><Link to="/courses">Browse public courses</Link></section></div></div>;
  }

  return (
    <div className="corporate-page">
      <div className="corporate-shell">
        <header className="corporate-header"><div><span>Corporate employee workspace</span><h1>Welcome back, {employee?.name || user?.name}</h1><p>Your learning plan is managed by {team?.name || "your organization"}.</p></div><div className="corporate-team-pill"><Users /><span><small>Assigned team</small><strong>{team?.name || "Awaiting team assignment"}</strong></span></div></header>

        <section className="corporate-profile-strip"><i>{(employee?.name || user?.name || "E").charAt(0)}</i><div><h2>{employee?.name || user?.name}</h2><p>{employee?.designation || "Corporate Employee"} · {employee?.department || "General"}</p><span><Mail /> {employee?.email || user?.email}</span></div>{team?.leader && <aside><small>Team leader</small><strong>{team.leader.name}</strong><span>{team.leader.email}</span></aside>}</section>

        <section className="employer-metric-grid corporate-metrics">{stats.map(([label, value, Icon, tone]) => <article key={label} className={`employer-metric-card tone-${tone}`}><div><span>{label}</span><strong>{value}</strong></div><i><Icon /></i></article>)}</section>

        <div className="corporate-dashboard-grid">
          <section className="corporate-course-panel"><header><div><span>Your development plan</span><h2>Assigned Courses</h2></div><b>{inProgress.length} in progress</b></header><div className="corporate-course-list">{assignments.map((course) => <article key={courseId(course)}><div><span>{course.category || "Course"}</span><h3>{course.title}</h3><p>{course.duration || "Self-paced"} · {course.level || "beginner"}</p></div><div className="corporate-course-progress"><p><span>Progress</span><strong>{course.progress || 0}%</strong></p><i><b style={{ width: `${course.progress || 0}%` }} /></i><Link to={`/course/${courseId(course)}`}>{Number(course.progress) >= 100 ? "Review course" : "Continue learning"}</Link></div></article>)}</div>{!assignments.length && <div className="employer-empty-state">No courses have been assigned yet. Your team leader or employer head can add courses to your plan.</div>}</section>

          <aside className="corporate-side-panel"><section><span>Team membership</span><h2>{team?.name || "Unassigned"}</h2><p>{team?.department || employee?.department || "General"} Department</p><dl><div><dt>Role</dt><dd>Team Member</dd></div><div><dt>Status</dt><dd className={`status-${employee?.status || "pending"}`}>{employee?.status || "pending"}</dd></div><div><dt>Joined</dt><dd>{employee?.joinedAt ? new Date(employee.joinedAt).toLocaleDateString() : "Recently"}</dd></div></dl></section><section><span>Achievement summary</span><h2>{completed.length} completed</h2><p>{employee?.progress || 0}% average course progress</p><div className="corporate-overall-progress"><i><b style={{ width: `${employee?.progress || 0}%` }} /></i></div></section></aside>
        </div>
      </div>
    </div>
  );
}
