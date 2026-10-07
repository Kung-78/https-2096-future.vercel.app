import { useInView } from '@/hooks/useInView';
import { useState } from 'react';

/* ---------- Introduction ---------- */
export function Introduction() {
  const [activeWorld, setActiveWorld] = useState<number | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 });
  const worldCards = [
    { icon: '🌍', title: 'Environment', body: 'เมืองและธรรมชาติฟื้นตัวไปพร้อมกัน พลังงานสะอาดและระบบนิเวศถูกออกแบบให้เกื้อหนุนกัน' },
    { icon: '🤖', title: 'Technology', body: 'AI ทำงานอยู่เบื้องหลังชีวิตประจำวัน พร้อมให้ข้อมูลและช่วยประสานระบบต่าง ๆ' },
    { icon: '🏙️', title: 'Smart City', body: 'อาคาร ถนน ระบบขนส่ง และพลังงานสื่อสารกันแบบ Real-Time เพื่อให้เมืองตอบสนองต่อผู้คน' },
    { icon: '🧬', title: 'Human Evolution', body: 'มนุษย์ปรับตัวกับเทคโนโลยีมากขึ้น แต่ยังต้องตั้งคำถามว่าอะไรทำให้เราเป็นมนุษย์' },
  ];
  return (
    <section id="world" className="section content-min-h items-center text-center">
      <div ref={ref} className="max-w-2xl mx-auto">
        <p
          className={`thin-title fade-up ${inView ? 'in' : ''}`}
          style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.9rem)', color: 'var(--c-muted)', transitionDelay: '0.1s' }}
        >
          เราเคยมองปี 2096 เป็นเพียงจินตนาการ
        </p>
        <p
          className={`thin-title fade-up ${inView ? 'in' : ''}`}
          style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', marginTop: '1.2rem', color: 'var(--c-ice)', transitionDelay: '0.6s' }}
        >
          แต่สำหรับเรา...
        </p>
        <p
          className={`thin-title fade-up glow-cyan ${inView ? 'in' : ''}`}
          style={{ fontSize: 'clamp(1.8rem, 6vw, 3.2rem)', marginTop: '0.6rem', color: 'var(--c-cyan)', transitionDelay: '1.1s' }}
        >
          มันคือปัจจุบัน
        </p>
        <p className="thin-title mt-6" style={{ color: 'var(--c-muted)', fontSize: '1rem', lineHeight: 1.8 }}>
          คุณกำลังเชื่อมต่อกับโลกในปี 2096<br />ข้อมูลบางอย่างที่คุณกำลังจะเห็น<br />อาจเป็นสิ่งที่มนุษย์ในปัจจุบันยังไม่เคยพบ
        </p>
      </div>
      <div className="max-w-6xl mx-auto w-full mt-12">
        <p className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>WORLD 2096 / SELECT A DATA NODE</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          {worldCards.map((card, index) => (
            <button
              key={card.title}
              type="button"
              className="holo-card world-card"
              aria-expanded={activeWorld === index}
              onClick={() => setActiveWorld(activeWorld === index ? null : index)}
              style={{ color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
            >
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>{card.icon}</span>
              <span className="font-mono-fut text-cyan block mt-3" style={{ fontSize: '0.8rem' }}>{card.title}</span>
              <span className="block mt-2" style={{ color: 'var(--c-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>กดเพื่อเปิดข้อมูล</span>
            </button>
          ))}
        </div>
        {activeWorld !== null && (
          <div className="glass glass-edge holo-popup mt-4 text-left" role="status" style={{ padding: '1.3rem 1.5rem' }}>
            <div className="font-mono-fut text-cyan mb-2" style={{ fontSize: '0.72rem' }}>{worldCards[activeWorld].title.toUpperCase()} / 2096</div>
            <p style={{ color: 'var(--c-ice)', lineHeight: 1.7 }}>{worldCards[activeWorld].body}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Section 01: City ---------- */
const CITY_CARDS = [
  { title: 'การเดินทางอัตโนมัติ', en: 'Autonomous Transportation', body: 'ยานพาหนะที่ไม่ต้องมีคนขับ รู้จักเส้นทาง จัดลำดับ และหลีกกันเองได้ เหมือนฝูงปลาที่ว่ายพร้อมกันโดยไม่ชนกัน' },
  { title: 'โครงสร้างพื้นฐานอัจฉริยะ', en: 'Smart Infrastructure', body: 'สะพาน อาคาร และถนนที่ปรับตัวเองได้ตามการใช้งาน ขยาย หด หรือเปลี่ยนหน้าที่ได้ตามช่วงเวลาของวัน' },
  { title: 'จราจรควบคุมด้วย AI', en: 'AI Traffic Control', body: 'ระบบกลางที่คำนวณเส้นทางของทุกยานพาหนะพร้อมกัน ไม่มีไฟแดง ไม่มี่รถติด มีเพียงการไหลที่ลงตัว' },
  { title: 'การเดินทางปลอดมลพิษ', en: 'Zero-emission Mobility', body: 'พลังงานที่ใช้ไม่ทิ้งสิ่งใดเป็นขยะ อากาศในเมืองใสขึ้นทุกปี เสียงเครื่องยนต์กลายเป็นเรื่องที่คนรุ่นหลังไม่เคยได้ยิน' },
];

export function CitySection({ onInteract }: { onInteract: () => void }) {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  return (
    <section id="city" className="section content-min-h">
      <div ref={ref} className="max-w-6xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''}`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            01 / เมืองแห่งอนาคต
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)', lineHeight: 1.15, maxWidth: '900px' }}>
            เมืองที่ไม่มีรถยนต์
          </h2>
          <p className="thin-title mt-5" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'var(--c-muted)', maxWidth: '640px', lineHeight: 1.6 }}>
            เมื่อการเดินทางไม่จำเป็นต้องมีคนขับ<br />
            ถนนจึงไม่จำเป็นต้องเป็นแบบเดิม
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {CITY_CARDS.map((c, i) => (
            <button
              key={c.en}
              type="button"
              className={`holo-card fade-up ${inView ? 'in' : ''}`}
              aria-expanded={activeCard === i}
              onClick={() => {
                setActiveCard(activeCard === i ? null : i);
                onInteract();
              }}
              style={{ transitionDelay: `${0.2 + i * 0.15}s`, width: '100%', textAlign: 'left', color: 'inherit', cursor: 'pointer' }}
            >
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <div className="font-mono-fut text-cyan mb-3" style={{ fontSize: '0.62rem', opacity: 0.6 }}>{c.en}</div>
              <h3 className="thin-title text-ice" style={{ fontSize: '1.15rem', marginBottom: '0.7rem' }}>{c.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--c-muted)', lineHeight: 1.65 }}>{c.body}</p>
            </button>
          ))}
        </div>
        {activeCard !== null && (
          <div className="glass glass-edge holo-popup mt-5" role="status" style={{ padding: '1.3rem 1.5rem' }}>
            <div className="font-mono-fut text-cyan mb-2" style={{ fontSize: '0.68rem' }}>CITY DATA / 2096</div>
            <p style={{ color: 'var(--c-ice)', lineHeight: 1.7 }}>{CITY_CARDS[activeCard].body}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Section 02: Memory ---------- */
const MEMORY_FLOW = ['MEMORY', 'DATA', 'IDENTITY'];

export function MemorySection() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  return (
    <section className="section content-min-h" id="memory">
      <div ref={ref} className="max-w-5xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''}`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            02 / ความทรงจำ
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.2, maxWidth: '820px' }}>
            ถ้าความทรงจำของมนุษย์<br />สามารถสำรองข้อมูลได้
          </h2>
          <p className="thin-title mt-6" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', color: 'var(--c-ice)', fontStyle: 'italic' }}>
            ความทรงจำยังเป็นของเราอยู่หรือไม่?
          </p>
        </div>

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '0.5s', marginTop: '3.5rem' }}>
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
            {MEMORY_FLOW.map((m, i) => (
              <div key={m} className="flex items-center gap-3 sm:gap-6">
                <div
                  className="glass glass-edge"
                  style={{
                    padding: '1.2rem 2rem',
                    borderRadius: '8px',
                    fontFamily: "'Orbitron', sans-serif",
                    letterSpacing: '0.2em',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)',
                    color: i === 1 ? 'var(--c-violet)' : i === 2 ? 'var(--c-cyan)' : 'var(--c-ice)',
                  }}
                >
                  {m}
                </div>
                {i < MEMORY_FLOW.length - 1 && (
                  <span className="text-cyan" style={{ fontSize: '1.5rem', opacity: 0.6 }}>↓</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-muted" style={{ fontSize: '0.9rem', maxWidth: '600px', margin: '2rem auto 0' }}>
            ลองจินตนาการว่าทุกความทรงจำสามารถเก็บไว้เป็นข้อมูล — และข้อมูลนั้นคือส่วนหนึ่งของตัวตนเรา<br />
            คลิกที่จุดต่าง ๆ ในฉากเพื่อสำรวจชิ้นส่วนความทรงจำ
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 03: AI ---------- */
const AI_TASKS = [
  { icon: 'วางแผนชีวิต', body: 'จัดตาราง เลือกเส้นทาง แนะนำสิ่งที่เหมาะกับเป้าหมายของคุณในแต่ละวัน' },
  { icon: 'วิเคราะห์ข้อมูล', body: 'อ่านข้อมูลนับล้านชิ้นในเสี้ยววินาที สรุปเป็นภาพใหญ่ให้มนุษย์ตัดสินใจ' },
  { icon: 'ควบคุมบ้าน', body: 'อุณหภูมิ แสง น้ำ และอากาศ — ปรับเองตามพฤติกรรมที่เรียนรู้จากคุณ' },
  { icon: 'ดูแลการเดินทาง', body: 'เรียกยานพาหนะ วางเส้นทาง และประสานกับระบบเมืองโดยอัตโนมัติ' },
  { icon: 'ช่วยตัดสินใจ', body: 'ชั่งน้ำหนักทางเลือก เปรียบเทียบผลลัพธ์ แต่ปล่อยให้คำตัดสินสุดท้ายเป็นของคุณ' },
  { icon: 'เชื่อมต่อระบบต่าง ๆ', body: 'พูดกับทุกระบบ แปลภาษา ประสานอุปกรณ์ และส่งต่อข้อมูลได้ทั่วโลกในพริบตา' },
];

export function AISection() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  return (
    <section id="ai" className="section content-min-h">
      <div ref={ref} className="max-w-5xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''}`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            03 / ปัญญาประดิษฐ์
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.2 }}>
            AI ไม่ได้อยู่ในคอมพิวเตอร์อีกต่อไป
          </h2>
          <p className="thin-title mt-4 glow-cyan" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', color: 'var(--c-cyan)' }}>
            มันอยู่รอบตัวเรา
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
          {AI_TASKS.map((t, i) => (
            <div
              key={t.icon}
              className={`holo-card fade-up ${inView ? 'in' : ''}`}
              style={{ transitionDelay: `${0.2 + i * 0.1}s`, padding: '1.2rem 1.3rem' }}
            >
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <h3 className="thin-title text-ice" style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{t.icon}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--c-muted)', lineHeight: 1.6 }}>{t.body}</p>
            </div>
          ))}
        </div>

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '1s', marginTop: '3rem' }}>
          <p className="thin-title" style={{ fontSize: 'clamp(1.05rem, 2.8vw, 1.4rem)', color: 'var(--c-ice)', fontStyle: 'italic', maxWidth: '680px', lineHeight: 1.6 }}>
            "เมื่อ AI รู้จักเรามากกว่าที่เรารู้จักตัวเอง<br />
            เรายังเป็นคนกำหนดชีวิตของเราอยู่หรือไม่?"
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 04: Space ---------- */
const SPACE_CARDS = [
  { title: 'อาณานิคมอวกาศ', en: 'Space Colony', body: 'ชุมชนแรกที่เติบโตนอกโลก คนรุ่นใหม่ที่เกิดที่นั่นอาจไม่เคยเห็นท้องฟ้าสีฟ้า' },
  { title: 'ถิ่นฐานบนดาว', en: 'Planetary Habitat', body: 'บ้านที่สร้างบนดินดาวต่างกฎเกณฑ์ อากาศ น้ำ และแสง ล้วนถูกสร้างขึ้นใหม่ใต้โดม' },
  { title: 'สถานีในวงโคจร', en: 'Orbital Station', body: 'เมืองลอยฟ้าที่หมุนรอบดาว คนใช้ชีวิตทั้งชีวิตบนวงแหวนโดยไม่เคยเหยียบพื้นดิน' },
  { title: 'การเดินทางระหว่างดาว', en: 'Interplanetary Travel', body: 'เส้นทางที่ใช้เวลาเป็นเดือนปี การเดินทางไม่ใช่การไป แต่เป็นการใช้ชีวิตช่วงหนึ่งบนเส้นทาง' },
];

export function SpaceSection({ onInteract }: { onInteract: () => void }) {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  return (
    <section id="space" className="section content-min-h">
      <div ref={ref} className="max-w-6xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''}`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            04 / มนุษย์บนดาวดวงอื่น
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.2, maxWidth: '800px' }}>
            โลกไม่ใช่บ้านเพียงแห่งเดียวอีกต่อไป
          </h2>
          <p className="thin-title mt-4 text-muted" style={{ fontSize: '0.88rem', maxWidth: '500px' }}>
            ลากเพื่อหมุนดาว — สำรวจถิ่นฐานและยานสำรวจในฉาก
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
          {SPACE_CARDS.map((c, i) => (
            <button
              key={c.en}
              type="button"
              className={`holo-card fade-up ${inView ? 'in' : ''}`}
              aria-expanded={activeCard === i}
              onClick={() => {
                setActiveCard(activeCard === i ? null : i);
                onInteract();
              }}
              style={{ transitionDelay: `${0.2 + i * 0.12}s`, width: '100%', textAlign: 'left', color: 'inherit', cursor: 'pointer' }}
            >
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <div className="font-mono-fut text-cyan mb-2" style={{ fontSize: '0.6rem', opacity: 0.6 }}>{c.en}</div>
              <h3 className="thin-title text-ice" style={{ fontSize: '1.1rem', marginBottom: '0.6rem' }}>{c.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--c-muted)', lineHeight: 1.6 }}>{c.body}</p>
            </button>
          ))}
        </div>
        {activeCard !== null && (
          <div className="glass glass-edge holo-popup mt-5" role="status" style={{ padding: '1.3rem 1.5rem' }}>
            <div className="font-mono-fut text-cyan mb-2" style={{ fontSize: '0.68rem' }}>{SPACE_CARDS[activeCard].en.toUpperCase()} / 2096</div>
            <p style={{ color: 'var(--c-ice)', lineHeight: 1.7 }}>{SPACE_CARDS[activeCard].body}</p>
          </div>
        )}

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '0.9s', marginTop: '2.5rem' }}>
          <p className="thin-title" style={{ fontSize: 'clamp(1.05rem, 2.8vw, 1.4rem)', color: 'var(--c-ice)', fontStyle: 'italic', maxWidth: '700px' }}>
            "เมื่อมนุษย์ออกจากโลก<br />
            คำว่า 'บ้าน' จะยังหมายถึงที่เดิมหรือไม่?"
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Section 05: Humanity / Regrets ---------- */
const REGRETS = [
  'เวลาที่เราคิดว่ามีไม่จำกัด',
  'ธรรมชาติที่เราคิดว่าจะอยู่เหมือนเดิม',
  'คนที่เราคิดว่าจะได้พบกันอีก',
  'โอกาสที่เราคิดว่ายังมีวันพรุ่งนี้',
];

export function HumanitySection() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  return (
    <section className="section content-min-h items-center text-center">
      <div ref={ref} className="max-w-2xl mx-auto">
        <p className={`thin-title fade-up ${inView ? 'in' : ''}`} style={{ fontSize: 'clamp(1.6rem, 5vw, 2.6rem)', color: 'var(--c-muted)', transitionDelay: '0.1s' }}>
          เราเสียดาย…
        </p>
        <div className="mt-8 space-y-5">
          {REGRETS.map((r, i) => (
            <p
              key={r}
              className={`thin-title fade-up ${inView ? 'in' : ''}`}
              style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                color: 'var(--c-ice)',
                opacity: 0.5 + i * 0.12,
                transitionDelay: `${0.5 + i * 0.4}s`,
              }}
            >
              {r}
            </p>
          ))}
        </div>
        <h2
          className={`thin-title fade-up glow-cyan ${inView ? 'in' : ''}`}
          style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.4rem)', marginTop: '3rem', color: 'var(--c-cyan)', lineHeight: 1.3, transitionDelay: '2.4s' }}
        >
          สิ่งที่คนในปี 2096 เสียดาบที่สุด<br />
          อาจไม่ใช่สิ่งที่เราคิด
        </h2>
      </div>
    </section>
  );
}

/* ---------- Timeline ---------- */
const TIMELINE = [
  { year: '2026', title: 'จุดเริ่มต้น', body: 'ปีที่คุณอยู่ — ทุกอย่างยังเป็นไปได้ ทุกทางเลือกยังเปิดอยู่ เทคโนโลยีเริ่มเปลี่ยน แต่โลกยังคุ้นเคย' },
  { year: '2040', title: 'โครงสร้างพื้นฐานเชื่อมต่อกัน', body: 'AI กลายเป็นส่วนหนึ่งของโครงสร้างพื้นฐานในชีวิตประจำวัน ตั้งแต่พลังงาน การเดินทาง ไปจนถึงบริการสาธารณะ' },
  { year: '2070', title: 'มนุษย์และเครื่องจักร', body: 'การทำงานร่วมกันระหว่างมนุษย์กับเครื่องจักรกลายเป็นเรื่องปกติ แต่การตัดสินใจและความหมายยังเป็นของมนุษย์' },
  { year: '2090', title: 'เมืองอัจฉริยะขนาดใหญ่', body: 'เมืองอัจฉริยะเชื่อมโยงระบบต่าง ๆ เข้าด้วยกัน และการอยู่อาศัยนอกโลกกลายเป็นความเป็นไปได้ที่จับต้องได้' },
  { year: '2096', title: 'ปัจจุบันของเรา', body: 'สำหรับคนที่ส่งข้อความนี้ ปี 2096 ไม่ใช่อนาคต มันคือวันที่พวกเขาเปิดตาขึ้นและมองกลับมาหาคุณ' },
];

export function TimelineSection() {
  const [activeYear, setActiveYear] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  return (
    <section id="timeline" className="section content-min-h">
      <div ref={ref} className="max-w-5xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''} text-center`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            เส้นเวลาอนาคต · conceptual timeline
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(1.6rem, 4.5vw, 2.6rem)' }}>
            2026 → 2096
          </h2>
        </div>

        {/* Timeline rail */}
        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '0.3s', marginTop: '3rem' }}>
          <div className="relative" style={{ padding: '0 1rem' }}>
            <div
              style={{
                position: 'absolute',
                left: '1rem',
                right: '1rem',
                top: '7px',
                height: '1px',
                background: 'linear-gradient(90deg, rgba(79,214,255,0.1), rgba(79,214,255,0.5), rgba(139,108,255,0.3))',
              }}
            />
            <div className="flex justify-between items-start relative">
              {TIMELINE.map((t, i) => (
                <button key={t.year} type="button" className={`tl-node ${activeYear === i ? 'active' : ''}`} aria-pressed={activeYear === i} style={{ flex: 1, textAlign: 'center', background: 'none', border: 0, padding: 0, color: 'inherit' }} onClick={() => setActiveYear(i)}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className={`tl-dot ${activeYear === i ? 'active' : ''}`} />
                  </div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: 'clamp(0.7rem, 2vw, 0.95rem)',
                      marginTop: '0.7rem',
                      color: activeYear === i ? 'var(--c-ice)' : 'var(--c-muted)',
                      transition: 'color 0.3s ease',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {t.year}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active content */}
        <div className="glass glass-edge mt-10" style={{ padding: '2rem 2.2rem', borderRadius: '12px' }} key={activeYear}>
          <div className="holo-popup">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="font-display glow-cyan" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--c-cyan)', letterSpacing: '0.1em' }}>
                {TIMELINE[activeYear].year}
              </span>
              <span className="thin-title text-ice" style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)' }}>
                {TIMELINE[activeYear].title}
              </span>
            </div>
            <p style={{ color: 'var(--c-muted)', lineHeight: 1.75, fontSize: '0.95rem', maxWidth: '640px' }}>
              {TIMELINE[activeYear].body}
            </p>
            <p className="font-mono-fut mt-4 text-cyan" style={{ fontSize: '0.65rem', opacity: 0.5 }}>
              * เส้นเวลานี้เป็นจินตนาการเชิงแนวคิด มิใช่ข้อเท็จจริงที่ได้รับการยืนยัน
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Final Section ---------- */
interface FinalProps {
  onRestart: () => void;
  onExplore: () => void;
}

export function FinalSection({ onRestart, onExplore }: FinalProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const lines = [
    { text: 'สำหรับคนในปี 2096', sub: 'ปี 2026 คืออดีต', delay: 0.1 },
    { text: 'แต่สำหรับคุณ…', sub: '', delay: 0.9 },
    { text: '', sub: 'มันคือวันนี้', delay: 1.5 },
    { text: 'อนาคตยังไม่เกิดขึ้น', sub: '', delay: 2.4 },
    { text: '', sub: 'มันกำลังถูกสร้างขึ้น\nจากสิ่งที่เราทำในวันนี้', delay: 3.0 },
  ];
  return (
    <section className="section content-min-h items-center text-center">
      <div ref={ref} className="max-w-2xl mx-auto">
        <div className="space-y-8">
          {lines.map((l, i) => (
            <div key={i} className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: `${l.delay}s` }}>
              {l.text && (
                <p className="thin-title text-muted" style={{ fontSize: 'clamp(1rem, 2.8vw, 1.3rem)' }}>{l.text}</p>
              )}
              {l.sub && (
                <p
                  className="thin-title glow-soft"
                  style={{
                    fontSize: 'clamp(1.3rem, 4vw, 2rem)',
                    color: 'var(--c-ice)',
                    whiteSpace: 'pre-line',
                    marginTop: l.text ? '0.4rem' : 0,
                  }}
                >
                  {l.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '4.5s', marginTop: '3.5rem' }}>
          <h2
            className="thin-title glow-cyan"
            style={{ fontSize: 'clamp(1.4rem, 4.5vw, 2.2rem)', color: 'var(--c-cyan)', lineHeight: 1.4 }}
          >
            แล้วคุณอยากให้ปี 2096<br />จำปี 2026 ว่าอย่างไร?
          </h2>
        </div>

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '5.5s', marginTop: '2.5rem', display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-fut" onClick={onRestart}>START AGAIN</button>
          <button className="btn-fut" onClick={onExplore}>EXPLORE THE FUTURE</button>
        </div>
      </div>
    </section>
  );
}
