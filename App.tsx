import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Message, AppMode, FirFormData, LanguageCode, Attachment, Metadata } from './types';
import { INITIAL_GREETINGS, LANGUAGES, UI_TRANSLATIONS, SYSTEM_PROMPT } from './constants';
import { sendMessageToGemini } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import FirForm from './components/FirForm';
import IpcSearch from './components/IpcSearch';
import BankFraud from './components/BankFraud';
import ConsumerRights from './components/ConsumerRights';
import AadhaarSupport from './components/AadhaarSupport';
import GlobalSearch from './components/GlobalSearch';
import Tutorial from './components/Tutorial';
import AdrGuide from './components/AdrGuide';
import LegalDictionary from './components/LegalDictionary';
import StationFinder from './components/StationFinder';
import FirTracker from './components/FirTracker';
import { Button, Card, Badge } from './components/UiComponents';

type Histories = Record<AppMode, Message[]>;

// --- AUDIO HELPERS ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  
  // Voice/Live state
  const [isLiveActive, setIsLiveActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [histories, setHistories] = useState<Histories>({
    [AppMode.CHAT]: [],
    [AppMode.FIR_GENERATOR]: [],
    [AppMode.IPC_EXPLAINER]: [],
    [AppMode.BANK_FRAUD]: [],
    [AppMode.CONSUMER_RIGHTS]: [],
    [AppMode.AADHAAR_SUPPORT]: [],
    [AppMode.STATION_FINDER]: [],
    [AppMode.FIR_TRACKER]: [],
    [AppMode.GLOBAL_SEARCH]: [],
    [AppMode.ADR_GUIDE]: [],
    [AppMode.LEGAL_DICTIONARY]: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const tutorialSeen = localStorage.getItem('tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
      localStorage.setItem('tutorial_seen', 'true');
    }

    const savedHistory = localStorage.getItem('nyaya_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load search history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    scrollToBottom();
  }, [histories, mode, pendingAttachment]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getTranslatedText = (key: string) => {
    const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['en'];
    return t[key] || UI_TRANSLATIONS['en'][key];
  };

  const addToHistory = (query: string) => {
    if (!query || query.trim().length < 2) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      const updated = [query, ...filtered].slice(0, 10);
      localStorage.setItem('nyaya_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('nyaya_search_history');
  };

  const addMessage = (role: 'user' | 'model', text: string, metadata?: Metadata, targetMode?: AppMode) => {
    const activeMode = targetMode || mode;
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      role,
      text,
      timestamp: Date.now(),
      metadata
    };
    
    setHistories(prev => ({
      ...prev,
      [activeMode]: [...prev[activeMode], newMessage]
    }));
    return newMessage;
  };

  const handleSend = async (customInput?: string, contextData?: string, targetMode?: AppMode, locationOverride?: {latitude: number, longitude: number}) => {
    const activeMode = targetMode || mode;
    const textToSend = customInput || input;
    if (!textToSend.trim() && !contextData && !locationOverride && !pendingAttachment) return;

    if (textToSend && !contextData) {
      addToHistory(textToSend);
    }

    let userMsgMetadata: Metadata | undefined;
    if (pendingAttachment) {
      userMsgMetadata = {
        confidence: 'HIGH',
        sources: [],
        actions: [],
        attachment: pendingAttachment
      };
    }

    addMessage('user', textToSend || (pendingAttachment ? "Document attached" : "Locating..."), userMsgMetadata, activeMode);
    
    const currentAttachment = pendingAttachment;
    setPendingAttachment(null);
    setInput('');
    setIsLoading(true);

    const currentHistory = histories[activeMode];
    const historyForApi = [...currentHistory, { id: 'temp', role: 'user', text: textToSend, timestamp: Date.now() } as Message];

    const response = await sendMessageToGemini(
      historyForApi, 
      textToSend, 
      activeMode, 
      language, 
      contextData, 
      locationOverride || userLocation || undefined,
      currentAttachment || undefined
    );

    addMessage('model', response.text, response.metadata, activeMode);
    setIsLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64 = (event.target.result as string).split(',')[1];
        setPendingAttachment({
          data: base64,
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const startLiveSession = async () => {
    if (isLiveActive) {
      stopLiveSession();
      return;
    }

    try {
      setIsLiveActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inCtx, output: outCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error', e);
            stopLiveSession();
          },
          onclose: () => {
            stopLiveSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_PROMPT + "\nYou are in a live voice conversation. Be concise and speak clearly.",
        },
      });

      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error('Failed to start live session', err);
      setIsLiveActive(false);
    }
  };

  const stopLiveSession = () => {
    setIsLiveActive(false);
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => s.close());
    }
    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode !== AppMode.CHAT && histories[newMode].length === 0) {
      setTimeout(() => {
        setHistories(prev => ({
          ...prev,
          [newMode]: [{
            id: 'init-' + newMode,
            role: 'model',
            text: INITIAL_GREETINGS[language] || INITIAL_GREETINGS['en'],
            timestamp: Date.now(),
            metadata: { confidence: 'HIGH', sources: [], actions: [] }
          }]
        }));
      }, 100);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative' | 'reported') => {
    setHistories(prev => ({
      ...prev,
      [mode]: prev[mode].map(msg => msg.id === messageId ? { ...msg, feedback: feedback as any } : msg)
    }));
  };

  const renderContent = () => {
    const currentMessages = histories[mode];
    const isHistoryEmpty = currentMessages.length === 0;

    // Chat Home Screen (Empty State)
    if (mode === AppMode.CHAT && isHistoryEmpty && !isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto px-4 animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-medium text-gray-900 dark:text-gray-100 mb-12 text-center tracking-tight">
            {getTranslatedText('welcomeTitle')}
          </h2>
          
          <div className="w-full max-w-2xl relative">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full shadow-xl flex items-center p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*,.pdf,.doc,.docx"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 transition-colors ${pendingAttachment ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-indigo-500'}`}
                title="Upload files or photos"
              >
                <i className={`fas ${pendingAttachment ? 'fa-file-circle-check' : 'fa-plus'}`}></i>
              </button>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder={getTranslatedText('inputPlaceholder')}
                className="flex-1 bg-transparent border-none outline-none px-2 py-4 text-lg text-gray-900 dark:text-white placeholder-gray-400"
              />
              <div className="flex items-center gap-1 pr-2">
                <button 
                  onClick={startLiveSession}
                  className={`p-3 transition-colors ${isLiveActive ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-indigo-500'}`}
                  title="Real-time voice interaction"
                >
                  <i className="fas fa-microphone"></i>
                </button>
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                </button>
              </div>
            </div>

            {pendingAttachment && (
              <div className="absolute top-full mt-4 left-0 right-0 flex justify-center">
                 <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">File Ready</span>
                    <button onClick={() => setPendingAttachment(null)} className="text-gray-400 hover:text-red-500"><i className="fas fa-times-circle"></i></button>
                 </div>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Legal Rights', icon: 'fa-scale-balanced' },
                { label: 'FIR Help', icon: 'fa-shield-halved' },
                { label: 'Consumer Law', icon: 'fa-shopping-bag' },
                { label: 'Drafting', icon: 'fa-file-signature' }
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={() => handleSend(`Tell me about ${item.label}`)}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all group"
                >
                  <i className={`fas ${item.icon} text-gray-400 group-hover:text-indigo-500`}></i>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (mode === AppMode.FIR_GENERATOR && (isHistoryEmpty || currentMessages.length <= 1) && !isLoading) {
      return (
        <div className="max-w-3xl mx-auto pt-4 md:pt-10">
          <FirForm 
            onSubmit={(data) => {
               const formattedData = `Document Type: ${data.documentType}\nCategory: ${data.offenseType}\nName: ${data.complainantName}\nDetails: ${data.details}\nPolice Station: ${data.policeStation}`;
               handleSend(`Generate ${data.documentType} draft for ${data.complainantName}`, formattedData);
            }} 
            onCancel={() => handleModeChange(AppMode.CHAT)}
            isSubmitting={isLoading}
          />
        </div>
      );
    }

    if (mode === AppMode.STATION_FINDER && (isHistoryEmpty || currentMessages.length <= 1) && !isLoading) {
      return (
        <StationFinder 
          onSearch={(query, loc) => {
            if (loc) setUserLocation(loc);
            handleSend(query || "Finding nearby police stations...", undefined, AppMode.STATION_FINDER, loc);
          }} 
          isLoading={isLoading} 
        />
      );
    }

    if (mode === AppMode.FIR_TRACKER && (isHistoryEmpty || currentMessages.length <= 1) && !isLoading) {
      return (
        <FirTracker 
          onTrack={(details) => handleSend(details)}
          isLoading={isLoading}
        />
      );
    }

    if (mode === AppMode.ADR_GUIDE && (isHistoryEmpty || currentMessages.length <= 1) && !isLoading) {
      return <AdrGuide onOptionSelect={(opt) => handleSend(opt)} isLoading={isLoading} />;
    }

    if (mode === AppMode.LEGAL_DICTIONARY && (isHistoryEmpty || currentMessages.length <= 1) && !isLoading) {
      return <LegalDictionary onSearch={(q) => handleSend(q)} isLoading={isLoading} />;
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-6 pt-4">
        {mode === AppMode.IPC_EXPLAINER && isHistoryEmpty && <IpcSearch onSearch={(q) => handleSend(q)} isLoading={isLoading} />}
        {mode === AppMode.BANK_FRAUD && isHistoryEmpty && <BankFraud onOptionSelect={(opt) => handleSend(opt)} isLoading={isLoading} />}
        {mode === AppMode.CONSUMER_RIGHTS && isHistoryEmpty && <ConsumerRights onOptionSelect={(opt) => handleSend(opt)} isLoading={isLoading} />}
        {mode === AppMode.AADHAAR_SUPPORT && isHistoryEmpty && <AadhaarSupport onOptionSelect={(opt) => handleSend(opt)} isLoading={isLoading} />}
        
        {currentMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onFeedback={handleFeedback} />
        ))}
        {isLoading && <LoadingState />}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const LoadingState = () => (
    <div className="flex justify-start w-full mb-6 animate-pulse">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
         <div className="flex gap-1">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
         </div>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">Consulting Laws...</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-30 shadow-lg shadow-gray-200/50 dark:shadow-none">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/30">
            <i className="fas fa-scale-balanced"></i>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">NyayaSarathi</h1>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Legal Assistant</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 px-4 mt-2">
            Main Modules
          </div>
          <NavButton targetMode={AppMode.CHAT} icon="fa-comments" label={getTranslatedText('generalAssistant')} active={mode === AppMode.CHAT} onClick={() => handleModeChange(AppMode.CHAT)} />
          <NavButton targetMode={AppMode.FIR_GENERATOR} icon="fa-file-signature" label={getTranslatedText('firGenerator')} active={mode === AppMode.FIR_GENERATOR} onClick={() => handleModeChange(AppMode.FIR_GENERATOR)} />
          <NavButton targetMode={AppMode.STATION_FINDER} icon="fa-building-shield" label={getTranslatedText('stationFinder')} active={mode === AppMode.STATION_FINDER} onClick={() => handleModeChange(AppMode.STATION_FINDER)} />
          <NavButton targetMode={AppMode.FIR_TRACKER} icon="fa-magnifying-glass-location" label={getTranslatedText('firTracker')} active={mode === AppMode.FIR_TRACKER} onClick={() => handleModeChange(AppMode.FIR_TRACKER)} />
          <NavButton targetMode={AppMode.ADR_GUIDE} icon="fa-handshake-simple" label={getTranslatedText('adrGuide')} active={mode === AppMode.ADR_GUIDE} onClick={() => handleModeChange(AppMode.ADR_GUIDE)} />
          <NavButton targetMode={AppMode.LEGAL_DICTIONARY} icon="fa-spell-check" label={getTranslatedText('legalDictionary')} active={mode === AppMode.LEGAL_DICTIONARY} onClick={() => handleModeChange(AppMode.LEGAL_DICTIONARY)} />
          
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 px-4 mt-6">
            Quick Assistance
          </div>
          <NavButton targetMode={AppMode.IPC_EXPLAINER} icon="fa-book-open" label={getTranslatedText('ipcExplainer')} active={mode === AppMode.IPC_EXPLAINER} onClick={() => handleModeChange(AppMode.IPC_EXPLAINER)} />
          <NavButton targetMode={AppMode.BANK_FRAUD} icon="fa-shield-cat" label={getTranslatedText('bankingFraud')} active={mode === AppMode.BANK_FRAUD} onClick={() => handleModeChange(AppMode.BANK_FRAUD)} />
          <NavButton targetMode={AppMode.CONSUMER_RIGHTS} icon="fa-user-shield" label={getTranslatedText('consumerRights')} active={mode === AppMode.CONSUMER_RIGHTS} onClick={() => handleModeChange(AppMode.CONSUMER_RIGHTS)} />
          <NavButton targetMode={AppMode.AADHAAR_SUPPORT} icon="fa-fingerprint" label={getTranslatedText('aadhaarSupport')} active={mode === AppMode.AADHAAR_SUPPORT} onClick={() => handleModeChange(AppMode.AADHAAR_SUPPORT)} />

          {searchHistory.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between px-4 mb-3">
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                  Recent Searches
                </div>
                <button 
                  onClick={clearHistory}
                  className="text-[9px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1 px-2">
                {searchHistory.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMode(AppMode.GLOBAL_SEARCH);
                      handleSend(query, undefined, AppMode.GLOBAL_SEARCH);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2"
                  >
                    <i className="fas fa-clock-rotate-left text-[10px] opacity-50"></i>
                    <span className="truncate">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Settings Menu Section */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-4">
            {getTranslatedText('settings')}
          </div>
          
          <div className="px-4 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{getTranslatedText('language')}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-xs p-2 text-gray-700 dark:text-gray-300 font-bold focus:ring-0 cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>
              ))}
            </select>
          </div>

          <div className="px-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all group"
            >
              <span className="flex items-center gap-2">
                <i className={`fas ${darkMode ? 'fa-moon text-indigo-400' : 'fa-sun text-yellow-500'}`}></i>
                Theme
              </span>
              <div className={`w-7 h-4 bg-gray-200 dark:bg-slate-600 rounded-full relative transition-colors`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-3' : ''}`}></div>
              </div>
            </button>
          </div>

          <button 
            onClick={() => setShowTutorial(true)}
            className="w-full text-left px-4 py-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2 uppercase tracking-widest"
          >
            <i className="fas fa-circle-question"></i> {getTranslatedText('startTutorial')}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative h-full">
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center gap-4 z-10 sticky top-0 shadow-sm transition-colors">
          <GlobalSearch 
            onSearch={(q) => { setMode(AppMode.GLOBAL_SEARCH); handleSend(q, undefined, AppMode.GLOBAL_SEARCH); }} 
            placeholder={getTranslatedText('globalSearchPlaceholder')} 
          />
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Badge color="blue">v2.0 Beta</Badge>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-8 bg-gray-50 dark:bg-slate-950 relative">
          <div className="relative z-10">
            {renderContent()}
          </div>
        </div>

        {/* Input area only shown when in CHAT/SEARCH modes OR if history already exists */}
        {(mode === AppMode.GLOBAL_SEARCH || histories[mode].length > 0 || isLiveActive) && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 p-4 md:p-6 z-20">
             <div className="max-w-3xl mx-auto relative">
               {pendingAttachment && (
                 <div className="absolute bottom-full mb-4 left-0 right-0 flex justify-center animate-bounce">
                    <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                      <i className="fas fa-file-image"></i> Photo/File Attached <button onClick={() => setPendingAttachment(null)} className="ml-2 opacity-70 hover:opacity-100"><i className="fas fa-times-circle"></i></button>
                    </div>
                 </div>
               )}
               <div className="flex gap-3 items-end bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 p-2 shadow-lg group focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 transition-colors shrink-0 ${pendingAttachment ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-indigo-500'}`}
                >
                  <i className={`fas ${pendingAttachment ? 'fa-check-circle' : 'fa-plus'}`}></i>
                </button>
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={getTranslatedText('inputPlaceholder')}
                  className="flex-1 bg-transparent py-3 px-2 text-sm focus:outline-none resize-none dark:text-white"
                />
                <div className="flex items-center pr-2 shrink-0">
                  <button 
                    onClick={startLiveSession}
                    className={`p-3 transition-colors ${isLiveActive ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-indigo-500'}`}
                    title="Real-time Voice Assistant"
                  >
                    <i className="fas fa-microphone"></i>
                  </button>
                  <button 
                    onClick={() => handleSend()} 
                    disabled={isLoading || (!input.trim() && !pendingAttachment)} 
                    className={`w-10 h-10 flex items-center justify-center transition-all ${isLoading ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-500'}`}
                  >
                    <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                  </button>
                </div>
               </div>
               <div className="mt-3 max-w-xl mx-auto flex items-center gap-2 justify-center opacity-70 animate-fadeIn">
                 <i className="fas fa-shield-halved text-indigo-500 text-[9px] shrink-0"></i>
                 <p className="text-[10px] text-center text-gray-500 dark:text-slate-400 font-medium">
                   {getTranslatedText('disclaimer')}
                 </p>
               </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavButton = ({ targetMode, icon, label, active, onClick }: { targetMode: AppMode, icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200/50 dark:shadow-none' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
    }`}
  >
    <i className={`fas ${icon} w-4 text-center`}></i>
    {label}
  </button>
);

export default App;