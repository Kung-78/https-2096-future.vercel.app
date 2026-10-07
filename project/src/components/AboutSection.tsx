import { useInView } from '@/hooks/useInView';

const TECH_LIST = ['HTML', 'CSS', 'JavaScript', 'React', 'Three.js', 'TypeScript'];

const MEMBERS = [
  { num: '01', name: '', id: '', role: '' },
  { num: '02', name: '', id: '', role: '' },
  { num: '03', name: '', id: '', role: '' },
  { num: '04', name: '', id: '', role: '' },
];

export function AboutSection() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section id="about" className="section content-min-h">
      <div ref={ref} className="max-w-4xl mx-auto w-full">
        <div className={`fade-up ${inView ? 'in' : ''}`}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            ABOUT / เกี่ยวกับโปรเจกต์
          </div>
          <h2 className="thin-title glow-soft" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', lineHeight: 1.2 }}>
            ABOUT THIS PROJECT
          </h2>
        </div>

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '0.2s', marginTop: '2rem' }}>
          <div className="glass glass-edge" style={{ padding: '2rem 2.2rem', borderRadius: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
              <InfoRow label="Project Name" value="2096 — Message From The Future" />
              <InfoRow label="Project Type" value="Interactive Sci-Fi Website" />
              <div>
                <div className="font-mono-fut text-cyan" style={{ fontSize: '0.68rem', opacity: 0.7, marginBottom: '0.5rem' }}>Technology</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {TECH_LIST.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono-fut"
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.35rem 0.8rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(79, 214, 255, 0.2)',
                        background: 'rgba(79, 214, 255, 0.05)',
                        color: 'var(--c-ice)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <InfoRow label="Created by" value="[ใส่ชื่อสมาชิกของกลุ่มภายหลัง]" />
            </div>
          </div>
        </div>

        <div className={`fade-up ${inView ? 'in' : ''}`} style={{ transitionDelay: '0.5s', marginTop: '2rem' }}>
          <div className="font-mono-fut text-cyan mb-4" style={{ fontSize: '0.72rem', opacity: 0.7 }}>
            TEAM MEMBERS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MEMBERS.map((m) => (
              <div key={m.num} className="holo-card" style={{ padding: '1.4rem 1.5rem' }}>
                <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
                <div className="font-display glow-cyan" style={{ fontSize: '1.1rem', color: 'var(--c-cyan)', marginBottom: '0.8rem' }}>
                  MEMBER {m.num}
                </div>
                <MemberField label="Name" value={m.name} />
                <MemberField label="Student ID" value={m.id} />
                <MemberField label="Role" value={m.role} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-fut text-cyan" style={{ fontSize: '0.68rem', opacity: 0.7, marginBottom: '0.3rem' }}>{label}</div>
      <div className="thin-title text-ice" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)' }}>{value}</div>
    </div>
  );
}

function MemberField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
      <span className="font-mono-fut text-muted" style={{ fontSize: '0.65rem', minWidth: '60px' }}>{label}:</span>
      <span className="thin-title" style={{ fontSize: '0.85rem', color: value ? 'var(--c-ice)' : 'var(--c-muted)', opacity: value ? 1 : 0.4 }}>
        {value || '—'}
      </span>
    </div>
  );
}
