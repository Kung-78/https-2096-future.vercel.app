import { useState, useRef, useEffect, useCallback } from 'react';
import { useInView } from '@/hooks/useInView';

interface QAItem {
  question: string;
  answer: string;
}

const QA_LIST: QAItem[] = [
  {
    question: 'What is the future?',
    answer: 'อนาคตไม่ใช่จุดหมายที่รอเราอยู่ข้างหน้า แต่เป็นสิ่งที่กำลังถูกสร้างขึ้นจากการตัดสินใจของเราในวันนี้ ทุกคำพูด ทุกการกระทำ ทุกเทคโนโลยีที่เราเลือกใช้ ล้วนมีส่วนหล่อหลอมโลกในปี 2096',
  },
  {
    question: 'How does AI help humans?',
    answer: 'AI ในปี 2096 ไม่ได้แทนที่มนุษย์ แต่เป็นส่วนขยายของมนุษย์ มันช่วยวิเคราะห์ข้อมูล วางแผน เรียนรู้ และประสานระบบต่าง ๆ แต่การตัดสินใจสุดท้ายยังเป็นของมนุษย์เสมอ AI ดีที่สุดคือ AI ที่รู้จักขอบเขตของตัวเอง',
  },
  {
    question: 'What happened in 2096?',
    answer: 'ในปี 2096 มนุษย์มีถิ่นฐานบนดาวหลายดวง เมืองอัจฉริยะทำงานพร้อมกันโดยไม่มีรถติด AI กระจายอยู่ทุกที่รอบตัว แต่สิ่งที่คนในปี 2096 เสียดายที่สุดคือเวลา ธรรมชาติ และคนที่คิดว่าจะได้พบกันอีก โลกที่สวยงามนี้มาพร้อมกับสิ่งที่สูญเสียไป',
  },
  {
    question: 'Can I change the future?',
    answer: 'คุณกำลังเปลี่ยนมันอยู่ทุกวินาที อนาคตที่คุณเห็นในเว็บไซต์นี้เป็นเพียงหนึ่งในความเป็นไปได้ หากคุณเลือกต่างไป อนาคตก็จะเปลี่ยนไปด้วย นั่นคือเหตุผลที่ข้อความนี้ถูกส่งกลับมาหาคุณ',
  },
];

interface ChatLine {
  role: 'user' | 'ai';
  text: string;
  typing?: boolean;
}

export function AITerminal({ onInteract }: { onInteract: () => void }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [lines, setLines] = useState<ChatLine[]>([
    { role: 'ai', text: '> FUTURE AI SYSTEM\n> STATUS: ONLINE\n> พร้อมรับคำถามจากคุณ...' },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const askQuestion = useCallback((qa: QAItem) => {
    if (typing) return;
    onInteract();
    setTyping(true);
    setLines((prev) => [...prev, { role: 'user', text: qa.question }]);

    let i = 0;
    const fullAnswer = qa.answer;
    const tick = () => {
      if (i <= fullAnswer.length) {
        setLines((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (next[lastIdx] && next[lastIdx].role === 'ai' && next[lastIdx].typing) {
            next[lastIdx] = { role: 'ai', text: fullAnswer.slice(0, i), typing: true };
          } else {
            next.push({ role: 'ai', text: fullAnswer.slice(0, i), typing: true });
          }
          return next;
        });
        i += 2;
        setTimeout(tick, 25);
      } else {
        setLines((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (next[lastIdx] && next[lastIdx].typing) {
            next[lastIdx] = { role: 'ai', text: fullAnswer, typing: false };
          }
          return next;
        });
        setTyping(false);
      }
    };
    setTimeout(tick, 500);
  }, [typing, onInteract]);

  return (
    <section className="section content-min-h">
      <div ref={ref} className="max-w-4xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''}`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            AI & HUMAN / ปัญญาประดิษฐ์กับมนุษย์
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.2 }}>
            พูดคุยกับ AI จากปี 2096
          </h2>
          <p className="thin-title mt-4" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', color: 'var(--c-muted)' }}>
            เลือกคำถามเพื่อเริ่มสนทนา — ระบบจะตอบกลับแบบเรียลไทม์
          </p>
        </div>

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '0.3s', marginTop: '2rem' }}>
          <div
            className="glass glass-edge"
            style={{
              borderRadius: '10px',
              padding: '0',
              overflow: 'hidden',
            }}
          >
            {/* Terminal header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.2rem',
                borderBottom: '1px solid var(--c-line)',
                background: 'rgba(8, 16, 32, 0.5)',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-cyan)', boxShadow: '0 0 6px var(--c-cyan)' }} />
              <span className="font-mono-fut" style={{ fontSize: '0.68rem', color: 'var(--c-muted)', letterSpacing: '0.15em' }}>
                FUTURE_AI_TERMINAL.exe
              </span>
              <span className="font-mono-fut" style={{ fontSize: '0.62rem', color: 'var(--c-cyan)', marginLeft: 'auto', opacity: 0.7 }}>
                {typing ? 'PROCESSING...' : 'READY'}
              </span>
            </div>

            {/* Chat area */}
            <div
              ref={scrollRef}
              style={{
                padding: '1.2rem',
                minHeight: '200px',
                maxHeight: '280px',
                overflowY: 'auto',
                fontSize: '0.88rem',
                lineHeight: 1.7,
              }}
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="font-mono-fut"
                  style={{
                    marginBottom: '0.8rem',
                    color: line.role === 'user' ? 'var(--c-ice)' : 'var(--c-white)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {line.role === 'user' ? (
                    <><span style={{ color: 'var(--c-violet)' }}>{'> '}</span>{line.text}</>
                  ) : (
                    <>{line.text}{line.typing && <span className="blink-caret" />}</>
                  )}
                </div>
              ))}
            </div>

            {/* Question buttons */}
            <div
              style={{
                padding: '0.8rem 1.2rem',
                borderTop: '1px solid var(--c-line)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                background: 'rgba(8, 16, 32, 0.3)',
              }}
            >
              {QA_LIST.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => askQuestion(qa)}
                  disabled={typing}
                  className="font-mono-fut"
                  style={{
                    background: 'rgba(79, 214, 255, 0.06)',
                    border: '1px solid rgba(79, 214, 255, 0.25)',
                    color: 'var(--c-ice)',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    cursor: typing ? 'not-allowed' : 'pointer',
                    opacity: typing ? 0.4 : 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {qa.question}
                </button>
              ))}
            </div>
          </div>

          <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '0.8s', marginTop: '2rem' }}>
            <p className="thin-title" style={{ fontSize: 'clamp(1.05rem, 2.8vw, 1.4rem)', color: 'var(--c-ice)', fontStyle: 'italic', maxWidth: '680px', lineHeight: 1.6 }}>
              "เมื่อ AI รู้จักเรามากกว่าที่เรารู้จักตัวเอง<br />
              เรายังเป็นคนกำหนดชีวิตของเราอยู่หรือไม่?"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
