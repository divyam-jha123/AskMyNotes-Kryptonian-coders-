import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, EyeOff, Eye, CheckCircle2 } from "lucide-react";
import { useSignUp } from "@clerk/clerk-react";
import { signup } from "../api/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp: clerkSignUp, isLoaded: isClerkLoaded } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await signup({ username, email, password });
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-auth-panel text-auth-panel-foreground flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full border border-auth-panel-muted" />
          <div className="absolute bottom-32 left-10 w-48 h-48 rounded-full border border-auth-panel-muted" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full border border-auth-panel-muted" />
        </div>

        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-auth-accent flex items-center justify-center">
            <span className="text-auth-panel-foreground font-bold text-lg">DJ</span>
          </div>
          <span className="text-xl font-bold tracking-tight">DJproductions</span>
        </div>

        <div className="z-10 space-y-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
            Elevate your<br />
            <span className="text-auth-accent">creative workflow.</span>
          </h1>
          <div className="bg-auth-panel/80 backdrop-blur-sm border border-auth-panel-muted/20 rounded-2xl p-6 max-w-md space-y-4">
            <p className="text-auth-panel-muted text-sm leading-relaxed">Experience the gold standard in production tools. Join over 50,000+ creators globally.</p>
            <div className="space-y-3">
              {["Professional-grade tools", "Seamless collaboration", "99.9% Uptime guarantee"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-auth-check flex-shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-auth-panel-muted/30 border-2 border-auth-panel" />
            ))}
            <div className="w-8 h-8 rounded-full bg-auth-accent flex items-center justify-center text-xs font-bold border-2 border-auth-panel">+50K</div>
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase text-auth-panel-muted">Trusted by 50K+ users</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-card">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-auth-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">DJ</span>
            </div>
            <span className="text-xl font-bold tracking-tight">DJproductions</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-card-foreground">Create Account</h2>
            <p className="mt-2 text-muted-foreground">Join the premier production platform.</p>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          {success && <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating account..." : "Create your account"}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Social Sign-in</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={() => {
              if (!isClerkLoaded) return;
              clerkSignUp.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/login',
              });
            }}
            disabled={!isClerkLoaded}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-card text-card-foreground font-medium hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already a member?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
          </p>
          <p className="text-center text-[11px] tracking-wide uppercase text-muted-foreground">
            By proceeding, you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
