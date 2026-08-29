import { useEffect } from "react";
import { Award, Crown, Medal, Sparkles, Star, Trophy, X } from "lucide-react";

const badgeDetails = {
  "Bronze Explorer": { icon: Award, color: "#d97706", message: "Your learning journey is officially in motion." },
  "Silver Strategist": { icon: Medal, color: "#64748b", message: "Your consistent practice is becoming real capability." },
  "Gold Master": { icon: Trophy, color: "#eab308", message: "You are turning focused learning into visible progress." },
  "Platinum Legend": { icon: Crown, color: "#a855f7", message: "Outstanding momentum. Your commitment is showing." },
  "Diamond Elite": { icon: Star, color: "#3b82f6", message: "You have reached the highest WELX learning milestone." },
};

export default function BadgeCelebration({ isVisible, badge, onClose }) {
  useEffect(() => {
    if (!isVisible) return undefined;
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !badge) return null;

  const detail = badgeDetails[badge.name] || badgeDetails["Bronze Explorer"];
  const BadgeIcon = detail.icon;

  return (
    <div className="welx-badge-celebration" role="dialog" aria-modal="true" aria-labelledby="welxBadgeTitle">
      <button className="welx-badge-backdrop" type="button" onClick={onClose} aria-label="Close badge celebration" />
      <div className="welx-confetti" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => (
          <i key={index} style={{ "--x": `${(index * 37) % 100}%`, "--delay": `${(index % 8) * 90}ms`, "--spin": `${80 + (index % 5) * 45}deg`, "--confetti-color": ["#f472b6", "#a855f7", "#3b82f6", "#f9a8d4"][index % 4] }} />
        ))}
      </div>
      <article className="welx-badge-modal" style={{ "--badge-color": detail.color }}>
        <button className="welx-badge-close" type="button" onClick={onClose} aria-label="Close celebration"><X /></button>
        <div className="welx-badge-halo" aria-hidden="true"><span><BadgeIcon /></span><Sparkles /></div>
        <p>Badge unlocked</p>
        <h2 id="welxBadgeTitle">{badge.name}</h2>
        <strong>{badge.points.toLocaleString()} WELX points</strong>
        <p>{detail.message}</p>
        {badge.points >= 2500 && <div className="welx-badge-reward"><Star /><span><b>Course reward unlocked</b>30% off eligible WELX courses</span></div>}
        <button className="welx-badge-continue" type="button" onClick={onClose}>Keep learning <Sparkles /></button>
      </article>
    </div>
  );
}
