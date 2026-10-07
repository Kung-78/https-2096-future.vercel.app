import { useEffect, useState } from 'react';
import type { MissionId } from '@/hooks/useMission';

interface MissionTrackerProps {
  missions: Record<MissionId, boolean>;
  missionIds: MissionId[];
  missionLabels: Record<MissionId, string>;
  progress: number;
  allComplete: boolean;
  onReset: () => void;
}

export function MissionTracker({
  missions,
  missionIds,
  missionLabels,
  progress,
  allComplete,
  onReset,
}: MissionTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (allComplete) setExpanded(true);
  }, [allComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.4rem',
        left: '1.4rem',
        zIndex: 25,
      }}
    >
      {expanded ? (
        <div
          className="glass glass-edge"
          style={{
            borderRadius: '10px',
            padding: '1.2rem 1.4rem',
            width: 'min(300px, calc(100vw - 2rem))',
            maxHeight: 'min(70vh, 520px)',
            overflowY: 'auto',
            animation: 'holoIn 0.3s ease both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span className="font-mono-fut text-cyan" style={{ fontSize: '0.68rem', letterSpacing: '0.12em' }}>
              MISSION: EXPLORE 2096
            </span>
            <button
              onClick={() => setExpanded(false)}
              aria-label="collapse"
              style={{ background: 'none', border: 'none', color: 'var(--c-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
            >
              ✕
            </button>
          </div>

          {missionIds.map((id) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '3px',
                  border: '1px solid',
                  borderColor: missions[id] ? 'var(--c-cyan)' : 'var(--c-line)',
                  background: missions[id] ? 'rgba(79, 214, 255, 0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  color: 'var(--c-cyan)',
                  flexShrink: 0,
                }}
              >
                {missions[id] ? '✓' : ''}
              </span>
              <span
                className="font-mono-fut"
                style={{
                  fontSize: '0.72rem',
                  color: missions[id] ? 'var(--c-ice)' : 'var(--c-muted)',
                  textDecoration: missions[id] ? 'none' : 'none',
                }}
              >
                {missionLabels[id]}
              </span>
            </div>
          ))}

          <div style={{ marginTop: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span className="font-mono-fut text-muted" style={{ fontSize: '0.6rem' }}>EXPLORATION</span>
              <span className="font-mono-fut text-cyan" style={{ fontSize: '0.6rem' }}>{progress}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(79, 214, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--c-cyan), var(--c-violet))',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          {allComplete && (
            <div style={{ marginTop: '1rem', padding: '0.8rem', borderRadius: '6px', background: 'rgba(79, 214, 255, 0.08)', border: '1px solid rgba(79, 214, 255, 0.3)', animation: 'holoIn 0.5s ease both' }}>
              <div className="font-mono-fut glow-cyan" style={{ fontSize: '0.72rem', color: 'var(--c-cyan)', marginBottom: '0.3rem' }}>
                MISSION COMPLETE
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--c-ice)', lineHeight: 1.5 }}>
                You have successfully explored the world of 2096.
              </p>
              <button
                onClick={onReset}
                className="font-mono-fut"
                style={{
                  marginTop: '0.6rem',
                  background: 'none',
                  border: '1px solid var(--c-line)',
                  color: 'var(--c-muted)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '3px',
                  fontSize: '0.62rem',
                  cursor: 'pointer',
                }}
              >
                RESET
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="glass glass-edge"
          style={{
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '2px solid var(--c-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6rem',
              color: 'var(--c-cyan)',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
            }}
          >
            {Math.round(progress / 25)}
          </span>
          <span className="font-mono-fut" style={{ fontSize: '0.68rem', color: 'var(--c-ice)', letterSpacing: '0.1em' }}>
            MISSION {progress}%
          </span>
        </button>
      )}
    </div>
  );
}
