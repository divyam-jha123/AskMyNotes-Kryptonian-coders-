import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { login } from "../api/auth";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess(`Welcome back, ${data.user.username}!`);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#05050a',
      color: '#e2e8f0',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .login-input {
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
        }
        .login-input::placeholder { color: #4b5563; }
        .login-input:focus {
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
      `}</style>

      {/* Nebula glows */}
      <div style={{
        position: 'fixed', width: 500, height: 500, top: '-150px', right: '-100px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', width: 400, height: 400, bottom: '-80px', left: '-80px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Navigation */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', position: 'relative', zIndex: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ background: '#7C3AED', padding: 8, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ color: '#fff', width: 20, height: 20 }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>AskMyNotes</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Don't have an account?</span>
          <Link to="/signup" style={{
            padding: '8px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: '#7C3AED', color: '#fff', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)', transition: 'all 0.2s',
          }}>Sign Up</Link>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '100%', maxWidth: 420, padding: '36px 32px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          borderRadius: 24,
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
          animation: 'heroFadeIn 0.7s ease-out both',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>Welcome Back</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Please enter your details to sign in to your account.</p>
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Email or Username</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#4b5563' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#4b5563' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563',
                  transition: 'color 0.2s', display: 'flex',
                }}
                  onMouseOver={e => e.currentTarget.style.color = '#e2e8f0'}
                  onMouseOut={e => e.currentTarget.style.color = '#4b5563'}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Keep signed in */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} style={{ accentColor: '#7C3AED', width: 16, height: 16 }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Keep me signed in</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 6px 24px rgba(124,58,237,0.4)',
              transition: 'all 0.2s',
              fontFamily: "'Inter', sans-serif",
            }}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Bottom link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 22 }}>
            New to AskMyNotes?{" "}
            <Link to="/signup" style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none' }}>Create an account</Link>
          </p>

          {/* Footer links */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 20, paddingTop: 18,
            marginTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {["Privacy Policy", "Terms of Service", "Help Center"].map((item) => (
              <a key={item} href="#" style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                color: '#334155', textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseOut={e => e.currentTarget.style.color = '#334155'}
              >{item}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: 11, color: '#1e293b', padding: '16px 0', position: 'relative', zIndex: 1 }}>
        © 2026 AskMyNotes. All rights reserved.
      </p>
    </div>
  );
};

export default Login;