
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Icons } from '../components/Icons';
import { useLocation, useNavigate } from 'react-router-dom';

const MockInterview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity, interviewer, resumeData } = location.state || { identity: 'Sky', interviewer: 'Ghost' };

  const [active, setActive] = useState(false);
  const [transcripts, setTranscripts] = useState<{ role: string, text: string }[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  
  const audioContextIn = useRef<AudioContext | null>(null);
  const audioContextOut = useRef<AudioContext | null>(null);
  const nextStartTime = useRef(0);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Manual base64 utils for Live API
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const stopInterview = () => {
    setActive(false);
    setStatus('idle');
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    sources.current.forEach(s => s.stop());
    sources.current.clear();
  };

  const startInterview = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContextIn.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextOut.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: interviewer === 'Sky' ? 'Kore' : 'Fenrir' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are ${interviewer}. You are conducting a mock interview for ${identity}. 
          The candidate has the following resume context: ${JSON.stringify(resumeData || 'Not provided')}.
          Be professional, challenging, and provide feedback at the end. Start by introducing yourself and asking the first question.`
        },
        callbacks: {
          onopen: () => {
            setActive(true);
            setStatus('listening');
            const source = audioContextIn.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextIn.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextIn.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscripts(prev => [...prev.slice(-10), { role: interviewer, text: message.serverContent!.outputTranscription!.text }]);
              setStatus('speaking');
            }
            if (message.serverContent?.inputTranscription) {
              setTranscripts(prev => [...prev.slice(-10), { role: identity, text: message.serverContent!.inputTranscription!.text }]);
              setStatus('listening');
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextOut.current) {
              nextStartTime.current = Math.max(nextStartTime.current, audioContextOut.current.currentTime);
              const buffer = await decodeAudioData(decode(audioData), audioContextOut.current, 24000);
              const source = audioContextOut.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextOut.current.destination);
              source.start(nextStartTime.current);
              nextStartTime.current += buffer.duration;
              sources.current.add(source);
              source.onended = () => {
                sources.current.delete(source);
                if (sources.current.size === 0) setStatus('listening');
              };
            }
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert("Error accessing microphone or connecting to API.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute top-6 left-8 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {active ? 'Live Mock Interview' : 'Ready to start'}
          </span>
        </div>

        <div className="text-center mb-12 mt-4">
          <div className="relative inline-block">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4 mx-auto transition-transform duration-500 ${status === 'speaking' ? 'scale-110' : ''}`}>
              {interviewer === 'Sky' ? <Icons.UserCheck className="w-12 h-12 text-white" /> : <Icons.User className="w-12 h-12 text-white" />}
            </div>
            {status === 'speaking' && (
              <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20" />
            )}
          </div>
          <h2 className="text-2xl font-bold">{interviewer}</h2>
          <p className="text-slate-400 text-sm">Your Technical Interviewer</p>
        </div>

        <div className="h-64 overflow-y-auto mb-8 space-y-4 px-4 scrollbar-hide">
          {transcripts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-sm">
              <Icons.Message className="w-8 h-8 mb-2 opacity-20" />
              Conversation will appear here...
            </div>
          ) : (
            transcripts.map((t, i) => (
              <div key={i} className={`flex flex-col ${t.role === identity ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-bold text-slate-500 mb-1">{t.role}</span>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${t.role === identity ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                  {t.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center items-center gap-8">
          {!active ? (
            <button
              onClick={startInterview}
              disabled={status === 'connecting'}
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center transition-all shadow-xl group-active:scale-95">
                <Icons.Call className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-300">Start Session</span>
            </button>
          ) : (
            <button
              onClick={stopInterview}
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center transition-all shadow-xl group-active:scale-95">
                <Icons.Hangup className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-300">End Interview</span>
            </button>
          )}
        </div>

        {status === 'connecting' && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md rounded-3xl flex flex-center items-center justify-center">
            <div className="text-center">
              <Icons.Refresh className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="font-bold text-blue-400">Connecting to {interviewer}...</p>
            </div>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => { stopInterview(); navigate(-1); }}
        className="mt-8 text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors"
      >
        <Icons.Close className="w-4 h-4" /> Exit to Dashboard
      </button>
    </div>
  );
};

export default MockInterview;
