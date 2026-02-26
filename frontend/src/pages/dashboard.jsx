import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, ArrowRight, Monitor, Smartphone, Zap,
  UploadCloud, Trash2, Loader2, RefreshCw, CheckCircle2,
  ThumbsUp, ThumbsDown, Edit3, Eye, ExternalLink,
  History, ChevronLeft, ChevronRight, FileText, Mic, BookOpen, LogOut, X, Gift, MoreVertical,
  Volume2, VolumeX, MicOff, Phone, PhoneOff
} from 'lucide-react';
import {
  getSubjects, createSubject,
  uploadNote, deleteNote,
  sendMessage, getChatHistory, getAllChatHistories, clearChatHistory,
} from '../api/askMyNotes';

// ─── Confidence Badge ───
const ConfidenceBadge = ({ level }) => {
  const colors = {
    High: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Low: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${colors[level] || colors.Low}`}>
      {level}
    </span>
  );
};

/* ─── Helper ─── */
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/* ─── 10 Slow-Moving Stars ─── */
const SLOW_STAR_COUNT = 10;

const SlowStars = () => {
  const stars = useMemo(() => {
    return Array.from({ length: SLOW_STAR_COUNT }, (_, i) => ({
      id: i,
      top: randomBetween(5, 90),
      left: randomBetween(5, 95),
      size: randomBetween(1.5, 3),
      duration: randomBetween(20, 45),
      delay: randomBetween(0, 10),
      dx: randomBetween(-60, 60),
      dy: randomBetween(-40, 40),
      opacity: randomBetween(0.4, 0.9),
      hue: ['#fff', '#c4b5fd', '#93c5fd', '#a78bfa', '#e0e7ff'][Math.floor(Math.random() * 5)],
    }));
  }, []);

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
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
            backgroundColor: s.hue,
            opacity: s.opacity,
            boxShadow: `0 0 ${s.size * 3}px ${s.size}px rgba(255,255,255,0.25)`,
            animation: `slowDrift${s.id} ${s.duration}s ${s.delay}s linear infinite alternate`,
          }}
        />
      ))}
      <style>{stars.map(s => `
        @keyframes slowDrift${s.id} {
          0%   { transform: translate(0, 0); opacity: ${s.opacity}; }
          50%  { opacity: ${Math.min(1, s.opacity + 0.3)}; }
          100% { transform: translate(${s.dx}vw, ${s.dy}vh); opacity: ${s.opacity * 0.6}; }
        }
      `).join('')}</style>
    </div>
  );
};

/* ─── Relative time helper ─── */
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const StitchInterface = () => {
  const [device, setDevice] = useState('app');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Backend state
  const [subjectId, setSubjectId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [chatHistories, setChatHistories] = useState([]);

  // Voice conversation mode
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const voiceModeRef = useRef(false); // ref to track active state in async callbacks

  const MAX_CHARS = 1000;

  // Auto-create or load a default subject on mount
  useEffect(() => {
    initSubject();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  // ─── Voice Conversation Engine ───
  function startVoiceMode() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }
    if (!window.speechSynthesis) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }
    if (!subjectId || uploadedFiles.length === 0) {
      setError('Please upload notes first before starting voice chat.');
      return;
    }

    setVoiceModeActive(true);
    voiceModeRef.current = true;
    voiceListen();
  }

  function stopVoiceMode() {
    voiceModeRef.current = false;
    setVoiceModeActive(false);
    setVoiceState('idle');
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  function voiceListen() {
    if (!voiceModeRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!voiceModeRef.current) return;
      setIsListening(true);
      setVoiceState('listening');
    };

    recognition.onresult = (event) => {
      if (!voiceModeRef.current) return;
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setVoiceState('thinking');

      // Add user message
      setMessages((prev) => [...prev, { role: 'user', content: transcript.trim() }]);
      setSending(true);

      // Send to AI
      sendMessage(subjectId, transcript.trim()).then((answer) => {
        if (!voiceModeRef.current) { setSending(false); return; }
        const answerText = typeof answer.answer === 'string'
          ? answer.answer
          : (answer.answer?.answer || JSON.stringify(answer));

        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: answerText,
          citations: answer.citations || [],
          confidence: answer.confidence || 'Low',
          evidence: answer.evidence || [],
        }]);
        setSending(false);

        // Speak the response, then listen again
        voiceSpeak(answerText);
      }).catch((err) => {
        if (!voiceModeRef.current) { setSending(false); return; }
        const errMsg = `Sorry, I encountered an error: ${err.message}`;
        setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
        setSending(false);
        voiceSpeak(errMsg);
      }).finally(() => {
        refreshHistories();
      });
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions.');
        stopVoiceMode();
        return;
      }
      // On no-speech or other errors, try listening again
      if (voiceModeRef.current && event.error !== 'aborted') {
        setTimeout(() => voiceListen(), 500);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function voiceSpeak(text) {
    if (!voiceModeRef.current) return;

    // Parse JSON if needed
    let cleanText = text;
    if (typeof text === 'string' && text.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        cleanText = parsed.answer || text;
      } catch { /* use original */ }
    }

    setVoiceState('speaking');
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      // After speaking, listen again (continuous loop)
      if (voiceModeRef.current) {
        setTimeout(() => voiceListen(), 300);
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (voiceModeRef.current) {
        setTimeout(() => voiceListen(), 300);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  // ─── Manual TTS for individual messages ───
  function handleSpeak(text, msgIndex) {
    if (!window.speechSynthesis) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking && speakingMsgIndex === msgIndex) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    let cleanText = text;
    if (typeof text === 'string' && text.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        cleanText = parsed.answer || text;
      } catch { /* use original */ }
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMsgIndex(msgIndex);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  }

  async function initSubject() {
    try {
      const subList = await getSubjects();
      setSubjects(subList);
      if (subList.length > 0) {
        // Try to restore the last active subject from localStorage
        const savedId = localStorage.getItem('activeSubjectId');
        const activeSubject = savedId ? subList.find(s => s._id === savedId) : null;
        const targetSubject = activeSubject || subList[subList.length - 1];
        setSubjectId(targetSubject._id);
        localStorage.setItem('activeSubjectId', targetSubject._id);
        // Load chat history for the target subject
        try {
          const history = await getChatHistory(targetSubject._id);
          setMessages(history || []);
        } catch {
          setMessages([]);
        }
        setUploadedFiles(targetSubject.notes || []);
      } else {
        const subject = await createSubject('My Notes');
        setSubjects([subject]);
        setSubjectId(subject._id);
        localStorage.setItem('activeSubjectId', subject._id);
        setMessages([]);
        setUploadedFiles([]);
      }
      // Fetch all chat histories for sidebar
      const histories = await getAllChatHistories();
      setChatHistories(histories);
    } catch (err) {
      console.error('Init subject error:', err);
    }
  }

  async function loadConversation(historySubjectId) {
    try {
      setSubjectId(historySubjectId);
      localStorage.setItem('activeSubjectId', historySubjectId);
      const history = await getChatHistory(historySubjectId);
      setMessages(history);
      // Also load the subject's files
      const sub = subjects.find(s => s._id === historySubjectId);
      if (sub) setUploadedFiles(sub.notes || []);
    } catch (err) {
      console.error('Load conversation error:', err);
    }
  }

  async function refreshHistories() {
    try {
      const histories = await getAllChatHistories();
      setChatHistories(histories);
    } catch (err) {
      console.error('Refresh histories error:', err);
    }
  }

  // ─── File upload ───
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function processUpload(file) {
    if (!subjectId) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'txt'].includes(ext)) {
      setError('Only PDF and TXT files are supported.');
      return;
    }
    try {
      setUploading(true);
      setError('');
      const result = await uploadNote(subjectId, file);
      setUploadedFiles((prev) => [...prev, { _id: result.noteId, originalName: result.originalName }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteNote(noteId) {
    if (!subjectId) return;
    try {
      await deleteNote(subjectId, noteId);
      setUploadedFiles((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      setError(err.message);
    }
  }

  // ─── Chat ───
  async function handleSend() {
    if (!input.trim() || !subjectId || sending) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    try {
      setSending(true);
      const answer = await sendMessage(subjectId, question);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: typeof answer.answer === 'string' ? answer.answer : (answer.answer?.answer || JSON.stringify(answer)),
        citations: answer.citations || [],
        confidence: answer.confidence || 'Low',
        evidence: answer.evidence || [],
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setSending(false);
      refreshHistories();
    }
  }

  const suggestions = [
    "Summarize the key concepts from my notes",
    "What are the most important topics covered?",
    "Explain the technical terms mentioned in the file",
    "List the main action items or takeaways"
  ];

  async function handleNewChat() {
    try {
      // 1. Refresh sidebar so current conversation appears in history
      await refreshHistories();
      // 2. Create a new subject for the fresh chat
      const newSubject = await createSubject(`Chat ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
      setSubjects((prev) => [...prev, newSubject]);
      setSubjectId(newSubject._id);
      localStorage.setItem('activeSubjectId', newSubject._id);
      // 3. Clear the UI for a fresh chat
      setMessages([]);
      setUploadedFiles([]);
      setInput('');
      setError('');
    } catch (err) {
      console.error('New chat error:', err);
      setError('Could not create new chat. Try again.');
    }
  }

  return (
    <>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#05050a',
        color: '#e2e8f0',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        <style>{`
        @keyframes twinkle { 0% { opacity: 0.15; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.3); } }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .card-glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        .card-glass:hover {
          border-color: rgba(124,58,237,0.35);
          box-shadow: 0 0 20px rgba(124,58,237,0.1);
        }
        .btn-purple {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
          transition: all 0.2s ease;
        }
        .btn-purple:hover {
          box-shadow: 0 6px 32px rgba(124,58,237,0.6);
          transform: translateY(-1px);
        }
        .sidebar-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .sidebar-item:hover {
          border-color: rgba(124,58,237,0.3);
          background: rgba(124,58,237,0.06);
        }
        .suggestion-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 16px 18px;
          font-size: 13px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.25s;
          text-align: left;
          line-height: 1.5;
        }
        .suggestion-btn:hover {
          border-color: rgba(124,58,237,0.4);
          color: #e2e8f0;
          background: rgba(124,58,237,0.08);
          transform: translateY(-2px);
        }
        .input-glow {
          position: relative;
        }
        .input-glow::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2), rgba(56,189,248,0.15));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.5s;
        }
        .input-glow:focus-within::before {
          opacity: 1;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        @keyframes micPulse {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        .mic-listening {
          animation: micPulse 1.2s ease-out infinite;
          background: rgba(239,68,68,0.2) !important;
          border-color: rgba(239,68,68,0.5) !important;
        }
        @keyframes voiceRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes voiceBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes voiceWave {
          0%, 100% { height: 12px; }
          50% { height: 32px; }
        }
      `}</style>

        <SlowStars />

        {/* Nebula glows */}
        <div style={{
          position: 'fixed', width: 500, height: 500, top: '-100px', left: '-100px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', width: 400, height: 400, bottom: '10%', right: '-80px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* ─── SIDEBAR ─── */}
        <aside style={{
          position: 'relative',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(5,5,12,0.95)',
          backdropFilter: 'blur(16px)',
          transition: 'width 0.3s ease',
          width: isSidebarOpen ? 260 : 0,
          overflow: 'hidden',
          zIndex: 10,
          flexShrink: 0,
        }}>
          <div style={{ padding: 24, width: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <History style={{ width: 18, height: 18, color: '#a78bfa' }} />
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Chat History</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }} className="scrollbar-thin">
              {chatHistories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <History style={{ width: 32, height: 32, color: '#374151', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: '#4b5563', margin: 0 }}>No conversations yet</p>
                  <p style={{ fontSize: 11, color: '#374151', marginTop: 6 }}>Upload notes & start chatting!</p>
                </div>
              ) : (
                chatHistories.map((h) => (
                  <div
                    key={h._id}
                    onClick={() => loadConversation(h.subjectId)}
                    className="sidebar-item"
                    style={{
                      animation: 'fadeInUp 0.3s ease',
                      borderColor: subjectId === h.subjectId ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.06)',
                      background: subjectId === h.subjectId ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <p style={{ fontSize: 12, color: '#fff', margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>
                        {h.subjectName}
                      </p>
                      <span style={{ fontSize: 9, color: '#4b5563', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {timeAgo(h.updatedAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                      {h.lastMessageRole === 'user' ? 'You: ' : ''}{h.lastMessage || 'No messages'}
                    </p>
                    <p style={{ fontSize: 9, color: '#374151', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {h.messageCount} messages
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', position: 'relative', zIndex: 1 }} className="scrollbar-thin">

          {/* Sidebar toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              zIndex: 50, padding: 6, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
              color: '#94a3b8', cursor: 'pointer', display: 'flex', transition: 'all 0.2s',
            }}
          >
            {isSidebarOpen ? <ChevronLeft style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
          </button>

          {/* Navigation */}
          <nav style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '24px 40px', maxWidth: '1280px', margin: '0 auto', width: '100%',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#7C3AED', padding: 8, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap style={{ color: '#fff', width: 22, height: 22 }} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Smash AI</span>
              <span style={{
                background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                fontSize: 9, padding: '3px 8px', borderRadius: 999, color: '#a78bfa',
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>BETA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Home</Link>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: '#94a3b8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              }}>
                <LogOut size={14} /> Sign Out
              </button>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED, #3b82f6, #10b981)',
                border: '2px solid rgba(255,255,255,0.15)',
              }} />
            </div>
          </nav>

          {/* Main Area */}
          <main style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '32px 40px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h2 style={{
                fontSize: '2.2rem', fontWeight: 900, color: '#f1f5f9', margin: 0,
                letterSpacing: '-1px', lineHeight: 1.2,
                animation: 'heroFadeIn 0.8s ease-out both',
              }}>
                Chat with Your{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #c084fc, #818cf8, #67e8f9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Notes</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 10, animation: 'heroFadeIn 0.8s 0.25s ease-out both' }}>
                Upload PDFs or TXT files and ask questions to the AI.
              </p>
            </div>

            {/* ─── File Drop Area ─── */}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.txt" style={{ display: 'none' }} />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="card-glass"
              style={{
                width: '100%', marginBottom: 32,
                border: `2px dashed ${isDragging ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 24, padding: '40px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                background: isDragging ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{
                padding: 12, borderRadius: '50%', marginBottom: 12,
                background: isDragging ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
              }}>
                {uploading ? <Loader2 size={32} className="animate-spin text-purple-400" /> : <UploadCloud size={32} style={{ color: isDragging ? '#a78bfa' : '#4b5563' }} />}
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', margin: 0 }}>
                {uploading ? 'Processing file...' : <>Drop files here or <span style={{ color: '#a78bfa', fontWeight: 700 }}>browse</span></>}
              </p>
              <p style={{ fontSize: 11, color: '#334145', marginTop: 8 }}>PDF or TXT files supported</p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                width: '100%', marginBottom: 20, padding: '12px 16px', borderRadius: 12,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
              }}>
                <p style={{ margin: 0, flex: 1 }}>{error}</p>
                <X size={16} onClick={() => setError('')} style={{ cursor: 'pointer', opacity: 0.7 }} />
              </div>
            )}

            {/* ─── Chat Messages Area ─── */}
            {messages.length > 0 && (
              <div style={{ width: '100%', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                      <div className="card-glass" style={{
                        maxWidth: '85%', padding: '16px 20px',
                        background: isUser ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                        borderColor: isUser ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)',
                        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      }}>
                        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                          {(() => {
                            const content = msg.content || '';
                            if (typeof content === 'string' && content.trim().startsWith('{')) {
                              try {
                                const parsed = JSON.parse(content);
                                return parsed.answer || content;
                              } catch {
                                return content;
                              }
                            }
                            return content;
                          })()}
                        </p>
                        {!isUser && msg.citations?.length > 0 && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {msg.confidence && <ConfidenceBadge level={msg.confidence} />}
                            {msg.citations.map((c, j) => (
                              <span key={j} style={{
                                fontSize: 10, color: '#3b82f6', background: 'rgba(59,130,246,0.1)',
                                padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(59,130,246,0.2)',
                                display: 'flex', alignItems: 'center', gap: 4
                              }}>
                                <FileText size={10} /> {c.file}{c.page ? `:p${c.page}` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                        {!isUser && msg.evidence?.length > 0 && (
                          <details style={{ marginTop: 8 }}>
                            <summary style={{ fontSize: 11, color: '#4b5563', cursor: 'pointer' }}>View evidence</summary>
                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {msg.evidence.map((e, j) => (
                                <p key={j} style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 8 }}>"{e}"</p>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                      {/* Speaker button for AI messages */}
                      {!isUser && (
                        <button
                          onClick={() => handleSpeak(msg.content, i)}
                          style={{
                            marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 10, fontSize: 11,
                            background: (isSpeaking && speakingMsgIndex === i) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                            border: '1px solid ' + ((isSpeaking && speakingMsgIndex === i) ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'),
                            color: (isSpeaking && speakingMsgIndex === i) ? '#a78bfa' : '#64748b',
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                        >
                          {(isSpeaking && speakingMsgIndex === i)
                            ? <><VolumeX size={14} /> Stop</>
                            : <><Volume2 size={14} /> Listen</>}
                        </button>
                      )}
                    </div>
                  );
                })}
                {sending && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div className="card-glass" style={{ padding: '12px 20px', borderRadius: '20px 20px 20px 4px' }}>
                      <Loader2 size={18} className="animate-spin text-purple-400" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {/* ─── Input Box Area ─── */}
            <div className="input-glow" style={{ width: '100%', marginTop: 20 }}>
              <div className="card-glass" style={{
                borderRadius: 24, padding: '24px', minHeight: 180,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
              }}>

                {/* Attached file cards inside input area */}
                {uploadedFiles.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    {uploadedFiles.map((f) => (
                      <div key={f._id} style={{
                        position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        padding: 10, borderRadius: 16, minWidth: 240, maxWidth: 300,
                      }}>
                        <div style={{ width: 40, height: 40, background: '#3b82f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={20} color="#fff" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</p>
                          <p style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Document</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteNote(f._id); }}
                          style={{
                            position: 'absolute', top: -8, right: -8, width: 20, height: 20,
                            borderRadius: '50%', background: '#fff', border: 'none', color: '#000',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  disabled={sending}
                  placeholder={uploadedFiles.length === 0 ? "Upload notes first to start chatting..." : "Ask anything about your notes..."}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 16, color: '#f1f5f9', resize: 'none', width: '100%', height: 80,
                    fontFamily: "'Inter', sans-serif", lineHeight: 1.6,
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        padding: 10, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.03)', color: '#94a3b8', cursor: 'pointer',
                        display: 'flex', transition: 'all 0.2s'
                      }}
                    >
                      <Plus size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(45deg, #a855f7, #10b981)' }} />
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Gemini Flash</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={handleNewChat}
                      style={{
                        padding: '10px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.color = '#e2e8f0'; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      <RefreshCw size={14} /> New Chat
                    </button>
                    <button
                      onClick={startVoiceMode}
                      disabled={uploadedFiles.length === 0}
                      style={{
                        padding: '10px 16px', borderRadius: 14,
                        border: '1px solid rgba(124,58,237,0.3)',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))',
                        color: '#a78bfa',
                        cursor: uploadedFiles.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                        opacity: uploadedFiles.length === 0 ? 0.4 : 1,
                        fontWeight: 600, fontSize: 13,
                      }}
                      title="Start voice conversation"
                    >
                      <Mic size={16} /> Voice Chat
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending || uploadedFiles.length === 0}
                      className="btn-purple"
                      style={{
                        padding: '12px 24px', borderRadius: 14, border: 'none', color: '#fff',
                        fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.3s',
                        display: 'flex', alignItems: 'center', gap: 8,
                        opacity: (!input.trim() || sending || uploadedFiles.length === 0) ? 0.4 : 1,
                      }}
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Ask AI</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </main>

          {/* Suggestion Prompts */}
          <div style={{ width: '100%', marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {suggestions.map((text, i) => (
              <button
                key={i}
                onClick={() => setInput(text)}
                className="suggestion-btn"
                disabled={uploadedFiles.length === 0}
                style={{ opacity: uploadedFiles.length === 0 ? 0.3 : 1, cursor: uploadedFiles.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                {text}
              </button>
            ))}
          </div>

        </div>{/* close MAIN CONTENT div */}
      </div>{/* close root layout div */}

      {/* Voice Conversation Overlay */}
      {voiceModeActive && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(5,5,15,0.96)',
          backdropFilter: 'blur(30px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'heroFadeIn 0.4s ease-out',
        }}>
          {/* Close button */}
          <button
            onClick={stopVoiceMode}
            style={{
              position: 'absolute', top: 32, right: 32,
              padding: '12px 20px', borderRadius: 14,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}
          >
            <PhoneOff size={18} /> End Call
          </button>

          {/* Voice state indicator */}
          <div style={{ position: 'relative', marginBottom: 48 }}>
            {/* Pulsing rings */}
            {voiceState === 'listening' && (
              <>
                <div style={{
                  position: 'absolute', inset: -20,
                  borderRadius: '50%', border: '2px solid rgba(124,58,237,0.3)',
                  animation: 'voiceRing 2s ease-out infinite',
                }} />
                <div style={{
                  position: 'absolute', inset: -20,
                  borderRadius: '50%', border: '2px solid rgba(124,58,237,0.2)',
                  animation: 'voiceRing 2s 0.5s ease-out infinite',
                }} />
                <div style={{
                  position: 'absolute', inset: -20,
                  borderRadius: '50%', border: '2px solid rgba(124,58,237,0.1)',
                  animation: 'voiceRing 2s 1s ease-out infinite',
                }} />
              </>
            )}

            {/* Center mic circle */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: voiceState === 'listening'
                ? 'linear-gradient(135deg, #7C3AED, #3b82f6)'
                : voiceState === 'thinking'
                  ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                  : voiceState === 'speaking'
                    ? 'linear-gradient(135deg, #10b981, #3b82f6)'
                    : 'linear-gradient(135deg, #374151, #1f2937)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: voiceState === 'listening'
                ? '0 0 60px rgba(124,58,237,0.4)'
                : voiceState === 'thinking'
                  ? '0 0 60px rgba(245,158,11,0.3)'
                  : voiceState === 'speaking'
                    ? '0 0 60px rgba(16,185,129,0.3)'
                    : '0 0 30px rgba(0,0,0,0.3)',
              animation: voiceState !== 'idle' ? 'voiceBreathe 2s ease-in-out infinite' : 'none',
              transition: 'all 0.5s ease',
            }}>
              {voiceState === 'listening' && <Mic size={48} color="#fff" />}
              {voiceState === 'thinking' && <Loader2 size={48} color="#fff" className="animate-spin" />}
              {voiceState === 'speaking' && <Volume2 size={48} color="#fff" />}
              {voiceState === 'idle' && <Mic size={48} color="#9ca3af" />}
            </div>
          </div>

          {/* Voice state text */}
          <h2 style={{
            fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px',
            color: voiceState === 'listening' ? '#a78bfa'
              : voiceState === 'thinking' ? '#fbbf24'
                : voiceState === 'speaking' ? '#34d399'
                  : '#6b7280',
            transition: 'color 0.3s',
          }}>
            {voiceState === 'listening' && 'Listening...'}
            {voiceState === 'thinking' && 'Thinking...'}
            {voiceState === 'speaking' && 'Speaking...'}
            {voiceState === 'idle' && 'Starting...'}
          </h2>
          <p style={{ fontSize: 14, color: '#4b5563', marginTop: 12, maxWidth: 400, textAlign: 'center' }}>
            {voiceState === 'listening' && 'Speak your question now. I\'m listening.'}
            {voiceState === 'thinking' && 'Processing your question with AI...'}
            {voiceState === 'speaking' && 'I\'m reading the answer aloud. I\'ll listen again after.'}
            {voiceState === 'idle' && 'Initializing voice mode...'}
          </p>

          {/* Audio wave visualization for speaking */}
          {voiceState === 'speaking' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 32 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 4, borderRadius: 4,
                    background: 'linear-gradient(to top, #10b981, #34d399)',
                    animation: `voiceWave 0.8s ${i * 0.1}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Listening wave visualization */}
          {voiceState === 'listening' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 32 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 4, borderRadius: 4,
                    background: 'linear-gradient(to top, #7C3AED, #a78bfa)',
                    animation: `voiceWave 1s ${i * 0.12}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Branding at bottom */}
          <div style={{ position: 'absolute', bottom: 40, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
            <Zap size={16} color="#a78bfa" />
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Smash AI Voice</span>
          </div>
        </div>
      )}
    </>
  );
};

export default StitchInterface;

