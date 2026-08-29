import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  Code2,
  Gauge,
  Layers,
  MousePointer2,
  Play,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import featureCoding from "../assets/landing/feature-coding.jpg";
import featureLearningPath from "../assets/landing/feature-learning-path.jpg";
import featureProgress from "../assets/landing/feature-progress.jpg";
import featureSimulation from "../assets/landing/feature-simulation.jpg";
import heroPathPlan from "../assets/landing/hero-path-plan-v2.png";
import heroPathPractice from "../assets/landing/hero-path-practice-v2.png";
import heroPathProgress from "../assets/landing/hero-path-progress-v2.png";
import testimonialAfrican from "../assets/testimonials/testimonial-african.png";
import testimonialEastAsian from "../assets/testimonials/testimonial-east-asian.png";
import testimonialEmirati from "../assets/testimonials/testimonial-emirati.png";
import testimonialLatina from "../assets/testimonials/testimonial-latina.png";
import testimonialSouthAsian from "../assets/testimonials/testimonial-south-asian.png";

const heroSlides = [
  {
    number: "01",
    kicker: "A path made for you",
    title: "Choose your direction.",
    copy: "Start with the capability you want next and follow a focused, practical route.",
    image: heroPathPlan,
  },
  {
    number: "02",
    kicker: "Skills in context",
    title: "Practice what matters.",
    copy: "Learn through decisions, simulations, projects, and feedback that feel relevant to real work.",
    image: heroPathPractice,
  },
  {
    number: "03",
    kicker: "Progress made visible",
    title: "Build proof of growth.",
    copy: "See your momentum, close skill gaps, and leave with work you can confidently share.",
    image: heroPathProgress,
  },
];

const journeyGroups = {
  individual: {
    eyebrow: "B2C / Individual growth",
    title: "A clearer way to grow.",
    copy: "For beginners, career switchers, and ambitious professionals who want every lesson to lead somewhere useful.",
    cards: [
      {
        icon: Target,
        tag: "Your goal",
        title: "Personal learning paths",
        prompt: "Tap to see the benefit",
        backTitle: "A next step that makes sense",
        detail: "WELX shapes learning around your goal, current level, and pace—so you always know what to do next.",
      },
      {
        icon: Play,
        tag: "Your practice",
        title: "Skills you can use",
        prompt: "Tap to see the benefit",
        backTitle: "Less watching. More doing.",
        detail: "Interactive activities, projects, and simulations turn new knowledge into practical confidence.",
      },
      {
        icon: Gauge,
        tag: "Your progress",
        title: "Momentum you can see",
        prompt: "Tap to see the benefit",
        backTitle: "Know what is improving",
        detail: "Clear milestones and skill evidence show what you have completed, strengthened, and can demonstrate.",
      },
    ],
  },
  organization: {
    eyebrow: "B2B / Workforce growth",
    title: "One learning system. Every team.",
    copy: "For organizations that need a simple, measurable way to build capability across roles, departments, and locations.",
    cards: [
      {
        icon: Layers,
        tag: "Centralize",
        title: "One connected LMS",
        prompt: "Tap to see the benefit",
        backTitle: "Learning in one place",
        detail: "Bring courses, assignments, employee pathways, completion data, and certificates into one centralized experience.",
      },
      {
        icon: BarChart3,
        tag: "Measure",
        title: "KPI and skills tracker",
        prompt: "Tap to see the benefit",
        backTitle: "See the workforce picture",
        detail: "Track participation, progress, performance patterns, and capability gaps with useful team-level visibility.",
      },
      {
        icon: Users,
        tag: "Upskill",
        title: "Growth for every employee",
        prompt: "Tap to see the benefit",
        backTitle: "Relevant paths at scale",
        detail: "Support technical, business, leadership, and role-specific development without forcing everyone into one path.",
      },
    ],
  },
};

const momentumFeatures = [
  {
    number: "01",
    action: "Practice",
    icon: Code2,
    title: "Interactive Coding Playground",
    copy: "Write, test, and improve code in real time without leaving the lesson. Immediate practice helps new ideas become usable skills.",
    image: featureCoding,
    caption: "Practice ideas live",
  },
  {
    number: "02",
    action: "Decide",
    icon: Briefcase,
    title: "Business Simulations",
    copy: "Make strategic decisions inside realistic scenarios, see their consequences, and learn through useful AI-supported feedback.",
    image: featureSimulation,
    caption: "Decide in context",
  },
  {
    number: "03",
    action: "Personalize",
    icon: Target,
    title: "Personalized Learning Paths",
    copy: "Follow recommendations shaped around your goals, current level, and learning pace—so every next step has a clear purpose.",
    image: featureLearningPath,
    caption: "A path made for you",
  },
  {
    number: "04",
    action: "Improve",
    icon: BarChart3,
    title: "Real-time Progress Tracking",
    copy: "See completed work, performance patterns, and the skills that need attention next through clear, useful analytics.",
    image: featureProgress,
    caption: "Progress made visible",
  },
];

const programmes = [
  {
    special: true,
    number: "01",
    kicker: "Wellington Campus × CMI",
    title: "CMI Level 7",
    subtitle: "Strategic Management & Leadership",
    copy: "The Chartered Management Institute (CMI) Level 7 is the UK's most prestigious management qualification. Delivered by Wellington Campus, this programme provides the strategic leadership skills to transform your career and your organisation.",
    facts: ["Professional qualification", "Strategic leadership", "Built for senior growth"],
    href: "https://wellingtoncampus.co/courses/professional/cmi",
  },
  {
    number: "02",
    kicker: "Create for the web",
    title: "Web Development",
    subtitle: "Build useful digital experiences",
    copy: "Build responsive websites with HTML, CSS, JavaScript, and the habits modern development teams use.",
    facts: ["Practical lessons", "Portfolio projects", "All experience levels"],
    href: "/courses",
  },
  {
    number: "03",
    kicker: "Lead with clarity",
    title: "Business Skills",
    subtitle: "Think, communicate, and decide",
    copy: "Strengthen leadership, communication, strategy, and decision-making through real workplace scenarios.",
    facts: ["Scenario practice", "Useful feedback", "Role-ready skills"],
    href: "/courses",
  },
  {
    number: "04",
    kicker: "Work smarter",
    title: "Data & AI",
    subtitle: "Turn information into action",
    copy: "Build practical data confidence and discover responsible ways to use AI in everyday professional work.",
    facts: ["Applied workflows", "AI foundations", "Business context"],
    href: "/courses",
  },
];

const impactModes = [
  {
    value: 72,
    suffix: "%",
    label: "Skill gap mapped",
    title: "Find the missing capability",
    copy: "Connect where someone is now to the knowledge, practice, and evidence their next role requires.",
    color: "#f472b6",
    path: "M10 118C55 116 76 93 118 98S183 62 223 70s66-29 117-49",
  },
  {
    value: 48,
    prefix: "+",
    suffix: "%",
    label: "Momentum model",
    title: "Turn learning into movement",
    copy: "Focused paths remove noise and make the next useful action easier to see, practice, and repeat.",
    color: "#a78bfa",
    path: "M10 121C49 104 75 113 109 82s70-6 105-31 64-29 126-33",
  },
  {
    value: 360,
    suffix: "°",
    label: "Team visibility",
    title: "See growth across the workforce",
    copy: "Bring personal progress, team KPIs, completion, and skill signals into one shared view.",
    color: "#60a5fa",
    path: "M10 107C44 123 75 73 112 90s69-44 104-22 75-43 124-54",
  },
];

const orbitStats = [
  {
    target: 1000,
    format: "thousand",
    label: "Active learners",
    detail: "Curious people building useful capability.",
    icon: Users,
  },
  {
    target: 1000,
    format: "plus",
    label: "Courses available",
    detail: "Technical, business, creative, and leadership paths.",
    icon: BookOpen,
  },
  {
    target: 95,
    format: "percent",
    label: "Success rate",
    detail: "Learning designed around visible outcomes.",
    icon: Check,
  },
  {
    target: 1000000,
    format: "million",
    label: "Hours learned",
    detail: "Momentum created one practical step at a time.",
    icon: Play,
  },
];

function formatOrbitValue(value, stat, complete = false) {
  if (stat.format === "thousand") return complete ? "1K+" : Math.round(value).toLocaleString();
  if (stat.format === "plus") return `${Math.round(value).toLocaleString()}${complete ? "+" : ""}`;
  if (stat.format === "percent") return `${Math.round(value)}%`;
  if (stat.format === "million") {
    if (complete) return "1M+";
    if (value < 100000) return Math.round(value).toLocaleString();
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return Math.round(value).toLocaleString();
}

const testimonials = [
  {
    quote: "I could learn around a demanding workday, apply the ideas immediately, and see where my confidence was growing.",
    name: "Aisha A.",
    role: "UAE emerging leader",
    status: "Now: leading with confidence",
    image: testimonialEmirati,
    alt: "Emirati professional learning with a laptop in a modern workspace",
    focus: "center 38%",
  },
  {
    quote: "The simulations gave our team a safe place to make decisions, compare approaches, and improve together before the stakes were real.",
    name: "Kwame D.",
    role: "Operations team lead",
    status: "Now: leading a stronger team",
    image: testimonialAfrican,
    alt: "Black professional holding a tablet in a modern workplace",
    focus: "center 35%",
  },
  {
    quote: "The progress view made every next step obvious. I stopped collecting courses and started building skills I could actually show.",
    name: "Daniel K.",
    role: "Product professional",
    status: "Now: ready for the next move",
    image: testimonialEastAsian,
    alt: "East Asian professional with a laptop in a modern office",
    focus: "center 34%",
  },
  {
    quote: "WELX turned a career change into a series of manageable actions. Each project gave me something useful to discuss in interviews.",
    name: "Sofia M.",
    role: "Career-switching professional",
    status: "Now: moving into a new role",
    image: testimonialLatina,
    alt: "Latina professional working at a laptop",
    focus: "center 34%",
  },
  {
    quote: "The learning path respected my pace without letting me lose momentum. I always knew what to practise and why it mattered.",
    name: "Nadia F.",
    role: "Business upskilling learner",
    status: "Now: learning with a clear plan",
    image: testimonialSouthAsian,
    alt: "South Asian professional learning with a laptop in a modern workspace",
    focus: "center 38%",
  },
];

function ParticleCanvas({ hostRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return undefined;

    const context = canvas.getContext("2d");
    const palette = ["#f472b6", "#f9a8d4", "#a78bfa", "#60a5fa", "#dbeafe"];
    const pointer = { x: 0, y: 0, active: false };
    const balls = [];
    let width = 0;
    let height = 0;
    let frame;
    let dpr = 1;

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const addBall = (x, y, index = 0) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.55 + Math.random() * 1.65;
      balls.push({
        x,
        y,
        radius: 4 + Math.random() * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: palette[(balls.length + index) % palette.length],
      });
      if (balls.length > 46) balls.shift();
    };

    const positionFromEvent = (event) => {
      const bounds = host.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const handleMove = (event) => {
      Object.assign(pointer, positionFromEvent(event), { active: true });
    };
    const handleLeave = () => { pointer.active = false; };
    const handleDown = (event) => {
      if (event.target.closest("a, button")) return;
      const point = positionFromEvent(event);
      for (let index = 0; index < 7; index += 1) addBall(point.x, point.y, index);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      balls.forEach((ball) => {
        if (pointer.active) {
          const dx = ball.x - pointer.x;
          const dy = ball.y - pointer.y;
          const distance = Math.max(Math.hypot(dx, dy), 1);
          if (distance < 170) {
            const force = (1 - distance / 170) * 0.2;
            ball.vx += (dx / distance) * force;
            ball.vy += (dy / distance) * force;
          }
        }
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.995;
        ball.vy *= 0.995;
        if (ball.x < ball.radius || ball.x > width - ball.radius) ball.vx *= -0.94;
        if (ball.y < ball.radius || ball.y > height - ball.radius) ball.vy *= -0.94;
        ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x));
        ball.y = Math.max(ball.radius, Math.min(height - ball.radius, ball.y));
        context.beginPath();
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        context.fillStyle = ball.color;
        context.shadowBlur = 18;
        context.shadowColor = ball.color;
        context.fill();
      });
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    [[.12, .73], [.37, .18], [.64, .77], [.88, .3]].forEach(([x, y], index) => addBall(width * x, height * y, index));
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    host.addEventListener("pointermove", handleMove, { passive: true });
    host.addEventListener("pointerleave", handleLeave);
    host.addEventListener("pointerdown", handleDown);
    draw();

    return () => {
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
      host.removeEventListener("pointerdown", handleDown);
      window.cancelAnimationFrame(frame);
    };
  }, [hostRef]);

  return <canvas ref={canvasRef} className="welx-particle-canvas" aria-hidden="true" />;
}

function BenefitCard({ card, flipped, onFlip }) {
  const Icon = card.icon;
  return (
    <button className={`welx-benefit-card${flipped ? " is-flipped" : ""}`} type="button" onClick={onFlip} aria-pressed={flipped}>
      <span className="welx-benefit-inner">
        <span className="welx-benefit-face welx-benefit-front">
          <span className="welx-benefit-icon"><Icon /></span>
          <span className="welx-benefit-tag">{card.tag}</span>
          <strong>{card.title}</strong>
          <small><MousePointer2 /> {card.prompt}</small>
        </span>
        <span className="welx-benefit-face welx-benefit-back">
          <span className="welx-benefit-icon"><Check /></span>
          <strong>{card.backTitle}</strong>
          <span>{card.detail}</span>
          <small>Tap to turn back</small>
        </span>
      </span>
    </button>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const statsSectionRef = useRef(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [audience, setAudience] = useState("individual");
  const [flippedBenefit, setFlippedBenefit] = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [programme, setProgramme] = useState(0);
  const [bookDirection, setBookDirection] = useState("next");
  const [activeOrbit, setActiveOrbit] = useState(0);
  const [orbitCount, setOrbitCount] = useState(0);
  const [impactMode, setImpactMode] = useState(0);
  const [impactCount, setImpactCount] = useState(0);
  const [testimonial, setTestimonial] = useState(0);
  const momentumRefs = useRef([]);

  const activeJourney = journeyGroups[audience];
  const activeProgramme = programmes[programme];
  const activeOrbitStat = orbitStats[activeOrbit];
  const activeImpact = impactModes[impactMode];
  const activeTestimonial = testimonials[testimonial];
  const impactValue = `${activeImpact.prefix || ""}${impactCount}${activeImpact.suffix || ""}`;
  const orbitValue = formatOrbitValue(orbitCount, activeOrbitStat, orbitCount >= activeOrbitStat.target);

  const showProgramme = (index, direction = "next") => {
    setBookDirection(direction);
    setProgramme((index + programmes.length) % programmes.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroSlides.length), 5200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let scrollFrame = 0;
    const updateOrbitFromScroll = () => {
      scrollFrame = 0;
      const section = statsSectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      setActiveOrbit(Math.min(orbitStats.length - 1, Math.floor(progress * orbitStats.length)));
    };
    const requestUpdate = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateOrbitFromScroll);
    };
    updateOrbitFromScroll();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 760;
    setOrbitCount(0);
    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setOrbitCount(Math.round(activeOrbitStat.target * eased));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [activeOrbit, activeOrbitStat.target]);

  useEffect(() => {
    const nodes = momentumRefs.current.filter(Boolean);
    if (!("IntersectionObserver" in window) || !nodes.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setMomentum(Number(visible[0].target.dataset.index));
    }, { rootMargin: "-35% 0px -35% 0px", threshold: [0.2, 0.5, 0.8] });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 850;
    setImpactCount(0);
    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setImpactCount(Math.round(activeImpact.value * eased));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [activeImpact.value, impactMode]);

  const orbitDots = useMemo(() => Array.from({ length: 16 }, (_, index) => index), []);

  return (
    <div className="welx-landing">
      <section ref={heroRef} className="welx-hero" aria-labelledby="welxHeroTitle">
        <ParticleCanvas hostRef={heroRef} />
        <div className="welx-hero-grid" aria-hidden="true" />
        <div className="welx-orb welx-orb-one" aria-hidden="true" />
        <div className="welx-orb welx-orb-two" aria-hidden="true" />
        <div className="welx-shell welx-hero-layout">
          <div className="welx-hero-copy">
            <p className="welx-kicker welx-kicker-light"><span /> Welcome to WELX</p>
            <h1 id="welxHeroTitle">Learn it.<br /><em>Build it.</em></h1>
            <p>Real skills, built through practice.</p>
            <div className="welx-actions">
              <Link className="welx-button welx-button-pink welx-button-hero" to="/signup">Start learning <ArrowRight /></Link>
            </div>
            <div className="welx-hero-tabs" aria-label="Choose a WELX path preview">
              {heroSlides.map((slide, index) => (
                <button key={slide.number} className={heroSlide === index ? "is-active" : ""} type="button" onClick={() => setHeroSlide(index)}>
                  <span>{slide.number}</span><strong>{index === 0 ? "Learn" : index === 1 ? "Practice" : "Grow"}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="welx-hero-stage" aria-live="polite">
            <div className="welx-hero-rings" aria-hidden="true"><i /><i /><i /></div>
            <article key={heroSlides[heroSlide].number} className="welx-path-card">
              <img src={heroSlides[heroSlide].image} alt="" />
              <div className="welx-path-overlay" />
              <header><span><i /> YOUR WELX PATH</span><b><i /> In motion</b></header>
              <div className="welx-path-content">
                <span className="welx-path-number">{heroSlides[heroSlide].number}</span>
                <p>{heroSlides[heroSlide].kicker}</p>
                <h2>{heroSlides[heroSlide].title}</h2>
                <p>{heroSlides[heroSlide].copy}</p>
              </div>
              <footer>{heroSlides.map((slide, index) => <i key={slide.number} className={heroSlide === index ? "is-active" : ""} />)}</footer>
            </article>
          </div>
        </div>
        <p className="welx-click-hint"><span>+</span> Click the open space</p>
      </section>

      <section id="journey" className="welx-section welx-journey" aria-labelledby="journeyTitle">
        <div className="welx-shell">
          <div className="welx-section-heading">
            <div><p className="welx-kicker">Built for people and organizations</p><h2 id="journeyTitle">A learning journey that moves when <em>you do.</em></h2></div>
            <p>Switch perspectives, then flip each card to discover how WELX supports individual ambition and workforce capability.</p>
          </div>

          <div className="welx-audience-switch" role="tablist" aria-label="Choose an audience">
            <button className={audience === "individual" ? "is-active" : ""} type="button" onClick={() => { setAudience("individual"); setFlippedBenefit(0); }} role="tab" aria-selected={audience === "individual"}><Users /> For individuals</button>
            <button className={audience === "organization" ? "is-active" : ""} type="button" onClick={() => { setAudience("organization"); setFlippedBenefit(0); }} role="tab" aria-selected={audience === "organization"}><Building2 /> For organizations</button>
          </div>

          <div className="welx-journey-panel" key={audience}>
            <div className="welx-journey-intro"><p>{activeJourney.eyebrow}</p><h3>{activeJourney.title}</h3><span>{activeJourney.copy}</span></div>
            <div className="welx-benefit-grid">
              {activeJourney.cards.map((card, index) => (
                <BenefitCard key={card.title} card={card} flipped={flippedBenefit === index} onFlip={() => setFlippedBenefit(flippedBenefit === index ? -1 : index)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={statsSectionRef} className="welx-stats-section" aria-labelledby="welxStatsTitle">
        <div className="welx-stats-sticky">
          <div className="welx-shell welx-stats-layout">
            <div className="welx-stats-copy">
              <p className="welx-kicker welx-kicker-light">WELX in motion</p>
              <h2 id="welxStatsTitle">Progress you can <em>feel.</em><br />Results you can see.</h2>
              <p>Scroll through the circle or choose a signal to see the WELX learning community one result at a time.</p>
              <div className="welx-stats-progress" aria-live="polite"><span>0{activeOrbit + 1}</span> / 04</div>
            </div>

            <div className="welx-stats-orbit" style={{ "--orbit-angle": `${activeOrbit * 90}deg` }}>
              <div className="welx-stats-track" aria-hidden="true"><i /></div>
              <div className="welx-stats-hub" aria-hidden="true"><span>WELX</span><strong>Learning<br />in motion</strong></div>
              {orbitStats.map((stat, index) => {
                const StatIcon = stat.icon;
                const isActive = activeOrbit === index;
                return (
                  <button
                    key={stat.label}
                    className={`welx-orbit-stat welx-orbit-stat-${index}${isActive ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setActiveOrbit(index)}
                    onMouseEnter={() => setActiveOrbit(index)}
                    onFocus={() => setActiveOrbit(index)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span><StatIcon /></span>
                    <strong>{isActive ? orbitValue : formatOrbitValue(stat.target, stat, true)}</strong>
                    <p>{stat.label}</p>
                    <small>{stat.detail}</small>
                  </button>
                );
              })}
            </div>

            <p className="welx-stats-cue"><span aria-hidden="true">↓</span> Keep scrolling to rotate</p>
          </div>
        </div>
      </section>

      <section className="welx-section welx-momentum" aria-labelledby="momentumTitle">
        <div className="welx-shell welx-momentum-heading">
          <p className="welx-kicker welx-kicker-light">Learning designed around momentum</p>
          <h2 id="momentumTitle">Tools that turn a lesson into <em>movement.</em></h2>
          <p>Every WELX feature moves you beyond reading and watching—into experimenting, deciding, improving, and seeing your progress.</p>
        </div>
        <div className="welx-shell welx-momentum-layout">
          <div className="welx-momentum-sticky">
            <article key={momentumFeatures[momentum].number} className="welx-momentum-visual">
              <img src={momentumFeatures[momentum].image} alt={momentumFeatures[momentum].caption} />
              <div><span>{React.createElement(momentumFeatures[momentum].icon)}</span><strong>{momentumFeatures[momentum].caption}</strong></div>
              <p>{momentumFeatures[momentum].number} / 04</p>
            </article>
          </div>
          <div className="welx-momentum-steps">
            {momentumFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article key={feature.number} ref={(node) => { momentumRefs.current[index] = node; }} data-index={index} className={momentum === index ? "is-active" : ""} onMouseEnter={() => setMomentum(index)}>
                  <p><Icon /> {feature.number} / {feature.action}</p>
                  <h3>{feature.title}</h3>
                  <span>{feature.copy}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="welx-section welx-book-section" aria-labelledby="bookTitle">
        <div className="welx-shell">
          <div className="welx-section-heading">
            <div><p className="welx-kicker">Popular course categories</p><h2 id="bookTitle">Open a new <em>chapter.</em></h2></div>
            <p>Flip through practical skills and a flagship professional qualification designed for ambitious leaders.</p>
          </div>
          <div key={activeProgramme.number} className={`welx-book is-${bookDirection}${activeProgramme.special ? " is-special" : ""}`} aria-live="polite">
            <article className="welx-book-cover">
              <div className="welx-book-top"><span>{activeProgramme.special ? "FEATURED PROFESSIONAL PROGRAMME" : "WELX FIELD GUIDE"}</span><b>{activeProgramme.number}</b></div>
              <div className="welx-book-symbol">{activeProgramme.special ? <Sparkles /> : <BookOpen />}</div>
              <div><p>{activeProgramme.kicker}</p><h3>{activeProgramme.title}</h3><span>{activeProgramme.subtitle}</span></div>
              {activeProgramme.special && <strong className="welx-featured-stamp">CMI<br />LEVEL 7</strong>}
            </article>
            <article className="welx-book-page">
              {activeProgramme.special && <p className="welx-special-label"><Sparkles /> Flagship leadership qualification</p>}
              <h3>{activeProgramme.subtitle}</h3>
              <p>{activeProgramme.copy}</p>
              <ul>{activeProgramme.facts.map((fact) => <li key={fact}><Check /> {fact}</li>)}</ul>
              {activeProgramme.href.startsWith("http") ? (
                <a className="welx-book-link" href={activeProgramme.href} target="_blank" rel="noreferrer">Learn more <ArrowUpRight /></a>
              ) : (
                <Link className="welx-book-link" to={activeProgramme.href}>Explore courses <ArrowUpRight /></Link>
              )}
            </article>
          </div>
          <div className="welx-book-controls">
            <button type="button" onClick={() => showProgramme(programme - 1, "previous")} aria-label="Previous programme"><ArrowLeft /></button>
            <div>{programmes.map((item, index) => <button key={item.number} className={programme === index ? "is-active" : ""} type="button" onClick={() => showProgramme(index, index < programme ? "previous" : "next")} aria-label={`Show ${item.title}`} />)}</div>
            <span><b>{activeProgramme.number}</b> / 04</span>
            <button type="button" onClick={() => showProgramme(programme + 1, "next")} aria-label="Next programme"><ArrowRight /></button>
          </div>
        </div>
      </section>

      <section className="welx-section welx-impact-lab" aria-labelledby="impactLabTitle">
        <div className="welx-impact-noise" aria-hidden="true" />
        <div className="welx-shell">
          <div className="welx-impact-heading">
            <p className="welx-kicker welx-kicker-light">The WELX impact map</p>
            <h2 id="impactLabTitle">Close the gap.<br /><em>Grow what comes next.</em></h2>
            <p>Pick a signal. Watch the map change. Discover how WELX connects learning to useful movement.</p>
          </div>
          <div className="welx-impact-layout">
            <div className="welx-impact-orbit" style={{ "--impact-color": activeImpact.color }}>
              <div className="welx-impact-rings" aria-hidden="true">{orbitDots.map((dot) => <i key={dot} style={{ "--dot": dot }} />)}</div>
              <div className="welx-impact-core"><small>LIVE MODEL</small><strong>{impactValue}</strong><span>{activeImpact.label}</span></div>
              <svg viewBox="0 0 350 145" aria-hidden="true">
                <defs><linearGradient id="impactFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={activeImpact.color} stopOpacity=".45" /><stop offset="1" stopColor={activeImpact.color} stopOpacity="0" /></linearGradient></defs>
                <path className="welx-impact-grid-line" d="M10 32H340M10 72H340M10 112H340" />
                <path key={`fill-${impactMode}`} className="welx-impact-fill" d={`${activeImpact.path}V140H10Z`} />
                <path key={`line-${impactMode}`} className="welx-impact-line" pathLength="1" d={activeImpact.path} />
              </svg>
            </div>
            <div className="welx-impact-choices">
              {impactModes.map((mode, index) => (
                <button key={mode.label} className={impactMode === index ? "is-active" : ""} type="button" onClick={() => setImpactMode(index)} onMouseEnter={() => setImpactMode(index)} style={{ "--choice-color": mode.color }}>
                  <span>0{index + 1}</span><div><strong>{mode.title}</strong><p>{mode.copy}</p></div><ChevronRight />
                </button>
              ))}
            </div>
          </div>
          <p className="welx-impact-note">Interactive pathway model for exploration; figures are illustrative and vary by learner, role, and organisation.</p>
        </div>
      </section>

      <section className="welx-section welx-stories" aria-labelledby="storiesTitle">
        <div className="welx-shell">
          <div className="welx-section-heading">
            <div><p className="welx-kicker">What our users say</p><h2 id="storiesTitle">One story at a <em>time.</em></h2></div>
            <p>Real learning feels different when every step leads to something useful.</p>
          </div>
          <article className="welx-testimonial" aria-live="polite">
            <div className="welx-testimonial-photo"><img key={activeTestimonial.image} src={activeTestimonial.image} style={{ objectPosition: activeTestimonial.focus }} alt={activeTestimonial.alt} loading="lazy" decoding="async" /><span>{activeTestimonial.status}</span></div>
            <div className="welx-testimonial-copy">
              <div className="welx-mic"><span /><span /><span /></div>
              <blockquote>“{activeTestimonial.quote}”</blockquote>
              <div><p><strong>{activeTestimonial.name}</strong><span>{activeTestimonial.role}</span></p><b>0{testimonial + 1} / 0{testimonials.length}</b></div>
              <nav aria-label="Choose a testimonial">
                <button type="button" onClick={() => setTestimonial((testimonial - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial"><ArrowLeft /></button>
                <span>{testimonials.map((story, index) => <button key={story.name} className={testimonial === index ? "is-active" : ""} type="button" onClick={() => setTestimonial(index)} aria-label={`Show testimonial ${index + 1}`} />)}</span>
                <button type="button" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)} aria-label="Next testimonial"><ArrowRight /></button>
              </nav>
            </div>
          </article>
        </div>
      </section>

      <section className="welx-final-cta">
        <div className="welx-final-rings" aria-hidden="true" />
        <div className="welx-shell">
          <div><p className="welx-kicker welx-kicker-light">Your next step</p><h2>Start small.<br /><em>Go somewhere big.</em></h2></div>
          <div><p>Turn focused learning into useful skills, visible progress, and work you can confidently show.</p><Link className="welx-button welx-button-pink" to="/courses">Explore your courses <ArrowUpRight /></Link></div>
        </div>
      </section>
    </div>
  );
}
