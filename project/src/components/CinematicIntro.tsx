import { useCallback, useEffect, useRef, useState } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

const LAUNCH_MESSAGES = [
  'INITIALIZING LAUNCH...',
  'LEAVING EARTH ORBIT...',
  'DESTINATION: YEAR 2096',
];

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const completed = useRef(false);
  const finishTimer = useRef<number | null>(null);

  const beginFade = useCallback(() => {
    if (completed.current || finishTimer.current !== null) return;
    setFadingOut(true);
    finishTimer.current = window.setTimeout(() => {
      completed.current = true;
      onComplete();
    }, 700);
  }, [onComplete]);

  useEffect(() => {
    const messageTimers = [
      window.setTimeout(() => setMessageIndex(1), 1500),
      window.setTimeout(() => setMessageIndex(2), 2900),
    ];
    const outroTimer = window.setTimeout(beginFade, 4300);
    return () => {
      messageTimers.forEach(window.clearTimeout);
      window.clearTimeout(outroTimer);
      if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
    };
  }, [beginFade]);

  return (
    <div className={`cinematic-intro${fadingOut ? ' is-fading' : ''}`} aria-label="Cinematic launch sequence">
      <div className="cinematic-intro__topline font-mono-fut">
        <span>ORBITAL TRANSFER / 2096</span>
        <span className="cinematic-intro__signal">SIGNAL LOCKED</span>
      </div>

      <div className="cinematic-intro__message font-display" aria-live="polite">
        <span className="cinematic-intro__marker">//</span>
        {LAUNCH_MESSAGES[messageIndex]}
      </div>

      <div className="cinematic-intro__coordinates font-mono-fut">
        <span>EARTH // SOL SYSTEM</span>
        <span>FLIGHT PATH: DEEP SPACE</span>
      </div>

      <div className="cinematic-intro__progress" aria-hidden="true"><span /></div>

      <button className="cinematic-intro__skip font-mono-fut" onClick={beginFade}>
        SKIP INTRO <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}