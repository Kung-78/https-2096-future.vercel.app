import { useEffect } from 'react';

interface HoloModalProps {
  title: string;
  subtitle?: string;
  body: string;
  tag?: string;
  onClose: () => void;
}

export function HoloModal({ title, subtitle, body, tag, onClose }: HoloModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(2,4,10,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="holo-popup glass glass-edge"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '2rem 2.2rem',
          borderRadius: '12px',
        }}
      >
        {tag && (
          <div className="font-mono-fut text-cyan" style={{ fontSize: '0.68rem', marginBottom: '0.6rem', opacity: 0.7 }}>
            {tag}
          </div>
        )}
        <h3 className="thin-title glow-soft" style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: '0.4rem', color: 'var(--c-ice)' }}>
          {title}
        </h3>
        {subtitle && (
          <div className="font-mono-fut text-cyan" style={{ fontSize: '0.72rem', marginBottom: '1rem', opacity: 0.8 }}>
            {subtitle}
          </div>
        )}
        <p style={{ color: 'var(--c-muted)', lineHeight: 1.75, fontSize: '0.92rem' }}>
          {body}
        </p>
        <div style={{ marginTop: '1.6rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="font-mono-fut btn-fut"
            style={{ padding: '0.6rem 1.6rem', fontSize: '0.72rem' }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
