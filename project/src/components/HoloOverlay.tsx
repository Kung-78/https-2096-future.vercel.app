import { useEffect, useState } from 'react';
import type { HoverInfo } from '@/three/SceneManager';

interface HoverLabelProps {
  hover: HoverInfo | null;
}

export function HoverLabel({ hover }: HoverLabelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hover) setVisible(true);
    else {
      const id = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(id);
    }
  }, [hover]);

  if (!hover && !visible) return null;

  return (
    <div
      className="holo-popup"
      style={{
        position: 'fixed',
        left: (hover?.x ?? 0) + 18,
        top: (hover?.y ?? 0) + 18,
        zIndex: 30,
        pointerEvents: 'none',
        opacity: hover ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div
        className="glass glass-edge"
        style={{
          padding: '0.5rem 0.9rem',
          borderRadius: '4px',
          fontFamily: "'Space Grotesk', monospace",
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          color: 'var(--c-ice)',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: 'var(--c-cyan)' }}>◉ </span>
        {hover?.label}
      </div>
    </div>
  );
}

interface HoloPopupProps {
  info: HoverInfo | null;
  onClose: () => void;
}

const POPUP_CONTENT: Record<string, { title: string; body: string }> = {
  'โลก · ปี 2026': {
    title: 'โลกใบเดิม',
    body: 'ในมุมมองของคนปี 2096 โลกใบนี้คือจุดเริ่มต้นของทุกสิ่ง — ทั้งสิ่งที่พวกเขาสร้างขึ้น และสิ่งที่สูญเสียไป ลองจินตนาการว่านี่คือภาพสะท้อนของบ้านในอดีต ที่ยังเป็นปัจจุบันของคุณอยู่ในตอนนี้',
  },
  'อาคารอัจฉริยะ': {
    title: 'อาคารที่คิดเองได้',
    body: 'ในโลกสมมติของปี 2096 อาคารอาจปรับตัวเองได้ — เปลี่ยนรูปทรง อุณหภูมิ และแสงตามพฤติกรรมของคนข้างใน ผนังไม่ใช่แค่กั้น แต่เป็นส่วนหนึ่งของระบบที่เรียนรู้',
  },
  'เสาสัญญาณโฮโลแกรม': {
    title: 'สัญญาณที่ไม่มีสาย',
    body: 'ลองจินตนาการถึงเมืองที่ไม่มีป้ายบอดสี ป้ายโฆษณา หรือจอติดผนัง ทุกสิ่งถูกฉายในอากาศเป็นโฮโลแกรม ปรากฏเฉพาะเมื่อต้องการ และหายไปเมื่อไม่จำเป็น',
  },
  'ท่ายานบิน': {
    title: 'ท่าที่ไม่มีพื้นดิน',
    body: 'การเดินทางในอนาคตอาจไม่ต้องสัมผัสพื้น ท่ายานบินลอยนิ่งอยู่กลางอากาศ รับส่งยานพาหนะขนาดเล็กที่เคลื่อนที่ด้วยระบบอัตโนมัติโดยสมบูรณ์',
  },
  'ศูนย์ควบคุมจราจร': {
    title: 'จราจรที่ไม่มีรถติด',
    body: 'เมื่อรถทุกคันคุยกันเองได้ การติดอาจเป็นเรื่องในอดีต AI กลางวางเส้นทางให้ยานพาหนะทุกล้อในเมืองพร้อมกัน เหมือนวงดนตรีที่เล่นพร้อมกันโดยไม่ต้องมีผู้กำกับ',
  },
  'ชิ้นส่วนความทรงจำ': {
    title: 'ข้อมูลที่เคยเป็นความรู้สึก',
    body: 'ลองจินตนาการว่าความทรงจำสามารถบันทึกเป็นข้อมูลได้ — เสียงหัวเราะของคนที่รัก กลิ่นของวันที่จากไป แต่เมื่อความทรงจำกลายเป็นไฟล์ มันยังเป็นของเราอยู่หรือไม่?',
  },
  'AI · ปัญญาประดิษฐ์รอบตัว': {
    title: 'ปัญญาที่อยู่ทุกที่',
    body: 'AI ในปี 2096 อาจไม่ได้อยู่ในกล่องใดกล่องหนึ่ง มันกระจายอยู่ในอากาศ ในผนัง ในแสง เรียกใช้ได้ทุกที่ เห็นได้ทุกที่ แต่จับตัวไม่ได้ — เหมือนลมที่รู้จักเรา',
  },
  'ดาวอังคาร · ถิ่นฐานใหม่': {
    title: 'บ้านหลังที่สอง',
    body: 'ลองจินตนาการว่ามนุษย์อาจมีบ้านอีกแห่งบนดาวดวงใหม่ ฟ้าสีแดง ทรายสีส้ม แสงอาทิตย์ที่เล็กลง แต่คำว่า "บ้าน" จะยังหมายถึงที่เดิมหรือไม่ เมื่อเราเริ่มมีหลายบ้าน?',
  },
  'สถานีอวกาศในวงโคจร': {
    title: 'เมืองที่ลอยอยู่เหนือดาว',
    body: 'สถานีในวงโคจรอาจกลายเป็นเมืองขนาดย่อม คนเกิด โต และใช้ชีวิตทั้งชีวิตบนวงแหวนที่หมุนรอบดาว โดยไม่เคยเหยียบพื้นดินเลย',
  },
  'ยานสำรวจระหว่างดาว': {
    title: 'เส้นทางระหว่างดวงดาว',
    body: 'ยานสำรวจอาจเป็นเสมือนบ้านเคลื่อนที่ ใช้เวลาเดินทางเป็นปี คนบนยานอาจเติบโต เรียน ทำงาน และฝัน ในขณะที่โลกที่จากมาเปลี่ยนไปโดยไม่รู้ตัว',
  },
};

export function HoloPopup({ info, onClose }: HoloPopupProps) {
  if (!info) return null;
  const content = POPUP_CONTENT[info.label] || { title: info.label, body: 'วัตถุจากโลกในอนาคต — ลองจินตนาการถึงสิ่งที่อาจเป็นไปได้' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        background: 'rgba(2,4,10,0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        className="holo-popup glass glass-edge"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          padding: '2rem 2.2rem',
          borderRadius: '12px',
        }}
      >
        <div
          className="font-mono-fut text-cyan"
          style={{ fontSize: '0.68rem', marginBottom: '0.6rem', opacity: 0.7 }}
        >
          // ข้อมูลจากปี 2096
        </div>
        <h3 className="thin-title glow-soft" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--c-ice)' }}>
          {content.title}
        </h3>
        <p style={{ color: 'var(--c-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {content.body}
        </p>
        <div style={{ marginTop: '1.6rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="font-mono-fut"
            style={{
              background: 'none',
              border: '1px solid var(--c-line)',
              color: 'var(--c-ice)',
              padding: '0.5rem 1.4rem',
              borderRadius: '3px',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
