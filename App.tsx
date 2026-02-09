
import React, { useState, useRef, useEffect } from 'react';
import { ArabicVoice, AudioSnippet } from './types';
import { generateArabicTTS, vowelizeArabicText } from './services/geminiService';
import { decodeBase64, decodeAudioData, createWavBlob } from './utils/audio';
import { DIACRITICS } from './constants';
import {
  PlayIcon,
  TrashIcon,
  SpeakerWaveIcon,
  ArrowPathIcon,
  SparklesIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('gemini_api_key') || process.env.GEMINI_API_KEY || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [fixing, setFixing] = useState<boolean>(false);
  const [history, setHistory] = useState<AudioSnippet[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const VOICE_NAME = "Mr. GPS";
  const SELECTED_VOICE = ArabicVoice.CHARON;

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioCtxRef.current;
  };

  const handleFixText = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Gemini API Key first.");
      return;
    }
    if (!text.trim()) return;
    setFixing(true);
    setError(null);
    try {
      const vowelized = await vowelizeArabicText(text, apiKey);
      setText(vowelized);
    } catch (err: any) {
      setError("Could not add diacritics automatically. Please check your API Key and try again.");
    } finally {
      setFixing(false);
    }
  };

  const handleRemoveTashkeel = () => {
    const textarea = document.getElementById('arabic-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const tashkeelRegex = /[\u064B-\u0652\u0651\u0653\u0670\u0640]/g;

    if (start !== end) {
      // Selected text
      const selectedPart = text.substring(start, end);
      const cleanedPart = selectedPart.replace(tashkeelRegex, "");
      const newText = text.substring(0, start) + cleanedPart + text.substring(end);
      setText(newText);

      // Maintain selection on the cleaned text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + cleanedPart.length);
      }, 0);
    } else {
      // No selection, clean everything
      setText(prev => prev.replace(tashkeelRegex, ""));
    }
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your Gemini API Key first.");
      return;
    }
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const base64Audio = await generateArabicTTS(text, SELECTED_VOICE, apiKey);
      const newSnippet: AudioSnippet = {
        id: crypto.randomUUID(),
        text,
        voice: SELECTED_VOICE,
        timestamp: Date.now(),
        audioData: base64Audio,
      };

      setHistory(prev => [newSnippet, ...prev]);
      playAudio(base64Audio);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please check your API Key.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (base64: string) => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const bytes = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(bytes, ctx);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err) {
      console.error('Playback Error:', err);
      setError('Could not play audio. Try again.');
    }
  };

  const handleDownload = (snippet: AudioSnippet) => {
    try {
      const bytes = decodeBase64(snippet.audioData);
      const blob = createWavBlob(bytes);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qiraa-narration-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download Error:', err);
      setError('Could not download audio.');
    }
  };

  const insertDiacritic = (char: string) => {
    const textarea = document.getElementById('arabic-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + char + text.substring(end);
    setText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteSnippet = (id: string) => {
    setHistory(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-indigo-900 text-white py-8 px-6 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-amiri tracking-wide">قِراءة مع {VOICE_NAME}</h1>
              <p className="text-indigo-200 text-sm">Natural Arabic Voice with Human Expression</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-indigo-950/50 px-5 py-2.5 rounded-2xl border border-indigo-700/50">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
            <span className="text-sm font-semibold tracking-wider uppercase">Expressive Mode Active</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-50">

            {/* API Key Input */}
            <div className="mb-6">
              <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API Key"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                Your key is stored locally in your browser and used only for API requests.
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900">
                <SparklesIcon className="w-5 h-5" />
                Input Arabic Text
              </h2>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={handleFixText}
                  disabled={fixing || !text.trim() || !apiKey.trim()}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${fixing || !apiKey.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
                    }`}
                  title="Auto-vowelize text using AI"
                >
                  {fixing ? (
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                  )}
                  {fixing ? 'تشكيل جاري...' : 'التشكيل التلقائي'}
                </button>
                <button
                  onClick={handleRemoveTashkeel}
                  disabled={!text.trim()}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all bg-red-50 text-red-700 hover:bg-red-100 border border-red-100"
                  title="Remove diacritics from selection or entire text"
                >
                  <NoSymbolIcon className="w-3.5 h-3.5" />
                  إزالة التشكيل
                </button>
                <button
                  onClick={() => setText('')}
                  className="text-slate-400 hover:text-red-500 text-xs transition-colors px-2 py-1"
                >
                  مسح الكل
                </button>
              </div>
            </div>

            <textarea
              id="arabic-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب النص هنا..."
              dir="rtl"
              className="w-full h-48 p-6 text-2xl font-amiri border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none outline-none leading-relaxed"
            />

            {/* Diacritics Keyboard */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              {DIACRITICS.map(d => (
                <button
                  key={d.label}
                  onClick={() => insertDiacritic(d.char)}
                  title={d.label}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 font-amiri text-xl shadow-sm transition-all active:scale-95"
                >
                  {d.char}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !text.trim() || !apiKey.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-md ${loading || !text.trim() || !apiKey.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                  }`}
              >
                {loading ? (
                  <ArrowPathIcon className="w-6 h-6 animate-spin" />
                ) : (
                  <SpeakerWaveIcon className="w-6 h-6" />
                )}
                {loading ? 'Processing...' : `Let ${VOICE_NAME} Speak Naturally`}
              </button>
            </div>


            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}
          </section>
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-50 sticky top-8 max-h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-4 text-indigo-900">
              <h2 className="font-semibold flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5" />
                Recent Recordings
              </h2>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-slate-400 hover:text-red-500"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-sm">
                  Your recent narrations will appear here.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all group"
                  >
                    <p className="text-right font-amiri text-lg mb-2 line-clamp-2 leading-relaxed" dir="rtl">
                      {item.text}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => playAudio(item.audioData)}
                          className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                          title="Replay"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                          title="Download Audio"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSnippet(item.id)}
                          className="p-2 bg-slate-200 text-slate-500 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        <div className="font-bold text-indigo-600 uppercase flex items-center gap-1">
                          <CheckBadgeIcon className="w-3 h-3" />
                          NATURAL {VOICE_NAME}
                        </div>
                        <div>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-6 mt-12 text-center text-slate-400 text-sm">


      </footer>
    </div>
  );
};

export default App;
