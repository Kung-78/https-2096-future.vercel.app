import { useState, useEffect } from 'react';
import { useInView } from '@/hooks/useInView';

const FULL_MESSAGE = `ถึงมนุษย์ในปี 2026

หากคุณกำลังอ่านข้อความนี้
แสดงว่าการเชื่อมต่อระหว่างอดีตและอนาคตสำเร็จแล้ว

โลกที่คุณกำลังจะเห็น
คือโลกที่เทคโนโลยีไม่ได้เป็นเพียงเครื่องมือ
แต่มันกลายเป็นส่วนหนึ่งของชีวิตมนุษย์

สิ่งที่เราอยากบอกคุณคือ
อนาคตยังไม่เกิดขึ้น
มันกำลังถูกสร้างขึ้นจากสิ่งที่คุณทำในวันนี้`;

const DECRYPT_STEPS = [
  'ACCESSING...',
  'DECRYPTING...',
  '██████████ 100%',
];

export function MessageSection({ onInteract }: { onInteract: () => void }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [phase, setPhase] = useState<'idle' | 'decrypting' | 'revealed'>('idle');
  const [decryptStep, setDecryptStep] = useState(0);
  const [revealedText, setRevealedText] = useState('');

  const handleDecrypt = () => {
    if (phase !== 'idle') return;
    onInteract();
    setPhase('decrypting');
    setDecryptStep(0);
  };

  useEffect(() => {
    if (phase !== 'decrypting') return;
    if (decryptStep < DECRYPT_STEPS.length) {
      const id = setTimeout(() => setDecryptStep((s) => s + 1), 700);
      return () => clearTimeout(id);
    }
    setPhase('revealed');
    let i = 0;
    const tick = () => {
      if (i <= FULL_MESSAGE.length) {
        setRevealedText(FULL_MESSAGE.slice(0, i));
        i += 2;
        setTimeout(tick, 20);
      }
    };
    tick();
  }, [phase, decryptStep]);

  return (
    <section id="message" className="section content-min-h">
      <div ref={ref} className="max-w-3xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''}`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            MESSAGE / ข้อความจากอนาคต
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.2 }}>
            ข้อความจากปี 2096
          </h2>
        </div>

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '0.3s', marginTop: '2rem' }}>
          <div
            className="glass glass-edge"
            style={{
              borderRadius: '12px',
              padding: '2.2rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div className="font-mono-fut" style={{ fontSize: '0.72rem', color: 'var(--c-cyan)', marginBottom: '1.2rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ animation: 'blink 1.5s steps(2) infinite' }}>●</span>
              INCOMING MESSAGE
            </div>

            {phase === 'idle' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p className="thin-title" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--c-muted)', marginBottom: '1.8rem' }}>
                  มีข้อความเข้ามาจากปี 2096<br />
                  กดปุ่มเพื่อถอดรหัส
                </p>
                <button className="btn-fut" onClick={handleDecrypt} style={{ fontSize: '0.9rem', padding: '1rem 2.4rem' }}>
                  DECRYPT MESSAGE
                </button>
              </div>
            )}

            {phase === 'decrypting' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                {DECRYPT_STEPS.slice(0, decryptStep).map((step, i) => (
                  <div
                    key={i}
                    className="font-mono-fut"
                    style={{
                      fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
                      color: i === 2 ? 'var(--c-cyan)' : 'var(--c-ice)',
                      marginBottom: '0.6rem',
                      opacity: 0,
                      animation: 'holoIn 0.4s ease both',
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            )}

            {phase === 'revealed' && (
              <div className="font-mono-fut" style={{ whiteSpace: 'pre-line', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', lineHeight: 1.9, color: 'var(--c-ice)' }}>
                {revealedText}
                <span className="blink-caret" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
