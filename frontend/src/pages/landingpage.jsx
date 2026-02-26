import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  MessageSquare,
  ShieldCheck,
  Mic,
  UploadCloud,
  AlertCircle,
  Zap,
  GraduationCap,
  Users,
  Clock,
  Star,
  Globe,
  Mail
} from 'lucide-react';

/* ─── Starfield helpers ─── */
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

const STAR_COUNT = 80;

const StarField = () => {
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      top: randomBetween(0, 100),
      left: randomBetween(0, 100),
      size: randomBetween(0.6, 2.4),
      duration: randomBetween(2.5, 7),
      delay: randomBetween(0, 6),
      opacity: randomBetween(0.4, 1),
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            backgroundColor: '#fff',
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite alternate`,
            boxShadow: `0 0 ${s.size * 2}px ${s.size}px rgba(255,255,255,0.3)`,
          }}
        />
      ))}
    </div>
  );
};

/* ─── CSS keyframes injected once ─── */
const GlobalStyles = () => (
  <style>{`
    @keyframes twinkle {
      0%   { opacity: 0.15; transform: scale(0.8); }
      100% { opacity: 1;    transform: scale(1.3); }
    }
    @keyframes shootingStar {
      0%   { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 1; }
      100% { transform: translateX(300px) translateY(200px) rotate(-35deg); opacity: 0; }
    }
    .shooting-star {
      position: fixed;
      width: 120px;
      height: 1px;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, #fff 50%, rgba(255,255,255,0) 100%);
      animation: shootingStar 3s ease-in-out infinite;
      pointer-events: none;
      z-index: 0;
    }
    .glow-purple {
      box-shadow: 0 0 40px 8px rgba(124,58,237,0.35), 0 0 80px 20px rgba(124,58,237,0.12);
    }
    .btn-primary {
      background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
      box-shadow: 0 4px 24px rgba(124,58,237,0.45);
      transition: box-shadow 0.2s, transform 0.15s;
    }
    .btn-primary:hover {
      box-shadow: 0 6px 32px rgba(124,58,237,0.65);
      transform: translateY(-1px);
    }
    .card-dark {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
    }
    .card-dark:hover {
      background: rgba(124,58,237,0.1);
      border-color: rgba(124,58,237,0.35);
      box-shadow: 0 0 24px rgba(124,58,237,0.2);
    }
    .nebula {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }
  `}</style>
);

/* ─── Main Component ─── */
const LandingPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#05050a',
        color: '#e2e8f0',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <GlobalStyles />

      {/* Starfield */}
      <StarField />

      {/* Shooting star */}
      <div className="shooting-star" style={{ top: '12%', left: '20%', animationDelay: '1s' }} />
      <div className="shooting-star" style={{ top: '35%', left: '60%', animationDelay: '5s' }} />

      {/* Nebula glows */}
      <div
        className="nebula"
        style={{ width: 600, height: 600, top: '-150px', left: '-150px', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }}
      />
      <div
        className="nebula"
        style={{ width: 500, height: 500, bottom: '10%', right: '-100px', background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="nebula"
        style={{ width: 400, height: 400, top: '40%', left: '40%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)' }}
      />

      {/* ── All content wrapped in relative z-10 ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 40px',
            maxWidth: '1280px',
            margin: '0 auto',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#7C3AED', padding: 8, borderRadius: 10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap style={{ color: '#fff', width: 22, height: 22 }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Smash AI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, fontWeight: 500 }}>
            <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseOver={e => e.target.style.color='#ffffff'}
               onMouseOut={e => e.target.style.color='#94a3b8'}>Features</a>
            <a href="#howit" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseOver={e => e.target.style.color='#ffffff'}
               onMouseOut={e => e.target.style.color='#94a3b8'}>How it Works</a>
            <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
               onMouseOver={e => e.target.style.color='#ffffff'}
               onMouseOut={e => e.target.style.color='#94a3b8'}>Pricing</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color='#ffffff'}
                  onMouseOut={e => e.currentTarget.style.color='#94a3b8'}>
              Log In
            </Link>
            <Link to="/signup" className="btn-primary" style={{
              fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none',
              padding: '10px 22px', borderRadius: 12,
            }}>
              Get Started
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <header style={{
          padding: '80px 40px 100px',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)',
              padding: '5px 14px', borderRadius: 999,
              color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              width: 'fit-content',
            }}>
              <Zap style={{ width: 11, height: 11 }} /> YOUR AI STUDY COPILOT
            </div>

            <h1 style={{
              fontSize: '3.8rem', fontWeight: 900, lineHeight: 1.08,
              letterSpacing: '-2px', color: '#f1f5f9', margin: 0,
            }}>
              Transform your lecture notes into{' '}
              <span style={{
                background: 'linear-gradient(90deg, #c084fc 0%, #a78bfa 30%, #818cf8 60%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontStyle: 'italic',
                paddingRight: '4px',
              }}>
                interactive sessions.
              </span>
            </h1>

            <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.7, maxWidth: 460, margin: 0 }}>
              Smash AI is your subject-scoped study copilot that turns static documents into
              dynamic learning experiences grounded in your curriculum.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <Link to="/signup" className="btn-primary" style={{
                color: '#fff', textDecoration: 'none', padding: '16px 30px',
                borderRadius: 16, fontWeight: 700, fontSize: 15,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                Get Started for Free <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <button style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', padding: '16px 28px', borderRadius: 16,
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
              >
                <Play style={{ width: 16, height: 16, fill: 'currentColor' }} /> Watch Demo
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex' }}>
                {[['JD','#7C3AED'],['AS','#3b82f6'],['ML','#6366f1']].map(([label, bg], i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: '50%', background: bg,
                    border: '2px solid #05050a', marginLeft: i > 0 ? -10 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#fff',
                  }}>{label}</div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                Joined by <span style={{ fontWeight: 700, color: '#e2e8f0' }}>10k+ students</span> this semester
              </p>
            </div>
          </div>

          {/* ── Nova Star Animation ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px 0 40px',
          }}>
            <svg viewBox="0 0 400 400" width="420" height="420" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="novaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="1" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="novaGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.6" />
                </linearGradient>
                <filter id="novaGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="novaGlowBig">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer rotating ring */}
              <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(124,58,237,0.1)" strokeWidth="0.5">
                <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="60s" repeatCount="indefinite" />
              </circle>
              <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="0.5" strokeDasharray="4 8">
                <animateTransform attributeName="transform" type="rotate" from="360 200 200" to="0 200 200" dur="45s" repeatCount="indefinite" />
              </circle>

              {/* 8-pointed nova star lines */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const innerR = 20;
                const outerR = 150;
                const x1 = 200 + Math.cos(rad) * innerR;
                const y1 = 200 + Math.sin(rad) * innerR;
                const x2 = 200 + Math.cos(rad) * outerR;
                const y2 = 200 + Math.sin(rad) * outerR;
                return (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="url(#novaGrad1)" strokeWidth="1.5" strokeLinecap="round"
                    filter="url(#novaGlow)" opacity="0"
                  >
                    <animate attributeName="opacity" values="0;0.9;0.5" dur="3s" begin={`${i * 0.3}s`} fill="freeze" />
                    <animate attributeName="strokeWidth" values="0;2.5;1.5" dur="3s" begin={`${i * 0.3}s`} fill="freeze" />
                  </line>
                );
              })}

              {/* Secondary shorter rays between main rays */}
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const innerR = 30;
                const outerR = 90;
                const x1 = 200 + Math.cos(rad) * innerR;
                const y1 = 200 + Math.sin(rad) * innerR;
                const x2 = 200 + Math.cos(rad) * outerR;
                const y2 = 200 + Math.sin(rad) * outerR;
                return (
                  <line key={`s${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="url(#novaGrad2)" strokeWidth="1" strokeLinecap="round"
                    filter="url(#novaGlow)" opacity="0"
                  >
                    <animate attributeName="opacity" values="0;0.6;0.3" dur="2.5s" begin={`${2.4 + i * 0.2}s`} fill="freeze" />
                  </line>
                );
              })}

              {/* Connecting diamond shape */}
              <polygon
                points="200,60 340,200 200,340 60,200"
                fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="0.8"
                strokeDasharray="600" strokeDashoffset="600"
              >
                <animate attributeName="stroke-dashoffset" from="600" to="0" dur="4s" begin="1s" fill="freeze" />
              </polygon>

              {/* Inner octagon */}
              <polygon
                points="200,120 256,144 280,200 256,256 200,280 144,256 120,200 144,144"
                fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="0.6"
                strokeDasharray="500" strokeDashoffset="500"
              >
                <animate attributeName="stroke-dashoffset" from="500" to="0" dur="3.5s" begin="2s" fill="freeze" />
              </polygon>

              {/* Center pulsing orb */}
              <circle cx="200" cy="200" r="8" fill="#7C3AED" filter="url(#novaGlowBig)" opacity="0">
                <animate attributeName="opacity" values="0;1" dur="1s" begin="0.5s" fill="freeze" />
                <animate attributeName="r" values="5;12;8" dur="3s" begin="0.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="200" cy="200" r="4" fill="#c084fc" opacity="0">
                <animate attributeName="opacity" values="0;1" dur="1s" begin="0.8s" fill="freeze" />
              </circle>

              {/* Tiny orbiting dots */}
              {[0, 120, 240].map((startAngle, i) => (
                <circle key={`orb${i}`} cx="200" cy="200" r="2"
                  fill={['#c084fc', '#67e8f9', '#a78bfa'][i]}
                  filter="url(#novaGlow)" opacity="0.7"
                >
                  <animateMotion
                    path={`M0,0 a${80 + i * 30},${80 + i * 30} 0 1,1 0.01,0`}
                    dur={`${8 + i * 4}s`} begin={`${3 + i}s`} repeatCount="indefinite"
                  />
                </circle>
              ))}

              {/* Endpoint dots on rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const cx = 200 + Math.cos(rad) * 150;
                const cy = 200 + Math.sin(rad) * 150;
                return (
                  <circle key={`dot${i}`} cx={cx} cy={cy} r="2.5"
                    fill="#a78bfa" filter="url(#novaGlow)" opacity="0"
                  >
                    <animate attributeName="opacity" values="0;0.8" dur="1s" begin={`${i * 0.3 + 2}s`} fill="freeze" />
                    <animate attributeName="r" values="2;3.5;2" dur="4s" begin={`${i * 0.3 + 2}s`} repeatCount="indefinite" />
                  </circle>
                );
              })}
            </svg>
          </div>
        </header>

        {/* ── Features ── */}
        <section id="features" style={{
          padding: '80px 40px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Features</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f1f5f9', margin: '12px 0 14px', letterSpacing: '-1px' }}>
                Study smarter with AI grounded in your own notes
              </h2>
              <p style={{ color: '#64748b', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                Experience a new way of learning that is accurate, interactive, and personalized to your curriculum.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { icon: <MessageSquare style={{ width: 22, height: 22, color: '#a78bfa' }} />, title: 'Subject-Scoped Q&A', desc: "Select a specific subject, lecture, or textbook chapter and start a focused chat session. The AI won't hallucinate or use outside info." },
                { icon: <ShieldCheck style={{ width: 22, height: 22, color: '#a78bfa' }} />, title: 'Grounded Responses', desc: 'Every answer comes with citations, confidence levels, and direct evidence snippets from your materials. Never doubt the accuracy.' },
                { icon: <Mic style={{ width: 22, height: 22, color: '#a78bfa' }} />, title: 'Voice Interaction', desc: 'Ask questions naturally and listen to detailed explanations on the go. Perfect for reviewing during commutes or hands-free study.' },
              ].map((f, i) => (
                <div key={i} className="card-dark" style={{
                  padding: '36px 32px', borderRadius: 24,
                  transition: 'all 0.25s', cursor: 'default',
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section style={{ padding: '80px 40px' }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', margin: 0 }}>
                Your curriculum is unique.<br />Your AI should be too.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[
                  { icon: <UploadCloud />, title: 'Upload Anything', desc: 'PDFs, PowerPoints, handwritten notes, or textbook scans. We parse them all with advanced OCR.' },
                  { icon: <AlertCircle />, title: 'Zero Hallucinations', desc: 'The AI is "scoped" to your document. If it\'s not in your notes, the copilot will tell you exactly that.' },
                  { icon: <Zap />, title: 'AI Flashcards & Summaries', desc: 'Automatically generate study guides and active recall tests based on the core concepts in your notes.' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {React.cloneElement(item.icon, { style: { width: 18, height: 18, color: '#a78bfa' } })}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', margin: '0 0 4px' }}>{item.title}</h4>
                      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Average user goal', val: '9 CGPA', icon: <GraduationCap /> },
                { label: 'Universities', val: '500+', icon: <Users /> },
                { label: 'Saved per week', val: '2.5 hrs', icon: <Clock /> },
                { label: 'User rating', val: '4.9/5', icon: <Star /> },
              ].map((s, i) => (
                <div key={i} className="card-dark" style={{
                  padding: '28px 24px', borderRadius: 22, transition: 'all 0.25s',
                }}>
                  <div style={{ marginBottom: 14, opacity: 0.6 }}>
                    {React.cloneElement(s.icon, { style: { width: 22, height: 22, color: '#a78bfa' } })}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '60px 40px 100px' }}>
          <div style={{
            maxWidth: '900px', margin: '0 auto',
            background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.22) 0%, rgba(5,5,10,0.9) 70%)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 40, padding: '72px 40px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            {/* glow ring */}
            <div style={{
              position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
              width: 300, height: 300,
              background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
              borderRadius: '50%', pointerEvents: 'none',
            }} />
            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#f1f5f9', marginBottom: 16, letterSpacing: '-1.5px', position: 'relative' }}>
              Ready to ace your next exam?
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.6, position: 'relative' }}>
              Join thousands of students already using Smash AI to study smarter, faster, and more effectively.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', position: 'relative' }}>
              <Link to="/signup" className="btn-primary" style={{
                color: '#fff', textDecoration: 'none',
                padding: '16px 36px', borderRadius: 16, fontWeight: 700, fontSize: 16,
              }}>
                Get Started for Free
              </Link>
              <button style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', padding: '16px 32px', borderRadius: 16,
                fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
              >
                Contact Sales
              </button>
            </div>
            <p style={{ marginTop: 20, fontSize: 12, color: '#334155', position: 'relative' }}>No credit card required. Free plan includes 3 subjects.</p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          padding: '48px 40px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          maxWidth: '1280px', margin: '0 auto',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: '#7C3AED', padding: 6, borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Zap style={{ color: '#fff', width: 16, height: 16 }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>Smash AI</span>
              </div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                The ultimate AI companion for students who take their learning seriously.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <Globe style={{ width: 18, height: 18, color: '#475569', cursor: 'pointer' }} />
                <Mail style={{ width: 18, height: 18, color: '#475569', cursor: 'pointer' }} />
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Chrome Extension', 'Mobile App', 'Integrations'] },
              { title: 'Resources', links: ['Study Guide', 'Blog', 'Help Center', 'Student Discounts'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 18 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" style={{ fontSize: 13, color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                         onMouseOver={e => e.target.style.color='#a78bfa'}
                         onMouseOut={e => e.target.style.color='#475569'}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{
            paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 12, color: '#334155',
          }}>
            <p style={{ margin: 0 }}>© 2026 Smash AI Inc. All rights reserved.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Globe style={{ width: 14, height: 14 }} />
              <Zap style={{ width: 14, height: 14 }} />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
