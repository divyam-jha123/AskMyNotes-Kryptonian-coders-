import React, { useMemo, useState, useRef, useEffect } from 'react';
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
    html {
      scroll-behavior: smooth;
    }
  `}</style>
);

/* ─── Main Component ─── */
const LandingPage = () => {
  const [rotation, setRotation] = useState({ x: -10, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const svgRef = useRef(null);

  const handleMove = React.useCallback((e) => {
    if (!isDragging) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;

    const deltaX = (clientX - dragStart.current.x) * 0.5;
    const deltaY = (clientY - dragStart.current.y) * 0.5;
    
    setRotation({
      x: dragStart.current.rotX - deltaY,
      y: dragStart.current.rotY + deltaX
    });
  }, [isDragging]);

  const startDragging = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    dragStart.current = { x: clientX, y: clientY, rotX: rotation.x, rotY: rotation.y };
    setIsDragging(true);
  };

  const stopDragging = React.useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', stopDragging);
    } else {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', stopDragging);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging, handleMove, stopDragging]);

  useEffect(() => {
    let frameId;
    const animate = () => {
      if (!isDragging) {
        setRotation(prev => ({
          x: prev.x + 0.12,
          y: prev.y + 0.18
        }));
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isDragging]);

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
            <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
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

          {/* ── Interactive 3D Network of Lines (The Neural Web) ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 0 60px',
            cursor: isDragging ? 'grabbing' : 'grab',
            perspective: '1200px',
            userSelect: 'none',
          }}
          onMouseDown={startDragging}
          onTouchStart={startDragging}
          >
            <div
              style={{
                width: 480,
                height: 480,
                position: 'relative',
                transformStyle: 'preserve-3d',
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transition: isDragging ? 'none' : 'transform 1s cubic-bezier(0.1, 0.9, 0.2, 1)',
              }}
            >
              {/* Central Core Glow */}
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 100, height: 100,
                background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%) translateZ(0px)',
                filter: 'blur(30px)',
              }} />

              {/* Subtle 3D Skeletal Sphere - With selective moving inner lines */}
              {useMemo(() => {
                const orbitCount = 24; 
                return Array.from({ length: orbitCount }, (_, i) => {
                  const rotY = (i / orbitCount) * 180;
                  const rotX = (i % 6) * 30;
                  const color = ['#7C3AED', '#3b82f6', '#06b6d4'][i % 3];
                  const radius = 160 + (i % 4) * 10;
                  const isMoving = i % 4 === 0; // Only animate some lines
                  
                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute', inset: -60,
                        transformStyle: 'preserve-3d',
                        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                      }}
                    >
                      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <circle 
                          cx="200" cy="200" r={radius} 
                          fill="none" 
                          stroke={color} 
                          strokeWidth="0.8" 
                          opacity={isMoving ? 0.35 : 0.15}
                          strokeDasharray={isMoving ? "60 120" : "none"}
                        >
                          {isMoving && (
                            <animate 
                              attributeName="stroke-dashoffset" 
                              from="540" to="0" 
                              dur="10s" 
                              repeatCount="indefinite" 
                            />
                          )}
                        </circle>
                        {/* Subtle secondary arc for depth */}
                        <path 
                          d={`M ${200 - radius} 200 A ${radius} ${radius} 0 0 1 ${200 + radius} 200`}
                          fill="none"
                          stroke={color}
                          strokeWidth="1.2"
                          opacity="0.25"
                        />
                      </svg>
                    </div>
                  );
                });
              }, [])}

              {/* Static Central Core Plate */}
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 100, height: 100,
                transform: 'translate(-50%, -50%) translateZ(0px)',
              }}>
                 <svg viewBox="0 0 400 400" width="100%" height="100%">
                    <circle cx="200" cy="200" r="8" fill="#7C3AED" opacity="0.3" />
                 </svg>
              </div>
            </div>
          </div>
        </header>

        {/* ── How It Works ── */}
        <section id="how-it-works" style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Workflow</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f1f5f9', margin: '12px 0 14px', letterSpacing: '-1px' }}>
                How it works
              </h2>
              <p style={{ color: '#64748b', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                Master any subject in three simple steps. No more guessing, just grounded learning.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, position: 'relative' }}>
              {/* Connecting lines for desktop */}
              <div style={{ 
                position: 'absolute', top: 45, left: '20%', right: '20%', height: 1, 
                background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)',
                zIndex: 0,
                display: 'block'
              }} className="mobile-hide" />

              {[
                { 
                  num: '01', 
                  title: 'Upload your PDF', 
                  desc: 'Just drag and drop your study material, lecture notes, or textbooks into the workspace.',
                  icon: <UploadCloud style={{ width: 24, height: 24, color: '#a78bfa' }} />
                },
                { 
                  num: '02', 
                  title: 'Ask your doubt', 
                  desc: 'Whatever your confusion regarding the PDF or any complex concept within it, just ask naturally.',
                  icon: <MessageSquare style={{ width: 24, height: 24, color: '#60a5fa' }} />
                },
                { 
                  num: '03', 
                  title: 'Get instant clarity', 
                  desc: 'The AI explains the concept using only your document as the source of truth, ensuring 100% accuracy.',
                  icon: <Zap style={{ width: 24, height: 24, color: '#22d3ee' }} />
                }
              ].map((step, i) => (
                <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', position: 'relative',
                    boxShadow: '0 0 30px rgba(124,58,237,0.1)'
                  }}>
                    <span style={{ 
                      position: 'absolute', top: -5, right: -5,
                      background: '#7C3AED', color: '#fff', fontSize: 10, fontWeight: 900,
                      padding: '4px 8px', borderRadius: 8,
                    }}>{step.num}</span>
                    {step.icon}
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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

        {/* ── Pricing ── */}
        <section id="pricing" style={{ padding: '80px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Pricing Plans</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f1f5f9', margin: '12px 0 14px', letterSpacing: '-1px' }}>
                Simple, transparent pricing for everyone
              </h2>
              <p style={{ color: '#64748b', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
                Choose the plan that fits your learning journey. From solo students to large institutions.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {[
                { 
                  name: 'Student', 
                  price: '0', 
                  period: '/ forever',
                  desc: 'Perfect for individual learners starting their journey.',
                  features: ['3 Subject Scopes', 'Basic AI Q&A', '100MB Storage', 'Community Support']
                },
                { 
                  name: 'Individual', 
                  price: '10', 
                  period: '/ month',
                  desc: 'Unlock full power with advanced AI and more storage.',
                  features: ['Unlimited Subjects', 'Advanced Grounding', '2GB Storage', 'Priority Email Support', 'Voice Interaction'],
                  popular: true
                },
                { 
                  name: 'Schools & Colleges', 
                  price: '15', 
                  period: '/ user / mo',
                  desc: 'Designed for high-impact institutional learning.',
                  features: ['Bulk User Management', 'LMS Integration', 'Unlimited Storage', 'Dedicated Success Manager', 'Advanced Analytics']
                }
              ].map((plan, i) => (
                <div key={i} className="card-dark" style={{
                  padding: '48px 40px', borderRadius: 32,
                  display: 'flex', flexDirection: 'column', gap: 32,
                  position: 'relative',
                  border: plan.popular ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  background: plan.popular ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.02)',
                }}>
                  {plan.popular && (
                    <div style={{
                      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                      background: '#7C3AED', color: '#fff', fontSize: 11, fontWeight: 800,
                      padding: '6px 16px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>Most Popular</div>
                  )}
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{plan.name}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{plan.desc}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '3rem', fontWeight: 900, color: '#fff' }}>${plan.price}</span>
                    <span style={{ fontSize: 14, color: '#64748b' }}>{plan.period}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ShieldCheck style={{ width: 18, height: 18, color: '#a78bfa' }} />
                        <span style={{ fontSize: 14, color: '#94a3b8' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/signup" className={plan.popular ? "btn-primary" : ""} style={{
                    marginTop: 'auto', textAlign: 'center', textDecoration: 'none',
                    padding: '14px 24px', borderRadius: 16, fontSize: 14, fontWeight: 700,
                    background: plan.popular ? undefined : 'rgba(255,255,255,0.05)',
                    color: plan.popular ? '#fff' : '#e2e8f0',
                    border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s'
                  }}>
                    {plan.price === '0' ? 'Get Started' : 'Start Free Trial'}
                  </Link>
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
