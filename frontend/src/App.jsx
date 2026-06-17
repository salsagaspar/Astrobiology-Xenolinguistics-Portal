import React, { useState, useEffect, useRef } from "react";
import { 
  Globe, 
  MessageSquare, 
  Settings, 
  Volume2, 
  BarChart3, 
  HelpCircle, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  Search, 
  BookOpen,
  ArrowRight,
  Database
} from "lucide-react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement
} from "chart.js";
import { Scatter, Bar } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, CategoryScale, BarElement);

const API_BASE = "http://localhost:8000/api";

function App() {
  const [activeTab, setActiveTab] = useState("predictor");
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem("groq_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [health, setHealth] = useState({ status: "checking", models_loaded: {} });

  // Load API Health on start
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: "offline", models_loaded: {} }));
  }, []);

  const saveApiKey = (key) => {
    setGroqKey(key);
    localStorage.setItem("groq_api_key", key);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen flex flex-col scanline relative">
      {/* Header */}
      <header className="border-b border-[var(--border-cyan)] bg-[rgba(10,12,20,0.8)] backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[rgba(0,242,254,0.1)] border border-[var(--text-cyan)] flex items-center justify-center text-[var(--text-cyan)] shadow-[0_0_15px_rgba(0,242,254,0.2)]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-cyan)] to-[#a855f7] tracking-wider font-tech">
              XENODECIPHER & COSMOBIO
            </h1>
            <p className="text-xs text-[var(--text-grey)] font-mono">ASTROBIOLOGY & XENOLINGUISTICS PORTAL v1.0.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Health Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[rgba(13,17,28,0.6)] border border-[var(--border-cyan)] text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${
              health.status === "healthy" ? "bg-[var(--text-green)] shadow-[0_0_8px_var(--text-green)]" : "bg-red-500 animate-pulse"
            }`} />
            <span>SYS: {health.status.toUpperCase()}</span>
          </div>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-cyan)] transition-all"
            title="Configure Groq Key"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Panel Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 border-r border-[var(--border-cyan)] bg-[rgba(10,12,20,0.4)] p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("predictor")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-tech transition-all border ${
              activeTab === "predictor" 
                ? "bg-[rgba(0,242,254,0.1)] border-[var(--text-cyan)] text-[var(--text-cyan)] shadow-[0_0_15px_rgba(0,242,254,0.1)]" 
                : "border-transparent text-[var(--text-grey)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--text-white)]"
            }`}
          >
            <Globe className="w-5 h-5" />
            <span>Biosignatures</span>
          </button>

          <button
            onClick={() => setActiveTab("translator")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-tech transition-all border ${
              activeTab === "translator" 
                ? "bg-[rgba(57,255,20,0.1)] border-[var(--text-green)] text-[var(--text-green)] shadow-[0_0_15px_rgba(57,255,20,0.1)]" 
                : "border-transparent text-[var(--text-grey)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--text-white)]"
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span>Xenolinguistics</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-tech transition-all border ${
              activeTab === "chat" 
                ? "bg-[rgba(112,0,255,0.1)] border-[#a855f7] text-[#c084fc] shadow-[0_0_15px_rgba(112,0,255,0.1)]" 
                : "border-transparent text-[var(--text-grey)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--text-white)]"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Cosmo-LLM RAG</span>
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-tech transition-all border ${
              activeTab === "dashboard" 
                ? "bg-[rgba(0,242,254,0.1)] border-[var(--text-cyan)] text-[var(--text-cyan)] shadow-[0_0_15px_rgba(0,242,254,0.1)]" 
                : "border-transparent text-[var(--text-grey)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--text-white)]"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics Hub</span>
          </button>
        </nav>

        {/* Workspace Display Area */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Settings Overlay Panel */}
          {showSettings && (
            <div className="absolute inset-0 bg-[rgba(7,9,14,0.95)] z-20 flex items-center justify-center p-6">
              <div className="glass-card max-w-md w-full">
                <h3 className="text-lg mb-4 text-[var(--text-cyan)]">System Configuration</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-[var(--text-grey)] block mb-1.5 font-mono">GROQ API KEY</label>
                    <input 
                      type="password"
                      placeholder="gsk_..."
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => saveApiKey(groqKey)}
                      className="btn-cyber flex-1"
                    >
                      Save Key
                    </button>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 border border-red-500/30 text-red-400 text-xs uppercase font-tech hover:bg-red-500/10 rounded transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "predictor" && <BiosignaturePredictorPanel />}
          {activeTab === "translator" && <WhaleCodaTranslatorPanel />}
          {activeTab === "chat" && <CosmoChatPanel api_key={groqKey} />}
          {activeTab === "dashboard" && <AnalyticsHubPanel />}
        </main>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 1. BIOSIGNATURE PREDICTOR PANEL
// ----------------------------------------------------
function BiosignaturePredictorPanel() {
  const [params, setParams] = useState({
    planet_radius_earth: 1.2,
    orbital_period_days: 250,
    surface_temperature_K: 288,
    atmospheric_composition: "O2_N2_O3",
    oxygen_percentage: 21.0,
    methane_ppm: 1800.0,
    water_vapor_detected: "Yes",
    biofluorescence_signal: 0.15,
    habitable_zone_position: "conservative_HZ"
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict-biosignature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [params]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      {/* Parameter Adjustment Panel */}
      <div className="glass-card flex-1">
        <h2 className="text-xl mb-4 text-[var(--text-cyan)] flex items-center gap-2 border-b border-[var(--border-cyan)] pb-2">
          <Globe className="w-5 h-5 animate-pulse" />
          Planetary Parameters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Temperature */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Surface Temperature</span>
              <span className="text-[var(--text-cyan)]">{params.surface_temperature_K} K ({Math.round(params.surface_temperature_K - 273.15)}°C)</span>
            </div>
            <input 
              type="range" min="100" max="800" step="1"
              value={params.surface_temperature_K}
              onChange={(e) => setParams({...params, surface_temperature_K: parseFloat(e.target.value)})}
            />
          </div>

          {/* Planet Radius */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Planet Radius ($R_\oplus$)</span>
              <span className="text-[var(--text-cyan)]">{params.planet_radius_earth} Earth Radii</span>
            </div>
            <input 
              type="range" min="0.3" max="8.0" step="0.05"
              value={params.planet_radius_earth}
              onChange={(e) => setParams({...params, planet_radius_earth: parseFloat(e.target.value)})}
            />
          </div>

          {/* Orbital Period */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Orbital Period</span>
              <span className="text-[var(--text-cyan)]">{params.orbital_period_days} Days</span>
            </div>
            <input 
              type="range" min="5" max="1000" step="5"
              value={params.orbital_period_days}
              onChange={(e) => setParams({...params, orbital_period_days: parseFloat(e.target.value)})}
            />
          </div>

          {/* Oxygen % */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Atmospheric Oxygen</span>
              <span className="text-[var(--text-cyan)]">{params.oxygen_percentage}%</span>
            </div>
            <input 
              type="range" min="0" max="40" step="0.1"
              value={params.oxygen_percentage}
              onChange={(e) => setParams({...params, oxygen_percentage: parseFloat(e.target.value)})}
            />
          </div>

          {/* Methane ppm */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Atmospheric Methane</span>
              <span className="text-[var(--text-cyan)]">{params.methane_ppm} ppm</span>
            </div>
            <input 
              type="range" min="0" max="10000" step="50"
              value={params.methane_ppm}
              onChange={(e) => setParams({...params, methane_ppm: parseFloat(e.target.value)})}
            />
          </div>

          {/* Biofluorescence */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Biofluorescence Signal</span>
              <span className="text-[var(--text-cyan)]">{params.biofluorescence_signal} Strength</span>
            </div>
            <input 
              type="range" min="0" max="1.0" step="0.01"
              value={params.biofluorescence_signal}
              onChange={(e) => setParams({...params, biofluorescence_signal: parseFloat(e.target.value)})}
            />
          </div>

          {/* Atmosphere Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-grey)] font-mono">Atmosphere Mix</label>
            <select 
              value={params.atmospheric_composition} 
              onChange={(e) => setParams({...params, atmospheric_composition: e.target.value})}
              className="input-field"
            >
              <option value="O2_N2_O3">Oxygen-Rich ($O_2/N_2/O_3$)</option>
              <option value="N2_O2_CO2">Earth-like Pre-Industrial ($N_2/O_2/CO_2$)</option>
              <option value="CO2_SO2_N2">Venusian Sulfuric ($CO_2/SO_2/N_2$)</option>
              <option value="H2_He_CH4">Gas Giant Jovian ($H_2/He/CH_4$)</option>
              <option value="N2_CH4_Ar">Titan Methane ($N_2/CH_4/Ar$)</option>
              <option value="H2O_CO2_N2">Steam World ($H_2O/CO_2/N_2$)</option>
            </select>
          </div>

          {/* HZ Position Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-grey)] font-mono">Habitable Zone Position</label>
            <select 
              value={params.habitable_zone_position} 
              onChange={(e) => setParams({...params, habitable_zone_position: e.target.value})}
              className="input-field"
            >
              <option value="conservative_HZ">Conservative Habitable Zone</option>
              <option value="optimistic_HZ">Optimistic Habitable Zone</option>
              <option value="inner_edge">Inner Edge / Hot Zone</option>
              <option value="outer_edge">Outer Edge / Cold Zone</option>
              <option value="outside_HZ">Completely Outside HZ</option>
            </select>
          </div>

          {/* Water Vapor Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-grey)] font-mono">Water Vapor Detected</label>
            <select 
              value={params.water_vapor_detected} 
              onChange={(e) => setParams({...params, water_vapor_detected: e.target.value})}
              className="input-field"
            >
              <option value="Yes">Confirmed Yes</option>
              <option value="Tentative">Tentative / Marginal</option>
              <option value="No">No / Under Detection Limits</option>
            </select>
          </div>
        </div>
      </div>

      {/* Model Output Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="glass-card flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-[rgba(255,255,255,0.05)] font-bold text-7xl select-none font-tech">BIO</div>
          <h3 className="text-xs text-[var(--text-grey)] font-mono mb-4 uppercase">AI Biosignature Confidence</h3>

          {loading ? (
            <div className="w-40 h-40 rounded-full border-4 border-[rgba(0,242,254,0.1)] border-t-[var(--text-cyan)] animate-spin flex items-center justify-center mb-4" />
          ) : (
            <div className="relative mb-6">
              {/* Outer Glowing Circle */}
              <div 
                className="w-48 h-48 rounded-full border border-[var(--border-cyan)] flex flex-col items-center justify-center transition-all duration-500"
                style={{
                  boxShadow: prediction?.biosignature_confidence_score > 60 
                    ? "inset 0 0 20px rgba(57,255,20,0.15), 0 0 25px rgba(57,255,20,0.25)" 
                    : "inset 0 0 20px rgba(0,242,254,0.15), 0 0 25px rgba(0,242,254,0.25)",
                  borderColor: prediction?.biosignature_confidence_score > 60 ? "var(--text-green)" : "var(--text-cyan)"
                }}
              >
                <span className="text-6xl font-black font-tech tracking-tighter">
                  {prediction?.biosignature_confidence_score}%
                </span>
                <span className="text-xs text-[var(--text-grey)] font-mono uppercase mt-1">confidence</span>
              </div>
            </div>
          )}

          <div className="w-full">
            <h4 className={`text-sm font-bold mb-2 ${
              prediction?.biosignature_confidence_score > 60 ? "text-[var(--text-green)]" : "text-[var(--text-cyan)]"
            }`}>
              {prediction?.outcome_classification}
            </h4>
            <p className="text-xs text-[var(--text-grey)] leading-relaxed">
              Exoplanet confidence scores represent a multi-variate analysis combining atmospheric thermodynamics, photolysis, and radiative equilibriums.
            </p>
          </div>
        </div>

        {/* Biological Context Alert */}
        <div className="glass-card border-l-4 border-l-[var(--text-green)] p-4 bg-[rgba(57,255,20,0.02)]">
          <h4 className="text-xs font-bold text-[var(--text-green)] mb-1 uppercase font-tech">Astrobiology Guideline</h4>
          <p className="text-xs text-[var(--text-grey)] leading-relaxed">
            Values above 75% confidence generally correspond to biosignature signals containing co-existing water vapor, high oxygen percentages, and significant biofluorescence in conservative habitable zones.
          </p>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. WHALE CODA TRANSLATOR PANEL
// ----------------------------------------------------
function WhaleCodaTranslatorPanel() {
  const [params, setParams] = useState({
    click_count: 15,
    inter_click_interval_ms: 850.0,
    frequency_hz: 12000.0,
    duration_seconds: 5.5,
    matriarch_present: "Yes"
  });

  const [translation, setTranslation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);

  const runTranslation = async () => {
    try {
      const res = await fetch(`${API_BASE}/translate-coda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      setTranslation(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runTranslation();
  }, [params]);

  // Audio simulation beep beeps
  const simulateAudio = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    // Initialize web audio
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    let currentClick = 0;
    const totalClicks = Math.min(params.click_count, 15); // cap sound triggers for user comfort
    const interval = params.inter_click_interval_ms;
    
    const playClick = () => {
      if (currentClick >= totalClicks) {
        setIsPlaying(false);
        return;
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      // Frequency scaling to acoustic human hearing limit
      osc.frequency.setValueAtTime(params.frequency_hz > 15000 ? 3000 : params.frequency_hz / 5, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
      
      currentClick++;
      setTimeout(playClick, interval);
    };
    
    playClick();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
      {/* Parameter Control Panel */}
      <div className="glass-card flex-1 green-theme">
        <h2 className="text-xl mb-4 text-[var(--text-green)] flex items-center gap-2 border-b border-[var(--border-green)] pb-2">
          <Volume2 className="w-5 h-5 animate-pulse" />
          Acoustic Click Parameters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Click Count */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Click Count</span>
              <span className="text-[var(--text-green)]">{params.click_count} clicks</span>
            </div>
            <input 
              type="range" min="1" max="40" step="1"
              value={params.click_count}
              onChange={(e) => setParams({...params, click_count: parseInt(e.target.value)})}
            />
          </div>

          {/* Inter-click Interval */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Inter-Click Interval (ICI)</span>
              <span className="text-[var(--text-green)]">{params.inter_click_interval_ms} ms</span>
            </div>
            <input 
              type="range" min="100" max="2000" step="10"
              value={params.inter_click_interval_ms}
              onChange={(e) => setParams({...params, inter_click_interval_ms: parseFloat(e.target.value)})}
            />
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Vocal Frequency</span>
              <span className="text-[var(--text-green)]">{params.frequency_hz} Hz ({Math.round(params.frequency_hz / 1000)} kHz)</span>
            </div>
            <input 
              type="range" min="500" max="30000" step="500"
              value={params.frequency_hz}
              onChange={(e) => setParams({...params, frequency_hz: parseFloat(e.target.value)})}
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span>Coda Duration</span>
              <span className="text-[var(--text-green)]">{params.duration_seconds} sec</span>
            </div>
            <input 
              type="range" min="0.1" max="30" step="0.1"
              value={params.duration_seconds}
              onChange={(e) => setParams({...params, duration_seconds: parseFloat(e.target.value)})}
            />
          </div>

          {/* Matriarch Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-grey)] font-mono">Matriarch Present</label>
            <select 
              value={params.matriarch_present} 
              onChange={(e) => setParams({...params, matriarch_present: e.target.value})}
              className="input-field green-theme"
            >
              <option value="Yes">Yes (Matriarch Social Anchor)</option>
              <option value="No">No (Decentralized Coordination)</option>
            </select>
          </div>

          {/* Simulate Coda Audio */}
          <div className="flex items-end">
            <button 
              onClick={simulateAudio}
              disabled={isPlaying}
              className={`w-full btn-cyber green-theme flex items-center justify-center gap-2 ${isPlaying ? "opacity-50" : ""}`}
            >
              <Volume2 className="w-4 h-4" />
              {isPlaying ? "Vocalizing..." : "Simulate Acoustic Coda"}
            </button>
          </div>
        </div>

        {/* Simple visualizer waves */}
        {isPlaying && (
          <div className="flex gap-1 items-end h-12 mt-6 justify-center">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i}
                className="w-1.5 bg-[var(--text-green)] rounded-t transition-all duration-100"
                style={{ 
                  height: `${Math.random() * 100}%`,
                  animation: "pulse 0.4s infinite ease-in-out" 
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Prediction Output & Confidence Distribution */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="glass-card green-theme flex-1 flex flex-col">
          <h3 className="text-xs text-[var(--text-grey)] font-mono mb-4 uppercase">AI Xenolinguistics Translation</h3>
          
          <div className="bg-[rgba(13,17,28,0.6)] border border-[var(--border-green)] rounded p-4 mb-4 flex-1 flex flex-col justify-center">
            <span className="text-xs text-[var(--text-grey)] font-mono block mb-1">PREDICTED CONTEXT:</span>
            <span className="text-xl font-bold text-[var(--text-green)] tracking-wider font-tech">
              {translation?.predicted_context?.replace("_", " ")}
            </span>
            <span className="text-xs text-[var(--text-grey)] mt-2 font-mono">
              Confidence: <span className="text-white">{translation?.prediction_confidence_pct}%</span>
            </span>
          </div>

          <h4 className="text-xs text-[var(--text-grey)] font-mono mb-2 uppercase">Probability Distribution</h4>
          <div className="flex flex-col gap-2">
            {translation?.confidence_distribution && Object.entries(translation.confidence_distribution)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([key, val]) => (
                <div key={key} className="text-xs">
                  <div className="flex justify-between font-mono mb-0.5 text-[var(--text-grey)]">
                    <span>{key.replace("_", " ")}</span>
                    <span>{val}%</span>
                  </div>
                  <div className="w-full bg-[rgba(13,17,28,0.9)] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[var(--text-green)] h-full rounded-full" 
                      style={{ width: `${val}%`, boxShadow: "0 0 5px var(--text-green)" }}
                    />
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. COSMO-LLM RAG CHAT PANEL
// ----------------------------------------------------
function CosmoChatPanel({ api_key }) {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hello! I am the CosmoBio RAG Assistant. Ask me anything about the extremophile database, survival durations, biological analogs, or planetary simulation chamber results." 
    }
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeContexts, setActiveContexts] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query;
    setQuery("");
    setMessages(prev => [...prev, { role: "user", content: userQuery }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/cosmo-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, api_key })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      if (data.contexts) {
        setActiveContexts(data.contexts);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error communicating with server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto h-[75vh]">
      {/* Chat Area */}
      <div className="glass-card flex-1 flex flex-col overflow-hidden">
        <h2 className="text-xl mb-4 text-[#c084fc] flex items-center gap-2 border-b border-[rgba(168,85,247,0.2)] pb-2 font-tech">
          <MessageSquare className="w-5 h-5" />
          RAG Chat Terminal
        </h2>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 mb-4 font-mono text-sm">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col p-3.5 rounded border ${
                m.role === "user" 
                  ? "bg-[rgba(168,85,247,0.05)] border-[rgba(168,85,247,0.3)] self-end max-w-[80%]" 
                  : "bg-[rgba(13,17,28,0.6)] border-[var(--border-cyan)] self-start max-w-[85%]"
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                m.role === "user" ? "text-[#c084fc]" : "text-[var(--text-cyan)]"
              }`}>
                {m.role === "user" ? "COSMOLOGIST" : "COSMOBIO ASSISTANT"}
              </span>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-grey)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[var(--text-cyan)] animate-bounce" />
              <span>AI is querying database & thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about micro-organism survival, planet analogs, temperature thresholds..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="input-field flex-1"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="btn-cyber flex items-center gap-1.5"
            style={{ color: "#c084fc", borderColor: "#c084fc" }}
          >
            Send <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* RAG Context Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden">
        <div className="glass-card flex-1 flex flex-col overflow-hidden">
          <h3 className="text-xs text-[var(--text-grey)] font-mono mb-3 uppercase flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            Retrieved Sources ({activeContexts.length})
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
            {activeContexts.length === 0 ? (
              <div className="text-center text-xs text-[var(--text-grey)] font-mono py-12">
                Ask a question to retrieve relevant contexts from the local CSV knowledge base.
              </div>
            ) : (
              activeContexts.map((c, i) => (
                <div key={i} className="bg-[rgba(13,17,28,0.8)] border border-[rgba(0,242,254,0.15)] rounded p-3 text-xs">
                  <div className="flex justify-between font-mono font-bold text-[var(--text-cyan)] mb-1">
                    <span className="truncate max-w-[180px]">{c.title}</span>
                    <span className="text-[10px] text-[var(--text-grey)]">score: {c.score.toFixed(3)}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-grey)] font-mono leading-relaxed bg-[rgba(0,0,0,0.2)] p-2 rounded border border-[rgba(255,255,255,0.03)]">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. ANALYTICS HUB PANEL
// ----------------------------------------------------
function AnalyticsHubPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/dataset-stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 rounded-full border-4 border-[rgba(0,242,254,0.1)] border-t-[var(--text-cyan)] animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 glass-card">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="font-tech text-red-400">Failed to load statistics</h3>
        <p className="text-xs text-[var(--text-grey)] font-mono">Ensure python backend is running on port 8000</p>
      </div>
    );
  }

  // 1. Bar Chart: Coda Types
  const codaData = {
    labels: Object.keys(stats.whales.coda_distribution).slice(0, 6),
    datasets: [{
      label: "Coda Frequencies",
      data: Object.values(stats.whales.coda_distribution).slice(0, 6),
      backgroundColor: "rgba(57, 255, 20, 0.4)",
      borderColor: "var(--text-green)",
      borderWidth: 1
    }]
  };

  // 2. Bar Chart: Habitable Zones
  const hzData = {
    labels: Object.keys(stats.exoplanets.hz_distribution),
    datasets: [{
      label: "Planet HZ Counts",
      data: Object.values(stats.exoplanets.hz_distribution),
      backgroundColor: "rgba(0, 242, 254, 0.4)",
      borderColor: "var(--text-cyan)",
      borderWidth: 1
    }]
  };

  // 3. Scatter Plot: PCA Coordinates
  const scatterColors = {
    "conservative_HZ": "rgba(57, 255, 20, 0.85)",  // bright green
    "optimistic_HZ": "rgba(0, 242, 254, 0.85)",   // cyan
    "inner_edge": "rgba(255, 165, 0, 0.85)",       // orange
    "outer_edge": "rgba(112, 0, 255, 0.85)",       // purple
    "outside_HZ": "rgba(239, 68, 68, 0.85)"        // red
  };

  const pcaScatterData = {
    datasets: Object.keys(scatterColors).map(hzName => ({
      label: hzName.replace("_", " "),
      data: stats.exoplanets.scatterplot
        .filter(p => p.hz === hzName)
        .map(p => ({ x: p.x, y: p.y, label: `${p.id} (${p.star})` })),
      backgroundColor: scatterColors[hzName],
      pointRadius: 6,
      pointHoverRadius: 8
    }))
  };

  const scatterOptions = {
    scales: {
      x: { title: { display: true, text: "Principal Component 1", color: "var(--text-grey)", font: { family: "Inter" } } },
      y: { title: { display: true, text: "Principal Component 2", color: "var(--text-grey)", font: { family: "Inter" } } }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => ctx.raw.label
        }
      },
      legend: {
        labels: {
          color: "var(--text-white)",
          font: { family: "Orbitron", size: 10 }
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <span className="text-xs text-[var(--text-grey)] font-mono">Exoplanets Catalogued</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black font-tech text-[var(--text-cyan)]">{stats.exoplanets.total}</span>
            <Globe className="w-5 h-5 text-[var(--text-cyan)]" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-4 flex flex-col justify-between">
          <span className="text-xs text-[var(--text-grey)] font-mono">Average Temp (K)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black font-tech text-[var(--text-cyan)]">{stats.exoplanets.avg_temp_K} K</span>
            <span className="text-xs text-[var(--text-grey)] font-mono">({Math.round(stats.exoplanets.avg_temp_K - 273.15)}°C)</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-4 green-theme flex flex-col justify-between">
          <span className="text-xs text-[var(--text-grey)] font-mono">Sperm Whale Recordings</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black font-tech text-[var(--text-green)]">{stats.whales.total}</span>
            <Database className="w-5 h-5 text-[var(--text-green)]" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-card p-4 green-theme flex flex-col justify-between">
          <span className="text-xs text-[var(--text-grey)] font-mono">Avg Whale Vocal Complexity</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black font-tech text-[var(--text-green)]">{stats.whales.avg_complexity}</span>
            <span className="text-xs text-[var(--text-grey)] font-mono">Scale 1-10</span>
          </div>
        </div>
      </div>

      {/* Main PCA scatterplot mapping */}
      <div className="glass-card">
        <h3 className="text-lg text-[var(--text-cyan)] mb-4 border-b border-[var(--border-cyan)] pb-2 font-tech">
          Planetary Chemical Distribution (PCA Dimensionality Reduction)
        </h3>
        <div className="h-96">
          <Scatter data={pcaScatterData} options={scatterOptions} />
        </div>
        <p className="text-xs text-[var(--text-grey)] mt-3 font-mono leading-relaxed bg-[rgba(13,17,28,0.6)] p-3 rounded border border-[rgba(0,242,254,0.1)]">
          **PCA Map Analysis:** The scatterplot compresses 6 major exoplanet properties (planet radius, orbit period, surface temperature, oxygen %, methane ppm, and biofluorescence signal) into a 2D space. The groupings show clear segregation based on their Habitable Zone status, serving as a powerful map for targeting biosignature search pipelines.
        </p>
      </div>

      {/* Two distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habitable Zone distribution */}
        <div className="glass-card">
          <h3 className="text-sm text-[var(--text-cyan)] mb-4 font-tech">Exoplanet HZ Distribution</h3>
          <div className="h-64">
            <Bar 
              data={hzData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "var(--text-grey)" } },
                  x: { ticks: { color: "var(--text-grey)" } }
                }
              }} 
            />
          </div>
        </div>

        {/* Coda types distribution */}
        <div className="glass-card green-theme">
          <h3 className="text-sm text-[var(--text-green)] mb-4 font-tech">Whale Coda Frequency Distribution</h3>
          <div className="h-64">
            <Bar 
              data={codaData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "var(--text-grey)" } },
                  x: { ticks: { color: "var(--text-grey)" } }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
