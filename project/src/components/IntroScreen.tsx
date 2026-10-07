import { useState, useEffect } from 'react';

interface IntroScreenProps {
  onEnter: () => void;
}

const BOOT_LINES = [
  'SYSTEM INITIALIZING...',
  'YEAR: 2096',
  'CONNECTION ESTABLISHED',
  'MESSAGE RECEIVED FROM THE FUTURE',
];

export function IntroScreen({ onEnter }: IntroScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) {
      const id = setTimeout(() => setVisibleLines((v) => v + 1), 550);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setShowButton(true), 400);
    return () => clearTimeout(id);
  }, [visibleLines]);

  const handleEnter = () => {
    setFadingOut(true);
    setTimeout(onEnter, 700);
  };

  return (
    <div
      className="intro-screen"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.7s ease',
      }}
    >
      <div className="intro-scanline" />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '520px' }}>
        <div className="font-mono-fut" style={{ fontSize: '0.7rem', color: 'var(--c-cyan)', opacity: 0.6, marginBottom: '1.5rem', letterSpacing: '0.15em' }}>
          FUTURE COMMUNICATION TERMINAL v2096.1
        </div>
        <div style={{ minHeight: '180px' }}>
          {BOOT_LINES.map((line, i) => (
            <div
              key={i}
              style={{
                opacity: i < visibleLines ? 1 : 0,
                transform: i < visibleLines ? 'translateX(0)' : 'translateX(-12px)',
                transition: 'all 0.4s ease',
                marginBottom: '0.8rem',
              }}
            >
              <span style={{ color: 'var(--c-cyan)' }}>{'> '}</span>
              <span className="font-mono-fut" style={{ fontSize: 'clamp(0.85rem, 3vw, 1.1rem)', color: 'var(--c-ice)' }}>
                {line}
                {i === visibleLines - 1 && <span className="blink-caret" />}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            marginTop: '2rem',
          }}
        >
          <button
            className="btn-fut intro-enter-btn"
            onClick={handleEnter}
            style={{ fontSize: '1rem', padding: '1.1rem 3rem' }}
          >
            ENTER 2096
          </button>
        </div>
      </div>
      <button
        onClick={handleEnter}
        className="font-mono-fut"
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          background: 'none',
          border: '1px solid var(--c-line)',
          color: 'var(--c-muted)',
          padding: '0.5rem 1.2rem',
          borderRadius: '3px',
          fontSize: '0.68rem',
          letterSpacing: '0.15em',
          cursor: 'pointer',
          opacity: 0.75,
          transition: 'opacity 0.5s ease, color 0.3s ease',
          zIndex: 3,
        }}
      >
        SKIP
      </button>
    </div>
  );
}
