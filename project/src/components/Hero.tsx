import { useEffect, useState } from 'react';
import { useTypingText } from '@/hooks/useTypingText';

interface HeroProps {
  onEnter: () => void;
}

export function Hero({ onEnter }: HeroProps) {
  const [phase, setPhase] = useState(0);
  const [yearClicks, setYearClicks] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const handleYearClick = () => {
    if (yearClicks >= 4) {
      setShowSecret(true);
      setYearClicks(0);
      return;
    }
    setYearClicks(yearClicks + 1);
  };
  // phase 0: "2096", phase 1: subtitle, phase 2: main quote, phase 3: button
  const t1 = useTypingText('2096', 140, 800);
  const t2 = useTypingText('คุณกำลังอ่านข้อความจากอนาคต', 55, 400);
  const t3 = useTypingText('ถ้าคุณกำลังอ่านข้อความนี้\nแสดงว่าเรายังแก้ไขอดีตไม่ได้', 50, 600);

  useEffect(() => {
    if (phase === 0 && t1.done) {
      const id = setTimeout(() => setPhase(1), 600);
      return () => clearTimeout(id);
    }
    if (phase === 1 && t2.done) {
      const id = setTimeout(() => setPhase(2), 600);
      return () => clearTimeout(id);
    }
    if (phase === 2 && t3.done) {
      const id = setTimeout(() => setPhase(3), 800);
      return () => clearTimeout(id);
    }
  }, [phase, t1.done, t2.done, t3.done]);

  return (
    <section id="home" className="section content-min-h items-center text-center" style={{ minHeight: '100vh' }}>
      <div className="flex flex-col items-center max-w-3xl mx-auto pt-10">
        <div className="font-mono-fut text-cyan" style={{ fontSize: '0.72rem', opacity: 0.75 }}>MESSAGE FROM THE FUTURE</div>
        {/* Year 2096 */}
        <button
          type="button"
          aria-label="2096"
          onClick={handleYearClick}
          className="font-display glow-cyan"
          style={{
            fontSize: 'clamp(3.5rem, 12vw, 9rem)',
            fontWeight: 700,
            color: 'inherit',
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            opacity: phase >= 0 ? 1 : 0,
            transition: 'opacity 1s ease',
            lineHeight: 1,
          }}
        >
          {t1.text}
          {!t1.done && <span className="blink-caret" />}
        </button>

        {/* Subtitle */}
        <div
          className="thin-title text-ice glow-soft mt-8"
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 1.2s ease',
            minHeight: '1.6em',
          }}
        >
          {phase >= 1 ? (t2.text + (!t2.done ? <span className="blink-caret" /> : '')) : ''}
        </div>

        {/* Main quote */}
        <div
          className="thin-title mt-10"
          style={{
            fontSize: 'clamp(1.3rem, 4vw, 2.4rem)',
            opacity: phase >= 2 ? 1 : 0,
            transition: 'opacity 1.4s ease',
            minHeight: '3em',
            color: 'var(--c-white)',
            lineHeight: 1.35,
            whiteSpace: 'pre-line',
          }}
        >
          {phase >= 2 ? t3.text : ''}
          {phase >= 2 && !t3.done && <span className="blink-caret" />}
        </div>

        {/* Enter button */}
        <div
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transition: 'opacity 1s ease',
            marginTop: '3rem',
          }}
        >
          {phase >= 3 && (
            <button className="btn-fut" onClick={onEnter}>
              ENTER THE FUTURE
            </button>
          )}
        </div>

        {/* scroll hint */}
        {phase >= 3 && (
          <div className="scroll-hint mt-16 text-muted font-mono-fut" style={{ fontSize: '0.7rem' }}>
            เลื่อนลงเพื่อเดินทางผ่านกาลเวลา ↓
          </div>
        )}
      </div>
      {showSecret && (
        <div className="glass glass-edge holo-popup" role="dialog" aria-modal="true" aria-label="Secret message" style={{ position: 'fixed', zIndex: 45, bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: 'min(420px, calc(100vw - 2rem))', padding: '1rem 1.2rem' }}>
          <p className="font-mono-fut glow-cyan" style={{ color: 'var(--c-cyan)', fontSize: '0.85rem' }}>YOU WERE NOT SUPPOSED TO FIND THIS.</p>
          <button className="font-mono-fut" onClick={() => setShowSecret(false)} style={{ marginTop: '0.7rem', background: 'none', border: '1px solid var(--c-line)', color: 'var(--c-ice)', padding: '0.4rem 0.8rem', cursor: 'pointer' }}>CLOSE</button>
        </div>
      )}
    </section>
  );
}
