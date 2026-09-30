import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  ArrowRight, 
  X, 
  Compass, 
  CornerDownLeft,
  MapPin,
  Loader2,
  HelpCircle,
  Coffee,
  BookOpen,
  GraduationCap,
  DoorOpen,
  ChevronDown
} from 'lucide-react';
import { BuildingData } from '../../types';

interface AIAssistantWidgetProps {
  buildings: BuildingData[];
  onSelectDestination: (buildingId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  userNearestBuilding?: BuildingData | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  destinationId?: string | null;
  suggestedDestinations?: { label: string; buildingId: string; icon: any }[];
  time: string;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  buildings,
  onSelectDestination,
  isOpen,
  onToggle,
  userNearestBuilding
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Hello! I am GeoNav AI, your campus navigation assistant. Ask me anything about NIIS buildings, classrooms, facilities, hostels, or faculty offices.',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    'Where is Block C?',
    'How do I reach the canteen?',
    'Show all hostels',
    'Where is the library?',
    'Where is BCA classroom?'
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  // Feature 9: Lost / Confused User Mode
  const handleImLost = () => {
    const detected = userNearestBuilding || buildings.find(b => b.id === 'block-a') || buildings[0];

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: "I'm lost! Can you help me?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMsg: ChatMessage = {
      id: `b-${Date.now()}`,
      sender: 'assistant',
      text: `You appear to be near ${detected.name}. Don't worry, I can guide you anywhere on campus! Where would you like to go?`,
      suggestedDestinations: [
        { label: 'My Classroom (Block B)', buildingId: 'block-b', icon: GraduationCap },
        { label: 'Central Library (Block C)', buildingId: 'block-c', icon: BookOpen },
        { label: 'NIIS Canteen', buildingId: 'niis-canteen', icon: Coffee },
        { label: 'Common Washrooms', buildingId: 'common-washroom', icon: DoorOpen },
        { label: 'Main Gate', buildingId: 'main-gate', icon: MapPin }
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    if (/i'?m lost|lost|confused|where am i/i.test(textToSend)) {
      handleImLost();
      setInput('');
      return;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history: messages.slice(-4) })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is what I found for your query.',
        destinationId: data.destinationId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'assistant',
          text: 'I can help you navigate NIIS campus. Please try asking about Block A, Block B, Block C, Canteen, Hostels, or Library.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech Recognition Handler
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported by your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" 
        onClick={onToggle}
      />

      {/* Floating Glass Chatbot Container */}
      <div 
        className="fixed z-50 bottom-0 md:bottom-auto md:top-16 inset-x-0 md:inset-x-auto md:right-6 w-full md:w-96 max-h-[85vh] md:max-h-[calc(100vh-80px)] glass-panel rounded-t-3xl md:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/20 backdrop-blur-2xl flex flex-col transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3FA4] to-[#00f0ff] p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#171019] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#FF3FA4]" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight font-display flex items-center gap-1.5">
                <span>NIIS GeoNav Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[10px] text-white/50">Ask me anything about the campus!</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* I'm Lost Quick Button */}
            <button
              onClick={handleImLost}
              className="px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="I'm Lost - Auto-locate and guide me"
            >
              <HelpCircle className="w-3 h-3" />
              <span>I&apos;m Lost</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl glass-panel text-white/50 hover:text-white transition-colors cursor-pointer"
              title="Close Chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Prompt Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none shrink-0 border-b border-white/5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-xl glass-panel-subtle text-[10px] font-medium text-white/70 hover:text-white hover:border-[#FF3FA4]/40 whitespace-nowrap transition-all cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Scroll View */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 text-xs min-h-[160px] max-h-[48vh]">
          {messages.map(m => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-gradient-to-r from-[#FF3FA4] to-[#c73570] text-white rounded-tr-sm shadow-md' 
                    : 'glass-panel-subtle text-white/90 border border-white/10 rounded-tl-sm shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                
                {/* Destination navigation shortcut button if detected */}
                {m.destinationId && (
                  <button
                    onClick={() => {
                      onSelectDestination(m.destinationId!);
                      onToggle();
                    }}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/40 text-[#00f0ff] font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Navigate to Destination</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {/* Suggested Destinations in Lost Mode */}
                {m.suggestedDestinations && (
                  <div className="mt-2.5 space-y-1 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono uppercase text-[#E9B95F] font-bold block mb-1">
                      Choose Your Target:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {m.suggestedDestinations.map(sd => {
                        const Icon = sd.icon;
                        return (
                          <button
                            key={sd.buildingId}
                            onClick={() => {
                              onSelectDestination(sd.buildingId);
                              onToggle();
                            }}
                            className="p-1.5 px-2 rounded-lg bg-white/10 hover:bg-[#FF3FA4]/20 border border-white/10 text-left flex items-center gap-1.5 text-[11px] text-white cursor-pointer transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />
                            <span className="truncate">{sd.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-white/30 px-1 mt-0.5 font-mono">{m.time}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl glass-panel-subtle text-white/50 text-xs w-36">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF3FA4]" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Fixed Input Area at Bottom */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2 pt-2 border-t border-white/10 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask where any building, lab, or hostel is..."
            className="flex-1 py-2.5 pl-3.5 pr-10 rounded-2xl glass-input text-xs placeholder-white/40 focus:outline-none focus:border-[#FF3FA4]/70 transition-all"
          />

          {/* Speech Mic Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`absolute right-12 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all cursor-pointer ${
              isListening ? 'bg-red-500/30 text-red-400 animate-pulse' : 'text-white/40 hover:text-white'
            }`}
            title={isListening ? 'Listening...' : 'Voice Input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] disabled:opacity-40 text-white shadow-md hover:brightness-110 transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};
