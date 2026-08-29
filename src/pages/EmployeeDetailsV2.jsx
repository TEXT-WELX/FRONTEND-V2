import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  Clock3,
  Mail,
  Star,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import api from "../utils/api";

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const hours = Math.max(0, Math.floor((Date.now() - date.getTime()) / 3600000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
  return date.toLocaleDateString();
}

function displayDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function EmployeeDetailsV2() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [employee, setEmployee] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    Promise.all([api.get(`/employees/${employeeId}`), api.get("/employees/activity")])
      .then(([employeeResponse, activityResponse]) => {
        if (!current) return;
        setEmployee(employeeResponse.data);
        setActivities((activityResponse.data || []).filter((activity) => String(activity.employee || "") === String(employeeId)));
      })
      .catch((requestError) => current && setError(requestError?.response?.data?.message || "Unable to load this employee profile."))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [employeeId]);

  const learning = useMemo(() => {
    const assignments = employee?.courseAssignments || [];
    return {
      current: assignments.filter((course) => Number(course.progress || 0) < 100 && !course.completedAt),
      completed: assignments.filter((course) => Number(course.progress || 0) >= 100 || course.completedAt),
    };
  }, [employee]);

  if (loading) return <div className="employer-page"><div className="employer-shell employer-not-found"><User /><h1>Loading employee profile...</h1></div></div>;

  if (!employee || error) {
    return <div className="employer-page"><div className="employer-shell employer-not-found"><User /><h1>Employee not found</h1><p>{error || "This employee is not part of your organization."}</p><button type="button" className="employer-button employer-button-blue" onClick={() => navigate("/employee-management")}>Back to team</button></div></div>;
  }

  const id = employee._id || employee.id;
  const skills = Array.isArray(employee.skills) ? employee.skills : [];
  const overallProgress = Math.round(Number(employee.progress || 0));
  const averageScore = Math.round(Number(employee.avgQuizScore || 0));
  const engagement = Math.round(Number(employee.engagementLevel || 0));
  const goalAchievement = Math.round(Number(employee.goalAchievement || 0));
  const learningHours = Number(employee.learningHours || 0);
  const learningVelocity = Math.min(10, Math.round((learningHours / Math.max(1, employee.assignedCourses || 1) / 5) * 10) / 10);
  const badges = [
    Number(employee.completedCourses) > 0 && "Course Finisher",
    averageScore >= 80 && "Quiz Performer",
    goalAchievement >= 80 && "Goal Achiever",
  ].filter(Boolean);
  const stats = [
    { value: `${overallProgress}%`, label: "Progress", tone: "blue" },
    { value: String(averageScore), label: "Avg Score", tone: "green" },
    { value: `${learningHours}h`, label: "Learning", tone: "purple" },
    { value: String(employee.completedCourses || 0), label: "Completed", tone: "orange" },
  ];

  return (
    <div className="employer-page employer-profile-page">
      <div className="employer-shell">
        <header className="employer-profile-heading">
          <button type="button" onClick={() => navigate("/employee-management")}><ArrowLeft /> Back to team</button>
          <div><span>Employee learning profile</span><h1>{employee.name}</h1></div>
          <button type="button" className="employer-button employer-button-blue" onClick={() => navigate(`/assign-courses/${id}`)}><BookOpen /> Assign courses</button>
        </header>

        <div className="employer-profile-layout">
          <aside>
            <section className="employer-panel employer-profile-card">
              <div className="employer-profile-avatar"><User /></div>
              <h2>{employee.name}</h2><p>{employee.designation || "Employee"}</p><b>{employee.department || "General"}</b>
              <dl>
                <div><dt><Mail /></dt><dd>{employee.email}</dd></div>
                <div><dt><CalendarDays /></dt><dd>Joined: {displayDate(employee.joinedAt || employee.createdAt)}</dd></div>
                <div><dt><Clock3 /></dt><dd>{learningHours}h total learning</dd></div>
              </dl>
            </section>
            <section className="employer-panel employer-profile-skills"><span>Capability profile</span><h3>Skills</h3><div>{skills.length ? skills.map((skill) => <b key={skill}>{skill}</b>) : <small>No skills recorded yet.</small>}</div></section>
          </aside>

          <main>
            <section className="employer-profile-stats">{stats.map((stat) => <article key={stat.label} className={`tone-${stat.tone}`}><strong>{stat.value}</strong><span>{stat.label}</span></article>)}</section>
            <section className="employer-panel employer-profile-workspace">
              <nav aria-label="Employee details">{["overview", "courses", "performance", "badges"].map((tab) => <button type="button" key={tab} className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
              <div className="employer-profile-tab-content">
                {activeTab === "overview" && <div className="employer-overview-tab">
                  <section><div className="employer-subheading"><span>Learning momentum</span><h3>Learning Progress</h3></div><div className="employer-overall-progress"><p><strong>Overall Progress</strong><span>{overallProgress}%</span></p><i><b style={{ width: `${overallProgress}%` }} /></i></div></section>
                  <section><div className="employer-subheading"><span>Latest updates</span><h3>Recent Activity</h3></div><div className="employer-profile-activity">{activities.slice(0, 5).map((activity) => <article key={activity._id}><i className="tone-blue"><BookOpen /></i><p>{activity.description}</p><time>{relativeTime(activity.createdAt)}</time></article>)}</div>{!activities.length && <div className="employer-empty-state">No learning activity has been recorded yet.</div>}</section>
                </div>}

                {activeTab === "courses" && <div className="employer-courses-tab">
                  <section><div className="employer-subheading"><span>Active learning</span><h3>Current Courses ({learning.current.length})</h3></div>{learning.current.map((course) => <article className="employer-course-row" key={String(course.course)}><header><div><strong>{course.title}</strong><span>{course.category || "General"}</span></div><em>in progress</em></header><p><span>Progress</span><b>{course.progress || 0}%</b></p><i><b style={{ width: `${course.progress || 0}%` }} /></i><small>{course.duration || "Self-paced"} · assigned {displayDate(course.assignedAt)}</small></article>)}{!learning.current.length && <div className="employer-empty-state">No courses are currently in progress.</div>}</section>
                  <section><div className="employer-subheading"><span>Learning history</span><h3>Completed Courses ({learning.completed.length})</h3></div>{learning.completed.map((course) => <article className="employer-completed-course" key={String(course.course)}><div><strong>{course.title}</strong><span>Completed {displayDate(course.completedAt)}</span></div><p><b>{course.progress || 100}%</b><Award /></p></article>)}{!learning.completed.length && <div className="employer-empty-state">Completed courses will appear here.</div>}</section>
                </div>}

                {activeTab === "performance" && <div className="employer-performance-tab">
                  <div className="employer-performance-highlights"><article className="tone-blue"><TrendingUp /><span><small>Learning Velocity</small><strong>{learningVelocity}/10</strong><em>Based on recorded learning hours</em></span></article><article className="tone-green"><Target /><span><small>Goal Achievement</small><strong>{goalAchievement}%</strong><em>Current learning target progress</em></span></article></div>
                  <section><div className="employer-subheading"><span>Measured outcomes</span><h3>Performance Metrics</h3></div><div className="employer-performance-metrics">{[{ label: "Course Completion Rate", value: overallProgress, tone: "green" }, { label: "Quiz Performance", value: averageScore, tone: "blue" }, { label: "Engagement Level", value: engagement, tone: "purple" }].map((metric) => <article key={metric.label}><span>{metric.label}</span><i><b className={`tone-${metric.tone}`} style={{ width: `${metric.value}%` }} /></i><strong>{metric.value}%</strong></article>)}</div></section>
                </div>}

                {activeTab === "badges" && <div className="employer-badges-tab"><div className="employer-subheading"><span>Recognition</span><h3>Earned Badges ({badges.length})</h3></div>{badges.length ? <div>{badges.map((badge) => <article key={badge}><Star /><strong>{badge}</strong><span>Earned from learning data</span></article>)}</div> : <div className="employer-empty-state">Badges will appear as this learner reaches milestones.</div>}</div>}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
