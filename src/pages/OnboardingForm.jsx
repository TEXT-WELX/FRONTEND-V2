import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Briefcase, CalendarDays, Clock3, Compass, GraduationCap, Sparkles, Target, User } from "lucide-react";
import api from "../utils/api";
import SkillsMultiSelect from "../components/SkillsMultiSelect";
import "../onboarding.css";

const initialForm = {
  currentLevel: "", primaryGoal: "", timeCommitment: "", education: "", fieldOfStudy: "",
  workExperience: "", targetRole: "", skillsToImprove: [], budget: "", startDate: "", completionTimeline: "",
};

const choice = (active) => `onboard-choice ${active ? "is-selected" : ""}`;

export default function OnboardingForm({ user, setUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role === "employer") navigate("/employee-management");
  }, [user, navigate]);

  const update = (key, value) => { setError(""); setFormData((current) => ({ ...current, [key]: value })); };
  const valid = [
    Boolean(formData.currentLevel && formData.primaryGoal && formData.timeCommitment),
    Boolean(formData.education && formData.workExperience),
    Boolean(formData.targetRole.trim() && formData.skillsToImprove.length),
    Boolean(formData.startDate && formData.completionTimeline),
  ][step - 1];

  const next = async () => {
    if (!valid || saving) return;
    if (step < 4) { setStep((value) => value + 1); return; }
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/onboarding", { onboardingData: formData });
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/learning-roadmap");
    } catch (requestError) {
      const status = requestError?.response?.status;
      setError(status === 401 ? "Your session expired. Please sign in again, then your choices can be saved." : requestError?.response?.data?.message || "We could not save your learning plan. Please try again.");
    } finally { setSaving(false); }
  };

  if (!user) return null;
  const today = new Date().toISOString().slice(0, 10);
  const headings = [
    [User, "Your starting point", "A few quick details help us pitch the path at the right level."],
    [GraduationCap, "Your experience", "Your background helps us avoid teaching what you already know."],
    [Target, "Shape your destination", "Mix technical, commercial and people skills in one learning path."],
    [CalendarDays, "Set your pace", "Choose when you start and the finish line you want to work toward."],
  ];
  const [StepIcon, title, subtitle] = headings[step - 1];

  return <main className="onboard-page">
    <div className="onboard-orb one" /><div className="onboard-orb two" />
    <section className="onboard-shell">
      <aside className="onboard-story">
        <span className="onboard-kicker"><Sparkles /> Personal learning studio</span>
        <h1>Build a path that feels made for <em>you.</em></h1>
        <p>Four focused steps. Real marketplace courses. A timeline you control.</p>
        <div className="onboard-journey">
          {["Starting point", "Experience", "Career direction", "Timeline"].map((label, index) => <button type="button" key={label} className={`${index + 1 === step ? "is-current" : ""} ${index + 1 < step ? "is-done" : ""}`} onClick={() => index + 1 < step && setStep(index + 1)}><i>{index + 1 < step ? "✓" : index + 1}</i><span>{label}</span></button>)}
        </div>
        <div className="onboard-insight"><Compass /><span><strong>Marketplace-powered</strong>Your path refreshes as new WEL.X courses are published.</span></div>
      </aside>

      <section className="onboard-card">
        <header><span>Step {step} of 4</span><div><i style={{ width: `${step * 25}%` }} /></div></header>
        <div className="onboard-title"><i><StepIcon /></i><div><h2>{title}</h2><p>{subtitle}</p></div></div>

        {step === 1 && <div className="onboard-fields">
          <fieldset><legend>Current skill level</legend><div className="onboard-choice-grid three">{["Beginner", "Intermediate", "Advanced"].map((item) => <button type="button" key={item} className={choice(formData.currentLevel === item)} onClick={() => update("currentLevel", item)}>{item}</button>)}</div></fieldset>
          <fieldset><legend>Primary learning goal</legend><div className="onboard-choice-grid two">{["Career advancement", "Switch careers", "Build practical skills", "Start a business"].map((item) => <button type="button" key={item} className={choice(formData.primaryGoal === item)} onClick={() => update("primaryGoal", item)}>{item}</button>)}</div></fieldset>
          <fieldset><legend>Weekly time commitment</legend><div className="onboard-choice-grid three">{["2–4 hours", "5–8 hours", "9+ hours"].map((item) => <button type="button" key={item} className={choice(formData.timeCommitment === item)} onClick={() => update("timeCommitment", item)}><Clock3 />{item}</button>)}</div></fieldset>
        </div>}

        {step === 2 && <div className="onboard-fields">
          <label>Highest education<select value={formData.education} onChange={(event) => update("education", event.target.value)}><option value="">Select education</option>{["High school", "Diploma", "Bachelor's degree", "Master's degree", "Doctorate", "Self-taught"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Field of study <small>Optional</small><input value={formData.fieldOfStudy} onChange={(event) => update("fieldOfStudy", event.target.value)} placeholder="e.g. Finance, Computer Science, Design" /></label>
          <fieldset><legend>Work experience</legend><div className="onboard-choice-grid two">{["No experience yet", "0–2 years", "3–5 years", "6+ years"].map((item) => <button type="button" key={item} className={choice(formData.workExperience === item)} onClick={() => update("workExperience", item)}><Briefcase />{item}</button>)}</div></fieldset>
        </div>}

        {step === 3 && <div className="onboard-fields">
          <label>Target role<input value={formData.targetRole} onChange={(event) => update("targetRole", event.target.value)} placeholder="e.g. Software Engineer, Finance Manager" /></label>
          <fieldset><legend>Skills to improve <small>Choose more than one</small></legend><SkillsMultiSelect value={formData.skillsToImprove} onChange={(value) => update("skillsToImprove", value)} /></fieldset>
          <p className="onboard-tip"><Sparkles /> You can mix tracks—like software engineering with leadership or finance.</p>
        </div>}

        {step === 4 && <div className="onboard-fields">
          <div className="onboard-date-grid"><label>Start date<input type="date" min={today} value={formData.startDate} onChange={(event) => update("startDate", event.target.value)} /></label><label>Target completion<select value={formData.completionTimeline} onChange={(event) => update("completionTimeline", event.target.value)}><option value="">Choose timeline</option>{["1 month", "3 months", "6 months", "1 year"].map((item) => <option key={item}>{item}</option>)}</select></label></div>
          <div className="onboard-timeline-preview"><CalendarDays /><span><strong>{formData.startDate || "Choose your start date"}</strong><small>{formData.completionTimeline ? `Your curated plan will target ${formData.completionTimeline}.` : "Add a completion timeline to generate your phases."}</small></span></div>
          <p className="onboard-tip"><Compass /> Phases unlock in sequence only after every course in the previous phase is completed.</p>
        </div>}

        {error && <div className="onboard-error" role="alert">{error}</div>}
        <footer><button type="button" className="onboard-back" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}><ArrowLeft /> Back</button><button type="button" className="onboard-next" onClick={next} disabled={!valid || saving}>{saving ? "Creating your path..." : step === 4 ? "Build my career path" : "Continue"}<ArrowRight /></button></footer>
      </section>
    </section>
  </main>;
}
