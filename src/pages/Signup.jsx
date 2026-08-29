import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import api from "../utils/api";

export default function Signup({ setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    company: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSubmitting(true);

  try {
    const res = await api.post("/auth/signup", formData);

    const user = res.data.user;

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(user));

    // IMPORTANT: update React state
    setUser(user);

    // Redirect based on role
    if (user.role === "employer") {
      navigate("/employee-management");
    } else if (user.role === "student") {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }

  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message ||
      "Signup failed. Try again."
    );
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="welx-auth-page welx-auth-signup">
      <div className="welx-auth-orb welx-auth-orb-one" aria-hidden="true" />
      <div className="welx-auth-orb welx-auth-orb-two" aria-hidden="true" />
      <div className="welx-auth-shell">
        <section className="welx-auth-story" aria-label="Join WELX">
          <Link className="welx-auth-back" to="/"><span>←</span> Back to WELX</Link>
          <div>
            <p className="welx-auth-kicker"><Sparkles /> Your next chapter starts here</p>
            <h1>Build skills.<br /><em>Show progress.</em></h1>
            <p>Create one account for practical learning, visible outcomes, and your next career move.</p>
          </div>
          <div className="welx-auth-steps" aria-hidden="true"><span className="is-active">Choose</span><i /><span>Practice</span><i /><span>Progress</span></div>
        </section>

        <section className="welx-auth-card">
          <div className="welx-auth-heading">
            <span>Sign up</span>
            <h2>Create your account.</h2>
            <p>Tell us where your WELX journey begins.</p>
          </div>

          <form className="welx-auth-form" onSubmit={handleSubmit}>
            {error && <p className="welx-auth-error" role="alert">{error}</p>}
            <div className="welx-auth-field">
              <label htmlFor="signup-name">Full name</label>
              <div className="welx-auth-input">
                <User />
                <input id="signup-name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" autoComplete="name" required />
              </div>
            </div>

            <div className="welx-auth-field">
              <label htmlFor="signup-email">Email address</label>
              <div className="welx-auth-input">
                <Mail />
                <input id="signup-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" autoComplete="email" required />
              </div>
            </div>

            <div className="welx-auth-field">
              <label htmlFor="signup-password">Create a password</label>
              <div className="welx-auth-input">
                <Lock />
                <input id="signup-password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Create a password" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="welx-auth-field">
              <label htmlFor="signup-role">I am joining as</label>
              <select id="signup-role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value, company: e.target.value === "employer" ? formData.company : "" })}>
                <option value="student">Individual Student</option>
                <option value="employer">Employer/Organization</option>
                <option value="employee">Corporate Employee</option>
              </select>
            </div>

            {formData.role === "employer" && (
              <div className="welx-auth-field">
                <label htmlFor="signup-company">Company / Organization</label>
                <div className="welx-auth-input">
                  <Building2 />
                  <input id="signup-company" type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Your organization name" autoComplete="organization" required />
                </div>
              </div>
            )}

            <button type="submit" className="welx-auth-submit" disabled={submitting}>{submitting ? "Creating account..." : "Create account"} <ArrowRight /></button>
          </form>

          <p className="welx-auth-switch">Already have an account? <Link to="/login">Sign in <ArrowRight /></Link></p>
          <p className="welx-auth-note"><Lock /> Your details are used only to create and protect your account.</p>
        </section>
      </div>
    </div>
  );
}
