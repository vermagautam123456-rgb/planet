'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const TacticalGlobe = dynamic(() => import('./components/TacticalGlobe'), { 
  ssr: false,
  loading: () => <div className="glass-card" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>INITIALIZING 3D PROJECTION...</div>
});

// Original Interfaces
interface WeatherData { temperature: number; windspeed: number; condition: string; time: string; }
interface FlightData { id: string; flightNumber: string; airline: string; status: 'airborne' | 'landed'; position: { lat: number; lng: number }; metrics: { altitude: number; speed: number }; }
interface ISSData { latitude: number; longitude: number; altitude: number; velocity: number; visibility: string; }
interface EarthquakeData { id: string; magnitude: string; place: string; time: string; status: 'critical' | 'normal'; lat: number; lng: number; }

// New Interfaces
interface AsteroidData { id: string; name: string; diameterMin: number; diameterMax: number; isHazardous: boolean; velocity: number; missDistance: string; }
interface AQIData { aqi: number; pm10: number; pm25: number; co: number; status: string; statusClass: string; }
interface CryptoData { name: string; symbol: string; price: number; change: number; }
interface SpaceWeatherData { time: string; kpIndex: string; condition: string; statusClass: string; }

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Authentication check
  useEffect(() => {
    const authStatus = localStorage.getItem('auth_access');
    setIsAuthenticated(authStatus === 'GRANTED');
  }, []);

  if (isAuthenticated === null) return <div className="loader" style={{marginTop: '20vh'}}></div>;

  const handleLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      localStorage.setItem('auth_access', 'GRANTED');
      setIsAuthenticated(true);
      setIsTransitioning(false);
    }, 2800); 
  };

  if (isTransitioning) return <FlightTransition />;

  return isAuthenticated ? <Dashboard onLogout={() => { localStorage.removeItem('auth_access'); setIsAuthenticated(false); }} /> : <LoginScreen onLogin={handleLogin} />;
}

function FlightTransition() {
  const [stage, setStage] = useState(0);
  const stages = [
    "INITIALIZING SECURE HANDSHAKE",
    "VERIFYING CLEARANCE LEVEL 4",
    "ESTABLISHING SATELLITE UPLINK",
    "DECRYPTING GLOBAL TELEMETRY",
    "SYNCHRONIZING TACTICAL CORE"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="transition-screen">
      <div className="tactical-loader">
        <div className="loader-circles">
          <div className="loader-circle circle-1"></div>
          <div className="loader-circle circle-2"></div>
          <div className="loader-circle circle-3"></div>
        </div>
        
        <div className="status-terminal">
          <div className="terminal-header">SYSTEM UPLINK IN PROGRESS</div>
          <div className="terminal-content">
            {stages.slice(0, stage + 1).map((s, i) => (
              <div key={i} className="terminal-line">
                <span className="line-prefix">{">>"}</span> {s} ... <span className="line-status">OK</span>
              </div>
            ))}
            <div className="terminal-cursor">_</div>
          </div>
        </div>

        <div className="loading-progress-container">
          <div className="loading-progress-bar" style={{ width: `${(stage + 1) * 20}%` }}></div>
          <div className="loading-percentage">{((stage + 1) * 20)}%</div>
        </div>
      </div>
    </div>
  );
}

const RadarVisualization = ({ flights, earthquakes }: { flights: any[], earthquakes: any[] }) => {
  return (
    <div className="radar-visualizer" style={{ position: 'relative', width: '100%', height: '200px', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', margin: '20px auto' }}>
      <div className="radar-sweep"></div>
      <div className="radar-circles">
        <div className="radar-circle"></div>
        <div className="radar-circle"></div>
        <div className="radar-circle"></div>
      </div>
      {/* Flight Targets */}
      {flights.slice(0, 5).map((f, i) => {
        const angle = (i * 72 * Math.PI) / 180;
        const dist = 15 + (i * 5); // Max dist 35% from center
        return (
          <div key={f.icao24} className="radar-ping" style={{ 
            position: 'absolute', 
            left: `${50 + Math.cos(angle) * dist}%`, 
            top: `${50 + Math.sin(angle) * dist}%`,
          }}>
            <div className="ping-dot"></div>
            <div className="ping-ring"></div>
            <span className="ping-label">{f.callsign || 'UNK'}</span>
          </div>
        );
      })}
      {/* Quake Targets */}
      {earthquakes.slice(0, 3).map((q, i) => {
        const angle = ((i * 120 + 45) * Math.PI) / 180;
        const dist = 30 + (i * 5); // Max dist 40% from center
        return (
          <div key={q.id} className="radar-ping warning" style={{ 
            position: 'absolute', 
            left: `${50 + Math.cos(angle) * dist}%`, 
            top: `${50 + Math.sin(angle) * dist}%`,
          }}>
            <div className="ping-dot"></div>
            <div className="ping-ring"></div>
            <span className="ping-label">MAG {q.magnitude}</span>
          </div>
        );
      })}
    </div>
  );
};

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toUpperCase() === 'ADMIN' || passcode === '1234') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card login-card">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="pulse-dot" style={{ width: '12px', height: '12px', margin: '0 auto 20px' }}></div>
          <h2 style={{ fontSize: '2.2rem', letterSpacing: '-1px', fontWeight: 800 }}>RESTRICTED ACCESS</h2>
          <p style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '8px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
            Global Telemetry Proxy System
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label className="input-label">AUTHENTICATION KEY REQUIRED</label>
            <input 
              type="password" 
              className={`glass-input ${error ? 'input-error' : ''}`} 
              placeholder="0000-0000" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoFocus
            />
            <div style={{ marginTop: '10px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>HINT: ADMIN</div>
          </div>
          
          <button type="submit" className="glass-button" style={{ height: '50px', fontSize: '0.9rem' }}>
            ESTABLISH SECURE LINK
          </button>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
              ACCESS DENIED. CLEARANCE LEVEL INSUFFICIENT.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const AlertOverlay = () => (
  <div style={{
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
    border: '10px solid rgba(239, 68, 68, 0.3)',
    animation: 'pulse-red-border 2s infinite',
  }}>
    <div style={{
      position: 'absolute', top: '100px', width: '100%', textAlign: 'center',
      color: '#ef4444', fontStyle: 'italic', fontWeight: 800, letterSpacing: '4px',
      fontSize: '1rem', textShadow: '0 0 10px #ef4444'
    }}>
      [ SYSTEM WIDE ALERT // CRITICAL THREAT DETECTED ]
    </div>
  </div>
);

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [iss, setIss] = useState<ISSData | null>(null);
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  
  const [asteroids, setAsteroids] = useState<AsteroidData[]>([]);
  const [aqi, setAqi] = useState<any | null>(null);
  const [planetary, setPlanetary] = useState<any | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isLiveFeed, setIsLiveFeed] = useState(false);
  const [cryptos, setCryptos] = useState<any[]>([]);
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherData | null>(null);

  const [packets, setPackets] = useState<{id: number, text: string}[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [history, setHistory] = useState<{id: string, time: string, type: string, detail: string}[]>([]);
  const [activeView, setActiveView] = useState('ALL');
  const [theme, setTheme] = useState('default');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string>('');

  const fetchTelemetry = async () => {
    try {
      const [wRes, fRes, iRes, qRes, aRes, aqiRes, cRes, swRes, pRes] = await Promise.allSettled([
        fetch('/api/weather'), fetch('/api/flights'), fetch('/api/iss'), fetch('/api/earthquake'),
        fetch('/api/asteroids'), fetch('/api/aqi'), fetch('/api/crypto'), fetch('/api/spaceweather'), fetch('/api/planetary')
      ]);

      let curWeather = weather; let curFlights = flights; let curIss = iss; let curQuakes = earthquakes; let curAsteroids = asteroids;

      if (wRes.status === 'fulfilled' && wRes.value.ok) { curWeather = await wRes.value.json(); setWeather(curWeather); }
      if (fRes.status === 'fulfilled' && fRes.value.ok) { curFlights = (await fRes.value.json()).data || []; setFlights(curFlights); }
      if (iRes.status === 'fulfilled' && iRes.value.ok) { curIss = await iRes.value.json(); setIss(curIss); }
      if (qRes.status === 'fulfilled' && qRes.value.ok) { curQuakes = (await qRes.value.json()).data || []; setEarthquakes(curQuakes); }
      
      if (aRes.status === 'fulfilled' && aRes.value.ok) { curAsteroids = (await aRes.value.json()).data || []; setAsteroids(curAsteroids); }
      if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) setAqi(await aqiRes.value.json());
      if (pRes.status === 'fulfilled' && pRes.value.ok) setPlanetary(await pRes.value.json());
      if (cRes.status === 'fulfilled' && cRes.value.ok) setCryptos((await cRes.value.json()).data || []);
      if (swRes.status === 'fulfilled' && swRes.value.ok) setSpaceWeather(await swRes.value.json());

      // History Tracking
      const newLogs: any[] = [];
      curQuakes.forEach((q: any) => {
        if (parseFloat(q.magnitude) >= 4.5) {
          newLogs.push({ id: q.id, time: q.time, type: 'SEISMIC', detail: `Mag ${q.magnitude} - ${q.place}` });
        }
      });
      curAsteroids.forEach((a: any) => {
        if (a.isHazardous) {
          newLogs.push({ id: a.id, time: 'TODAY', type: 'ASTEROID', detail: `Hazardous NEO: ${a.name}` });
        }
      });
      
      setHistory(prev => {
        const unique = [...prev];
        newLogs.forEach(log => {
          if (!unique.find(u => u.id === log.id)) unique.unshift(log);
        });
        return unique.slice(0, 20);
      });

    } catch (e) {
      console.error("Telemetry error", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceMode = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!isVoiceMode) {
      if (!SpeechRecognition) {
        alert("CRITICAL: Voice Recognition API not detected in this browser module. Switch to Chrome/Edge for TVI support.");
        return;
      }
      setIsVoiceMode(true);
      setVoiceError(null);
      playChirp(880, 0.15);
    } else {
      setIsVoiceMode(false);
      setVoiceError(null);
      playChirp(440, 0.15);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  useEffect(() => {
    if (!isVoiceMode) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false; // Burst mode often more reliable for command parsing
    recognition.interimResults = true; 
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log("TVI_CORE: SENSORS_ONLINE");
      setVoiceError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (event.results[i].isFinal) {
          setLastVoiceCommand(transcript);
          handleVoiceCommand(transcript);
        } else {
          interimTranscript = transcript;
        }
      }
      if (interimTranscript) {
        setLastVoiceCommand(`Hearing: ${interimTranscript}...`);
      }
    };

    recognition.onnomatch = () => {
      setLastVoiceCommand("CMD_UNKNOWN");
      playChirp(220, 0.2);
    };

    recognition.onerror = (event: any) => {
      // Suppress network and no-speech errors to maintain tactical focus
      if (event.error === 'no-speech' || event.error === 'network') {
        console.log("TVI_CORE: SENSORS_STANDBY (Silence/Network Jitter)");
        return; 
      }
      console.error("TVI_CORE_ALERT:", event.error);
      setVoiceError(event.error.toUpperCase());
      if (event.error === 'not-allowed') setIsVoiceMode(false);
    };

    recognition.onend = () => {
      // Immediate restart for heart-beat like recognition
      if (isVoiceMode) {
        try { recognition.start(); } catch(e) {}
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("TVI_ATTACH_FAILED", e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [isVoiceMode]);

  const handleVoiceCommand = (cmd: string) => {
    if (isSpeaking) return; 
    playChirp(523, 0.05); // Confirmation beep
    if (cmd.includes('system') || cmd.includes('all')) setActiveView('ALL');
    else if (cmd.includes('space')) setActiveView('SPACE');
    else if (cmd.includes('terrestrial') || cmd.includes('earth')) setActiveView('EARTH');
    else if (cmd.includes('civilian')) setActiveView('CIVILIAN');
    else if (cmd.includes('archive') || cmd.includes('history')) setActiveView('HISTORY');
    else if (cmd.includes('toggle 3d') || cmd.includes('globe')) setIs3DMode(!is3DMode);
    else if (cmd.includes('briefing')) { if (aiSummary) handleSpeak(); }
    else if (cmd.includes('alert level')) {
      const level = cmd.match(/\d/);
      if (level) { /* logic to change threat level if possible */ }
    }
    if (cmd.includes('mute') || cmd.includes('silence')) {
      setIsMuted(true);
      playChirp(440, 0.2);
    }
    if (cmd.includes('unmute') || cmd.includes('audio on')) {
      setIsMuted(false);
      playChirp(880, 0.2);
    }
    if (cmd.includes('threat level high') || cmd.includes('emergency override')) {
      playChirp(220, 1);
      // We don't have a specific setthreat but we can trigger a high score simulation if needed
      // For now let's just trigger a chirp
    }
    
    console.log("VOICE COMMAND");
  };

  // TVI Ref for persistent control
  const recognitionRef = useRef<any>(null);

  const playChirp = (freq: number, duration: number = 0.1) => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context init blocked");
    }
  };

  const handleSpeak = () => {
    if (!aiSummary || isSpeaking) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(aiSummary);
    utterance.rate = 1.1;
    utterance.pitch = 0.8;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const generateBrief = async () => {
    setAiSummary('Analyzing planetary telemetry...');
    try {
      const context = { weather, flights, iss, earthquakes, asteroids, aqi, cryptos, spaceWeather, planetary };
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummary(data.summary);
      } else {
        setAiSummary('Summary generation failed.');
      }
    } catch {
      setAiSummary('Threat Assessment offline.');
    }
  };

  useEffect(() => {
    const packetStrings = [
      '[UPLINK-04] SECURE HANDSHAKE: SUCCESS',
      '[INTEL] DECRYPTING SECTOR 7G...',
      '[SATELLITE] SIGNAL GAIN: +14dB',
      '[PROXY] REDIRECTING VIA LHR-HUB',
      '[CORE] AI INFERENCE COMPLETE',
      '[SYS] PARSING TELEMETRY STREAM...',
      '[SECURITY] ENCRYPTION LAYER: AES-256',
      '[CMD] PINGING ORBITAL-01'
    ];
    const packetInterval = setInterval(() => {
      const newPacket = {
        id: Date.now(),
        text: packetStrings[Math.floor(Math.random() * packetStrings.length)]
      };
      setPackets(prev => [newPacket, ...prev].slice(0, 5));
      playChirp(440, 0.05);
    }, 3000);
    return () => clearInterval(packetInterval);
  }, []);

  const calculateThreatLevel = () => {
    let score = 0;
    if (spaceWeather && parseFloat(spaceWeather.kpIndex) >= 4) score += 2;
    if (asteroids.some(a => a.isHazardous)) score += 2;
    if (earthquakes.some(q => parseFloat(q.magnitude) >= 5.0)) score += 3;
    if (aqi && aqi.aqi > 40) score += 1;
    
    if (score >= 6) return { label: 'CRITICAL', color: '#ef4444', level: 5 };
    if (score >= 4) return { label: 'HIGH', color: '#f97316', level: 4 };
    if (score >= 2) return { label: 'GUARDED', color: '#eab308', level: 3 };
    return { label: 'LOW', color: '#10b981', level: 1 };
  };

  const threat = calculateThreatLevel();

  useEffect(() => {
    if (threat.level >= 4 && !isMuted) {
      playChirp(220, 0.5);
      setTimeout(() => playChirp(440, 0.5), 500);
    }
  }, [threat.level]);

  useEffect(() => {
    fetchTelemetry().then(() => {
      setTimeout(generateBrief, 2000);
    });
    const telemetryInterval = setInterval(() => { fetchTelemetry(); }, 15000); 
    const clockInterval = setInterval(() => { setNow(new Date()); }, 1000);
    return () => {
      clearInterval(telemetryInterval);
      clearInterval(clockInterval);
      window.speechSynthesis.cancel();
    };
  }, []);

  const getSystemAlerts = () => {
    const alerts: string[] = [];
    if (spaceWeather && parseFloat(spaceWeather.kpIndex) >= 4) alerts.push(`CRITICAL SPACE WEATHER: KP-INDEX AT ${spaceWeather.kpIndex}`);
    if (asteroids.some(a => a.isHazardous)) alerts.push(`HAZARDOUS NEO DETECTED: INTERCEPTION ENVELOPE ACTIVE`);
    if (earthquakes.some(q => parseFloat(q.magnitude) >= 4.5)) alerts.push(`SEISMIC ANOMALY: MAGNITUDE ${earthquakes.find(q => parseFloat(q.magnitude) >= 4.5)?.magnitude} DETECTED`);
    if (aqi && aqi.aqi > 40) alerts.push(`ATMOSPHERIC TOXICITY WARNING: AQI LEVEL ${aqi.aqi}`);
    if (alerts.length === 0) return ['SYSTEMS STABLE', 'ALL TELEMETRY NOMINAL', 'SCANNING FOR PLANETARY THREATS...'];
    return [...alerts, ...alerts]; 
  };

  return (
    <>
      <div className={`scanline ${theme !== 'default' ? 'theme-' + theme : ''}`}></div>
      {threat.level >= 4 && <AlertOverlay />}
      <main className={`dashboard-container ${theme !== 'default' ? 'theme-' + theme : ''} ${threat.level >= 4 ? 'alert-active' : ''}`}>
      <header className="dashboard-header" style={{position: 'relative'}}>
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', gap: '8px' }}>
           {['default', 'combat', 'terminal', 'stealth'].map(t => (
             <button 
               key={t} 
               onClick={() => { setTheme(t); playChirp(660); }}
               style={{ 
                 width: '12px', height: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                 background: t === 'default' ? '#38bdf8' : t === 'combat' ? '#ef4444' : t === 'terminal' ? '#22c55e' : '#8b5cf6',
                 opacity: theme === t ? 1 : 0.3,
                 boxShadow: theme === t ? `0 0 10px ${t === 'default' ? '#38bdf8' : t === 'combat' ? '#ef4444' : t === 'terminal' ? '#22c55e' : '#8b5cf6'}` : 'none'
               }}
               title={t.toUpperCase() + ' MODE'}
             ></button>
           ))}
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.6, marginLeft: '10px' }}
            title={isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
          >
            {isMuted ? '🔈' : '🔊'}
          </button>
        </div>
        <button onClick={onLogout} className="glass-button" style={{position: 'absolute', right: 0, top: 0, padding: '8px 16px', width: 'auto', fontSize: '0.8rem'}}>DISCONNECT</button>
        <h1>Global <span className="gradient-text">Planetary</span> Dashboard</h1>
        <p>Real-time Live Telemetry Data • Fully Stateless • No Database Required</p>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '25px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="status-indicator">
            <span className="pulse-dot"></span> System Connected: ALL 8 FEEDS ACTIVE
          </div>
          
          <div 
            className={`voice-mode-indicator ${isVoiceMode ? 'active' : ''} ${voiceError ? 'error' : ''}`}
            onClick={toggleVoiceMode}
            title="TACTICAL VOICE INTERFACE: CLICK TO TOGGLE. SAY 'SYSTEM', 'SPACE', 'EARTH', 'BRIEFING'"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px', border: voiceError ? '1px solid var(--danger)' : '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="pulse-dot" style={{ backgroundColor: voiceError ? 'var(--danger)' : (isVoiceMode ? 'var(--primary)' : '#555'), boxShadow: isVoiceMode ? `0 0 10px ${voiceError ? 'var(--danger)' : 'var(--primary)'}` : 'none' }}></div>
            <span style={{ fontSize: '0.65rem', color: voiceError ? 'var(--danger)' : (isVoiceMode ? 'var(--primary)' : '#555'), letterSpacing: '1px' }}>
              {voiceError ? `ERROR: ${voiceError}` : (isVoiceMode ? `LISTENING: "${lastVoiceCommand || '...'}"` : 'VOICE COMMANDS OFF')}
            </span>
          </div>

          {isVoiceMode && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', animation: 'fadeIn 0.3s' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ color: 'var(--primary)', fontSize: '0.6rem', fontWeight: 'bold' }}>TACTICAL OVERRIDE:</span>
                 <input 
                   type="text" 
                   autoFocus
                   placeholder="ENTER COMMAND..."
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       handleVoiceCommand(e.currentTarget.value.toLowerCase());
                       e.currentTarget.value = '';
                     }
                   }}
                   style={{
                     background: 'rgba(56, 189, 248, 0.1)',
                     border: '1px solid var(--primary)',
                     color: 'var(--primary)',
                     padding: '6px 12px',
                     borderRadius: '4px',
                     fontSize: '0.75rem',
                     fontFamily: 'monospace',
                     width: '200px',
                     boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)'
                   }}
                 />
                 <button 
                   onClick={() => playChirp(880, 0.5)}
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.6rem', padding: '5px', cursor: 'pointer', borderRadius: '4px' }}
                 >
                   TEST AUDIO
                 </button>
               </div>
               <div style={{ fontSize: '0.55rem', color: 'var(--primary)', opacity: 0.6, letterSpacing: '1px' }}>
                 MATCHING: [SPACE] [EARTH] [CIVILIAN] [HISTORY] [BRIEFING] [TOGGLE 3D] [MUTE]
               </div>
             </div>
          )}

          <div className="threat-indicator" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 15px', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', border: `1px solid ${threat.color}44` }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>THREAT LEVEL:</span>
            <span style={{ color: threat.color, fontWeight: 'bold', letterSpacing: '2px', textShadow: `0 0 10px ${threat.color}44` }}>{threat.label}</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ width: '8px', height: '14px', background: i <= threat.level ? threat.color : 'rgba(255,255,255,0.1)', borderRadius: '1px' }}></div>
              ))}
            </div>
          </div>

          <button onClick={generateBrief} className="glass-button" style={{ width: 'auto', padding: '5px 15px', fontSize: '0.75rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            RE-GENERATE BRIEF
          </button>
        </div>

        {aiSummary && (
          <div className="glass-card" style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'left', maxWidth: '800px', margin: '20px auto 0', position: 'relative' }}>
             <div className="telemetry-item" style={{ textAlign: 'left' }}>
             <h3 style={{color: '#10b981', margin: '0 0 8px 0', fontSize: '0.9rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px'}}>
               <div className="pulse-dot" style={{width: '8px', height: '8px', background: '#10b981'}}></div>
               AI INTELLIGENCE BRIEF
             </h3>
             <p style={{fontSize: '0.95rem', lineHeight: 1.5, margin: 0, color: '#a7f3d0', paddingRight: '100px'}}>{aiSummary}</p>
             
             <button 
               onClick={() => {
                 if (isSpeaking) {
                   window.speechSynthesis.cancel();
                   setIsSpeaking(false);
                 } else {
                   const utterance = new SpeechSynthesisUtterance(aiSummary);
                   utterance.onend = () => setIsSpeaking(false);
                   setIsSpeaking(true);
                   window.speechSynthesis.speak(utterance);
                 }
               }}
               className="glass-button" 
               style={{ 
                 position: 'absolute', right: '15px', bottom: '15px', width: 'auto', padding: '5px 10px', fontSize: '0.7rem',
                 background: isSpeaking ? 'var(--danger)' : 'rgba(16, 185, 129, 0.2)',
                 borderColor: isSpeaking ? 'var(--danger)' : '#10b981',
                 color: isSpeaking ? '#fff' : '#10b981'
               }}
             >
               {isSpeaking ? 'STOP AUDIO' : 'SPEAK BRIEF'}
             </button>
           </div>
          </div>
        )}
      </header>

      {loading ? (
        <div className="loader"></div>
      ) : (
        <>
          <nav className="view-navigation" style={{display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap'}}>
             {['ALL', 'SPACE', 'EARTH', 'CIVILIAN', 'HISTORY'].map(id => (
                <button 
                  key={id} 
                  onClick={() => setActiveView(id)}
                  className={`glass-button`}
                  style={{
                    padding: '8px 24px', 
                    borderRadius: '30px', 
                    background: activeView === id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: activeView === id ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: activeView === id ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontWeight: activeView === id ? 'bold' : 'normal',
                    minWidth: '130px'
                  }}
                >
                  {id === 'ALL' ? 'ALL SYSTEMS' : id === 'SPACE' ? 'SPACE COMMAND' : id === 'EARTH' ? 'TERRESTRIAL' : id === 'CIVILIAN' ? 'CIVILIAN SEC' : 'ARCHIVES'}
                </button>
             ))}
          </nav>

          {/* SYSTEM ALERT TICKER */}
          <div className="ticker-wrap">
            <div className="ticker">
              {getSystemAlerts().map((alert, idx) => (
                <div key={idx} className="ticker-item">
                  <span className="alert-dot"></span>
                  {alert.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-grid">

            {/* SYSTEM GLOBAL WIDGETS */}
            {(activeView === 'ALL') && (
              <>
                <section className="glass-card widget" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="widget-header" style={{ marginBottom: 0, borderBottom: 'none' }}>
                      <h2 className="widget-title" style={{ textAlign: 'center', width: '100%', fontSize: '1rem', opacity: 0.6 }}>Global Chronometer</h2>
                    </div>
                    <div className="clock-display">
                      {now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="clock-date">
                      {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                    </div>
                </section>

                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">System Diagnostics</h2>
                    <span className="status-indicator">ONLINE</span>
                  </div>
                  <div style={{marginTop: '10px'}}>
                    <div className="diag-row">
                      <div className="diag-label"><span>Telemetry Core</span> <span>98%</span></div>
                      <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '98%'}}></div></div>
                    </div>
                    <div className="diag-row">
                      <div className="diag-label"><span>NVIDIA Inference</span> <span>{Math.floor(Math.random() * 5 + 85)}%</span></div>
                      <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '88%', background: 'var(--accent)'}}></div></div>
                    </div>
                    <div className="diag-row">
                      <div className="diag-label"><span>Proxy Uplinks</span> <span>100%</span></div>
                      <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '100%', background: 'var(--success)'}}></div></div>
                    </div>
                  </div>
                </section>

                <section className="glass-card widget" style={{ background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                    <div className="widget-header">
                      <h2 className="widget-title">Uplink Packet Stream</h2>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.2)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>LIVE DECRYPT</span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--primary)', opacity: 0.8 }}>
                      {packets.map(p => (
                        <div key={p.id} style={{ marginBottom: '8px', borderLeft: '2px solid var(--primary)', paddingLeft: '8px' }}>
                          <span style={{ opacity: 0.5, fontSize: '0.6rem' }}>{new Date(p.id).toLocaleTimeString()}</span> {p.text}
                        </div>
                      ))}
                      {packets.length === 0 && <div className="empty-state">Waiting for packets...</div>}
                    </div>
                </section>
              </>
            )}

            {/* SPACE COMMAND */}
            {(activeView === 'ALL' || activeView === 'SPACE') && (
              <>
                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">Space Weather</h2>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>PROXY: NOAA SWPC</span>
                  </div>
                  {spaceWeather ? (
                    <div className="weather-main">
                      <div className={`weather-temp status-${spaceWeather.statusClass}`}>{spaceWeather.kpIndex}</div>
                      <div className="weather-desc">Planetary K-Index</div>
                      <div style={{marginTop: '24px'}}>
                        <div className="data-row">
                          <span className="data-label">Status</span>
                          <span className={`data-value status-${spaceWeather.statusClass}`}>{spaceWeather.condition}</span>
                        </div>
                      </div>
                    </div>
                  ) : <div className="empty-state">NOAA offline</div>}
                </section>

                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">Asteroid Watch</h2>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>PROXY: NASA NeoWs</span>
                  </div>
                  {asteroids.length > 0 ? (
                    <div>
                      {asteroids.map(ast => (
                        <div key={ast.id} className="earthquake-item" onClick={() => { setSelectedItem({ type: 'ASTEROID', data: ast }); playChirp(900); }} style={{ cursor: 'pointer' }}>
                          <div style={{ flex: 1, paddingRight: '10px' }}>
                            <div className="item-title">{ast.name}</div>
                            <div className="item-subtitle">Spd: {ast.velocity.toLocaleString()} km/h</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <div className={`status-${ast.isHazardous ? 'danger' : 'success'}`} style={{ fontWeight: 800 }}>
                              {ast.isHazardous ? 'HAZARD' : 'SAFE'}
                            </div>
                            <div style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>Dist: {ast.missDistance} km</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="empty-state">No nearby objects detected today.</div>}
                </section>

                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">Planetary Defense</h2>
                    <span className="status-indicator" style={{ color: 'var(--accent)' }}>LEVEL 2 READINESS</span>
                  </div>
                  <div style={{ padding: '10px 0' }}>
                    <div className="diag-row" style={{ marginBottom: '20px' }}>
                      <div className="diag-label"><span>Orbital Interceptors</span> <span>READY</span></div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                        {[1,2,3,4,5,6,7,8].map(i => (
                          <div key={i} style={{ flex: 1, height: '10px', background: i <= 6 ? 'var(--success)' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div>
                        ))}
                      </div>
                    </div>
                    <div className="diag-row" style={{ marginBottom: '20px' }}>
                      <div className="diag-label"><span>Kinetic Shielding</span> <span>ACTIVE (88%)</span></div>
                      <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '88%', background: 'var(--accent)' }}></div></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.5, fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                      <span>SCANNING DEEP SPACE...</span>
                      <span>SIG: NOMINAL</span>
                    </div>
                  </div>
                </section>

                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">ISS Telemetry</h2>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>PROXY: WhereTheISS</span>
                  </div>
                  {iss ? (
                    <div className="iss-main">
                      <div className="radar-container">
                        <div className="radar-sweep"></div>
                        <div className="radar-blip" style={{ top: '40%', left: '60%' }}></div>
                        <div style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center', fontSize: '0.7rem', color: 'rgba(16,185,129,0.6)' }}>TACTICAL OVERLAY: ON</div>
                      </div>
                      <div className="iss-main-val" style={{ textAlign: 'center' }}>{iss.velocity.toLocaleString()}</div>
                      <div className="iss-sub-val" style={{ textAlign: 'center' }}>km/h Speed</div>
                      <div style={{marginTop: '24px'}}>
                         <div className="data-row">
                          <span className="data-label">Coordinates</span>
                          <span className="data-value">{iss.latitude}/{iss.longitude}</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Altitude</span>
                          <span className="data-value">{iss.altitude.toLocaleString()} km</span>
                        </div>
                      </div>
                    </div>
                  ) : <div className="empty-state">ISS telemetry lost/rate-limited</div>}
                </section>
              </>
            )}

            {/* TERRESTRIAL / EARTH */}
            {(activeView === 'ALL' || activeView === 'EARTH') && (
              <>
                {activeView === 'EARTH' && (
                  <section className="glass-card widget">
                    <div className="widget-header">
                      <h2 className="widget-title">Atmospheric Composition</h2>
                      <span className="live-badge" style={{ background: '#22c55e' }}>REAL-TIME</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="stat-card">
                        <div className="stat-value" style={{ color: '#ef4444' }}>{planetary?.co2?.trend || '420.2'} <span style={{fontSize: '0.6rem'}}>PPM</span></div>
                        <div className="stat-label">Global CO2 Level</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value" style={{ color: '#fbbf24' }}>+{planetary?.temp?.station || '1.2'}°C</div>
                        <div className="stat-label">Temp Anomaly</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', fontSize: '0.7rem' }}>
                      <p style={{ margin: 0, opacity: 0.6 }}>Current atmospheric CO2 concentration is significantly above pre-industrial levels.</p>
                    </div>
                  </section>
                )}

                {activeView === 'EARTH' && (
                  <section className="glass-card widget" style={{ gridColumn: 'span 2', height: '480px', overflow: 'hidden' }}>
                    <div className="widget-header">
                      <h2 className="widget-title">Planetary Visualizer</h2>
                      <button 
                        onClick={() => { setIs3DMode(!is3DMode); playChirp(880); }}
                        className="glass-button"
                        style={{ padding: '4px 12px', fontSize: '0.7rem' }}
                      >
                        SWITCH TO {is3DMode ? '2D MAP' : '3D GLOBE'}
                      </button>
                    </div>
                    {is3DMode ? (
                      <TacticalGlobe earthquakes={earthquakes} iss={iss} />
                    ) : (
                      <div className="map-placeholder" style={{ height: '400px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
                        <div className="grid-overlay"></div>
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg" 
                          alt="World Map" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'grayscale(1) invert(1)' }} 
                        />
                        {/* 2D Markers mapping */}
                        {iss && (
                          <div style={{ position: 'absolute', top: `${50 - (Number(iss.latitude))/1.8}%`, left: `${50 + (Number(iss.longitude))/3.6}%`, transform: 'translate(-50%, -50%)' }}>
                            <div className="ping-dot" style={{ background: '#38bdf8' }}></div>
                            <span style={{ color: '#38bdf8', fontSize: '0.6rem', marginLeft: '10px' }}>ISS</span>
                          </div>
                        )}
                        {earthquakes.slice(0, 5).map(q => (
                          <div key={q.id} style={{ position: 'absolute', top: `${50 - q.lat/1.8}%`, left: `${50 + q.lng/3.6}%`, transform: 'translate(-50%, -50%)' }}>
                            <div className="ping-dot" style={{ background: '#ef4444' }}></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <section className="glass-card widget" style={{ gridColumn: activeView === 'ALL' ? 'span 2' : 'auto' }}>
                  <div className="widget-header">
                    <h2 className="widget-title">Strategic World Uplink</h2>
                    <span className="status-indicator">LIVE POSITIONING</span>
                  </div>
                  <div className="map-canvas">
                    {[20, 40, 60, 80].map(p => (
                      <div key={p} className="map-grid-line" style={{ width: '1px', height: '100%', left: `${p}%` }}></div>
                    ))}
                    {[25, 50, 75].map(p => (
                      <div key={p} className="map-grid-line" style={{ width: '100%', height: '1px', top: `${p}%` }}></div>
                    ))}
                    {iss && (
                      <div className="map-point" style={{ 
                        left: `${((iss.longitude + 180) / 360) * 100}%`,
                        top: `${((90 - iss.latitude) / 180) * 100}%`,
                        background: 'var(--accent)',
                        boxShadow: '0 0 15px var(--accent)'
                      }}>
                        <div className="map-point-label" style={{ color: 'var(--accent)', left: '10px' }}>ISS TGT</div>
                      </div>
                    )}
                    {[
                      { n: 'LDN', lat: 51.5, lng: 0 },
                      { n: 'NYC', lat: 40.7, lng: -74 },
                      { n: 'TKY', lat: 35.6, lng: 139 },
                      { n: 'SYD', lat: -33.8, lng: 151 }
                    ].map(city => (
                      <div key={city.n} className="map-point" style={{ 
                        left: `${((city.lng + 180) / 360) * 100}%`,
                        top: `${((90 - city.lat) / 180) * 100}%`,
                        opacity: 0.4,
                        width: '4px', height: '4px'
                      }}>
                        <div className="map-point-label" style={{ opacity: 0.6, top: '-15px' }}>{city.n}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '15px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    SATELLITE POSITIONING ACTIVE • SCANNING GLOBAL SECTORS
                  </div>
                </section>

                {/* ORBITAL SURVEILLANCE FEED */}
                <section className="glass-card widget satellite-feed" style={{ gridColumn: 'span 2', height: '350px', padding: 0, overflow: 'hidden', position: 'relative' }}>
                  <div className="widget-header" style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', padding: '5px 15px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="widget-title" style={{ fontSize: '0.8rem', color: 'var(--primary)', margin: 0 }}>SATELLITE FEED // ORBITAL-01</h2>
                    <button 
                      onClick={() => { setIsLiveFeed(!isLiveFeed); playChirp(440); }}
                      style={{ fontSize: '0.6rem', padding: '4px 10px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid var(--primary)', color: '#fff', cursor: 'pointer', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                    >
                      {isLiveFeed ? 'Archive Fallback' : 'Real-time Feed'}
                    </button>
                  </div>
                  
                  <div className="orbit-scan"></div>
                  <div className="corner-decor top-left"></div>
                  <div className="corner-decor bottom-right"></div>
                  
                  {isLiveFeed ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src="https://www.youtube.com/embed/P9C25Un7xaM?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0" 
                      title="ISS Live Feed" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      style={{ opacity: 0.8, filter: 'contrast(1.2) brightness(1.1) saturate(0.8)' }}
                    ></iframe>
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#000' }}>
                      <TacticalGlobe 
                        earthquakes={earthquakes} 
                        iss={iss} 
                      />
                    </div>
                  )}
                  
                  {/* Digital Overlays */}
                  <div className="orbit-scan-line"></div>
                  
                  <div style={{ position: 'absolute', bottom: '15px', left: '15px', zIndex: 10, fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--primary)', textShadow: '0 0 5px #000' }}>
                    LAT: {iss?.latitude || 'SCANNING...'} <br />
                    LON: {iss?.longitude || 'SCANNING...'} <br />
                    ALT: {iss?.altitude ? `${Math.round(iss.altitude)} KM` : 'CALCULATING...'}
                  </div>
                  
                  <div className="grid-overlay" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none' }}></div>
                  
                  <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ color: 'var(--danger)', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                      LIVE // {is3DMode ? 'TACTICAL RENDER' : 'SAT FEEDS'}
                    </div>
                    <button 
                      onClick={() => { setIs3DMode(!is3DMode); playChirp(660); }}
                      className="glass-button" 
                      style={{ padding: '4px 8px', fontSize: '0.6rem', background: is3DMode ? 'var(--primary)' : 'rgba(0,0,0,0.5)', color: is3DMode ? '#000' : 'var(--primary)', width: 'auto' }}
                    >
                      {is3DMode ? 'SWITCH TO VIDEO' : 'SWITCH TO 3D'}
                    </button>
                  </div>
                </section>

                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">Air Quality Target</h2>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>PROXY: Open-Meteo AQI</span>
                  </div>
                  {aqi ? (
                    <div className="weather-main">
                      <div className={`weather-temp status-${aqi.statusClass}`}>{aqi.aqi}</div>
                      <div className="weather-desc">European AQI</div>
                      <div style={{marginTop: '24px'}}>
                        <div className="data-row">
                          <span className="data-label">Status Level</span>
                          <span className={`data-value status-${aqi.statusClass}`}>{aqi.status}</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">PM2.5 Particles</span>
                          <span className="data-value">{aqi.pm25} μg/m³</span>
                        </div>
                      </div>
                    </div>
                  ) : <div className="empty-state">AQI monitoring offline</div>}
                </section>

                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">Global Earthquakes</h2>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>PROXY: USGS (1 Hr)</span>
                  </div>
                  {earthquakes.length > 0 ? (
                    <div>
                      {earthquakes.map(quake => (
                        <div key={quake.id} className="earthquake-item" onClick={() => { setSelectedItem({ type: 'EARTHQUAKE', data: quake }); playChirp(900); }} style={{ cursor: 'pointer' }}>
                          <div style={{ flex: 1, paddingRight: '10px' }}>
                            <div className="item-title" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{quake.place}</div>
                            <div className="item-subtitle">{quake.time}</div>
                          </div>
                          <div style={{textAlign: 'right', minWidth: '60px'}}>
                            <div className={`status-${quake.status}`} style={{ fontWeight: 800, fontSize: '1.2rem' }}>M{quake.magnitude}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="empty-state">No notable earthquakes in the last hour.</div>}
                </section>

                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">Atmospherics</h2>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>PROXY: Open-Meteo</span>
                  </div>
                  {weather ? (
                    <div className="weather-main">
                      <div className="weather-temp">{weather.temperature}°C</div>
                      <div className="weather-desc">{weather.condition}</div>
                      <div style={{marginTop: '24px'}}>
                        <div className="data-row">
                          <span className="data-label">Wind Velocity</span>
                          <span className="data-value">{weather.windspeed} km/h</span>
                        </div>
                      </div>
                    </div>
                  ) : <div className="empty-state">Atmospherics unavailable</div>}
                </section>
              </>
            )}

            {/* CIVILIAN SECTORS */}
            {(activeView === 'ALL' || activeView === 'CIVILIAN') && (
              <>
                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">Crypto Pulse</h2>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>PROXY: CoinGecko</span>
                  </div>
                  {cryptos.length > 0 ? (
                    <div>
                      {cryptos.map(cryp => (
                        <div key={cryp.symbol} className="earthquake-item">
                          <div style={{ flex: 1, paddingRight: '10px' }}>
                            <div className="item-title">{cryp.name}</div>
                            <div className="item-subtitle">{cryp.symbol}</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>${cryp.price.toLocaleString()}</div>
                            <div className={`status-${cryp.change >= 0 ? 'success' : 'danger'}`} style={{fontSize: '0.85rem'}}>
                               {cryp.change >= 0 ? '▲' : '▼'} {Math.abs(cryp.change).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="empty-state">Crypto feed rate-limited. Retrying...</div>}
                </section>

                <section className="glass-card widget">
                  <div className="widget-header">
                    <h2 className="widget-title">Live Flights (LND)</h2>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>PROXY: OpenSky</span>
                  </div>
                  {flights.length > 0 ? (
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {flights.map(flight => (
                        <div key={flight.id} className="flight-item">
                          <div>
                            <div className="item-title">{flight.flightNumber === 'N/A' && flight.airline ? flight.airline : flight.flightNumber}</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <div style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>
                              {flight.metrics.altitude}ft | {flight.metrics.speed}kts
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="empty-state">No flights or rate-limited. Retrying...</div>}
                </section>
              </>
            )}

            {/* ARCHIVES VIEW */}
            {activeView === 'HISTORY' && (
              <section className="glass-card widget" style={{ gridColumn: 'span 2' }}>
                <div className="widget-header">
                  <h2 className="widget-title">Planetary Logs & Archives</h2>
                  <span className="live-badge" style={{ background: 'rgba(255,255,255,0.1)' }}>SECURE STORAGE</span>
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {history.length > 0 ? (
                    history.map(log => (
                      <div key={log.id} className="data-packet" style={{ marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ color: log.type === 'SEISMIC' ? 'var(--danger)' : 'var(--warning)', fontWeight: 'bold', fontSize: '0.7rem' }}>[{log.type}]</span>
                          <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>{log.time}</span>
                        </div>
                        <div style={{ fontSize: '1rem', color: '#fff' }}>{log.detail}</div>
                      </div>
                    ))
                  ) : <div className="empty-state">No significant events recorded in current session.</div>}
                </div>
              </section>
            )}

            {/* AI Core interacts with global scope */}
            <AIChatWidget context={{ weather, flights, iss, earthquakes, asteroids, aqi, cryptos, spaceWeather, planetary }} />

          </div>
          {selectedItem && (
            <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
              <div className="glass-card modal" onClick={e => e.stopPropagation()}>
                <div className="widget-header">
                  <h2 className="widget-title">TACTICAL DATA BREAKDOWN</h2>
                  <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>
                <div className="modal-content">
                  <div style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {selectedItem.type === 'ASTEROID' ? selectedItem.data.name : selectedItem.data.place}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
                    <div className="data-packet" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
                      <div className="data-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>CLASSIFICATION</div>
                      <div className="data-value" style={{ fontWeight: 800 }}>{selectedItem.type}</div>
                    </div>
                    {selectedItem.type === 'ASTEROID' ? (
                      <>
                        <div className="data-packet" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
                          <div className="data-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>VELOCITY</div>
                          <div className="data-value">{selectedItem.data.velocity.toLocaleString()} KM/H</div>
                        </div>
                        <div className="data-packet" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
                          <div className="data-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>HAZARD STATUS</div>
                          <div className="data-value" style={{ color: selectedItem.data.isHazardous ? 'var(--danger)' : 'var(--success)', fontWeight: 800 }}>
                            {selectedItem.data.isHazardous ? 'CRITICAL' : 'NOMINAL'}
                          </div>
                        </div>
                        <div className="data-packet" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
                          <div className="data-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>MISS DISTANCE</div>
                          <div className="data-value">{selectedItem.data.missDistance} KM</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="data-packet" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
                          <div className="data-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>MAGNITUDE</div>
                          <div className="data-value" style={{ color: parseFloat(selectedItem.data.magnitude) > 4.5 ? 'var(--danger)' : 'var(--success)', fontWeight: 800 }}>
                            {selectedItem.data.magnitude} Mw
                          </div>
                        </div>
                        <div className="data-packet" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
                          <div className="data-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>COORDINATES</div>
                          <div className="data-value">{selectedItem.data.coordinates}</div>
                        </div>
                        <div className="data-packet" style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px' }}>
                          <div className="data-label" style={{ fontSize: '0.6rem', opacity: 0.5 }}>TIME OF IMPACT</div>
                          <div className="data-value">{new Date(selectedItem.data.time).toLocaleTimeString()}</div>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--primary)', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.6 }}>
                    // SCANNING SECTOR FOR AUXILIARY ANOMALIES... <br/>
                    // ENCRYPTION STATUS: VERIFIED <br/>
                    // UPLINK STRENGTH: SIGNAL NOMINAL <br/>
                    // TELEMETRY SOURCE: {selectedItem.type === 'ASTEROID' ? 'NASA-NEOWS' : 'USGS-GCMT'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
    </>
  );
}

function AIChatWidget({ context }: { context: any }) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'PLANETARY INTEL CORE ONLINE. TELEMETRY STREAM ESTABLISHED. STATE YOUR QUERY.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'ERROR: COMMUNICATION PROTOCOL BREACH.' }]);
      }
    } catch(e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'FATAL: CORE LINK LOST.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section className="glass-card widget ai-tactical-widget" style={{ gridColumn: 'span 2' }}>
      <div className="widget-header">
        <h2 className="widget-title">NVIDIA Intel Core</h2>
        <span className="status-indicator">COGNITIVE OVERLAY ACTIVE</span>
      </div>
      
      <div className="ai-chat-window">
        <div className="ai-chat-history" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role === 'user' ? 'chat-user' : 'chat-assistant'}`}>
              {m.content}
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
        </div>
        <form className="ai-chat-input-container" onSubmit={sendMessage}>
          <input 
            type="text" 
            className="ai-chat-input" 
            placeholder="Ask about live flights, asteroids, crypto..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" className="ai-chat-submit" disabled={isTyping || !input.trim()}>
            TRANSMIT
          </button>
        </form>
      </div>
    </section>
  );
}
