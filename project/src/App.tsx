import { useEffect, useRef, useState, useCallback } from 'react';
import { SceneManager, type HoverInfo } from '@/three/SceneManager';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { Hero } from '@/components/Hero';
import { Nav } from '@/components/Nav';
import { HoverLabel, HoloPopup } from '@/components/HoloOverlay';
import { SpaceIntro } from '@/SpaceIntro';
import { AITerminal } from '@/components/AITerminal';
import { MessageSection } from '@/components/MessageSection';
import { MissionTracker } from '@/components/MissionTracker';
import { AboutSection } from '@/components/AboutSection';
import { FutureSurvivor, FutureSurvivorErrorBoundary, FutureSurvivorLauncher } from './components/FutureSurvivor';
import { useMission } from '@/hooks/useMission';
import {
  Introduction,
  CitySection,
  MemorySection,
  AISection,
  SpaceSection,
  HumanitySection,
  TimelineSection,
  FinalSection,
} from '@/components/Sections';

const NAV_TARGETS = ['home', 'world', 'city', 'ai', 'space', 'timeline', 'message', 'memory', 'game', 'about'];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [popup, setPopup] = useState<HoverInfo | null>(null);
  const [muted, setMuted] = useState(true);
  const [entered, setEntered] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const [gameOpen, setGameOpen] = useState(false);
  const [gameProgressVersion, setGameProgressVersion] = useState(0);
  const gameReturnScrollRef = useRef(0);
  const scrollProgress = useScrollProgress();
  const mission = useMission();

  useEffect(() => {
    if (!gameOpen) return;
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
    };
  }, [gameOpen]);

  // init three.js
  useEffect(() => {
    if (!canvasRef.current) return;
    const mgr = new SceneManager(canvasRef.current);
    managerRef.current = mgr;
    mgr.onHoverChange = (info) => setHover(info);
    mgr.onClickObject = (info) => setPopup(info);
    mgr.start();
    return () => {
      mgr.dispose();
      managerRef.current = null;
    };
  }, []);

  // sync scroll to scene
  useEffect(() => {
    managerRef.current?.setScrollProgress(scrollProgress);
  }, [scrollProgress]);

  useEffect(() => {
    const updateActiveNav = () => {
      let currentIndex = 0;
      let currentTop = Number.NEGATIVE_INFINITY;
      NAV_TARGETS.forEach((id, index) => {
        const section = document.getElementById(id);
        const top = section?.getBoundingClientRect().top;
        if (top !== undefined && top <= window.innerHeight * 0.45 && top > currentTop) {
          currentIndex = index;
          currentTop = top;
        }
      });
      setActiveNav((activeIndex: number) => activeIndex === currentIndex ? activeIndex : currentIndex);
    };
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav);
    updateActiveNav();
    return () => {
      window.removeEventListener('scroll', updateActiveNav);
      window.removeEventListener('resize', updateActiveNav);
    };
  }, [entered]);

  const handleIntroComplete = useCallback(() => {
    setEntered(true);
    managerRef.current?.finishIntro();
  }, []);

  const handleNavClick = useCallback((index: number) => {
    const target = document.getElementById(NAV_TARGETS[index]);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleStartMission = useCallback(() => {
    gameReturnScrollRef.current = window.scrollY;
    setGameOpen(true);
  }, []);

  const handleBackToWebsite = useCallback(() => {
    setGameOpen(false);
    setGameProgressVersion((version) => version + 1);
    requestAnimationFrame(() => {
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, gameReturnScrollRef.current);
      root.style.scrollBehavior = previousBehavior;
    });
  }, []);

  const handleRestart = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExplore = useCallback(() => {
    document.getElementById('world')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // drag-to-rotate for space / earth scenes
  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      managerRef.current?.dragRotate(dx, dy);
    };
    const onUp = () => { dragging = false; };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // ambient audio (Web Audio API generated drone) with mute
  useEffect(() => {
    if (!entered) return;
    let ctx: AudioContext | null = null;
    let nodes: { osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode; lfoGain: GainNode } | null = null;
    let cancelled = false;

    if (!muted) {
      try {
        const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextConstructor) {
          cancelled = true;
          return;
        }
        ctx = new AudioContextConstructor();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 55;
        gain.gain.value = 0.035;
        lfo.frequency.value = 0.15;
        lfoGain.gain.value = 12;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        lfo.start();
        nodes = { osc, gain, lfo, lfoGain };
      } catch {
        cancelled = true;
      }
    }

    return () => {
      if (cancelled) return;
      try {
        nodes?.osc.stop();
        nodes?.lfo.stop();
        ctx?.close();
      } catch { /* noop */ }
    };
  }, [entered, muted]);

  return (
    <>
      {/* Three.js canvas — fixed background */}
      <canvas id="scene-canvas" ref={canvasRef} />

      {/* Visual effects overlays */}
      <div className="fx-vignette" />
      <div className="fx-grain" />
      <div className="fx-scanlines" />

      {!entered && <SpaceIntro onComplete={handleIntroComplete} />}

      {/* Mute button */}
      {entered && !gameOpen && (
        <button
          onClick={() => setMuted((isMuted: boolean) => !isMuted)}
          aria-label={muted ? 'เปิดเสียง' : 'ปิดเสียง'}
          title={muted ? 'เปิดเสียง' : 'ปิดเสียง'}
          style={{
            position: 'fixed',
            bottom: '1.4rem',
            right: '1.4rem',
            zIndex: 25,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(8,16,32,0.6)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--c-line)',
            color: 'var(--c-ice)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      )}

      {/* Nav */}
      {entered && !gameOpen && <Nav activeIndex={activeNav} onNavClick={handleNavClick} />}
      {entered && !gameOpen && (
        <MissionTracker
          missions={mission.missions}
          missionIds={mission.missionIds}
          missionLabels={mission.missionLabels}
          progress={mission.progress}
          allComplete={mission.allComplete}
          onReset={mission.reset}
        />
      )}

      {/* 3D hover label */}
      {!gameOpen && <HoverLabel hover={hover} />}

      {/* Click popup */}
      {!gameOpen && popup && <HoloPopup info={popup} onClose={() => setPopup(null)} />}

      {/* Content */}
      <main
        aria-hidden={gameOpen}
        style={{
          position: 'relative',
          zIndex: 2,
          opacity: entered ? 1 : 0,
          transition: 'opacity 1.1s ease',
          pointerEvents: entered && !gameOpen ? 'auto' : 'none',
        }}
      >
        {entered && <Hero onEnter={handleExplore} />}
        {entered && <FutureSurvivorLauncher onStart={handleStartMission} refreshVersion={gameProgressVersion} />}
        {entered && <Introduction />}
        {entered && <CitySection onInteract={() => mission.complete('city')} />}
        {entered && <MemorySection />}
        {entered && <AISection />}
        {entered && <AITerminal onInteract={() => mission.complete('ai')} />}
        {entered && <SpaceSection onInteract={() => mission.complete('space')} />}
        {entered && <HumanitySection />}
        {entered && <TimelineSection />}
        {entered && <MessageSection onInteract={() => mission.complete('message')} />}
        {entered && <AboutSection />}
        {entered && <FinalSection onRestart={handleRestart} onExplore={handleExplore} />}
        {/* spacer to ensure full scroll range after final */}
        {entered && <div style={{ height: '20vh' }} />}
      </main>
      {entered && gameOpen && (
        <FutureSurvivorErrorBoundary onBack={handleBackToWebsite}>
          <FutureSurvivor autoStart onBack={handleBackToWebsite} />
        </FutureSurvivorErrorBoundary>
      )}
    </>
  );
}
