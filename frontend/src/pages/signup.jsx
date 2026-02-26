import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, EyeOff, Eye, CheckCircle2, Zap } from "lucide-react";
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .signup-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #f1f5f9;
          font-size: 14px;
          outline: none;
          transition: all 0.25s;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .signup-input::placeholder { color: #4b5563; }
        .signup-input:focus {
          border-color: rgba(124,58,237,0.5);
          box-shadow: 0 0 20px rgba(124,58,237,0.12);
        }
        .google-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 13px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .google-btn:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.07); }
        .google-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 1023px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; }
        }
      `}</style>

      {/* Left Panel — Branding */}
      <div className="left-panel" style={{
        width: '50%', background: 'linear-gradient(135deg, #0c0a14 0%, #110e1f 50%, #0a0818 100%)',
        color: '#e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 48px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 80, right: 40, width: 256, height: 256, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.5)' }} />
          <div style={{ position: 'absolute', bottom: 130, left: 40, width: 192, height: 192, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.5)' }} />
          <div style={{ position: 'absolute', top: '50%', right: '33%', width: 128, height: 128, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.5)' }} />
        </div>

        {/* Nebula glow */}
        <div style={{
          position: 'absolute', width: 400, height: 400, top: '-100px', left: '-50px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
          <div style={{ background: '#7C3AED', padding: 8, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ color: '#fff', width: 22, height: 22 }} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Smash AI</span>
        </div>

        {/* Hero text */}
        <div style={{ zIndex: 10 }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.15, marginBottom: 28, letterSpacing: '-1px' }}>
            Elevate your<br />
            <span style={{
              background: 'linear-gradient(90deg, #c084fc, #818cf8, #67e8f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>learning journey.</span>
          </h1>
          <div style={{
            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, maxWidth: 400,
          }}>
            <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              Experience AI-powered study tools. Join thousands of students learning smarter.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {["AI-powered note analysis", "Smart flashcard generation", "Personalized study sessions"].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 style={{ width: 18, height: 18, color: '#10b981', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
          <div style={{ display: 'flex' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(124,58,237,0.2)', border: '2px solid #0c0a14',
                marginLeft: i > 0 ? -8 : 0,
              }} />
            ))}
            <div style={{
              width: 30, height: 30, borderRadius: '50%', marginLeft: -8,
              background: '#7C3AED', border: '2px solid #0c0a14',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800, color: '#fff',
            }}>+50K</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', letterSpacing: '1px', textTransform: 'uppercase' }}>Trusted by 50K+ users</span>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="right-panel" style={{
        width: '50%', backgroundColor: '#05050a', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px 48px', position: 'relative',
      }}>
        {/* Subtle nebula */}
        <div style={{
          position: 'absolute', width: 300, height: 300, bottom: '-60px', right: '-60px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 420, animation: 'heroFadeIn 0.7s ease-out both', position: 'relative', zIndex: 1 }}>
          {/* Mobile logo */}
          <div className="left-panel" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ background: '#7C3AED', padding: 8, borderRadius: 10 }}>
              <Zap style={{ color: '#fff', width: 20, height: 20 }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Smash AI</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Create Account</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Join Smash AI and start learning smarter.</p>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 12, marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', fontSize: 13,
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              padding: '10px 14px', borderRadius: 12, marginBottom: 16,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              color: '#6ee7b7', fontSize: 13,
            }}>{success}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#4b5563' }} />
                <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="signup-input" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#4b5563' }} />
                <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="signup-input" />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#4b5563' }} />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="signup-input" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563',
                  transition: 'color 0.2s', display: 'flex',
                }}
                  onMouseOver={e => e.currentTarget.style.color = '#e2e8f0'}
                  onMouseOut={e => e.currentTarget.style.color = '#4b5563'}
                >
                  {showPassword ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 6px 24px rgba(124,58,237,0.4)',
              transition: 'all 0.2s', marginTop: 4,
              fontFamily: "'Inter', sans-serif",
            }}>
              {loading ? "Creating account..." : "Create your account"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px' }}>Social Sign-in</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Google */}
          <button
            className="google-btn"
            onClick={() => {
              if (!isClerkLoaded) return;
              clerkSignUp.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/login',
              });
            }}
            disabled={!isClerkLoaded}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Links */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 22 }}>
            Already a member?{" "}
            <Link to="/login" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
          </p>
          <p style={{ textAlign: 'center', fontSize: 10, color: '#334155', marginTop: 10, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            By proceeding, you agree to our{" "}
            <a href="#" style={{ color: '#4b5563', textDecoration: 'underline' }}>Terms</a> &{" "}
            <a href="#" style={{ color: '#4b5563', textDecoration: 'underline' }}>Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
