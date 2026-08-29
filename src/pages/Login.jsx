import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import api from "../utils/api";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🔗 Call backend API
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ Save JWT token + user in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("currentUser", JSON.stringify(res.data.user));

      // Update global state
      setUser(res.data.user);

      
      if (res.data.user.role === "employer") navigate("/employee-management");
      else navigate("/dashboard");
      // navigate("/form"); // temporary - to for workshop registration form
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="welx-auth-page welx-auth-login">
      <div className="welx-auth-orb welx-auth-orb-one" aria-hidden="true" />
      <div className="welx-auth-orb welx-auth-orb-two" aria-hidden="true" />
      <div className="welx-auth-shell">
        <section className="welx-auth-story" aria-label="Welcome to WELX">
          <Link className="welx-auth-back" to="/"><span>←</span> Back to WELX</Link>
          <div>
            <p className="welx-auth-kicker"><Sparkles /> Continue your momentum</p>
            <h1>Welcome<br />back to <em>what’s next.</em></h1>
            <p>Your courses, progress, and practical work are ready when you are.</p>
          </div>
          <div className="welx-auth-steps" aria-hidden="true"><span className="is-active">Learn</span><i /><span>Practice</span><i /><span>Grow</span></div>
        </section>

        <section className="welx-auth-card">
          <div className="welx-auth-heading">
            <span>Log in</span>
            <h2>Good to see you.</h2>
            <p>Enter your details to continue.</p>
          </div>

          <form className="welx-auth-form" onSubmit={handleSubmit}>
            {error && <p className="welx-auth-error" role="alert">{error}</p>}
            <div className="welx-auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="welx-auth-input">
                <Mail />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="welx-auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="welx-auth-input">
                <Lock />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button type="submit" className="welx-auth-submit">Sign in <ArrowRight /></button>
          </form>

          <p className="welx-auth-switch">New to WELX? <Link to="/signup">Create your account <ArrowRight /></Link></p>
          <p className="welx-auth-note"><Lock /> Your account details stay securely protected.</p>
        </section>
      </div>
    </div>
  );
}
