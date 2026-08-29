import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarDays, Check, Clock3, Lock, Plus, RefreshCw, ShoppingBag, Sparkles, Target, Trophy } from "lucide-react";
import api from "../utils/api";
import { useCurrency } from "../contexts/CurrencyContext";
import "../career-path.css";
import "../student-experience.css";

export default function LearningRoadmap({ user }) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const { data } = await api.get("/career-path"); setRoadmap(data.careerPath); }
    catch (requestError) {
      if (requestError?.response?.status === 409) navigate("/onboarding");
      else setError(requestError?.response?.data?.message || "Your career path could not be loaded.");
    } finally { setLoading(false); }
  }, [navigate]);
  useEffect(() => { if (!user) navigate("/login"); else load(); }, [user, navigate, load]);

  if (loading) return <div className="roadmap-state"><span/><h2>Curating your marketplace path…</h2><p>Matching your goals with courses that are available now.</p></div>;
  if (error) return <div className="roadmap-state error"><h2>We hit a detour</h2><p>{error}</p><button onClick={load}><RefreshCw/> Try again</button></div>;
  if (!roadmap) return null;

  return <main className="roadmap-page" onMouseMove={(event) => { event.currentTarget.style.setProperty("--mx", `${event.clientX}px`); event.currentTarget.style.setProperty("--my", `${event.clientY}px`); }}>
    <div className="roadmap-spotlight"/>
    <section className="roadmap-shell">
      <header className="roadmap-hero"><div><span><Sparkles/> Your adaptive career path</span><h1>{roadmap.title}</h1><p>Built only from live WEL.X marketplace courses. Customize any phase without breaking your sequence.</p><div className="roadmap-meta"><i><CalendarDays/><b>{roadmap.startDate}</b><small>Starts</small></i><i><Clock3/><b>{roadmap.timeline}</b><small>Target</small></i><i><BookOpen/><b>{roadmap.totalCourses}</b><small>Courses</small></i><i><Target/><b>~{roadmap.estimatedHours}h</b><small>Learning</small></i></div></div><aside><div className="roadmap-ring" style={{"--progress":`${roadmap.progress * 3.6}deg`}}><span><strong>{roadmap.progress}%</strong><small>complete</small></span></div><p>Real-time path progress</p></aside></header>

      <section className="roadmap-progress"><header><div><span>Journey progress</span><strong>{roadmap.progress}%</strong></div><small>Phases unlock only when every course in the previous phase reaches 100%.</small></header><div><i style={{width:`${roadmap.progress}%`}}/></div></section>

      <section className="roadmap-phases">{roadmap.phases.map((phase, index) => <article className={`roadmap-phase is-${phase.status}`} key={phase.key}>
        <div className="roadmap-phase-rail"><span>{phase.complete ? <Check/> : phase.unlocked ? index + 1 : <Lock/>}</span>{index < roadmap.phases.length - 1 && <i/>}</div>
        <div className="roadmap-phase-card">
          <header><div><span>{phase.complete ? "Phase complete" : phase.unlocked ? `Phase ${index + 1} · ${phase.progress}% complete` : "Locked until previous phase is complete"}</span><h2>{phase.title}</h2><p>{phase.description}</p></div><div className="roadmap-phase-dates"><CalendarDays/><span><small>Start</small><b>{phase.startDate}</b></span><ArrowRight/><span><small>Target</small><b>{phase.dueDate}</b></span></div></header>
          <div className="roadmap-course-grid">{phase.courses.map((course) => <article className="roadmap-course" key={course._id}><div className="roadmap-course-image"><img src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=460&fit=crop"} alt=""/><span>{course.level}</span>{course.completed && <i><Check/> Complete</i>}</div><div className="roadmap-course-body"><small>{course.category}</small><h3>{course.title}</h3><p>{course.duration} · {course.instructor}</p><div className="roadmap-mini-progress"><span><i style={{width:`${course.progress}%`}}/></span><b>{course.progress}%</b></div>{phase.unlocked ? course.enrolled ? <Link to={`/course/${course._id}`}>{course.completed ? "Review course" : "Continue course"}<ArrowRight/></Link> : <Link to={`/payment?courseId=${course._id}`}>Buy this course · {formatPrice(course.price)}<ShoppingBag/></Link> : <button disabled><Lock/> Complete the prior phase</button>}</div></article>)}</div>
          <footer><button type="button" onClick={() => navigate(`/courses?customizePhase=${phase.key}&returnTo=${encodeURIComponent("/learning-roadmap")}`)}><Plus/> Customize phase <small>{phase.courses.length}/3 courses</small></button>{phase.courses.length > 1 && !phase.enrolled && <Link className={phase.unlocked ? "" : "is-disabled"} aria-disabled={!phase.unlocked} onClick={(event) => !phase.unlocked && event.preventDefault()} to={`/payment?courseIds=${phase.courses.map((course)=>course._id).join(",")}&type=phase_bundle&phaseId=${phase.key}`}><span><b>Buy complete phase</b><small><s>{formatPrice(phase.subtotal)}</s> {formatPrice(phase.bundlePrice)} · save 20%</small></span><ShoppingBag/></Link>}{phase.complete && <div className="roadmap-complete-badge"><Trophy/><span><b>Phase mastered</b><small>Next phase unlocked</small></span></div>}</footer>
        </div>
      </article>)}</section>
    </section>
  </main>;
}
