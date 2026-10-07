import { useEffect, useState } from 'react';

/**
 * Types out text character by character. Returns the current visible substring
 * and whether typing has finished.
 */
export function useTypingText(fullText: string, speedMs = 45, startDelay = 0) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setText('');
    setDone(false);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const startTimer = setTimeout(() => {
      const tick = () => {
        if (i < fullText.length) {
          i++;
          setText(fullText.slice(0, i));
          timer = setTimeout(tick, speedMs);
        } else {
          setDone(true);
        }
      };
      tick();
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [fullText, speedMs, startDelay]);

  return { text, done };
}
