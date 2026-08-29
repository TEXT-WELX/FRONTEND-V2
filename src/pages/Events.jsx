import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, Monitor, Sparkles, X } from "lucide-react";
import worldefPassports from "../assets/events/worldef-passports.jpeg";
import worldefTeam from "../assets/events/worldef-team.png";
import acceleratorPoster from "../assets/events/ai-accelerator-poster.png";
import acceleratorSession from "../assets/events/ai-accelerator-session.png";
import careerStage from "../assets/events/career-day-stage.png";
import careerNetworking from "../assets/events/career-day-networking.png";

const events = [
  {
    number: "01",
    shortTitle: "WORLDEF Summit",
    eyebrow: "Summit recap",
    title: "WORLDEF Global E-commerce Summit",
    date: "12–14 February 2026",
    time: "Three-day experience",
    location: "Dubai CommerCity",
    images: [worldefPassports, worldefTeam],
    imageAlts: ["Wellington Campus passports at Dubai CommerCity", "Wellington Campus team at the WORLDEF summit leadership experience"],
    summary: "Leadership discovery met AI creativity at one of Dubai’s most energetic global commerce gatherings.",
    paragraphs: [
      "Wellington Campus joined the global e-commerce community for three energetic days at Dubai CommerCity. Visitors to our stand discovered their leadership style through an AI-powered experience that turned a few thoughtful answers into useful personal insight.",
      "Together with the Chartered Management Institute, we guided professionals toward stronger management capability, professional accreditation, and international recognition. Visitors could then transform their result into an AI-generated leadership caricature—an engaging experience that welcomed hundreds of people to the stand.",
    ],
    highlights: ["AI leadership discovery", "CMI professional guidance", "Hundreds of visitors"],
    thanks: "Thank you to our WELX team, WORLDEF and Dubai CommerCity organisers, CMI partners, and every visitor who made the experience such a success.",
  },
  {
    number: "02",
    shortTitle: "AI Accelerator",
    eyebrow: "Live online accelerator",
    title: "The Future of Thinking: AI Accelerator",
    date: "12–13 June 2026",
    time: "4:00 pm–6:00 pm",
    location: "Live online",
    images: [acceleratorPoster, acceleratorSession],
    imageAlts: ["The Future of Thinking WELX AI Accelerator poster", "Learners attending the online WELX AI Accelerator session"],
    summary: "Two focused days that moved learners beyond prompts and theory into useful AI workflows and working ideas.",
    paragraphs: [
      "The WELX AI Accelerator challenged learners to explore what AI could genuinely unlock in their study, work, and future careers. Participants built practical workflows, tested automation ideas, and learned how the right tools can return valuable time to every week.",
      "Every activity followed a simple rhythm: understand a real problem, build a solution, test the result, and share what changed. Learners left with clearer routes into projects, internships, modern careers, and more confident everyday work.",
    ],
    highlights: ["2 focused days", "100% hands-on", "Build, create, compete, grow"],
    thanks: "A practical, collaborative experience designed to turn AI curiosity into capability that learners can keep developing.",
  },
  {
    number: "03",
    shortTitle: "Career Matchmaking",
    eyebrow: "Career connections",
    title: "WEL.X Career Matchmaking Day",
    date: "14 July 2026",
    time: "10:00 am–3:00 pm",
    location: "Wellington Campus, Dubai CommerCity",
    images: [careerStage, careerNetworking],
    imageAlts: ["Summer Internship Career Day 2026 speakers and organisers", "Students networking with employers at Career Day 2026"],
    summary: "Rescheduled after exceptional demand, this career day brought 200+ students and graduates closer to real opportunity.",
    paragraphs: [
      "More than 200 students and graduates came together with industry leaders, recruiters, and mentors for a day built around meaningful career movement—not simply exchanging business cards.",
      "Panel conversations opened new perspectives, expert mentors offered practical guidance, and AI-powered mock interviews helped participants sharpen their stories before meeting employers in real interview settings. The result was a welcoming space where talent, confidence, and opportunity could meet.",
    ],
    highlights: ["200+ participants", "AI mock interviews", "Recruiters and mentors"],
    thanks: "With thanks to DIEZ, EHRDC, Dubai CommerCity, and our commercial partners for helping students take their next step.",
    address: "Office 111, Block B1, Dubai CommerCity · 11 17th Street, Umm Ramool",
    cta: "https://www.mywelx.com/signup",
  },
];

export default function Events() {
  const [activeIndex, setActiveIndex] = useState(null);
  const activeEvent = activeIndex === null ? null : events[activeIndex];

  useEffect(() => {
    if (!activeEvent) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => { if (event.key === "Escape") setActiveIndex(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeEvent]);

  return (
    <div className="welx-inner-page welx-events-page">
      <div className="welx-inner-glow welx-inner-glow-one" aria-hidden="true" />
      <div className="welx-inner-glow welx-inner-glow-two" aria-hidden="true" />

      <header className="welx-inner-hero welx-events-hero">
        <div className="welx-inner-shell welx-inner-hero-grid">
          <div className="welx-events-hero-copy">
            <nav className="welx-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><b>Events</b></nav>
            <p className="welx-inner-kicker">WELX events · Dubai + online</p>
            <h1>Where people meet <em>possibility.</em></h1>
            <p>Step inside the conversations, practical experiences, and career moments that bring learning to life.</p>
            <div className="welx-events-hero-meta" aria-label="Event page highlights">
              <span><strong>03</strong> stories from 2026</span>
              <span><strong>Real</strong> people and moments</span>
            </div>
          </div>
          <div className="welx-events-hero-collage" aria-label="Highlights from WELX events">
            <figure className="welx-events-hero-photo welx-events-hero-photo-main"><img src={careerNetworking} alt="Students networking with employers at a WELX career event" /></figure>
            <figure className="welx-events-hero-photo welx-events-hero-photo-small"><img src={worldefTeam} alt="The Wellington Campus team at WORLDEF" /></figure>
            <span className="welx-events-hero-ticket"><small>WELX field notes</small><strong>Meet · Make · Move</strong><i>2026</i></span>
          </div>
        </div>
      </header>

      <nav className="welx-inner-shell welx-event-jump" aria-label="Open an event">
        {events.map((event, index) => <button key={event.number} type="button" onClick={() => setActiveIndex(index)}><span>{event.number}</span><strong>{event.shortTitle}</strong><ArrowUpRight /></button>)}
      </nav>

      <main className="welx-inner-shell welx-event-card-area">
        <div className="welx-event-card-heading"><div><p className="welx-inner-kicker">Three WELX moments</p><h2>Click a story.<br /><em>Step inside.</em></h2></div><p>Each event opens in a focused view, so you can explore the details without scrolling through a long page.</p></div>
        <section className="welx-event-cards">
          {events.map((event, index) => (
            <button key={event.number} className="welx-event-preview" type="button" onClick={() => setActiveIndex(index)}>
              <img src={event.images[0]} alt="" />
              <span className="welx-event-preview-shade" />
              <span className="welx-event-preview-number">{event.number}</span>
              <span className="welx-event-preview-content"><small>{event.eyebrow}</small><strong>{event.title}</strong><em><CalendarDays /> {event.date}</em><b>Open event <ArrowUpRight /></b></span>
            </button>
          ))}
        </section>
      </main>

      <section className="welx-event-final"><div className="welx-inner-shell"><div><p className="welx-inner-kicker">The next WELX moment</p><h2>Learn together.<br /><em>Move further.</em></h2></div><Link to="/signup">Join the WELX community <ArrowUpRight /></Link></div></section>

      {activeEvent && (
        <div className="welx-event-modal" role="dialog" aria-modal="true" aria-labelledby="activeEventTitle" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
          <article>
            <button className="welx-event-modal-close" type="button" onClick={() => setActiveIndex(null)} aria-label="Close event"><X /></button>
            <div className="welx-event-modal-gallery">
              <figure><img src={activeEvent.images[0]} alt={activeEvent.imageAlts[0]} /></figure>
              <figure><img src={activeEvent.images[1]} alt={activeEvent.imageAlts[1]} /></figure>
              <span>{activeEvent.number} / 03</span>
            </div>
            <div className="welx-event-modal-copy" tabIndex="0">
              <div className="welx-event-scroll-hint"><span /> Scroll for the full story</div>
              <p className="welx-event-number">{activeEvent.eyebrow}</p>
              <h2 id="activeEventTitle">{activeEvent.title}</h2>
              <p className="welx-event-modal-summary">{activeEvent.summary}</p>
              <div className="welx-event-meta"><span><CalendarDays /> {activeEvent.date}</span><span><Clock3 /> {activeEvent.time}</span><span>{activeEvent.location === "Live online" ? <Monitor /> : <MapPin />} {activeEvent.location}</span></div>
              {activeEvent.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <div className="welx-event-modal-highlights">{activeEvent.highlights.map((highlight) => <span key={highlight}><Sparkles /> {highlight}</span>)}</div>
              {activeEvent.address && <p className="welx-event-address">{activeEvent.address}</p>}
              <div className="welx-event-thanks"><Sparkles /><span><strong>What made it matter</strong>{activeEvent.thanks}</span></div>
              {activeEvent.cta && <a className="welx-event-cta" href={activeEvent.cta} target="_blank" rel="noreferrer">Create your WELX profile <ArrowUpRight /></a>}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
