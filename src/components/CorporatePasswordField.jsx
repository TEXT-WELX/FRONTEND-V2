import { useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, Sparkles } from "lucide-react";

function generatedPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const values = new Uint32Array(10);
  window.crypto.getRandomValues(values);
  return `Wlx${Array.from(values, (value) => alphabet[value % alphabet.length]).join("")}9!`;
}

function passwordScore(password) {
  return [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password) && password.length >= 12,
  ].filter(Boolean).length;
}

export default function CorporatePasswordField({ value, onChange, label = "WEL.X login password" }) {
  const [visible, setVisible] = useState(false);
  const score = useMemo(() => passwordScore(value), [value]);
  const strength = ["Enter a password", "Basic", "Good", "Strong", "Excellent"][score];

  return (
    <div className="company-password-field">
      <div className="company-password-heading"><span>{label}</span><button type="button" onClick={() => onChange(generatedPassword())}><Sparkles /> Generate secure</button></div>
      <div className="company-password-control">
        <KeyRound />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="At least 8 characters with a letter and number"
          minLength="8"
          maxLength="72"
          pattern="(?=.*[A-Za-z])(?=.*\d).{8,72}"
          title="Use 8–72 characters with at least one letter and one number"
          autoComplete="new-password"
          required
        />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff /> : <Eye />}</button>
      </div>
      <div className={`company-password-strength score-${score}`}><i>{[1, 2, 3, 4].map((step) => <span key={step} className={step <= score ? "is-filled" : ""} />)}</i><small>{strength}</small></div>
      <p>This exact password is encrypted before storage and included in the onboarding email.</p>
    </div>
  );
}
