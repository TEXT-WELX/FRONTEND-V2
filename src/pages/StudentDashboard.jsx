import { useCallback, useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ArrowRight, BookOpen, Braces, CheckCircle2, Flame, Map, Play, Sparkles, Star, Target, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../student-experience.css";

const fallback = { points: { points: 0, badge: null, nextBadge: { name: "Bronze Explorer", points: 100 } }, courses: [], momentum: [], stats: { activeCourses: 0, completedCourses: 0, lessonsCompleted: 0, averageProgress: 0 }, activities: [] };
const relative = (value) => { const minutes = Math.max(1, Math.round((Date.now() - new Date(value)) / 60000)); return minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.round(minutes / 60)}h ago` : `${Math.round(minutes / 1440)}d ago`; };

export default function StudentDashboard({ user }) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => { try { const response = await api.get("/learner/dashboard"); setData(response.data); setError(""); } catch (requestError) { setError(requestError?.response?.data?.message || "Your live learning data is temporarily unavailable."); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); window.addEventListener("welxPointsUpdated", load); return () => window.removeEventListener("welxPointsUpdated", load); }, [load]);
  const nextTarget = data.points.nextBadge?.points || Math.max(data.points.points, 1);
  const badgeProgress = Math.min(100, Math.round((data.points.points / nextTarget) * 100));

  return <main className="learner-home" onMouseMove={(event) => { event.currentTarget.style.setProperty("--learner-x", `${event.clientX}px`); event.currentTarget.style.setProperty("--learner-y", `${event.clientY}px`); }}>
    <div className="learner-glow" />
    <div className="learner-shell">
      <section className="learner-hero">
        <div className="learner-hero-copy"><span><Sparkles /> YOUR LEARNING COMMAND CENTRE</span><h1>Welcome back,<br/><em>{user?.name?.split(" ")[0] || "Learner"}.</em></h1><p>Your courses, career direction and WELX rewards now move together in real time.</p><div><Link to={user?.onboardingComplete ? "/learning-roadmap" : "/onboarding"}>Open career path <ArrowRight /></Link><Link to="/courses">Explore courses</Link></div></div>
        <div className="learner-points-orbit"><span className="orbit-one"/><span className="orbit-two"/><div><Star/><strong>{data.points.points.toLocaleString()}</strong><small>WELX POINTS</small></div><p>{data.points.nextBadge ? `${Math.max(nextTarget - data.points.points, 0)} to ${data.points.nextBadge.name}` : "All ranks unlocked"}</p><i><span style={{width:`${badgeProgress}%`}}/></i></div>
      </section>

      {error && <button className="learner-error" onClick={load}>{error} <b>Try again</b></button>}
      <section className="learner-stat-grid">
        <article><span className="is-blue"><BookOpen/></span><div><small>ACTIVE COURSES</small><strong>{data.stats.activeCourses}</strong><p>Keep your momentum</p></div></article>
        <article><span className="is-green"><CheckCircle2/></span><div><small>COURSES MASTERED</small><strong>{data.stats.completedCourses}</strong><p>+150 points each</p></div></article>
        <article><span className="is-purple"><Target/></span><div><small>AVERAGE PROGRESS</small><strong>{data.stats.averageProgress}%</strong><p>Across your learning</p></div></article>
        <article><span className="is-orange"><Flame/></span><div><small>LESSONS FINISHED</small><strong>{data.stats.lessonsCompleted}</strong><p>Every step counts</p></div></article>
      </section>

      <div className="learner-layout">
        <div className="learner-main-column">
          <section className="learner-panel learner-momentum"><header><div><span>Learning signal</span><h2>Your momentum</h2></div><b><Zap/> Live updates</b></header><div className="learner-chart">{loading ? <div className="learner-loading"/> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={data.momentum}><defs><linearGradient id="learnerArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity={.42}/><stop offset="100%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="month" axisLine={false} tickLine={false}/><Tooltip contentStyle={{border:0,borderRadius:14,boxShadow:"0 14px 35px rgba(39,28,86,.15)"}}/><Area type="monotone" dataKey="points" stroke="#6d39df" strokeWidth={4} fill="url(#learnerArea)"/></AreaChart></ResponsiveContainer>}</div></section>
          <section className="learner-panel learner-courses"><header><div><span>Continue where you left off</span><h2>Your courses</h2></div><Link to="/courses">View marketplace <ArrowRight/></Link></header>{data.courses.length ? <div>{data.courses.slice(0,4).map((course)=><article key={course.id}><img src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=360&fit=crop"} alt=""/><div><small>{course.category} · {course.level}</small><h3>{course.title}</h3><p>{course.description}</p><div className="learner-course-progress"><span><i style={{width:`${course.progress}%`}}/></span><b>{course.progress}%</b></div></div><Link to={`/course/${course.id}`} aria-label={`Continue ${course.title}`}><Play/></Link></article>)}</div> : <div className="learner-empty"><span><BookOpen/></span><h3>Your next skill starts here</h3><p>Add a marketplace course or open your curated career path.</p><Link to="/courses">Find a course <ArrowRight/></Link></div>}</section>
        </div>
        <aside className="learner-side-column">
          <section className="learner-panel learner-launch"><header><span>Quick launch</span><h2>Learn by doing</h2></header><Link to="/learning-roadmap"><i><Map/></i><span><b>Career Path</b><small>See your next milestone</small></span><ArrowRight/></Link><Link to="/playground"><i><Braces/></i><span><b>Code Lab</b><small>Save work · earn 40 points</small></span><ArrowRight/></Link><Link to="/simulation"><i><Trophy/></i><span><b>Simulation</b><small>Make decisions · earn points</small></span><ArrowRight/></Link></section>
          <section className="learner-panel learner-activity"><header><span>Account activity</span><h2>Recent wins</h2></header>{data.activities.length ? data.activities.slice(0,5).map((item)=><article key={item.eventId}><i><Star/></i><div><b>{item.label}</b><small>{relative(item.createdAt)}</small></div><strong>+{item.points}</strong></article>) : <div className="learner-activity-empty"><Sparkles/><p>Complete a lesson, save code or finish a simulation to start your activity stream.</p></div>}</section>
        </aside>
      </div>
    </div>
  </main>;
}
