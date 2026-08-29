import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Award, LogOut, Menu, Star, Trophy, User, X } from "lucide-react";
import Leaderboard from "./Leaderboard";
import logo from "../assets/welx_brand.png";
import { getWelxPoints } from "../utils/welxPoints";

export default function Navbar({ user, setUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userStats, setUserStats] = useState({ points: 0, badge: null });
  const navigate = useNavigate();
  const location = useLocation();

  const badges = [
    { name: "Bronze Explorer", points: 100, icon: Award },
    { name: "Silver Strategist", points: 500, icon: Award },
    { name: "Gold Master", points: 1000, icon: Trophy },
    { name: "Platinum Legend", points: 2500, icon: Trophy },
    { name: "Diamond Elite", points: 5000, icon: Star },
  ];

  const refreshStats = async () => {
    if (!user) return;
    try {
      const data = await getWelxPoints();
      const currentBadge = [...badges].reverse().find((badge) => data.points >= badge.points);
      setUserStats({ points: data.points, badge: currentBadge });
    } catch { setUserStats({ points: Number(user.welxPoints || 0), badge: null }); }
  };

  useEffect(() => { refreshStats(); }, [user]);

  useEffect(() => {
    const handlePoints = () => refreshStats();
    window.addEventListener("welxPointsUpdated", handlePoints);
    return () => window.removeEventListener("welxPointsUpdated", handlePoints);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("welx-menu-open", isOpen);
    return () => document.body.classList.remove("welx-menu-open");
  }, [isOpen]);

  useEffect(() => {
    if (!showLeaderboard) return undefined;
    const handleKeyDown = (event) => event.key === "Escape" && setShowLeaderboard(false);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLeaderboard]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.clear();
    setUser(null);
    setIsOpen(false);
    navigate("/");
  };

  const hasCompletedLearnerOnboarding = Boolean(
    user?.role === "student" && (user?.onboardingComplete || user?.onboardingData)
  );

  const navLinks = [
    { label: "Courses", to: "/courses" },
    ...(hasCompletedLearnerOnboarding ? [{ label: "Career Path", to: "/learning-roadmap" }] : []),
    { label: "Sandbox", to: "/playground" },
    { label: "Simulation", to: "/simulation" },
    { label: "Events", to: "/events" },
    { label: "Contact", to: "/contact" },
  ];

  const isEmployerArea = (user?.role === "employer" || user?.companyAccess?.accessRole === "team_leader") && (
    location.pathname === "/dashboard" ||
    location.pathname === "/employer-analytics" ||
    location.pathname === "/employee-management" ||
    location.pathname === "/company-roles" ||
    location.pathname.startsWith("/employee/") ||
    location.pathname.startsWith("/assign-courses/")
  );
  const visibleNavLinks = isEmployerArea ? navLinks.filter((link) => link.label !== "Events") : navLinks;

  return (
    <header className={`welx-navbar${isScrolled ? " is-scrolled" : ""}${isOpen ? " is-open" : ""}${isEmployerArea ? " is-employer" : ""}`}>
      <Link className="welx-navbar-logo" to="/" aria-label="WELX home"><img src={logo} alt="WEL.X" /></Link>

      <nav className="welx-navbar-links" aria-label="Primary navigation">
        {visibleNavLinks.map((link) => <Link key={link.label} to={link.to}>{link.label}</Link>)}
      </nav>

      <div className="welx-navbar-actions">
        {user ? (
          <>
            <button className="welx-points-pill" type="button" onClick={() => setShowLeaderboard(!showLeaderboard)} aria-expanded={showLeaderboard} aria-haspopup="dialog">
              <span className="welx-progress-ring"><i>{userStats.badge ? <userStats.badge.icon /> : <Star />}</i></span>
              <b>{userStats.points.toLocaleString()} WELX</b>
            </button>
            <Link className="welx-user-link" to="/dashboard"><User /><span>{user.name}</span></Link>
            <button className="welx-logout" type="button" onClick={handleLogout} aria-label="Log out"><LogOut /></button>
          </>
        ) : (
          <><Link className="welx-login" to="/login">Log in</Link><Link className="welx-signup" to="/signup">Sign Up</Link></>
        )}
      </div>

      <button className="welx-menu-toggle" type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <div className="welx-mobile-menu" aria-hidden={!isOpen}>
        <div className="welx-mobile-actions">
          {user ? <><Link to="/dashboard" onClick={() => setIsOpen(false)}>Open dashboard</Link><button type="button" onClick={handleLogout}>Log out</button></> : <><Link to="/login" onClick={() => setIsOpen(false)}>Log in</Link><Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link></>}
        </div>
        <nav aria-label="Mobile navigation">
          {visibleNavLinks.map((link, index) => <Link key={link.label} to={link.to} onClick={() => setIsOpen(false)} style={{ "--link-index": index }}>{link.label}<span>0{index + 1}</span></Link>)}
        </nav>
      </div>

      {showLeaderboard && user && (
        <div className="welx-leaderboard-layer" onMouseDown={(event) => event.target === event.currentTarget && setShowLeaderboard(false)}>
          <div className="welx-leaderboard-popover" role="dialog" aria-modal="true" aria-label="Your WELX progress">
            <Leaderboard user={user} onClose={() => setShowLeaderboard(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
