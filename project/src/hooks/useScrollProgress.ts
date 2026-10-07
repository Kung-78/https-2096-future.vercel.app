import { useSyncExternalStore } from 'react';

let scrollProgress = 0;
const listeners = new Set<() => void>();
let dirty = false;

function getSnapshot() {
  return scrollProgress;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function computeProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
  dirty = false;
  listeners.forEach((l) => l());
}

function onScroll() {
  if (dirty) return;
  dirty = true;
  requestAnimationFrame(() => {
    computeProgress();
  });
}

let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  computeProgress();
}

export function useScrollProgress() {
  ensureInit();
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useActiveSection(progress: number, count: number) {
  return Math.min(count - 1, Math.floor(progress * count));
}
