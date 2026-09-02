import { useState, useCallback, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';

export function useMicrophone() {
  const [isActive, setIsActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startMicrophone = useCallback(async () => {
    setError(null);
    try {
      await audioService.requestMicrophone();
      setIsActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access failed';
      setError(msg);
      setIsActive(false);
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    audioService.stopAudioStream();
    setIsActive(false);
    setAudioLevel(0);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const updateLoop = () => {
      const level = audioService.getAudioLevel();
      setAudioLevel(level);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive]);

  return {
    isActive,
    audioLevel,
    error,
    startMicrophone,
    stopMicrophone,
  };
}
