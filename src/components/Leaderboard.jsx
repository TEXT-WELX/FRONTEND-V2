import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpenCheck,
  Check,
  Crown,
  Medal,
  PlayCircle,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
} from "lucide-react";
import BadgeCelebration from "./BadgeCelebration";
import { getWelxPoints } from "../utils/welxPoints";

const badges = [
  { name: "Bronze Explorer", points: 100, icon: Award, color: "#d97706" },
  { name: "Silver Strategist", points: 500, icon: Medal, color: "#64748b" },
  { name: "Gold Master", points: 1000, icon: Trophy, color: "#eab308" },
  { name: "Platinum Legend", points: 2000, icon: Crown, color: "#a855f7" },
  { name: "Diamond Elite", points: 5000, icon: Star, color: "#3b82f6" },
];

const mockLeaderboard = [
  { id: 1, name: "Alex Chen", points: 2450, badge: "Platinum Legend", initials: "AC" },
  { id: 2, name: "Sarah Wilson", points: 1875, badge: "Gold Master", initials: "SW" },
  { id: 3, name: "Mike Johnson", points: 1650, badge: "Gold Master", initials: "MJ" },
  { id: 4, name: "Emma Davis", points: 1200, badge: "Gold Master", initials: "ED" },
  { id: 5, name: "David Kim", points: 950, badge: "Silver Strategist", initials: "DK" },
];

const pointActions = [
  { action: "Complete a simulation", points: "20–100", detail: "Based on your performance", icon: PlayCircle },
  { action: "Earn a 90%+ score", points: "50", detail: "Excellent-performance bonus", icon: Target },
  { action: "Complete a course", points: "150", detail: "Finish the full learning path", icon: BookOpenCheck },
  { action: "Complete a lesson", points: "15", detail: "Every finished lesson counts", icon: Check },
];

export default function Leaderboard({ user, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [userStats, setUserStats] = useState({ points: 0, rank: 0, badge: null });
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
    let points = Number(user?.welxPoints || 0);
    try { points = Number((await getWelxPoints()).points || 0); } catch {}
    if (!active) return;
    const currentBadge = [...badges].reverse().find((badge) => points >= badge.points) || null;
    const rank = mockLeaderboard.filter((player) => player.points > points).length + 1;
    const lastCheckedPoints = Number.parseInt(localStorage.getItem(`last_badge_check_${user?.id}`) || "0", 10);

    if (currentBadge && points >= currentBadge.points && lastCheckedPoints < currentBadge.points) {
      setNewBadge(currentBadge);
      setShowBadgeCelebration(true);
      localStorage.setItem(`last_badge_check_${user?.id}`, points.toString());
    }

    setUserStats({ points, rank, badge: currentBadge });
    };
    refresh();
    window.addEventListener("welxPointsUpdated", refresh);
    return () => { active = false; window.removeEventListener("welxPointsUpdated", refresh); };
  }, [user]);

  const nextBadge = useMemo(
    () => badges.find((badge) => badge.points > userStats.points) || null,
    [userStats.points]
  );
  const nextTarget = nextBadge?.points || userStats.points || 1;
  const nextProgress = Math.min((userStats.points / nextTarget) * 100, 100);

  return (
    <section className="welx-leaderboard-panel" aria-labelledby="welxProgressTitle">
      <BadgeCelebration
        isVisible={showBadgeCelebration}
        badge={newBadge}
        onClose={() => setShowBadgeCelebration(false)}
      />

      <header className="welx-leaderboard-header">
        <div className="welx-leaderboard-mark"><Sparkles /></div>
        <div>
          <span>Your learning profile</span>
          <h2 id="welxProgressTitle">WELX progress</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close WELX progress"><X /></button>
      </header>

      <nav className="welx-leaderboard-tabs" aria-label="WELX progress sections">
        {[
          ["overview", "Overview"],
          ["badges", "Badges"],
          ["ranking", "Leaderboard"],
          ["points", "Earn points"],
        ].map(([id, label]) => (
          <button key={id} type="button" className={activeTab === id ? "is-active" : ""} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <div className="welx-leaderboard-body">
        {activeTab === "overview" && (
          <div className="welx-leaderboard-overview">
            <div className="welx-leaderboard-stats">
              <article><strong>{userStats.points.toLocaleString()}</strong><span>WELX points</span></article>
              <article><strong>#{userStats.rank}</strong><span>Global rank</span></article>
              <article className="is-badge">
                {userStats.badge ? <userStats.badge.icon /> : <Award />}
                <div><strong>{userStats.badge?.name || "First badge"}</strong><span>{userStats.badge ? "Current level" : "100 points away"}</span></div>
              </article>
            </div>

            <article className="welx-next-milestone">
              <div>
                <span>{nextBadge ? "Next badge" : "Top badge reached"}</span>
                <strong>{nextBadge?.name || "Diamond Elite"}</strong>
              </div>
              <b>{userStats.points.toLocaleString()} / {nextTarget.toLocaleString()} pts</b>
              <div className="welx-meter" aria-label={`${Math.round(nextProgress)}% toward the next badge`}><i style={{ width: `${nextProgress}%` }} /></div>
              <p>{nextBadge ? `${Math.max(nextBadge.points - userStats.points, 0).toLocaleString()} points to your next celebration.` : "You have unlocked every badge. Brilliant work."}</p>
            </article>

            <div className="welx-overview-bottom">
              <article>
                <span>Course reward</span>
                <strong>{userStats.points >= 2500 ? "30% unlocked" : `${Math.max(2500 - userStats.points, 0).toLocaleString()} pts to unlock`}</strong>
                <p>Reach 2,500 points to earn 30% off eligible courses.</p>
              </article>
              <article>
                <span>Keep moving</span>
                <strong>One useful action</strong>
                <p>Complete a lesson or simulation to grow your points today.</p>
              </article>
            </div>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="welx-badge-grid">
            {badges.map((badge) => {
              const earned = userStats.points >= badge.points;
              const Icon = badge.icon;
              return (
                <article key={badge.name} className={earned ? "is-earned" : ""} style={{ "--badge-color": badge.color }}>
                  <span><Icon /></span>
                  <div><strong>{badge.name}</strong><small>{badge.points.toLocaleString()} points</small></div>
                  <b>{earned ? "Earned" : "Locked"}</b>
                </article>
              );
            })}
          </div>
        )}

        {activeTab === "ranking" && (
          <div className="welx-ranking-list">
            {mockLeaderboard.map((player, index) => (
              <article key={player.id}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{player.initials}</span>
                <div><strong>{player.name}</strong><small>{player.badge}</small></div>
                <em>{player.points.toLocaleString()} pts</em>
              </article>
            ))}
            <p>Your activity updates your position automatically.</p>
          </div>
        )}

        {activeTab === "points" && (
          <div className="welx-points-guide">
            {pointActions.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.action}>
                  <span><Icon /></span>
                  <div><strong>{item.action}</strong><small>{item.detail}</small></div>
                  <b>+{item.points}</b>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
