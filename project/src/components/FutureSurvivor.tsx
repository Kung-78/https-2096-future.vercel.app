import { Component, useEffect, useMemo, useState, type ErrorInfo, type ReactNode } from 'react';
import { Activity, ArrowLeft, ArrowRight, AudioLines, BookOpen, BrainCircuit, Check, ChevronRight, CircleHelp, Database, RotateCcw, ShieldCheck, Sparkles, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';
import { analyzeGame, type AnalysisInput, type DecisionRecord, type SkillId } from '@/gameAnalysis';

type Skill = SkillId;
type Ending = 'sustainable' | 'ai' | 'secure' | 'data' | 'collapse';
type Resource = 'energy' | 'water' | 'food' | 'money' | 'pollution';
type Resources = Record<Resource, number>;

interface GameProgress {
  started: boolean;
  currentLevel: number;
  xp: number;
  skills: Record<Skill, number>;
  cleared: number[];
  achievements: string[];
  ecoTurn: number;
  ecoActions: number[];
  resources: Resources;
  ecoFinished: boolean;
  finalChoices: Ending[];
  decisions: DecisionRecord[];
  finished: boolean;
  ending: Ending | null;
}

interface Choice {
  label: string;
  feedback: string;
}

const STORAGE_KEY = 'future-survivor-2096-v1';
let progressReadWarning: string | null = null;
const EMPTY_SKILLS: Record<Skill, number> = {
  ai: 0, cyber: 0, data: 0, critical: 0, creativity: 0, sustainability: 0, adaptability: 0, collaboration: 0,
};
const START_RESOURCES: Resources = { energy: 100, water: 100, food: 100, money: 100, pollution: 0 };
const LEVEL_NAMES = ['AI COMMAND', 'CYBER CITY', 'DATA DETECTIVE', 'LAST GREEN CITY', 'THE FAKE WORLD', 'HUMAN + AI', 'FUTURE PROBLEM SOLVER', 'THE FINAL DECISION'] as const;

const INITIAL_PROGRESS: GameProgress = {
  started: false, currentLevel: 0, xp: 0, skills: EMPTY_SKILLS, cleared: [], achievements: [],
  ecoTurn: 0, ecoActions: [], resources: START_RESOURCES, ecoFinished: false, finalChoices: [], decisions: [], finished: false, ending: null,
};

const SKILL_LIST: { id: Skill; label: string; thai: string; icon: string }[] = [
  { id: 'ai', label: 'AI LITERACY', thai: 'ความรู้เท่าทัน AI', icon: '◈' },
  { id: 'cyber', label: 'CYBERSECURITY', thai: 'ความมั่นคงปลอดภัยไซเบอร์', icon: '⌑' },
  { id: 'data', label: 'DATA LITERACY', thai: 'ความรู้เท่าทันข้อมูล', icon: '▤' },
  { id: 'critical', label: 'CRITICAL THINKING', thai: 'การคิดเชิงวิพากษ์', icon: '⌁' },
  { id: 'creativity', label: 'CREATIVITY', thai: 'ความคิดสร้างสรรค์', icon: '✳' },
  { id: 'sustainability', label: 'SUSTAINABILITY', thai: 'ความยั่งยืน', icon: '⌘' },
  { id: 'adaptability', label: 'ADAPTABILITY', thai: 'การปรับตัว', icon: '↻' },
  { id: 'collaboration', label: 'HUMAN + AI', thai: 'การทำงานร่วมกับ AI', icon: '⌬' },
];

const KNOWLEDGE = [
  { id: 'ai' as Skill, icon: '🤖', title: 'AI Literacy', thai: 'ความรู้เท่าทัน AI', meaning: 'เข้าใจว่า AI ทำอะไรได้ มีข้อจำกัดอย่างไร และควรใช้มันอย่างรับผิดชอบ', real: 'ใช้ AI ช่วยร่างแผนงาน แล้วตรวจข้อเท็จจริงและปรับคำตอบให้ตรงบริบทก่อนส่ง', why: 'AI อาจให้ข้อมูลคลาดเคลื่อนหรือสะท้อนอคติ การรู้เท่าทันช่วยให้มนุษย์ยังเป็นผู้ตัดสินใจ', practice: 'ทดลองใช้ AI กับงานเล็ก ๆ เปรียบเทียบกับแหล่งที่เชื่อถือได้ และจดสิ่งที่ต้องตรวจซ้ำ', jobs: 'AI product designer, นักวิเคราะห์ AI, ผู้เชี่ยวชาญธรรมาภิบาล AI' },
  { id: 'cyber' as Skill, icon: '🛡️', title: 'Cybersecurity', thai: 'ความมั่นคงปลอดภัยไซเบอร์', meaning: 'ปกป้องบัญชี อุปกรณ์ เครือข่าย และข้อมูลส่วนตัวจากการเข้าถึงหรือหลอกลวง', real: 'ตรวจโดเมนผู้ส่งก่อนเปิดลิงก์ ใช้รหัสผ่านไม่ซ้ำ และเปิดการยืนยันตัวตนสองขั้นตอน', why: 'การคลิกลิงก์หรือเปิดเผยรหัสเพียงครั้งเดียวอาจกระทบทั้งตัวเราและระบบที่เชื่อมต่อ', practice: 'ฝึกสังเกตโดเมน ตั้ง password manager และทบทวนสิทธิ์การเข้าถึงแอปเป็นประจำ', jobs: 'นักวิเคราะห์ความปลอดภัย, ผู้ทดสอบระบบ, ผู้จัดการความเสี่ยงไซเบอร์' },
  { id: 'data' as Skill, icon: '📊', title: 'Data Literacy', thai: 'ความรู้เท่าทันข้อมูล', meaning: 'อ่าน ตั้งคำถาม วิเคราะห์ และสื่อสารข้อมูลโดยไม่สรุปเกินหลักฐาน', real: 'เมื่อค่าไฟเพิ่ม ให้แยกดูจำนวนผู้ใช้ สภาพอากาศ และช่วงเวลา แทนการเดาสาเหตุจากตัวเลขเดียว', why: 'ข้อมูลช่วยให้ตัดสินใจดีขึ้นก็ต่อเมื่อเข้าใจที่มา บริบท และข้อจำกัดของมัน', practice: 'อ่านกราฟหลายรูปแบบ ตรวจหน่วยและช่วงเวลา แล้วตั้งคำถามว่าอะไรยังไม่รู้', jobs: 'นักวิเคราะห์ข้อมูล, นักวิทยาศาสตร์ข้อมูล, นักสื่อสารข้อมูล' },
  { id: 'sustainability' as Skill, icon: '🌱', title: 'Sustainability', thai: 'ความยั่งยืน', meaning: 'ดูแลทรัพยากรและคุณภาพชีวิตในระยะยาว โดยคำนึงถึงผลกระทบที่เชื่อมโยงกัน', real: 'เลือกขนส่งสาธารณะช่วยลดพลังงานและมลพิษ แต่ต้องออกแบบให้ทุกชุมชนเข้าถึงได้', why: 'การแก้ปัญหาหนึ่งด้านอาจสร้างผลกระทบอีกด้าน จึงต้องมองทั้งระบบและคนที่ได้รับผล', practice: 'ติดตามการใช้พลังงานและน้ำ ทดลองเปลี่ยนพฤติกรรม แล้วประเมินผลที่เกิดขึ้นจริง', jobs: 'นักวางแผนเมืองยั่งยืน, ผู้เชี่ยวชาญพลังงานสะอาด, นักฟื้นฟูระบบนิเวศ' },
  { id: 'critical' as Skill, icon: '🧠', title: 'Critical Thinking', thai: 'การคิดเชิงวิพากษ์', meaning: 'ตรวจสอบเหตุผลและหลักฐาน แยกข้อเท็จจริงออกจากข้อกล่าวอ้างก่อนเชื่อหรือแชร์', real: 'ตรวจผู้เผยแพร่ วันที่ งานวิจัย และการยืนยันจากแหล่งอิสระก่อนส่งต่อข่าวสุขภาพ', why: 'พาดหัวที่มั่นใจไม่ได้แปลว่าหลักฐานเพียงพอ และการแชร์ข้อมูลผิดอาจสร้างความเสียหาย', practice: 'ถามว่าใครกล่าวอ้าง ใช้หลักฐานอะไร มีคำอธิบายอื่นหรือไม่ และยังขาดข้อมูลใด', jobs: 'นักวิจัย, นักข่าวตรวจสอบข้อเท็จจริง, นักนโยบายสาธารณะ' },
  { id: 'creativity' as Skill, icon: '💡', title: 'Creativity', thai: 'ความคิดสร้างสรรค์', meaning: 'มองปัญหาหลายมุมและออกแบบทางเลือกใหม่ที่ตอบโจทย์ผู้คนและข้อจำกัดจริง', real: 'ออกแบบจุดเติมน้ำในชุมชนที่ใช้พลังงานต่ำและเข้าถึงได้ในช่วงน้ำขาดแคลน', why: 'ปัญหาซับซ้อนมักไม่มีคำตอบสำเร็จรูป การสร้างทางเลือกช่วยให้เห็นทางออกที่หลากหลาย', practice: 'กำหนดปัญหาให้ชัด ระดมหลายแนวทาง ทำต้นแบบเล็ก และรับฟังผู้ใช้จริง', jobs: 'นักออกแบบบริการ, นักนวัตกรรมสังคม, นักออกแบบประสบการณ์' },
  { id: 'adaptability' as Skill, icon: '🔄', title: 'Adaptability', thai: 'ความสามารถในการปรับตัว', meaning: 'เรียนรู้จากสถานการณ์ที่เปลี่ยนแปลงและปรับแผนโดยยังมุ่งแก้ปัญหา', real: 'เมื่อระบบขนส่งหยุด ให้ใช้ข้อมูลเส้นทางสำรองและสื่อสารแผนใหม่กับผู้ได้รับผลกระทบ', why: 'โลกจริงเปลี่ยนเร็วกว่าที่แผนเดิมคาด การปรับตัวช่วยให้รับมือได้โดยไม่หยุดเรียนรู้', practice: 'ทบทวนผลหลังตัดสินใจ ฝึกทักษะใหม่ และเตรียมแผนสำรองสำหรับความเสี่ยงสำคัญ', jobs: 'ผู้จัดการวิกฤต, นักวางกลยุทธ์การเปลี่ยนแปลง, ผู้เชี่ยวชาญ resilience' },
  { id: 'collaboration' as Skill, icon: '🤝', title: 'Human + AI Collaboration', thai: 'การทำงานร่วมกันระหว่างมนุษย์กับ AI', meaning: 'ให้ AI สนับสนุนการวิเคราะห์ ขณะที่มนุษย์กำกับจริยธรรม บริบท และความรับผิดชอบ', real: 'ให้ระบบช่วยจัดลำดับเหตุฉุกเฉิน แต่มีทีมมนุษย์ตรวจสอบผลกระทบและอุทธรณ์ได้', why: 'การตัดสินใจที่กระทบผู้คนต้องมีผู้รับผิดชอบ ไม่ควรมอบอำนาจทั้งหมดให้ระบบอัตโนมัติ', practice: 'แบ่งงานว่าอะไรให้ AI ช่วย อะไรต้องใช้วิจารณญาณมนุษย์ และกำหนดคนรับผิดชอบให้ชัด', jobs: 'นักออกแบบปฏิสัมพันธ์มนุษย์-AI, ผู้เชี่ยวชาญจริยธรรมเทคโนโลยี, ผู้จัดการระบบ AI' },
];

const ACHIEVEMENTS = [
  { id: 'first', icon: '✦', title: 'FIRST CONTACT', detail: 'ผ่านด่านแรก' },
  { id: 'cyber', icon: '⬡', title: 'CYBER GUARDIAN', detail: 'รับมือภัยไซเบอร์' },
  { id: 'thinker', icon: '⌁', title: 'THINKER', detail: 'ตรวจสอบหลักฐานก่อนเชื่อ' },
  { id: 'planet', icon: '♧', title: 'PLANET SAVER', detail: 'เมืองอยู่รอดอย่างสมดุล' },
  { id: 'partner', icon: '⌬', title: 'AI PARTNER', detail: 'ตัดสินใจร่วมกับ AI อย่างรับผิดชอบ' },
  { id: 'ready', icon: '✧', title: 'FUTURE READY', detail: 'จบภารกิจทั้ง 8 ด่าน' },
];

const QUIZZES: Record<number, { title: string; scenario: string; prompt: string; skill: Skill; choices: Choice[] }> = {
  0: {
    title: 'คุณจะใช้ AI อย่างไร?',
    scenario: 'คุณทำงานในบริษัทแห่งอนาคตและมีเวลา 2 ชั่วโมงทำรายงานให้ทีม AI ช่วยวิเคราะห์ได้ แต่คุณเป็นผู้รับผิดชอบผลลัพธ์',
    prompt: 'คุณจะจัดการงานนี้อย่างไร?', skill: 'ai',
    choices: [
      { label: 'ให้ AI ทำทั้งหมดแล้วส่งทันที', feedback: 'เร็วขึ้น แต่ถ้าข้อมูลคลาดเคลื่อน อคติ หรือไม่ตรงบริบท ผลกระทบยังตกกับผู้ส่ง คุณควรกำหนดขอบเขตงานและตรวจคำตอบก่อนใช้' },
      { label: 'ใช้ AI ช่วยวิเคราะห์ แล้วตรวจสอบและแก้ไขเอง', feedback: 'นี่คือการใช้ AI เป็นเครื่องมือเสริมความสามารถ คุณยังตรวจหลักฐาน อคติ ความเป็นส่วนตัว และความเหมาะสมก่อนรับผิดชอบผลงาน' },
      { label: 'ไม่ใช้ AI เลย แม้จะช่วยงานได้', feedback: 'การไม่ใช้ AI เป็นทางเลือกได้ โดยเฉพาะข้อมูลอ่อนไหว แต่การเข้าใจเครื่องมือและข้อจำกัดช่วยให้เลือกใช้หรือปฏิเสธได้อย่างมีเหตุผล' },
      { label: 'คัดลอกคำตอบจาก AI โดยไม่ตรวจสอบ', feedback: 'คำตอบที่ฟังดูมั่นใจอาจผิดหรือแต่งแหล่งข้อมูลได้ ตรวจข้อเท็จจริงและบริบทเสมอก่อนเผยแพร่หรือใช้ตัดสินใจ' },
    ],
  },
  1: {
    title: 'ปกป้องเมืองไซเบอร์',
    scenario: 'คุณได้รับข้อความจากผู้ดูแลระบบ: “SECURITY ALERT — กรุณายืนยันรหัสผ่านภายใน 5 นาที — CLICK HERE”',
    prompt: 'คุณควรทำอะไรเป็นอย่างแรก?', skill: 'cyber',
    choices: [
      { label: 'กดลิงก์ทันทีเพื่อไม่ให้บัญชีถูกระงับ', feedback: 'ข้อความเร่งด่วนและขู่ให้กลัวเป็นสัญญาณ phishing อย่ากดลิงก์จากข้อความที่ไม่คาดคิด ให้เข้าเว็บไซต์ทางการด้วยตนเอง' },
      { label: 'ตรวจสอบ URL และติดต่อผู้ดูแลผ่านช่องทางทางการ', feedback: 'ดีมาก ตรวจชื่อโดเมนให้ตรงทุกตัว อย่าพิมพ์รหัสผ่านผ่านลิงก์ที่ส่งมา และยืนยันกับผู้ดูแลจากช่องทางที่รู้จัก' },
      { label: 'ส่งต่อให้เพื่อนช่วยกดตรวจสอบ', feedback: 'การส่งต่อขยายความเสี่ยงให้คนอื่นได้ หากสงสัยให้รายงานทีมความปลอดภัยโดยไม่เปิดลิงก์หรือแนบข้อมูลส่วนตัว' },
      { label: 'ป้อนรหัสผ่านทันที แล้วค่อยเปลี่ยนภายหลัง', feedback: 'ผู้โจมตีอาจยึดบัญชีได้ทันที ใช้รหัสผ่านไม่ซ้ำ เปิด 2FA และหากเผลอกรอกข้อมูลให้เปลี่ยนรหัสผ่านจากเว็บทางการทันที' },
    ],
  },
  2: {
    title: 'นักสืบข้อมูล',
    scenario: 'รายงานเมือง A ระบุว่าการใช้พลังงานเพิ่มขึ้น 30% ขณะที่ประชากรเพิ่มขึ้นเพียง 5%',
    prompt: 'ก่อนสรุปสาเหตุ ควรตรวจสอบอะไรต่อไป?', skill: 'data',
    choices: [
      { label: 'สรุปทันทีว่าประชาชนใช้ไฟฟ้าฟุ่มเฟือยขึ้น', feedback: 'ตัวเลขสองชุดยังบอกเหตุและผลไม่ได้ อาจมีอากาศร้อน โรงงานใหม่ หรือเปลี่ยนวิธีเก็บข้อมูล ต้องตรวจบริบทและแนวโน้มเพิ่ม' },
      { label: 'ดูช่วงเวลา หน่วย แหล่งข้อมูล และการใช้พลังงานแยกตามภาคส่วน', feedback: 'ถูกทาง ตรวจหน่วยและช่วงเวลา เปรียบเทียบข้อมูลอดีต แยกบ้านเรือนกับอุตสาหกรรม แล้วถามว่ามีปัจจัยอื่นใดร่วมเปลี่ยนแปลง' },
      { label: 'ทำกราฟจากตัวเลขสองค่าแล้วเลือกสาเหตุที่ดูชัดที่สุด', feedback: 'กราฟช่วยมองรูปแบบ แต่ข้อมูลเพียงสองจุดไม่ยืนยันแนวโน้มหรือสาเหตุ ควรหาข้อมูลหลายช่วงเวลาและตรวจวิธีวัด' },
      { label: 'เทียบกับเมืองอื่นแล้วใช้ข้อสรุปเดียวกัน', feedback: 'การเทียบเมืองช่วยตั้งคำถาม แต่โครงสร้างอุตสาหกรรม ภูมิอากาศ และวิธีเก็บข้อมูลอาจต่างกัน ตรวจความเทียบเคียงก่อนสรุป' },
    ],
  },
  4: {
    title: 'โลกข้อมูลลวง',
    scenario: 'มีโพสต์แชร์ว่า “นักวิทยาศาสตร์ค้นพบว่าการนอน 3 ชั่วโมงต่อวันทำให้มนุษย์ฉลาดขึ้น 40%” แต่ไม่มีแหล่งที่มาแนบมา',
    prompt: 'สถานะของข้อกล่าวอ้างนี้ควรเป็นอย่างไร?', skill: 'critical',
    choices: [
      { label: 'TRUE — มีตัวเลขชัดเจนจึงน่าเชื่อถือ', feedback: 'ตัวเลขที่เฉพาะเจาะจงไม่ได้รับประกันความจริง ต้องหาต้นฉบับ งานวิจัย กลุ่มตัวอย่าง และวิธีวัดก่อนเชื่อ' },
      { label: 'FALSE — ตัดสินว่าเท็จได้จากพาดหัวเพียงอย่างเดียว', feedback: 'พาดหัวน่าสงสัย แต่การตรวจสอบที่รอบคอบต้องค้นหลักฐานต้นทางและแหล่งอิสระก่อนฟันธงว่าเท็จ' },
      { label: 'NOT ENOUGH EVIDENCE — หลักฐานที่ให้มายังไม่พอ', feedback: 'ใช่ ข้อมูลในโพสต์ยังไม่พอพิสูจน์ ตรวจว่าใครเผยแพร่ มีงานวิจัยจริงหรือไม่ วันที่ใด และหลายแหล่งอิสระยืนยันหรือเปล่า' },
    ],
  },
  5: {
    title: 'มนุษย์ + AI',
    scenario: 'AI จัดลำดับการช่วยเหลือผู้ประสบภัยได้เร็ว แต่ข้อมูลของชุมชนห่างไกลไม่สมบูรณ์และระบบมีแนวโน้มจัดลำดับพวกเขาต่ำ',
    prompt: 'คุณเป็นผู้บัญชาการ จะตัดสินใจอย่างไร?', skill: 'collaboration',
    choices: [
      { label: 'ทำตาม AI ทั้งหมด เพราะประมวลผลเร็วกว่า', feedback: 'ความเร็วมีประโยชน์ แต่ข้อมูลที่ขาดอาจทำให้บางคนถูกมองข้าม ต้องตรวจผลกระทบและเปิดช่องให้ผู้เชี่ยวชาญแก้ไข' },
      { label: 'ปิด AI ทั้งระบบและตัดสินใจโดยไม่มีข้อมูลช่วย', feedback: 'การใช้วิจารณญาณมนุษย์สำคัญ แต่ยังใช้ AI ช่วยจำลองทางเลือกได้ โดยต้องกำกับข้อมูล ความเสี่ยง และการตรวจสอบโดยคน' },
      { label: 'ใช้ AI วิเคราะห์ ให้ทีมพื้นที่ตรวจสอบ และมนุษย์รับผิดชอบคำสั่งสุดท้าย', feedback: 'แนวทางนี้ใช้จุดแข็งทั้งสองด้าน ตรวจข้อมูลที่ขาด ฟังคนในพื้นที่ ประเมินความเสี่ยง และระบุผู้รับผิดชอบพร้อมช่องทางอุทธรณ์' },
      { label: 'เลือกเฉพาะคนที่ข้อมูลครบเพื่อให้ระบบทำงานง่าย', feedback: 'การตัดคนข้อมูลไม่ครบออกอาจทำให้กลุ่มเปราะบางเสียเปรียบ ควรหาข้อมูลเพิ่มและออกแบบการตรวจทานเพื่อไม่ให้ความไม่สมบูรณ์กลายเป็นความไม่เป็นธรรม' },
    ],
  },
  6: {
    title: 'นักแก้ปัญหาแห่งอนาคต',
    scenario: 'เกิดเหตุพร้อมกัน: พลังงานสำรองกำลังลด น้ำในเขตกักเก็บต่ำ Server โรงพยาบาลเริ่มล่ม และประชาชนกำลังอพยพ',
    prompt: 'การกระทำแรกที่คำนึงถึงความเสี่ยงและผลกระทบคือข้อใด?', skill: 'adaptability',
    choices: [
      { label: 'ฟื้นระบบ Server โรงพยาบาลและจ่ายพลังงานสำรองให้บริการฉุกเฉิน พร้อมตั้งทีมประเมินน้ำและเส้นทางอพยพ', feedback: 'จัดลำดับบริการที่กระทบชีวิตก่อน ประสานหลายทีม และประเมินข้อมูลซ้ำตามสถานการณ์ที่เปลี่ยนได้' },
      { label: 'แก้ทุกปัญหาพร้อมกันโดยไม่มีผู้รับผิดชอบแต่ละระบบ', feedback: 'การทำหลายอย่างพร้อมกันอาจสำคัญ แต่หากไม่มีเจ้าของงานและการประสาน ทรัพยากรจะซ้ำซ้อนและความเสี่ยงสูงขึ้น' },
      { label: 'ปิดระบบน้ำทั้งหมดเพื่อเก็บพลังงานให้ Server', feedback: 'การตัดสินใจแก้จุดหนึ่งอาจสร้างวิกฤตอีกจุด ประเมินความต้องการขั้นต่ำและผลกระทบต่อประชาชนก่อนจัดสรรทรัพยากร' },
      { label: 'รอข้อมูลสมบูรณ์ทุกด้านก่อนลงมือ', feedback: 'ข้อมูลเพิ่มมีประโยชน์ แต่การรออาจทำให้ความเสียหายขยาย ใช้ข้อมูลที่เชื่อถือได้ในขณะนี้ ทำขั้นตอนที่ย้อนกลับได้ และอัปเดตเมื่อมีหลักฐานใหม่' },
    ],
  },
};

type SkillScores = Partial<Record<Skill, number>>;

const QUIZ_SKILL_POINTS: Record<number, SkillScores[]> = {
  0: [{ ai: 1 }, { ai: 10, creativity: 2 }, { ai: 5, creativity: 4 }, { ai: 0 }],
  1: [{ cyber: 0 }, { cyber: 10 }, { cyber: 3 }, { cyber: 0 }],
  2: [{ data: 0 }, { data: 10 }, { data: 3 }, { data: 5 }],
  4: [{ critical: 0 }, { critical: 4 }, { critical: 10 }],
  5: [{ collaboration: 0 }, { collaboration: 4, critical: 2 }, { collaboration: 10, critical: 2 }, { collaboration: 1 }],
  6: [{ adaptability: 10, creativity: 2 }, { adaptability: 2 }, { adaptability: 0 }, { adaptability: 4 }],
};

const ECO_ACTIONS: { title: string; effect: Partial<Resources>; detail: string }[] = [
  { title: 'สร้าง Solar Farm', effect: { energy: 18, money: -14 }, detail: 'พลังงานสะอาดเพิ่ม แต่ต้องลงทุนเริ่มต้น' },
  { title: 'ระบบนำน้ำกลับมาใช้', effect: { water: 18, money: -12, energy: -3 }, detail: 'น้ำหมุนเวียนมากขึ้นและใช้พลังงานเพิ่มเล็กน้อย' },
  { title: 'ฟาร์มอาหารชุมชน', effect: { food: 16, water: -6, money: -8 }, detail: 'อาหารเพิ่ม แต่ต้องจัดการน้ำอย่างรอบคอบ' },
  { title: 'ขนส่งสาธารณะไฟฟ้า', effect: { energy: 8, money: -12, pollution: -9 }, detail: 'ลดมลพิษและช่วยให้คนเดินทางได้ทั่วถึง' },
  { title: 'เปิดโรงงานผลิต', effect: { money: 18, energy: -12, pollution: 12, food: 3 }, detail: 'รายได้และผลผลิตเพิ่ม แต่ใช้พลังงานและสร้างมลพิษ' },
  { title: 'ฟื้นฟูป่าเมือง', effect: { water: 8, food: 4, money: -9, pollution: -11 }, detail: 'ช่วยระบบนิเวศและคุณภาพชีวิตในระยะยาว' },
];

const FINAL_ROUNDS = [
  {
    title: 'วิกฤตพลังงาน / ENERGY CRISIS',
    prompt: 'พลังงานเหลือใช้ได้ 6 ชั่วโมง เมืองต้องจ่ายให้โรงพยาบาลและระบบขนส่งอพยพ',
    choices: [
      { title: 'จัดพลังงานให้โรงพยาบาลและเปิดศูนย์พลังงานชุมชน', tag: 'sustainable' as Ending, feedback: 'ปกป้องบริการจำเป็นและกระจายการเข้าถึงพลังงาน แม้ต้องชะลอการใช้บางส่วน' },
      { title: 'ให้ AI จัดสรรพลังงานแบบเรียลไทม์ โดยมีทีมมนุษย์ตรวจผลกระทบ', tag: 'ai' as Ending, feedback: 'ใช้การคำนวณช่วยเร่งการจัดสรร พร้อมรักษาการตรวจสอบโดยมนุษย์' },
      { title: 'แยกระบบสำคัญออกจากเครือข่ายและตรวจสอบสิทธิ์ก่อนสั่งจ่าย', tag: 'secure' as Ending, feedback: 'ลดความเสี่ยงการโจมตีในช่วงวิกฤต แต่ต้องคำนึงถึงความเร็วและระบบที่ยังต้องเชื่อมต่อ' },
      { title: 'ดูข้อมูลโหลดรายพื้นที่แล้วปรับแผนตามความต้องการจริง', tag: 'data' as Ending, feedback: 'ข้อมูลช่วยจัดสรรตรงจุด ตรวจความครบถ้วนและอย่าลืมกลุ่มที่มีข้อมูลไม่มากพอ' },
      { title: 'ตัดไฟทั้งเมืองทันทีเพื่อรักษาแบตเตอรี่ส่วนกลาง', tag: 'collapse' as Ending, feedback: 'การตัดสินใจแบบฉับพลันอาจหยุดบริการฉุกเฉินและทำให้ระบบอื่นเสียหายต่อเนื่อง' },
    ],
  },
  {
    title: 'สัญญาณไซเบอร์ / CYBER ALERT',
    prompt: 'เซนเซอร์หลายจุดส่งข้อมูลขัดแย้งกัน ขณะมีข้อความไม่ทราบที่มาขอสิทธิ์ผู้ดูแลระบบ',
    choices: [
      { title: 'แบ่งปันข้อมูลและพลังงานระหว่างพื้นที่ พร้อมตรวจสอบผลต่อชุมชน', tag: 'sustainable' as Ending, feedback: 'สร้างความยืดหยุ่นของเมืองและคำนึงถึงผู้ได้รับผลจากการเปลี่ยนแผน' },
      { title: 'ให้ AI เปรียบเทียบสัญญาณและเสนอแผนสำรองให้เจ้าหน้าที่อนุมัติ', tag: 'ai' as Ending, feedback: 'AI ช่วยหาแบบแผนได้ แต่การอนุมัติและตรวจแหล่งสัญญาณยังต้องมีคนรับผิดชอบ' },
      { title: 'ปฏิเสธสิทธิ์ที่ไม่ยืนยัน แยกระบบเสี่ยง และแจ้งทีมความปลอดภัย', tag: 'secure' as Ending, feedback: 'ลดพื้นที่โจมตีและตรวจสอบช่องทางก่อนให้สิทธิ์ แม้บางบริการอาจช้าลงชั่วคราว' },
      { title: 'เทียบข้อมูลหลายแหล่ง ตรวจเวลาและความน่าเชื่อถือก่อนจัดลำดับ', tag: 'data' as Ending, feedback: 'ตรวจแหล่งข้อมูลและความสอดคล้องก่อนตัดสินใจ โดยยังเตรียมแผนรับมือระหว่างรอ' },
      { title: 'ให้สิทธิ์ผู้ดูแลระบบกับผู้ส่งข้อความเพื่อแก้เหตุให้เร็วขึ้น', tag: 'collapse' as Ending, feedback: 'การให้สิทธิ์โดยไม่ยืนยันตัวตนอาจเปิดทางให้ผู้โจมตีควบคุมระบบเมือง' },
    ],
  },
  {
    title: 'แผนอพยพ / HUMAN IMPACT',
    prompt: 'การพยากรณ์ชี้ว่าพายุจะถึงเมืองใน 4 ชั่วโมง แต่แต่ละโมเดลให้เส้นทางต่างกัน',
    choices: [
      { title: 'อพยพเป็นลำดับ ดูแลผู้เปราะบาง และเตรียมเส้นทางสำรอง', tag: 'sustainable' as Ending, feedback: 'แผนคำนึงถึงความปลอดภัย การเข้าถึง และการฟื้นตัวในระยะยาว' },
      { title: 'จำลองเส้นทางหลายแบบด้วย AI แล้วให้ทีมภาคสนามตัดสินใจ', tag: 'ai' as Ending, feedback: 'ผสานความเร็วในการจำลองกับความรู้สถานการณ์จริงของเจ้าหน้าที่' },
      { title: 'ใช้ช่องทางสื่อสารที่ยืนยันตัวตนและป้องกันข่าวปลอมระหว่างอพยพ', tag: 'secure' as Ending, feedback: 'ข้อมูลคำสั่งที่เชื่อถือได้ช่วยลดความสับสนและการโจมตีในภาวะฉุกเฉิน' },
      { title: 'สื่อสารระดับความไม่แน่นอนและปรับแผนเมื่อข้อมูลใหม่เข้ามา', tag: 'data' as Ending, feedback: 'บอกสิ่งที่รู้และยังไม่รู้ พร้อมทบทวนหลักฐานแทนการทำเหมือนพยากรณ์แม่นยำแน่นอน' },
      { title: 'ยกเลิกการอพยพและรอให้พายุผ่านโดยไม่แจ้งประชาชน', tag: 'collapse' as Ending, feedback: 'การไม่สื่อสารความเสี่ยงทำให้ผู้คนเตรียมตัวไม่ได้ และอาจเพิ่มผลกระทบที่หลีกเลี่ยงได้' },
    ],
  },
];

const ENDINGS: Record<Ending, { title: string; name: string; icon: string; body: string }> = {
  sustainable: { title: 'SUSTAINABLE FUTURE', name: 'อนาคตที่เติบโตอย่างยั่งยืน', icon: '🌍', body: 'เมืองให้ความสำคัญกับทรัพยากรและผู้คน พร้อมเรียนรู้ที่จะฟื้นตัวจากวิกฤต การเปลี่ยนแปลงนี้ยังต้องอาศัยความร่วมมืออย่างต่อเนื่อง' },
  ai: { title: 'AI CIVILIZATION', name: 'อารยธรรมที่ร่วมคิดกับ AI', icon: '🤖', body: 'AI กลายเป็นผู้ช่วยสำคัญในการประสานเมือง ขณะที่มนุษย์ยังต้องกำกับเป้าหมาย จริยธรรม และความรับผิดชอบ' },
  secure: { title: 'SECURE CIVILIZATION', name: 'อารยธรรมที่ปกป้องความไว้วางใจ', icon: '🛡️', body: 'เมืองลงทุนกับความปลอดภัยและความเชื่อมั่น ระบบที่แข็งแรงช่วยลดความเสี่ยง แต่ต้องสมดุลกับการเข้าถึงและความเป็นส่วนตัว' },
  data: { title: 'DATA CIVILIZATION', name: 'อารยธรรมที่ตัดสินใจด้วยข้อมูล', icon: '📊', body: 'ข้อมูลช่วยให้เมืองเห็นสัญญาณและปรับแผนได้ดีขึ้น การตัดสินใจยังต้องถามว่าใครถูกนับ ใครถูกมองข้าม และข้อมูลบอกอะไรไม่ได้' },
  collapse: { title: 'COLLAPSE TIMELINE', name: 'เส้นเวลาแห่งความเปราะบาง', icon: '⚠️', body: 'ระบบบางส่วนรับภาระเกินขีดจำกัด เมืองต้องเริ่มฟื้นความไว้วางใจและเรียนรู้จากผลกระทบ เพื่อสร้างทางเลือกใหม่ร่วมกัน' },
};

const FINAL_SKILL_POINTS: Record<Ending, SkillScores> = {
  sustainable: { sustainability: 3, adaptability: 2 },
  ai: { ai: 2, collaboration: 3, adaptability: 2 },
  secure: { cyber: 3, adaptability: 2 },
  data: { data: 3, critical: 2, adaptability: 2 },
  collapse: {},
};

function boundedNumber(value: unknown, minimum: number, maximum: number, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(minimum, Math.min(maximum, value)) : fallback;
}

function isEnding(value: unknown): value is Ending {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ENDINGS, value);
}

function readProgress(): GameProgress {
  progressReadWarning = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return INITIAL_PROGRESS;
    const raw: unknown = JSON.parse(saved);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      progressReadWarning = 'ไฟล์ความคืบหน้าที่บันทึกไว้อ่านไม่ได้ เกมจะยังไม่เขียนทับข้อมูลจนกว่าคุณจะเลือกดำเนินการ';
      return INITIAL_PROGRESS;
    }
    const parsed = raw as Partial<GameProgress>;
    const cleared = Array.isArray(parsed.cleared)
      ? [...new Set(parsed.cleared.filter((value): value is number => Number.isInteger(value) && value >= 0 && value < 8))]
      : [];
    const savedSkills = parsed.skills && typeof parsed.skills === 'object' ? parsed.skills as Partial<Record<Skill, unknown>> : {};
    const skills = { ...EMPTY_SKILLS };
    (Object.keys(skills) as Skill[]).forEach((skill) => {
      skills[skill] = boundedNumber(savedSkills[skill], 0, 100, 0);
    });
    const savedResources = parsed.resources && typeof parsed.resources === 'object' ? parsed.resources as Partial<Record<Resource, unknown>> : {};
    const resources = { ...START_RESOURCES };
    (Object.keys(resources) as Resource[]).forEach((resource) => {
      resources[resource] = boundedNumber(savedResources[resource], 0, 100, START_RESOURCES[resource]);
    });
    const xp = boundedNumber(parsed.xp, 0, Number.MAX_SAFE_INTEGER, 0);
    const savedEcoTurn = parsed.ecoTurn;
    const ecoTurn = typeof savedEcoTurn === 'number' && Number.isInteger(savedEcoTurn) && savedEcoTurn >= 0 && savedEcoTurn <= 10 ? savedEcoTurn : 0;
    const ending = isEnding(parsed.ending) ? parsed.ending : null;
    const finished = parsed.finished === true && ending !== null && cleared.includes(7);
    const fallbackLevel = Math.max(0, Math.min(7, Math.max(-1, ...cleared) + 1));
    const savedLevel = parsed.currentLevel;
    const validSavedLevel = typeof savedLevel === 'number' && Number.isInteger(savedLevel) && savedLevel >= 0 && savedLevel <= 7;
    const invalidXp = parsed.xp !== undefined && (typeof parsed.xp !== 'number' || !Number.isFinite(parsed.xp) || parsed.xp < 0 || parsed.xp > Number.MAX_SAFE_INTEGER);
    const invalidCleared = parsed.cleared !== undefined && (!Array.isArray(parsed.cleared) || parsed.cleared.some((value) => !Number.isInteger(value) || value < 0 || value >= 8));
    const invalidChoices = parsed.finalChoices !== undefined && (!Array.isArray(parsed.finalChoices) || parsed.finalChoices.length > (finished ? 3 : 2) || parsed.finalChoices.some((value) => !isEnding(value)));
    const validDecision = (value: unknown): value is DecisionRecord => {
      if (!value || typeof value !== 'object') return false;
      const decision = value as Partial<DecisionRecord>;
      const level = decision.level;
      const choiceIndex = decision.choiceIndex;
      return typeof level === 'number' && Number.isInteger(level) && level >= 0 && level < 8 &&
        typeof decision.skill === 'string' && (Object.keys(EMPTY_SKILLS) as Skill[]).includes(decision.skill as Skill) &&
        typeof choiceIndex === 'number' && Number.isInteger(choiceIndex) && choiceIndex >= 0 && typeof decision.choiceLabel === 'string';
    };
    const decisions = Array.isArray(parsed.decisions) ? parsed.decisions.filter(validDecision).slice(0, 20) : [];
    const invalidSkills = parsed.skills !== undefined && (!parsed.skills || typeof parsed.skills !== 'object' || (Object.keys(EMPTY_SKILLS) as Skill[]).some((skill) => typeof savedSkills[skill] !== 'number' || !Number.isFinite(savedSkills[skill]) || savedSkills[skill] < 0 || savedSkills[skill] > 100));
    const invalidResources = parsed.resources !== undefined && (!parsed.resources || typeof parsed.resources !== 'object' || (Object.keys(START_RESOURCES) as Resource[]).some((resource) => typeof savedResources[resource] !== 'number' || !Number.isFinite(savedResources[resource]) || savedResources[resource] < 0 || savedResources[resource] > 100));
    const invalidAchievements = parsed.achievements !== undefined && (!Array.isArray(parsed.achievements) || parsed.achievements.some((id) => typeof id !== 'string' || !ACHIEVEMENTS.some((item) => item.id === id)));
    const invalidEnding = parsed.ending !== undefined && parsed.ending !== null && !isEnding(parsed.ending);
    const invalidEcoTurn = parsed.ecoTurn !== undefined && (typeof parsed.ecoTurn !== 'number' || !Number.isInteger(parsed.ecoTurn) || parsed.ecoTurn < 0 || parsed.ecoTurn > 10);
    const invalidEcoActions = parsed.ecoActions !== undefined && (!Array.isArray(parsed.ecoActions) || parsed.ecoActions.some((index) => !Number.isInteger(index) || index < 0 || index >= ECO_ACTIONS.length));
    const invalidStoredData = (savedLevel !== undefined && !validSavedLevel) || invalidXp || invalidCleared || invalidChoices || invalidSkills || invalidResources || invalidAchievements || invalidEnding || invalidEcoTurn || invalidEcoActions || (parsed.decisions !== undefined && !Array.isArray(parsed.decisions));
    if (invalidStoredData) progressReadWarning = 'ข้อมูลความคืบหน้าบางส่วนผิดรูปแบบ ระบบกู้คืนเฉพาะค่าที่อ่านได้และจะยังไม่เขียนทับไฟล์เดิมจนกว่าคุณจะยืนยัน';
    const currentLevel = finished ? 7 : typeof savedLevel === 'number' && Number.isInteger(savedLevel) && savedLevel >= 0 && savedLevel <= 7 ? savedLevel : fallbackLevel;
    const finalChoices = Array.isArray(parsed.finalChoices) ? parsed.finalChoices.filter(isEnding).slice(0, finished ? 3 : 2) : [];
    const achievements = Array.isArray(parsed.achievements)
      ? [...new Set(parsed.achievements.filter((id): id is string => typeof id === 'string' && ACHIEVEMENTS.some((item) => item.id === id)))]
      : [];
    return {
      ...INITIAL_PROGRESS,
      started: parsed.started === true || xp > 0 || cleared.length > 0 || finished,
      currentLevel,
      xp,
      skills,
      cleared,
      achievements,
      ecoTurn,
      ecoActions: Array.isArray(parsed.ecoActions) ? [...new Set(parsed.ecoActions.filter((index): index is number => Number.isInteger(index) && index >= 0 && index < ECO_ACTIONS.length))] : [],
      resources,
      ecoFinished: parsed.ecoFinished === true || ecoTurn >= 10,
      finalChoices,
      decisions,
      finished,
      ending,
    };
  } catch {
    progressReadWarning = 'ไฟล์ความคืบหน้าที่บันทึกไว้อ่านไม่ได้ เกมจะยังไม่เขียนทับข้อมูลจนกว่าคุณจะเลือกดำเนินการ';
    return INITIAL_PROGRESS;
  }
}

interface FutureSurvivorErrorBoundaryProps {
  children: ReactNode;
  onBack: () => void;
}

interface FutureSurvivorErrorBoundaryState {
  error: Error | null;
}

export class FutureSurvivorErrorBoundary extends Component<FutureSurvivorErrorBoundaryProps, FutureSurvivorErrorBoundaryState> {
  state: FutureSurvivorErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): FutureSurvivorErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Future Survivor] Render failed:', error, info.componentStack);
  }

  private retry = () => this.setState({ error: null });

  private resetSavedProgress = () => {
    if (!window.confirm('ความคืบหน้าของภารกิจอาจเสียหาย ต้องการล้างเฉพาะข้อมูล Future Survivor แล้วเริ่มใหม่หรือไม่?')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.setState({ error: null });
    } catch (error) {
      console.error('[Future Survivor] Could not reset saved progress:', error);
    }
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section className="section future-game future-game--overlay" role="alert" aria-live="assertive">
        <div className="future-game__error-panel">
          <p className="font-mono-fut future-game__eyebrow">MISSION ERROR / 2096</p>
          <h2>ไม่สามารถแสดงภารกิจนี้ได้</h2>
          <p>ข้อมูลระหว่างเปลี่ยนด่านไม่สมบูรณ์ ความคืบหน้ายังไม่ถูกลบ คุณลองเปิดภารกิจอีกครั้ง หรือกลับไปหน้าเว็บไซต์ได้</p>
          <div className="future-game__welcome-actions">
            <button type="button" className="future-game__primary" onClick={this.retry}>ลองอีกครั้ง</button>
            <button type="button" className="future-game__secondary" onClick={this.props.onBack}>BACK TO 2096</button>
            <button type="button" className="future-game__text-button" onClick={this.resetSavedProgress}>ล้างข้อมูลภารกิจที่เสียหาย</button>
          </div>
        </div>
      </section>
    );
  }
}

interface FutureSurvivorLauncherProps {
  onStart: () => void;
  refreshVersion: number;
}

export function FutureSurvivorLauncher({ onStart, refreshVersion }: FutureSurvivorLauncherProps) {
  const [progress, setProgress] = useState<GameProgress>(readProgress);
  const missionLevel = Math.min(progress.currentLevel + 1, 8);
  const status = progress.finished ? 'MISSION COMPLETE' : progress.started ? 'MISSION IN PROGRESS' : 'MISSION AVAILABLE';

  useEffect(() => {
    setProgress(readProgress());
  }, [refreshVersion]);

  return (
    <section id="game" className="section future-launch" aria-labelledby="future-launch-title">
      <div className="future-launch__panel">
        <div className="future-launch__copy">
          <p className="font-mono-fut future-launch__eyebrow"><span className="future-game__signal" /> 2096 / NEW SURVIVAL PROTOCOL</p>
          <h2 id="future-launch-title">FUTURE <span>SURVIVOR</span></h2>
          <p className="future-launch__thai">ภารกิจผู้รอดชีวิตแห่งปี 2096</p>
          <p className="future-launch__description">คุณได้รับข้อความจากอนาคต และมีเวลาเพียง 8 ภารกิจเพื่อเรียนรู้ทักษะที่จำเป็นต่อการอยู่รอดในโลกปี 2096</p>
          <div className="future-launch__stats"><span><strong>08</strong> LEVELS</span><span><strong>800</strong> XP</span><span><strong>06</strong> ACHIEVEMENTS</span></div>
          {progress.started && <div className="future-launch__progress"><span>{status}</span><span>LEVEL {missionLevel} / 8 <i /> XP {progress.xp}</span></div>}
          <button type="button" className="future-launch__button" onClick={onStart}><span>▶</span> {progress.started ? 'CONTINUE MISSION' : 'START MISSION'} <ArrowRight size={16} /></button>
        </div>
        <div className="future-launch__art" aria-hidden="true"><span className="future-launch__orbit" /><span className="future-launch__city">2096</span><span className="future-launch__art-tag">THE FUTURE NEEDS YOU</span><i className="future-launch__drone" /></div>
      </div>
    </section>
  );
}

function award(progress: GameProgress, id: string) {
  if (!progress.achievements.includes(id)) progress.achievements = [...progress.achievements, id];
}

function awardLevel(progress: GameProgress, level: number) {
  progress.cleared = progress.cleared.includes(level) ? progress.cleared : [...progress.cleared, level];
  progress.xp += 100;
  if (level === 0) award(progress, 'first');
  if (level === 1) award(progress, 'cyber');
  if (level === 3 && progress.resources.energy > 0 && progress.resources.water > 0 && progress.resources.food > 0 && progress.resources.pollution < 100) award(progress, 'planet');
}

function addSkillPoints(skills: Record<Skill, number>, points: SkillScores) {
  Object.entries(points).forEach(([skill, value]) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return;
    const key = skill as Skill;
    skills[key] = Math.min(100, skills[key] + value);
  });
}

function capResource(value: number) {
  return Math.max(0, Math.min(100, value));
}

function scoreEnding(choices: Ending[]): Ending {
  const counts: Record<Ending, number> = { sustainable: 0, ai: 0, secure: 0, data: 0, collapse: 0 };
  choices.forEach((choice) => { counts[choice] += 1; });
  if (counts.collapse >= 2) return 'collapse';
  return (['sustainable', 'ai', 'secure', 'data'] as Ending[]).reduce((winner, key) => counts[key] > counts[winner] ? key : winner, 'sustainable');
}

function FutureAnalysisReport({ progress, onBack, onRestart }: { progress: GameProgress; onBack: () => void; onRestart: () => void }) {
  const input = useMemo<AnalysisInput>(() => ({
    decisions: progress.decisions,
    skills: progress.skills,
    resources: progress.resources,
    achievements: progress.achievements,
    ending: progress.ending,
    cleared: progress.cleared,
    xp: progress.xp,
  }), [progress]);
  const report = useMemo(() => analyzeGame(input), [input]);
  const recordsBySkill = SKILL_LIST.map((skill) => ({
    ...skill,
    decisions: progress.decisions.filter((decision) => decision.skill === skill.id),
  }));

  return (
    <section id="future-survivor-overlay" className="section future-game future-game--overlay future-analysis" aria-label="รายงานจากปี 2096">
      <div className="future-game__skyline" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ left: `${index * 4.8}%`, height: `${18 + ((index * 37) % 42)}%`, width: `${3 + (index % 3)}%` }} />)}</div>
      <div className="future-game__rain" aria-hidden="true" />
      <div className="future-game__inner">
        <header className="future-game__heading future-analysis__heading">
          <div>
            <p className="font-mono-fut future-game__eyebrow"><span className="future-game__signal" /> REPORT TRANSMISSION / 2096</p>
            <h2 className="future-game__title">PERSONAL <span>DATA</span> REPORT</h2>
            <p className="future-game__subtitle">รายงานตนเองจากการตัดสินใจในภารกิจผู้รอดชีวิต</p>
          </div>
          <div className="future-game__header-actions">
            <button type="button" className="future-game__back" onClick={onBack}><ArrowLeft size={15} /> กลับไปดูผลลัพธ์</button>
          </div>
        </header>

        <div className="future-analysis__report">
          <aside className="future-analysis__side">
            <div className="future-analysis__identity">
              <span className="future-analysis__code">ID / 2096-<strong>{String(progress.xp).padStart(4, '0')}</strong></span>
              <div className="future-analysis__avatar"><span>◈</span><i /></div>
              <p className="font-mono-fut">PLAYER PROFILE</p>
              <h3>{report.persona}</h3>
              <p>{report.personaDescription}</p>
            </div>
            <div className="future-analysis__metadata">
              <div><span>DECISIONS</span><strong>{report.evidenceCount}</strong></div>
              <div><span>MISSIONS</span><strong>{progress.cleared.length}/8</strong></div>
              <div><span>ENDING</span><strong>{progress.ending?.slice(0, 3).toUpperCase()}</strong></div>
              <div><span>XP</span><strong>{progress.xp}</strong></div>
            </div>
            <div className="future-analysis__signal-card">
              <span>LIVE SIGNAL</span>
              <p>คำตอบถูกสร้างจากตัวเลือกจริงในเกม ไม่ใช่ข้อความสุ่ม</p>
              <i />
            </div>
          </aside>

          <main className="future-analysis__main">
            <div className="future-analysis__hero">
              <div className="future-analysis__hero-orbit"><span /><i /></div>
              <div>
                <p className="font-mono-fut">ARCHIVE SUMMARY / 2096</p>
                <h3>คุณเป็นคนแบบไหน?</h3>
                <p>{report.message}</p>
              </div>
              <div className="future-analysis__ending-chip"><span>{ENDINGS[progress.ending ?? 'sustainable'].icon}</span><div><small>FINAL PATH</small><strong>{ENDINGS[progress.ending ?? 'sustainable'].name}</strong></div></div>
            </div>

            <div className="future-analysis__section">
              <div className="future-analysis__section-title"><span>01</span><div><p>CORE PROFILE</p><h4>จุดแข็งของคุณ</h4></div></div>
              <div className="future-analysis__strength-grid">
                <article className="future-analysis__strength-card future-analysis__strength-card--primary">
                  <span className="future-analysis__strength-icon">{SKILL_LIST.find((skill) => skill.label === report.strongest.label)?.icon ?? '◈'}</span>
                  <div><small>STRONGEST CAPABILITY</small><h5>{report.strongest.label}</h5><p>{report.strongest.evidence}</p></div>
                  <strong>{report.strongest.value}%</strong>
                </article>
                <article className="future-analysis__strength-card">
                  <span className="future-analysis__strength-icon">◌</span>
                  <div><small>DOMINANT PATTERN</small><h5>{report.dominantTrait}</h5><p>{report.dominantEvidence}</p></div>
                </article>
              </div>
            </div>

            <div className="future-analysis__section">
              <div className="future-analysis__section-title"><span>02</span><div><p>THE NEXT VERSION</p><h4>สิ่งที่ควรปรับปรุง</h4></div></div>
              <div className="future-analysis__recommendation-grid">
                <article><span>01</span><div><h5>{report.improvement.label}</h5><p>{report.improvement.reason}</p><small>PRactice: {report.improvement.action}</small></div></article>
                <article><span>02</span><div><h5>{report.risk.label}</h5><p>{report.risk.reason}</p><small>Guidance: {report.risk.guidance}</small></div></article>
              </div>
            </div>

            <div className="future-analysis__section">
              <div className="future-analysis__section-title"><span>03</span><div><p>REPAIR & LEARNING</p><h4>สิ่งที่ควรแก้ไข & สิ่งที่ควรระมัดระวัง</h4></div></div>
              <div className="future-analysis__learning-grid">
                <article><span>↻</span><div><small>SHOULD FIX</small><h5>{report.learning.label}</h5><p>{report.learning.reason}</p><p>{report.learning.practice}</p></div></article>
                <article><span>!</span><div><small>WATCH OUT</small><h5>{report.risk.label}</h5><p>{report.risk.reason}</p><p>{report.risk.guidance}</p></div></article>
              </div>
            </div>

            <div className="future-analysis__section">
              <div className="future-analysis__section-title"><span>04</span><div><p>LEARNING PATH</p><h4>สิ่งที่คุณอาจต้องเรียนรู้</h4></div></div>
              <div className="future-analysis__path-card">
                <div><span>RECOMMENDED PATH</span><h5>{report.path.label}</h5></div>
                <p>{report.path.reason}</p>
                <div className="future-analysis__next-step"><span>NEXT STEP</span><p>{report.path.nextStep}</p></div>
              </div>
            </div>

            <div className="future-analysis__section">
              <div className="future-analysis__section-title"><span>05</span><div><p>CHARACTER MAP</p><h4>เส้นทางที่เหมาะกับคุณในอนาคต</h4></div></div>
              <div className="future-analysis__skill-wave">
                {recordsBySkill.map((skill) => {
                  const score = progress.skills[skill.id] ?? 0;
                  return <div key={skill.id}><span>{skill.icon}</span><div><small>{skill.thai}</small><strong>{score}%</strong><i><b style={{ width: `${score}%` }} /></i></div></div>;
                })}
              </div>
            </div>

            <div className="future-analysis__quote"><span>“</span><p>{report.message}</p><small>ข้อความจากอนาคตถึงคุณ</small></div>
          </main>
        </div>

        <footer className="future-analysis__actions">
          <p><span /> DATA VERIFIED / {report.evidenceCount} DECISIONS RECORDED</p>
          <div><button type="button" className="future-game__secondary" onClick={onBack}>กลับไปดูผลลัพธ์</button><button type="button" className="future-game__primary" onClick={onRestart}><RotateCcw size={15} /> เริ่มการเดินทางอีกครั้ง</button></div>
        </footer>
      </div>
    </section>
  );
}

interface FutureSurvivorProps {
  autoStart?: boolean;
  onBack: () => void;
}

export function FutureSurvivor({ autoStart = false, onBack }: FutureSurvivorProps) {
  const [progress, setProgress] = useState<GameProgress>(() => {
    const saved = readProgress();
    return autoStart ? { ...saved, started: true } : saved;
  });
  const [progressLoadWarning, setProgressLoadWarning] = useState<string | null>(() => progressReadWarning);
  const [view, setView] = useState<'mission' | 'profile' | 'knowledge' | 'achievements' | 'analysis'>('mission');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<(typeof KNOWLEDGE)[number] | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (progressLoadWarning) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* Storage may be disabled. */ }
  }, [progress, progressLoadWarning]);

  useEffect(() => () => { void audioContext?.close(); }, [audioContext]);

  useEffect(() => {
    if (!selectedKnowledge) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedKnowledge(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedKnowledge]);

  const playTone = () => {
    try {
      const context = audioContext ?? new AudioContext();
      if (!audioContext) setAudioContext(context);
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(560, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(840, context.currentTime + 0.12);
      gain.gain.setValueAtTime(0.045, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);
    } catch { /* Audio is optional and may be unavailable. */ }
  };

  const toggleSound = () => {
    setSoundOn((enabled) => !enabled);
    if (!soundOn) playTone();
  };

  const startGame = () => {
    setProgress((current) => ({ ...current, started: true }));
    setView('mission');
  };

  const resetGame = () => {
    if (!window.confirm('เริ่มความคืบหน้าใหม่ทั้งหมดหรือไม่? XP, Skill และ Achievement ที่บันทึกไว้จะถูกลบ')) return;
    setProgress({ ...INITIAL_PROGRESS, skills: { ...EMPTY_SKILLS }, resources: { ...START_RESOURCES } });
    setSelectedChoice(null);
    setFeedback(null);
    setView('mission');
    setProgressLoadWarning(null);
  };

  const restartGame = () => {
    resetGame();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitQuiz = (choiceIndex: number, explanation: string) => {
    setSelectedChoice(choiceIndex);
    setFeedback(explanation);
    if (soundOn) playTone();
  };

  const finishQuiz = (level: number, skill: Skill) => {
    const thoughtfulChoice = selectedChoice;
    const decision: DecisionRecord = {
      level,
      skill,
      choiceIndex: thoughtfulChoice ?? -1,
      choiceLabel: quiz.choices[thoughtfulChoice ?? -1]?.label ?? 'ไม่ระบุตัวเลือก',
    };
    setProgress((current) => {
      const next = { ...current, skills: { ...current.skills }, achievements: [...current.achievements], cleared: [...current.cleared], decisions: [...current.decisions, decision] };
      awardLevel(next, level);
      if (level === 4 && thoughtfulChoice === 2) award(next, 'thinker');
      if (level === 5 && thoughtfulChoice === 2) award(next, 'partner');
      addSkillPoints(next.skills, QUIZ_SKILL_POINTS[level]?.[thoughtfulChoice ?? -1] ?? { [skill]: 0 });
      next.currentLevel = level + 1;
      return next;
    });
    setSelectedChoice(null);
    setFeedback(null);
    setView('mission');
    document.getElementById('future-survivor-overlay')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const takeEcoAction = (actionIndex: number, effect: Partial<Resources>, detail: string) => {
    if (progress.ecoFinished) return;
    const nextTurn = progress.ecoTurn + 1;
    const decision: DecisionRecord = {
      level: 3,
      skill: 'sustainability',
      choiceIndex: actionIndex,
      choiceLabel: ECO_ACTIONS[actionIndex].title,
      actionIndex,
      actionLabel: ECO_ACTIONS[actionIndex].title,
    };
    setProgress((current) => {
      const resources = { ...current.resources };
      Object.entries(effect).forEach(([key, value]) => {
        const resource = key as Resource;
        resources[resource] = capResource(resources[resource] + (value ?? 0));
      });
      const ecoActions = current.ecoActions.includes(actionIndex) ? current.ecoActions : [...current.ecoActions, actionIndex];
      const next = { ...current, skills: { ...current.skills }, resources, ecoActions, ecoTurn: nextTurn, decisions: [...current.decisions, decision] };
      if (nextTurn >= 10) {
        next.ecoFinished = true;
        awardLevel(next, 3);
        const cityBalance = Math.round((resources.energy + resources.water + resources.food + resources.money + (100 - resources.pollution)) / 50);
        addSkillPoints(next.skills, { sustainability: cityBalance, creativity: Math.min(5, ecoActions.length) });
      }
      return next;
    });
    setFeedback(nextTurn >= 10 ? `${detail} ครบ 10 เทิร์นแล้ว เมืองจะอยู่รอดได้แค่ไหนขึ้นอยู่กับสมดุลทรัพยากรที่คุณสร้างไว้` : `${detail} / เหลือ ${10 - nextTurn} เทิร์น`);
    if (soundOn) playTone();
  };

  const continueFromEco = () => {
    setProgress((current) => ({ ...current, currentLevel: 4 }));
    setFeedback(null);
    setView('mission');
  };

  const pickFinalChoice = (tag: Ending, explanation: string) => {
    const choices = [...progress.finalChoices, tag];
    const decision: DecisionRecord = {
      level: 7,
      skill: tag === 'sustainable' ? 'sustainability' : tag === 'ai' ? 'collaboration' : tag === 'secure' ? 'cyber' : tag === 'data' ? 'data' : 'adaptability',
      choiceIndex: choices.length - 1,
      choiceLabel: FINAL_ROUNDS[progress.finalChoices.length].choices.find((choice) => choice.tag === tag)?.title ?? tag,
      ending: tag,
    };
    setFeedback(explanation);
    setProgress((current) => {
      const next = { ...current, finalChoices: choices, skills: { ...current.skills }, achievements: [...current.achievements], cleared: [...current.cleared], decisions: [...current.decisions, decision] };
      addSkillPoints(next.skills, FINAL_SKILL_POINTS[tag]);
      if (choices.length >= FINAL_ROUNDS.length) {
        next.ending = scoreEnding(choices);
        next.finished = true;
        awardLevel(next, 7);
        award(next, 'ready');
      }
      return next;
    });
    if (soundOn) playTone();
  };

  const level = progress.currentLevel;
  const quiz = QUIZZES[level];
  const finalRound = FINAL_ROUNDS[progress.finalChoices.length];
  const unlockedCards = KNOWLEDGE.filter((card) => progress.cleared.includes(({ ai: 0, cyber: 1, data: 2, sustainability: 3, critical: 4, collaboration: 5, adaptability: 6, creativity: 6 } as Partial<Record<Skill, number>>)[card.id] ?? 99));
  const futureLevel = Math.floor(progress.xp / 100) + 1;
  const cityStable = progress.resources.energy > 0 && progress.resources.water > 0 && progress.resources.food > 0 && progress.resources.pollution < 100;
  const missionDataMissing = progress.started && !progress.finished && view === 'mission' && (
    !Number.isInteger(level) || level < 0 || level >= LEVEL_NAMES.length ||
    (level !== 3 && level !== 7 && !quiz) ||
    (level === 7 && !finalRound)
  );

  if (progressLoadWarning) {
    return (
      <section id="future-survivor-overlay" className="section future-game future-game--overlay" role="alert" aria-live="assertive">
        <div className="future-game__error-panel">
          <p className="font-mono-fut future-game__eyebrow">SAVE RECOVERY / 2096</p>
          <h2>พบข้อมูลความคืบหน้าที่ไม่สมบูรณ์</h2>
          <p>{progressLoadWarning} คุณสามารถใช้ข้อมูลที่กู้คืนเพื่อเล่นต่อ กลับไปเว็บไซต์ หรือเริ่มความคืบหน้าใหม่โดยยืนยันก่อน</p>
          <div className="future-game__welcome-actions">
            <button type="button" className="future-game__primary" onClick={() => setProgressLoadWarning(null)}>ใช้ข้อมูลที่กู้คืนและเล่นต่อ</button>
            <button type="button" className="future-game__secondary" onClick={onBack}>BACK TO 2096</button>
            <button type="button" className="future-game__text-button" onClick={resetGame}>เริ่มความคืบหน้าใหม่</button>
          </div>
        </div>
      </section>
    );
  }

  if (missionDataMissing) {
    return (
      <section id="future-survivor-overlay" className="section future-game future-game--overlay" role="alert" aria-live="assertive">
        <div className="future-game__error-panel">
          <p className="font-mono-fut future-game__eyebrow">MISSION DATA / 2096</p>
          <h2>โหลดข้อมูลด่านถัดไปไม่สำเร็จ</h2>
          <p>ความคืบหน้าที่บันทึกไว้ยังอยู่ แต่ข้อมูลของด่านนี้ไม่ครบ คุณกลับไปเว็บไซต์แล้วลองต่อได้ หรือเริ่มข้อมูลภารกิจใหม่</p>
          <div className="future-game__welcome-actions">
            <button type="button" className="future-game__secondary" onClick={onBack}>BACK TO 2096</button>
            <button type="button" className="future-game__text-button" onClick={resetGame}>เริ่มข้อมูลภารกิจใหม่</button>
          </div>
        </div>
      </section>
    );
  }

  if (progress.finished && view === 'analysis') {
    return <FutureAnalysisReport progress={progress} onBack={() => setView('mission')} onRestart={restartGame} />;
  }

  return (
    <section id="future-survivor-overlay" className="section future-game future-game--overlay" aria-label="2096 Future Survivor">
      <div className="future-game__skyline" aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => <i key={index} style={{ left: `${index * 4.8}%`, height: `${18 + ((index * 37) % 42)}%`, width: `${3 + (index % 3)}%` }} />)}
      </div>
      <div className="future-game__rain" aria-hidden="true" />
      <div className="future-game__inner">
        <header className="future-game__heading">
          <div>
            <p className="font-mono-fut future-game__eyebrow"><span className="future-game__signal" /> 2096 / SURVIVAL SIMULATION</p>
            <h2 className="future-game__title">FUTURE <span>SURVIVOR</span></h2>
            <p className="future-game__subtitle">ภารกิจผู้รอดชีวิตแห่งอนาคต</p>
          </div>
          <div className="future-game__header-actions">
            <button type="button" className="future-game__back" onClick={onBack}><ArrowLeft size={15} /> BACK TO 2096</button>
            <button type="button" className="future-game__sound" onClick={toggleSound} aria-label={soundOn ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'} title={soundOn ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}>
              {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />} <span>SFX {soundOn ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </header>

        {!progress.started ? (
          <div className="future-game__welcome holo-popup">
            <div className="future-game__welcome-copy">
              <p className="font-mono-fut future-game__eyebrow">INCOMING MESSAGE / YEAR 2096</p>
              <h3>โลกในปี 2096<br />ไม่ได้ถามว่าคุณรู้มากแค่ไหน...</h3>
              <p className="future-game__quote">แต่มันถามว่า คุณสามารถใช้ความรู้นั้นเพื่อแก้ปัญหาได้หรือไม่?</p>
              <p className="future-game__welcome-desc">แปดสถานการณ์จำลอง หนึ่งเมืองที่ต้องการการตัดสินใจจากคุณ ทุกทางเลือกมีผล และทุกผลลัพธ์มีบางอย่างให้เรียนรู้</p>
              <div className="future-game__welcome-actions">
                <button type="button" className="future-game__primary" onClick={startGame}><Zap size={16} /> เริ่มภารกิจ <ArrowRight size={16} /></button>
                {progress.xp > 0 && <button type="button" className="future-game__secondary" onClick={startGame}>CONTINUE / เล่นต่อ</button>}
                {progress.xp > 0 && <button type="button" className="future-game__text-button" onClick={resetGame}><RotateCcw size={14} /> เริ่มเกมใหม่</button>}
              </div>
            </div>
            <div className="future-game__city-art" aria-hidden="true">
              <div className="future-game__planet" /><div className="future-game__moon" />
              <div className="future-game__holo">2096<span>AI CITY NETWORK</span></div>
              <div className="future-game__drone"><span /></div>
              <div className="future-game__road"><i className="future-game__car future-game__car--one" /><i className="future-game__car future-game__car--two" /></div>
            </div>
          </div>
        ) : progress.finished && progress.ending && view === 'mission' ? (
          <div className="future-game__ending holo-popup">
            <div className="future-game__ending-sun" />
            <p className="font-mono-fut future-game__eyebrow">TRANSMISSION RECEIVED / 2096</p>
            <p className="future-game__ending-line">คุณไม่ได้เรียนรู้อนาคต...</p>
            <p className="future-game__ending-line future-game__ending-line--bright">คุณกำลังสร้างมัน</p>
            <div className="future-game__ending-result">
              <span>{ENDINGS[progress.ending].icon}</span>
              <div><p className="font-mono-fut">{ENDINGS[progress.ending].title}</p><h3>{ENDINGS[progress.ending].name}</h3></div>
            </div>
            <p className="future-game__body">{ENDINGS[progress.ending].body}</p>
            <p className="future-game__outro">อนาคตไม่ได้มีคำตอบเดียว การตัดสินใจแต่ละครั้งสร้างผลลัพธ์ที่แตกต่างกัน</p>
            <div className="future-game__welcome-actions">
              <button type="button" className="future-game__primary" onClick={() => setView('analysis')}><Activity size={15} /> เปิดรายงานจากปี 2096</button>
              <button type="button" className="future-game__secondary" onClick={resetGame}><RotateCcw size={15} /> เล่นอีกครั้ง</button>
              <button type="button" className="future-game__secondary" onClick={() => setView('knowledge')}><BookOpen size={15} /> สำรวจคลังความรู้</button>
              <button type="button" className="future-game__secondary" onClick={() => setView('profile')}><Activity size={15} /> โปรไฟล์อนาคต</button>
            </div>
          </div>
        ) : (
          <>
            <div className="future-game__status">
              <div className="future-game__level-readout"><span>LEVEL</span><strong>{String(Math.min(level + 1, 8)).padStart(2, '0')} <i>/ 08</i></strong></div>
              <div className="future-game__xp"><div className="future-game__xp-label"><span>EXPERIENCE / XP</span><strong>{progress.xp} XP</strong></div><div className="future-game__bar"><span style={{ width: `${Math.min(100, (progress.xp % 1000) / 10)}%` }} /></div></div>
              <div className="future-game__rank"><Trophy size={15} /><span>LEVEL {futureLevel}<small>FUTURE EXPLORER</small></span></div>
              <button type="button" className="future-game__reset" title="รีเซ็ตความคืบหน้า" aria-label="รีเซ็ตความคืบหน้า" onClick={resetGame}><RotateCcw size={16} /></button>
            </div>

            <nav className="future-game__tabs" aria-label="เมนูเกม">
              {[['mission', 'ภารกิจ'], ['profile', 'โปรไฟล์'], ['knowledge', 'คลังความรู้'], ['achievements', 'เหรียญรางวัล']].filter(([id]) => !progress.finished || id !== 'mission').map(([id, label]) => (
                <button key={id} type="button" className={view === id ? 'is-active' : ''} onClick={() => setView(id as typeof view)}>{label}{id === 'knowledge' && <span>{unlockedCards.length}</span>}</button>
              ))}
            </nav>

            {view === 'mission' && (
              <div key={`level-${level}`} className="future-game__mission">
                <div className="future-game__mission-bar">
                  <span className="font-mono-fut">MISSION {String(level + 1).padStart(2, '0')} / {LEVEL_NAMES[level]}</span>
                  <span>{progress.cleared.length} / 8 COMPLETE</span>
                </div>

                {level === 3 ? (
                  <div className="future-game__scenario">
                    <div className="future-game__scenario-title"><span className="future-game__icon"><Activity size={19} /></span><div><p className="font-mono-fut">RESOURCE SIMULATION / TURN {Math.min(progress.ecoTurn + 1, 10)} OF 10</p><h3>Last Green City</h3></div></div>
                    <p className="future-game__scenario-copy">คุณเป็นผู้ดูแลเมืองที่ทรัพยากรมีจำกัด เลือกหนึ่งการกระทำต่อเทิร์น แล้วสังเกตว่าระบบหนึ่งส่งผลต่ออีกระบบอย่างไร</p>
                    <div className="future-game__resources">
                      {(['energy', 'water', 'food', 'money', 'pollution'] as Resource[]).map((key) => <div key={key} className={`future-game__resource ${key === 'pollution' ? 'is-pollution' : ''}`}><span>{key.toUpperCase()}</span><strong>{progress.resources[key]}</strong><div><i style={{ width: `${progress.resources[key]}%` }} /></div></div>)}
                    </div>
                    {!progress.ecoFinished ? <div className="future-game__actions">{ECO_ACTIONS.map((action, actionIndex) => <button key={action.title} type="button" disabled={progress.ecoTurn >= 10} onClick={() => takeEcoAction(actionIndex, action.effect, action.detail)}><span>{action.title}</span><small>{Object.entries(action.effect).map(([key, value]) => `${key.toUpperCase()} ${Number(value) > 0 ? '+' : ''}${value}`).join(' / ')}</small></button>)}</div> : <div className="future-game__eco-result"><Check size={18} /><span>{cityStable ? 'เมืองอยู่รอด แต่ยังต้องดูแลสมดุลทรัพยากร' : 'เมืองอยู่ในภาวะเปราะบางและต้องฟื้นฟูทรัพยากรเร่งด่วน'}</span><button type="button" className="future-game__primary" onClick={continueFromEco}>ปลดล็อกด่านถัดไป <ChevronRight size={15} /></button></div>}
                    {feedback && <p className="future-game__feedback" role="status">{feedback}</p>}
                    <div className="future-game__lesson"><strong>สิ่งที่กำลังฝึก</strong><p>ความยั่งยืนและการคิดเชิงระบบ: พลังงาน น้ำ อาหาร เงิน และมลพิษเชื่อมโยงกัน การตัดสินใจหนึ่งอย่างอาจช่วยระบบหนึ่งแต่เพิ่มภาระให้อีกระบบ</p></div>
                  </div>
                ) : level === 7 ? (
                  <div className="future-game__scenario">
                    {progress.finalChoices.length < FINAL_ROUNDS.length && finalRound ? <>
                      <div className="future-game__scenario-title"><span className="future-game__icon"><Sparkles size={19} /></span><div><p className="font-mono-fut">FINAL DECISION {progress.finalChoices.length + 1} / 3</p><h3>{finalRound.title}</h3></div></div>
                      <p className="future-game__scenario-copy">{finalRound.prompt}</p>
                      <div className="future-game__choices">{finalRound.choices.map((choice, index) => <button key={choice.title} type="button" className="future-game__choice" onClick={() => pickFinalChoice(choice.tag, choice.feedback)}><span className="future-game__choice-index">{String.fromCharCode(65 + index)}</span><span>{choice.title}<small>{choice.feedback}</small></span><ChevronRight size={17} /></button>)}</div>
                      {feedback && <p className="future-game__feedback" role="status">{feedback}</p>}
                    </> : <div className="future-game__eco-result"><Check size={18} /><span>ภารกิจสมบูรณ์แล้ว กำลังจัดเตรียมรายงานอนาคต...</span></div>}
                    <div className="future-game__lesson"><strong>ไม่มีทางเลือกที่ไร้ผลกระทบ</strong><p>พิจารณาความเสี่ยง ผู้ได้รับผล และข้อมูลที่ยังไม่แน่นอน ก่อนเลือกทิศทางให้เมือง</p></div>
                  </div>
                ) : (
                  <div className="future-game__scenario">
                    <div className="future-game__scenario-title"><span className="future-game__icon">{level === 1 ? <ShieldCheck size={19} /> : level === 2 ? <Database size={19} /> : level === 5 ? <BrainCircuit size={19} /> : <CircleHelp size={19} />}</span><div><p className="font-mono-fut">{['AI LITERACY', 'CYBERSECURITY', 'DATA LITERACY', '', 'CRITICAL THINKING', 'HUMAN + AI', 'DECISION MAKING'][level]}</p><h3>{quiz.title}</h3></div></div>
                    <div className="future-game__briefing"><span className="font-mono-fut">SITUATION REPORT</span><p>{quiz.scenario}</p></div>
                    <p className="future-game__prompt">{quiz.prompt}</p>
                    <div className="future-game__choices">{quiz.choices.map((choice, index) => <button key={choice.label} type="button" disabled={feedback !== null} className={`future-game__choice ${selectedChoice === index ? 'is-selected' : ''}`} onClick={() => submitQuiz(index, choice.feedback)}><span className="future-game__choice-index">{quiz.choices.length === 3 ? ['T', 'F', '?'][index] : String.fromCharCode(65 + index)}</span><span>{choice.label}</span>{selectedChoice === index ? <Check size={17} /> : <ChevronRight size={17} />}</button>)}</div>
                    {feedback && <div className="future-game__feedback" role="status"><strong>ทำไมการตัดสินใจนี้จึงสำคัญ?</strong><p>{feedback}</p><button type="button" className="future-game__primary" onClick={() => finishQuiz(level, quiz.skill)}>รับ +100 XP / ไปด่านถัดไป <ArrowRight size={15} /></button></div>}
                    <div className="future-game__lesson"><strong>ทักษะที่ได้รับเมื่อผ่าน</strong><p>{SKILL_LIST.find((skill) => skill.id === quiz.skill)?.label} +10 XP · ความรู้จะถูกเพิ่มในคลังความรู้หลังผ่านด่าน</p></div>
                  </div>
                )}
              </div>
            )}

            {view === 'profile' && <div className="future-game__panel"><div className="future-game__panel-heading"><div><p className="font-mono-fut">PLAYER RECORD / 2096</p><h3>FUTURE PROFILE</h3></div><div className="future-game__profile-rank"><Trophy size={17} /><span>LEVEL {futureLevel}<small>FUTURE EXPLORER</small></span></div></div><div className="future-game__skill-list">{SKILL_LIST.map((skill) => <div className="future-game__skill" key={skill.id}><span className="future-game__skill-icon">{skill.icon}</span><div><div className="future-game__skill-name"><span>{skill.label}<small>{skill.thai}</small></span><strong>{progress.skills[skill.id]}%</strong></div><div className="future-game__bar"><span style={{ width: `${progress.skills[skill.id]}%` }} /></div></div></div>)}</div><div className="future-game__stats"><span><strong>{progress.xp}</strong> TOTAL XP</span><span><strong>{progress.cleared.length}/8</strong> MISSIONS</span><span><strong>{progress.achievements.length}/6</strong> ACHIEVEMENTS</span></div></div>}

            {view === 'knowledge' && <div className="future-game__panel"><div className="future-game__panel-heading"><div><p className="font-mono-fut">FIELD MANUAL / UNLOCKED {unlockedCards.length} OF 8</p><h3>FUTURE KNOWLEDGE DATABASE</h3></div><BookOpen size={21} /></div>{unlockedCards.length ? <div className="future-game__knowledge-grid">{unlockedCards.map((card) => <button key={card.title} type="button" onClick={() => setSelectedKnowledge(card)}><span>{card.icon}</span><strong>{card.title}</strong><small>{card.thai}</small><ChevronRight size={15} /></button>)}</div> : <div className="future-game__empty"><BookOpen size={23} /><p>ผ่านด่านแรกเพื่อปลดล็อกการ์ดความรู้</p></div>}</div>}

            {view === 'achievements' && <div className="future-game__panel"><div className="future-game__panel-heading"><div><p className="font-mono-fut">MILESTONES / {progress.achievements.length} UNLOCKED</p><h3>ACHIEVEMENTS</h3></div><Trophy size={21} /></div><div className="future-game__achievement-grid">{ACHIEVEMENTS.map((item) => { const earned = progress.achievements.includes(item.id); return <div key={item.id} className={`future-game__achievement ${earned ? 'is-earned' : ''}`}><span>{earned ? item.icon : '◌'}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div>{earned && <Check size={15} />}</div>; })}</div></div>}
          </>
        )}

        <footer className="future-game__footer"><span><i className="future-game__signal" /> PROGRESS AUTOSAVED LOCALLY</span><span><AudioLines size={13} /> 2096 / MESSAGE FROM THE FUTURE</span></footer>
      </div>

      {selectedKnowledge && <div className="future-game__modal-backdrop" role="presentation" onClick={() => setSelectedKnowledge(null)}><article className="future-game__knowledge-modal holo-popup" role="dialog" aria-modal="true" aria-label={selectedKnowledge.title} onClick={(event) => event.stopPropagation()}><button type="button" className="future-game__modal-close" onClick={() => setSelectedKnowledge(null)} aria-label="ปิดรายละเอียด">×</button><div className="future-game__knowledge-modal-icon">{selectedKnowledge.icon}</div><p className="font-mono-fut">KNOWLEDGE CARD / UNLOCKED</p><h3>{selectedKnowledge.title}</h3><p className="future-game__modal-thai">{selectedKnowledge.thai}</p><dl>{[['ความหมาย', selectedKnowledge.meaning], ['ตัวอย่างในชีวิตจริง', selectedKnowledge.real], ['ทำไมจึงสำคัญ', selectedKnowledge.why], ['วิธีฝึกทักษะนี้', selectedKnowledge.practice], ['อาชีพในอนาคต', selectedKnowledge.jobs]].map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl></article></div>}
    </section>
  );
}