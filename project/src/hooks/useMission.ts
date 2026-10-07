import { useState, useCallback } from 'react';

export type MissionId = 'city' | 'ai' | 'space' | 'message';

interface MissionState {
  city: boolean;
  ai: boolean;
  space: boolean;
  message: boolean;
}

const STORAGE_KEY = 'mission_2096';
const MISSION_IDS: MissionId[] = ['city', 'ai', 'space', 'message'];
const MISSION_LABELS: Record<MissionId, string> = {
  city: 'Future City',
  ai: 'AI System',
  space: 'Space Station',
  message: 'Future Message',
};

function loadState(): MissionState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        city: !!parsed.city,
        ai: !!parsed.ai,
        space: !!parsed.space,
        message: !!parsed.message,
      };
    }
  } catch { /* noop */ }
  return { city: false, ai: false, space: false, message: false };
}

export function useMission() {
  const [missions, setMissions] = useState<MissionState>(loadState);

  const complete = useCallback((id: MissionId) => {
    setMissions((prev) => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const cleared = { city: false, ai: false, space: false, message: false };
    setMissions(cleared);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }, []);

  const completedCount = MISSION_IDS.filter((id) => missions[id]).length;
  const allComplete = completedCount === 4;
  const progress = (completedCount / 4) * 100;

  return { missions, complete, reset, completedCount, allComplete, progress, missionIds: MISSION_IDS, missionLabels: MISSION_LABELS };
}
