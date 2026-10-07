import { NAV_ITEMS } from '@/three/SceneManager';

interface NavProps {
  activeIndex: number;
  onNavClick: (index: number) => void;
}

export function Nav({ activeIndex, onNavClick }: NavProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-20"
      style={{
        padding: '0.9rem 4vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(3,6,13,0.6), transparent)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="font-display glow-cyan"
        style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.3em' }}
      >
        2096
      </div>
      <div className="nav-items flex items-center gap-5 sm:gap-7">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.index}
            className={`nav-link ${item.index === 8 ? 'nav-link--game' : ''} ${activeIndex === item.index ? 'active' : ''}`}
            onClick={() => onNavClick(item.index)}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
