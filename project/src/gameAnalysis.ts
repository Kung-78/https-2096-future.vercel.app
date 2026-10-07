export type SkillId = 'ai' | 'cyber' | 'data' | 'critical' | 'creativity' | 'sustainability' | 'adaptability' | 'collaboration';

export type DecisionRecord = {
  level: number;
  skill: SkillId;
  choiceIndex: number;
  choiceLabel: string;
  actionIndex?: number;
  actionLabel?: string;
  ending?: 'sustainable' | 'ai' | 'secure' | 'data' | 'collapse';
};

export type AnalysisInput = {
  decisions: DecisionRecord[];
  skills: Partial<Record<SkillId, number>>;
  resources: Partial<Record<'energy' | 'water' | 'food' | 'money' | 'pollution', number>>;
  achievements: string[];
  ending: 'sustainable' | 'ai' | 'secure' | 'data' | 'collapse' | null;
  cleared: number[];
  xp: number;
};

export type AnalysisReport = {
  persona: string;
  personaDescription: string;
  dominantTrait: string;
  dominantEvidence: string;
  strongest: { label: string; value: number; evidence: string };
  improvement: { label: string; reason: string; action: string };
  risk: { label: string; reason: string; guidance: string };
  learning: { label: string; reason: string; practice: string };
  path: { label: string; reason: string; nextStep: string };
  message: string;
  evidenceCount: number;
};

const SKILL_META: Record<SkillId, { label: string; thai: string; evidence: string }> = {
  ai: { label: 'AI Literacy', thai: 'ความรู้เท่าทัน AI', evidence: 'เลือกใช้ AI เป็นเครื่องมือสนับสนุนแล้วตรวจผล' },
  cyber: { label: 'Cybersecurity', thai: 'ความมั่นคงปลอดภัยไซเบอร์', evidence: 'ตรวจประวัติและแหล่งส่งข้อมูลก่อนรับขยายความเสี่ยง' },
  data: { label: 'Data Literacy', thai: 'ความรู้เท่าทันข้อมูล', evidence: 'ค้นหาหลายข้อมูลและสอบถามสาเหตุก่อนสรุป' },
  critical: { label: 'Critical Thinking', thai: 'การคิดเชิงวิพากษ์', evidence: 'ถามถึงหลักฐานและความสมบูรณ์ก่อนเชื่อ' },
  creativity: { label: 'Creativity', thai: 'ความคิดสร้างสรรค์', evidence: 'สร้างทางเลือกใหม่และกระจายทรัพยากร' },
  sustainability: { label: 'Sustainability', thai: 'ความยั่งยืน', evidence: 'คำนึงทรัพยากรกับผลกระทบผู้คนและระยะยาว' },
  adaptability: { label: 'Adaptability', thai: 'การปรับตัว', evidence: 'ประเมินการเปลี่ยนแปลงและเตรียมแผนสำรอง' },
  collaboration: { label: 'Human + AI', thai: 'การทำงานร่วมกับ AI', evidence: 'ใช้ AI กับความรับผิดชอบและการตรวจสอบมนุษย์' },
};

const SKILL_KEYS = Object.keys(SKILL_META) as SkillId[];

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

function latestChoice(records: DecisionRecord[], skill: SkillId): DecisionRecord | undefined {
  return [...records].reverse().find((record) => record.skill === skill);
}

function countChoice(records: DecisionRecord[], predicate: (record: DecisionRecord) => boolean): number {
  return records.filter(predicate).length;
}

function strongestSkill(input: AnalysisInput): { key: SkillId; value: number; evidence: string } {
  const scored = SKILL_KEYS.map((key) => ({
    key,
    value: clamp(input.skills[key] ?? 0),
    evidence: SKILL_META[key].evidence,
  }));
  scored.sort((a, b) => b.value - a.value || a.key.localeCompare(b.key));
  const top = scored[0];
  const matching = input.decisions.filter((decision) => decision.skill === top.key).length;
  return {
    key: top.key,
    value: top.value,
    evidence: matching > 0 ? `${top.evidence} โดยการเลือก${matching} ครั้งในเกม` : top.evidence,
  };
}

function lowestSkill(input: AnalysisInput): SkillId {
  return SKILL_KEYS.reduce((lowest, key) => (input.skills[key] ?? 0) < (input.skills[lowest] ?? 0) ? key : lowest);
}

function buildReport(input: AnalysisInput): AnalysisReport {
  const decisions = input.decisions;
  const strongest = strongestSkill(input);
  const lowSkill = lowestSkill(input);
  const highRiskCount = countChoice(decisions, (record) => /กด|ส่ง|ให้สิทธิ์|ตัดไฟ|ยกเลิก|ไม่ตรวจ|ปิด/i.test(record.choiceLabel));
  const cautiousCount = countChoice(decisions, (record) => /ตรวจสอบ|ยืนยัน|หลักฐาน|ข้อมูล|ไม่ใช้|ปิด|ระมัด|รักษา|ฟื้น/i.test(record.choiceLabel));
  const collaborativeCount = countChoice(decisions, (record) => /AI|ทีม|ร่วม|มนุษย์|ตรวจ|รับผิดชอบ/i.test(record.choiceLabel));
  const sustainableCount = countChoice(decisions, (record) => /น้ำ|อาหาร|พลังงาน|ทรัพยากร|รักษา|กระจาย|ฟื้น|สาธารณะ/i.test(record.choiceLabel));
  const riskTrait = highRiskCount >= 2 && cautiousCount < highRiskCount ? 'ความกล้าที่จะเปลี่ยนแปลง' : 'ความระมัดระวัง';
  const dominantTrait = collaborativeCount >= 2 ? 'ความร่วมมือ' : sustainableCount >= 2 ? 'ความยั่งยืน' : cautiousCount >= 2 ? 'ความระมัดระวัง' : 'ความคิดรวดเร็ว';
  const dominantEvidence = collaborativeCount >= 2
    ? `${collaborativeCount} การตัดสินใจที่ใช้ความร่วมมือกับ AI หรือทีม`
    : sustainableCount >= 2
      ? `${sustainableCount} การตัดสินใจที่คำนึงทรัพยากรและระยะยาว`
      : cautiousCount >= 2
        ? `${cautiousCount} การตัดสินใจที่ตรวจสอบหลักฐานก่อนดำเนิน`
        : `${decisions.length} การตัดสินใจที่ให้เห็นความคิดรวดเร็วและการตัดสินใจฉับพลัน`;
  const latest = latestChoice(decisions, strongest.key);
  const improvedSkill = SKILL_META[lowSkill];
  const resourceStatus = [
    ['ทีละพลังงาน', input.resources.energy],
    ['น้ำ', input.resources.water],
    ['อาหาร', input.resources.food],
    ['เงิน', input.resources.money],
    ['มลพิษ', input.resources.pollution],
  ] as const;
  const weakestResource = resourceStatus.reduce((weakest, item) => {
    const value = item[1] ?? 0;
    const weakestValue = weakest[1] ?? 0;
    return item[0] === 'มลพิษ' ? (value > weakestValue ? item : weakest) : (value < weakestValue ? item : weakest);
  }, resourceStatus[0]);
  const strongestResource = resourceStatus.reduce((best, item) => {
    const value = item[1] ?? 0;
    const bestValue = best[1] ?? 0;
    return item[0] === 'มลพิษ' ? (value < bestValue ? item : best) : (value > bestValue ? item : best);
  }, resourceStatus[0]);
  const endingName = input.ending ? ({ sustainable: 'อารยธรรมที่เติบโตอย่างยั่งยืน', ai: 'อารยธรรมที่ร่วมคิดกับ AI', secure: 'อารยธรรมที่ปกป้องความไว้วางใจ', data: 'อารยธรรมที่ตัดสินใจด้วยข้อมูล', collapse: 'เส้นเวลาแห่งความเปราะบาง' } as const)[input.ending] : 'อนาคตยังไม่ถูกกำหนด';
  const persona = strongest.value >= 80 ? 'คนที่สั่งการด้วยความมั่นใจและมีแผน' : strongest.value >= 55 ? 'คนที่มีจรรยาบรรณและสามารถปรับตัว' : 'คนที่เริ่มจากความไม่แน่นอนและมุ่งเรียนรู้';
  const personaDescription = `${persona} โดยมี${SKILL_META[strongest.key].thai} สูงที่สุดในตัวตนของคุณ และการเลือก${decisions.length} ครั้งที่ช่วยให้เห็นHow คุณทำงานร่วมกับระบบและผู้คน`;
  const report = {
    persona,
    personaDescription,
    dominantTrait,
    dominantEvidence,
    strongest: { label: SKILL_META[strongest.key].label, value: strongest.value, evidence: strongest.evidence },
    improvement: { label: improvedSkill.label, reason: `${improvedSkill.thai} ยังต่ำกว่าศูนย์ที่ดีที่สุด และจะช่วยห้องน้ำให้คุณตอบโจทย์ถามอย่างเต็มระบบ`, action: `ให้${improvedSkill.thai} เพิ่มขึ้นด้วยการตรวจสอบหลักฐานก่อนแชร์ข้อมูลหรือเลือกทางแก้ปัญหาที่มีเหตุผล` },
    risk: { label: riskTrait, reason: highRiskCount > 0 ? `${highRiskCount} การตัดสินใจที่มีความเสี่ยงหรือไม่ตรวจสอบขั้นตอนถูกบันทึกไว้` : 'ไม่มีการตัดสินใจที่มีความเสี่ยงสูงในประวัติของคุณ', guidance: highRiskCount > 0 ? 'ใช้ช่วงเวลาที่มีความเสี่ยงสูงเพื่อให้สมาชิกตรวจผลและกำหนดผู้รับผิดชอบก่อนดำเนิน' : 'รักษาแนวทางนี้ด้วยการตรวจสอบหลักฐานและแบ่งความรับผิดชอบก่อนทำงาน' },
    learning: { label: 'เรียนรู้จากการตัดสินใจทีละวัน', reason: `${cautiousCount} การตัดสินใจที่ดูเหมือนระมัดระวัง แต่${decisions.length - cautiousCount} การตัดสินใจยังต้องให้คุณทดลองกับหลักฐานและผลกระทบ`, practice: 'จดสิ่งที่คุณไม่ทราบ แล้วทดลองถามข้อมูลใหม่ก่อนทำหรือแชร์ผล' },
    path: { label: input.ending === 'collapse' ? 'เส้นทางฟื้นฟูก่อนรีบตื่น' : 'เส้นทางที่มีความรับผิดชอบ', reason: `${endingName} เป็นผลลัพธ์ที่ถูกบันทึกจากตัวเลือกในเกม โดยปลา:${latest?.choiceLabel ?? 'การตัดสินใจจากเกม'} แต่ยังต้องคำนึงถึงคนที่ได้รับผล`, nextStep: 'เริ่มงานเล็กจากข้อมูลที่ตรวจสอบ เปลี่ยนแบบตัดสินใจให้มีผู้รับผิดชอบและประเมินผลทุก ๆ' },
    message: `คุณไม่ได้ถูกสร้างมาเพื่อเป็นเหมือนใคร คุณกำลังสร้างตัวตนของคุณเองจากสิ่งที่คุณเลือกในแต่ละวัน`,
    evidenceCount: decisions.length,
  };
  return {
    ...report,
    strongest: { ...report.strongest, evidence: `${report.strongest.evidence} • ${latest?.choiceLabel ?? 'ไม่มีตัวเลือกเพิ่มเติม'}` },
    improvement: { ...report.improvement, reason: `${report.improvement.reason} • ${improvedSkill.thai} ต่ำกว่า${SKILL_META[strongest.key].thai} โดย${Math.max(0, (input.skills[strongest.key] ?? 0) - (input.skills[lowSkill] ?? 0))} จุด` },
    path: { ...report.path, reason: `${report.path.reason} • ${strongestResource[0]} ของคุณอยู่ที่${strongestResource[1]} และ${weakestResource[0]} อยู่ที่${weakestResource[1]} ภายใต้ระบบที่ต้องการสมดุล` },
  };
}

export function analyzeGame(input: AnalysisInput): AnalysisReport {
  return buildReport(input);
}
