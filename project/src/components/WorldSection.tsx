import { useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { HoloModal } from '@/components/HoloModal';

const WORLD_CARDS = [
  {
    icon: 'environment',
    title: 'สิ่งแวดล้อม',
    en: 'Environment',
    short: 'โลกในปี 2096 ฟื้นคืนธรรมชาติด้วยเทคโนโลยีที่ลดมลพิษเหลือศูนย์',
    body: 'ในปี 2096 อากาศในเมืองใสสะอาดขึ้นกว่าทุกยุค เพราะพลังงานสะอาดกลายเป็นมาตรฐานเดียว ป่าไม้ถูกฟื้นฟูด้วยระบบ AI ที่คำนวณการปลูกและดูแลพืชพันธุ์อัตโนมัติ มหาสมุทรถูกทำความสะอาดจากพลาสติกด้วยนาโนบอท แต่ความสูญเสียบางอย่างที่เกิดขึ้นก่อนหน้านั้นไม่มีวันคืนกลับมาได้อีก',
  },
  {
    icon: 'technology',
    title: 'เทคโนโลยี',
    en: 'Technology',
    short: 'เทคโนโลยีไม่ใช่เครื่องมืออีกต่อไป แต่กลายเป็นส่วนหนึ่งของชีวิต',
    body: 'เทคโนโลยีในปี 2096 ไม่ได้อยู่ในอุปกรณ์ใดอุปกรณ์หนึ่ง มันกระจายอยู่ทุกที่ในสิ่งแวดล้อมรอบตัว ผนัง ถนน อากาศ และแสงสว่างล้วนเป็นส่วนหนึ่งของระบบ AI ส่วนกลางที่เรียนรู้และปรับตัวตามพฤติกรรมมนุษย์อย่างต่อเนื่อง ทำให้แทบไม่รู้สึกเลยว่ากำลังใช้เทคโนโลยี',
  },
  {
    icon: 'city',
    title: 'เมืองอัจฉริยะ',
    en: 'Smart City',
    short: 'เมืองที่เชื่อมต่อกับระบบ AI ส่วนกลางแบบ Real-Time',
    body: 'เมืองในปี 2096 เชื่อมต่อกับระบบ AI ส่วนกลาง อาคาร ถนน ระบบขนส่ง และพลังงานสามารถสื่อสารกันแบบ Real-Time อาคารปรับตัวเองได้ตามการใช้งาน ถนนเปลี่ยนหน้าที่ได้ตามช่วงเวลาของวัน ระบบขนส่งไร้คนขับทำงานพร้อมกันเหมือนฝูงปลาที่ว่ายพร้อมกันโดยไม่ชนกัน',
  },
  {
    icon: 'evolution',
    title: 'วิวัฒนาการมนุษย์',
    en: 'Human Evolution',
    short: 'มนุษย์กับเทคโนโลยีกลายเป็นสิ่งเดียวกัน แต่ยังเป็นมนุษย์อยู่หรือไม่?',
    body: 'ในปี 2096 มนุษย์บางคนเลือกเชื่อมต่อสมองกับ AI โดยตรง ทำให้สามารถเรียนรู้และประมวลผลข้อมูลได้เร็วกว่าเดินหลายเท่า ความทรงจำสามารถสำรองและแชร์ได้ แต่คำถามสำคัญคือ เมื่อร่างกายและจิตใจเชื่อมต่อกับเครื่องจักร มนุษย์ยังเป็นมนุษย์อยู่หรือไม่',
  },
];

const ICON_MAP: Record<string, string> = {
  environment: 'E',
  technology: 'T',
  city: 'C',
  evolution: 'H',
};

export function WorldSection() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="section content-min-h">
      <div ref={ref} className="max-w-6xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''}`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            WORLD 2096 / ภาพรวมโลกอนาคต
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(2rem, 6vw, 3.6rem)', lineHeight: 1.15, maxWidth: '900px' }}>
            โลกในปี 2096
          </h2>
          <p className="thin-title mt-5" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'var(--c-muted)', maxWidth: '680px', lineHeight: 1.6 }}>
            มนุษย์ได้ก้าวข้ามขีดจำกัดเดิมหลายอย่าง — แต่สิ่งที่ได้มามีราคาเสมอ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {WORLD_CARDS.map((c, i) => (
            <button
              key={c.en}
              className={`holo-card fade-up ${inView ? 'in' : ''}`}
              style={{ transitionDelay: `${0.2 + i * 0.15}s`, cursor: 'pointer', textAlign: 'left', width: '100%', display: 'block' }}
              onClick={() => setSelected(i)}
            >
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <div
                className="font-display"
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: 'var(--c-cyan)',
                  marginBottom: '0.8rem',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: '1px solid rgba(79, 214, 255, 0.3)',
                  background: 'rgba(79, 214, 255, 0.05)',
                }}
              >
                {ICON_MAP[c.icon]}
              </div>
              <div className="font-mono-fut text-cyan mb-2" style={{ fontSize: '0.62rem', opacity: 0.6 }}>{c.en}</div>
              <h3 className="thin-title text-ice" style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>{c.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--c-muted)', lineHeight: 1.6 }}>{c.short}</p>
              <div className="font-mono-fut text-cyan" style={{ fontSize: '0.62rem', marginTop: '0.8rem', opacity: 0.5 }}>
                CLICK TO EXPLORE →
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected !== null && (
        <HoloModal
          tag="// ข้อมูลจากปี 2096"
          title={WORLD_CARDS[selected].title}
          subtitle={WORLD_CARDS[selected].en.toUpperCase()}
          body={WORLD_CARDS[selected].body}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
