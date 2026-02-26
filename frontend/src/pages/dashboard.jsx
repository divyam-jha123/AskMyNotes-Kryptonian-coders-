import React, { useState } from 'react';
import { 
  Plus, ArrowRight, Monitor, Smartphone, BookOpen, 
  Gift, MoreVertical, X, UploadCloud, FileText 
} from 'lucide-react';

const StitchInterface = () => {
  const [device, setDevice] = useState('app');
  const [isDragging, setIsDragging] = useState(false);

  // Handlers for the file drop box
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-gray-300 font-sans p-6 selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="flex justify-between items-center max-w-7xl mx-auto mb-16">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">Smash</span>
          <span className="bg-gray-800 text-[10px] px-2 py-0.5 rounded-full text-gray-400">BETA</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 hover:text-white transition-colors"><BookOpen size={18}/> Docs</button>
          <button className="hover:text-white transition-colors">Discord</button>
          <button className="hover:text-white transition-colors">X</button>
          <button className="relative hover:text-white transition-colors">
            <Gift size={20}/>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></span>
          </button>
          <MoreVertical size={20} className="cursor-pointer" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-green-400 border border-white/20" />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto flex flex-col items-center">
        
        {/* Export Notification */}
        <div className="mb-10 flex items-center gap-3 bg-blue-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20">
          <span>New: Export to Figma</span>
          <X size={14} className="cursor-pointer opacity-70 hover:opacity-100" />
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-medium text-white">Start a new</h2>
          <div className="bg-[#1a1a1e] border border-gray-800 p-1 rounded-xl flex">
            <button 
              onClick={() => setDevice('app')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${device === 'app' ? 'bg-[#2a2a30] text-white' : 'text-gray-500'}`}
            >
              <Smartphone size={16} /> App
            </button>
            <button 
              onClick={() => setDevice('web')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${device === 'web' ? 'bg-[#2a2a30] text-white' : 'text-gray-500'}`}
            >
              <Monitor size={16} /> Web
            </button>
          </div>
          <h2 className="text-2xl font-medium text-white">design</h2>
        </div>

        {/* --- NEW: FILE DROP SECTION --- */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full mb-4 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
              : 'border-white/10 bg-white/[0.02] hover:border-purple-500/50 hover:bg-purple-500/[0.02]'}`}
        >
          <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400 group-hover:text-purple-400'}`}>
            <UploadCloud size={28} />
          </div>
          <p className="text-sm font-medium text-gray-300">
            Drop files here or <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400 font-bold">browse</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG or Figma links</p>
        </div>

        {/* Main Search/Input Box */}
        <div className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-500 to-green-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#0d0d0f] border border-white/10 rounded-2xl p-6 min-h-[200px] flex flex-col justify-between shadow-2xl">
            <textarea 
              placeholder="Describe your design"
              className="bg-transparent border-none outline-none text-xl text-white placeholder-gray-600 resize-none w-full h-32"
            />
            
            <div className="flex justify-between items-center">
              <button className="p-2 rounded-full border border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-all">
                <Plus size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#1a1a1e] border border-gray-800 px-3 py-1.5 rounded-full text-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-green-400 rounded-full" />
                  <span className="text-gray-300">3.0 Flash</span>
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                </div>
                <button className="bg-gray-800 p-2 rounded-full text-gray-500 hover:text-white transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="w-full mt-10 space-y-3">
          <p className="text-sm text-gray-500 ml-1">Try these prompts</p>
          <div className="flex flex-col gap-2">
            {[
              "Profile page for Formula One driver Max Verstappen, featuring pastel red as the primary color",
              "Make me an app for people who love skiing in the Alps"
            ].map((prompt, i) => (
              <button key={i} className="text-left bg-transparent border border-gray-800 px-4 py-3 rounded-xl text-sm text-gray-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StitchInterface;