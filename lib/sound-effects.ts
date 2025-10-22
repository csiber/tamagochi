import { useCallback, useRef } from "react";

type OscillatorConfiguration = {
  startFrequency: number;
  endFrequency?: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
};

type SoundEffectApi = {
  playSuccess: () => void;
  playError: () => void;
  playNotification: () => void;
};

const MIN_FREQUENCY = 40;

const getAudioContextConstructor = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.AudioContext ||
    // @ts-expect-error - webkit fallback for Safari
    window.webkitAudioContext ||
    null
  );
};

export const useSoundEffects = (): SoundEffectApi => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const acquireContext = useCallback(() => {
    const AudioContextConstructor = getAudioContextConstructor();

    if (!AudioContextConstructor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextConstructor();
    }

    const context = audioContextRef.current;

    if (context.state === "suspended") {
      void context.resume();
    }

    return context;
  }, []);

  const playTone = useCallback(
    ({ startFrequency, endFrequency, duration, type, volume }: OscillatorConfiguration) => {
      const context = acquireContext();

      if (!context) {
        return;
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const now = context.currentTime;
      const safeStartFrequency = Math.max(startFrequency, MIN_FREQUENCY);
      const safeEndFrequency = endFrequency ? Math.max(endFrequency, MIN_FREQUENCY) : undefined;

      oscillator.type = type ?? "sine";
      oscillator.frequency.setValueAtTime(safeStartFrequency, now);

      if (safeEndFrequency && safeEndFrequency !== safeStartFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(safeEndFrequency, now + duration);
      }

      const targetVolume = volume ?? 0.12;

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + duration + 0.05);
    },
    [acquireContext],
  );

  const playSuccess = useCallback(() => {
    playTone({ startFrequency: 660, endFrequency: 990, duration: 0.32, type: "triangle" });
  }, [playTone]);

  const playError = useCallback(() => {
    playTone({ startFrequency: 220, endFrequency: 110, duration: 0.4, type: "sawtooth", volume: 0.15 });
  }, [playTone]);

  const playNotification = useCallback(() => {
    playTone({ startFrequency: 440, endFrequency: 554.37, duration: 0.22, type: "sine" });
  }, [playTone]);

  return { playSuccess, playError, playNotification };
};
