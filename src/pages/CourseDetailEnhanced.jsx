import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, BarChart3, BookOpen, Check, CheckCircle2, ChevronDown, Clock3, Globe2, Lock, Play, ShieldCheck, Sparkles, Star, Trophy, Users } from "lucide-react";
import VideoLesson from "../components/VideoLesson";
import ReadingLesson from "../components/ReadingLesson";
import QuizLesson from "../components/QuizLesson";
import { useCurrency } from "../contexts/CurrencyContext";
import { progressAPI } from "../utils/enhancedApiUpdated";
import { publishWelxPoints } from "../utils/welxPoints";
import api from "../utils/api";
import "../course-detail.css";

function lessonsFor(module) {
  if (Array.isArray(module.lessons)) return module.lessons.map((lesson) => ({ ...lesson, id: lesson.id, type: lesson.type || "reading" }));
  return [module.videoLesson && { ...module.videoLesson, type: "video" }, module.readingLesson && { ...module.readingLesson, type: "reading" }, module.quizLesson && { ...module.quizLesson, type: "quiz" }].filter(Boolean);
}

export default function CourseDetailEnhanced({ user }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolled, setEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completedModules, setCompletedModules] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [openModule, setOpenModule] = useState(null);

  useEffect(() => { (async () => { try { const { data } = await api.get(`/courses/${courseId}`); setCourse(data); setOpenModule(data.modules?.[0]?.id ?? null); } catch (requestError) { setError(requestError?.response?.data?.message || "This course could not be loaded."); } finally { setLoading(false); } })(); }, [courseId]);
  useEffect(() => { if (!user || !course) return; progressAPI.getCourseProgress(courseId).then(({ data }) => { setEnrolled(true); setCompletedLessons((data.completedLessons || []).map(String)); setCompletedModules((data.completedModules || []).map(String)); setOverallProgress(Number(data.overallProgress || 0)); }).catch((requestError) => { if ([403,404,500].includes(requestError?.response?.status)) setEnrolled(false); }); }, [course, courseId, user]);

  const modules = course?.modules || [];
  const totalLessons = useMemo(() => modules.reduce((sum, module) => sum + lessonsFor(module).length, 0), [modules]);
  const isUnlocked = (index) => index === 0 || completedModules.includes(String(modules[index - 1]?.id));
  const moduleProgress = (module) => { const lessons = lessonsFor(module); return lessons.length ? Math.round(lessons.filter((item) => completedLessons.includes(String(item.id))).length / lessons.length * 100) : 0; };
  const markLessonComplete = async (lessonId) => { try { const { data } = await progressAPI.updateLessonProgress(courseId, lessonId, { completed: true }); setCompletedLessons((data.completedLessons || []).map(String)); setCompletedModules((data.completedModules || []).map(String)); setOverallProgress(Number(data.overallProgress || 0)); if (data.points) publishWelxPoints(data.points); } catch (requestError) { setError(requestError?.response?.data?.message || "Progress could not be saved."); } };
  const enroll = () => { if (!user) navigate("/login"); else navigate(`/payment?courseId=${courseId}`); };

  if (loading) return <main className="course-detail-loading"><span/><span/><span/></main>;
  if (!course) return <main className="course-detail-missing"><BookOpen/><h1>Course unavailable</h1><p>{error}</p><Link to="/courses">Back to courses</Link></main>;

  return <main className="student-course-page" onMouseMove={(event) => { event.currentTarget.style.setProperty("--course-x",`${event.clientX}px`); event.currentTarget.style.setProperty("--course-y",`${event.clientY}px`); }}>
    <div className="student-course-glow"/>
    <div className="student-course-shell">
      <Link className="course-detail-back" to="/courses"><ArrowLeft/> Back to marketplace</Link>
      <section className="course-detail-hero">
        <div className="course-detail-cover"><img src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=760&fit=crop"} alt={course.title}/><div/><span><Play/> Preview course</span></div>
        <div className="course-detail-intro"><span className="course-detail-kicker"><Sparkles/> {course.category || "Professional learning"}</span><h1>{course.title}</h1><p>{course.description}</p><div className="course-detail-facts"><span><Star/><b>{course.rating || "New"}</b> rating</span><span><Users/><b>{Number(course.students || 0).toLocaleString()}</b> learners</span><span><Clock3/><b>{course.duration || "Self-paced"}</b></span><span><BarChart3/><b>{course.level || "All levels"}</b></span></div><div className="course-detail-author"><i>{(course.instructor || "W").charAt(0)}</i><span><small>YOUR INSTRUCTOR</small><b>{course.instructor || "WEL.X Faculty"}</b></span><BadgeCheck/></div></div>
      </section>

      {error && <div className="course-detail-error">{error}</div>}
      <div className="course-detail-layout">
        <section className="course-detail-content">
          <div className="course-detail-outcomes"><header><span>What you will gain</span><h2>A practical learning experience</h2></header><div><article><CheckCircle2/><span><b>Guided progression</b><small>Lessons unlock in a clear sequence.</small></span></article><article><Trophy/><span><b>150 WELX points</b><small>Awarded when you complete the course.</small></span></article><article><Globe2/><span><b>Learn anywhere</b><small>Return to your progress across devices.</small></span></article></div></div>

          {enrolled && <div className="course-progress-banner"><div className="course-progress-ring" style={{"--course-progress":`${overallProgress * 3.6}deg`}}><span>{overallProgress}%</span></div><div><small>YOUR LIVE PROGRESS</small><h2>{overallProgress >= 100 ? "Course mastered" : "Keep the momentum going"}</h2><p>{completedLessons.length} of {totalLessons} lessons completed</p></div><i><span style={{width:`${overallProgress}%`}}/></i></div>}

          <div className="course-curriculum"><header><div><span>Course curriculum</span><h2>Everything inside</h2></div><p>{modules.length} modules · {totalLessons} lessons</p></header>{modules.length ? <div className="course-module-list">{modules.map((module,index)=>{const open=String(openModule)===String(module.id);const unlocked=enrolled&&isUnlocked(index);const progress=moduleProgress(module);return <article className={`${open?"is-open":""} ${!unlocked?"is-locked":""}`} key={module.id}><button type="button" onClick={()=>unlocked&&setOpenModule(open?null:module.id)}><span className="course-module-number">{completedModules.includes(String(module.id))?<Check/>:index+1}</span><span><small>MODULE {String(index+1).padStart(2,"0")} · {lessonsFor(module).length} LESSONS</small><b>{module.title}</b><em>{module.description}</em></span><i>{!enrolled||!isUnlocked(index)?<Lock/>:<ChevronDown/>}</i></button>{open&&unlocked&&<div className="course-module-lessons">{lessonsFor(module).map((lesson)=>{const props={lesson,isCompleted:completedLessons.includes(String(lesson.id)),onComplete:markLessonComplete,isLocked:false};if(lesson.type==="video")return <VideoLesson key={lesson.id}{...props}/>;if(lesson.type==="quiz")return <QuizLesson key={lesson.id}{...props} courseId={courseId}/>;return <ReadingLesson key={lesson.id}{...props}/>;})}</div>}<footer><span><i style={{width:`${progress}%`}}/></span><b>{progress}%</b></footer></article>})}</div> : <div className="course-curriculum-empty"><BookOpen/><h3>Curriculum details are coming next</h3><p>WEL.X Faculty is preparing the guided module structure for this course.</p></div>}</div>
        </section>

        <aside className="course-enrol-card"><span className="course-enrol-label">{enrolled ? "YOUR COURSE" : "START LEARNING"}</span><div className="course-enrol-price"><strong>{formatPrice(course.price || 0)}</strong><small>one-time access</small></div>{!enrolled ? <button type="button" onClick={enroll}><span><b>Enroll now</b><small>Unlock this complete course</small></span><ArrowRight/></button> : <Link to="#curriculum"><span><b>Continue learning</b><small>{overallProgress}% complete</small></span><Play/></Link>}<div className="course-enrol-points"><Star/><span><b>Earn 150 WELX points</b><small>when you complete this course</small></span></div><ul><li><ShieldCheck/> Secure enrollment</li><li><BookOpen/> {totalLessons || "Upcoming"} guided lessons</li><li><Clock3/> {course.duration || "Self-paced"} access plan</li><li><Globe2/> Learn on any device</li></ul><p><Check/> Progress is saved to your account in real time.</p></aside>
      </div>
    </div>
  </main>;
}
