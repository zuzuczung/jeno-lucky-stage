import { useEffect, useRef, useState } from "react";
import type { AppState, Phase, Student } from "../types";
import { playSound } from "./audio";
export function useSelection(
  state: AppState,
  reduced: boolean,
  onFinish: () => void,
) {
  const [phase, setPhase] = useState<Phase>("idle"),
    [scannedId, setScannedId] = useState<string>(),
    [countdown, setCountdown] = useState<number | null>(null),
    [activeFan, setActiveFan] = useState<Student>(),
    [arrived, setArrived] = useState<string[]>([]);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const stateRef = useRef(state);
  stateRef.current = state;
  const pickId = state.pending?.id;
  useEffect(() => {
    const pick = stateRef.current.pending;
    if (!pick) {
      setPhase(stateRef.current.screen === "reveal" ? "revealed" : "idle");
      setCountdown(null);
      setScannedId(undefined);
      setActiveFan(undefined);
      setArrived([]);
      return;
    }
    if (reduced) {
      finishRef.current();
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    let canceled = false;
    const later = (fn: () => void, ms: number) => {
      timers.push(
        setTimeout(() => {
          if (!canceled) fn();
        }, ms),
      );
    };
    const speed = stateRef.current.settings.speed,
      factor = speed === "fast" ? 0.48 : speed === "dramatic" ? 1.5 : 1,
      scanSteps = speed === "fast" ? 10 : 20;
    setPhase("scanning");
    setArrived([]);
    setActiveFan(undefined);
    setCountdown(null);
    for (let i = 0; i < scanSteps; i++)
      later(
        () => {
          const roster = stateRef.current.students;
          setScannedId(roster[(i * 7 + 3) % roster.length]?.id);
          playSound("scan", stateRef.current.settings.sound);
        },
        i * 140 * factor + i * i * 3 * factor,
      );
    const start = scanSteps * 140 * factor + scanSteps * scanSteps * 3 * factor;
    for (let c = 3; c >= 1; c--)
      later(
        () => {
          setPhase("countdown");
          setCountdown(c);
          setScannedId(pick.students[0].id);
          playSound("count", stateRef.current.settings.sound);
        },
        start + (3 - c) * 650 * factor,
      );
    const walk = speed === "fast" ? 1200 : speed === "dramatic" ? 3200 : 2200,
      inviteStart = start + 3 * 650 * factor;
    pick.students.forEach((fan, i) => {
      later(
        () => {
          setPhase("inviting");
          setCountdown(null);
          setScannedId(fan.id);
          setActiveFan(fan);
          playSound("reveal", stateRef.current.settings.sound);
        },
        inviteStart + i * (walk + 500),
      );
      later(
        () => setArrived((a) => [...a, fan.id]),
        inviteStart + i * (walk + 500) + walk,
      );
    });
    later(
      () => finishRef.current(),
      inviteStart + pick.students.length * (walk + 500),
    );
    return () => {
      canceled = true;
      timers.forEach(clearTimeout);
    };
  }, [pickId, reduced, state.screen]);
  return {
    phase: state.screen === "reveal" ? ("revealed" as const) : phase,
    scannedId,
    countdown,
    activeFan,
    arrived,
  };
}
