import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import NeonText from "./NeonText";

export interface CountdownTimerProps {
  endsAt: number;
}

export interface TimeRemaining {
  total: number;
  seconds: number | string;
  minutes?: number;
}

const BigCountdownTimer: React.FC<CountdownTimerProps> = ({ endsAt }) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(getTimeRemaining(endsAt));
  const isFirstRender = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const scheduleUpdate = () => {
      const remaining = getTimeRemaining(endsAt);
      setTimeLeft(remaining);

      if (remaining.total <= 0) {
        isFirstRender.current = true;
        return;
      }

      const delay = isFirstRender.current ? remaining.total % 1000 : 1000;
      isFirstRender.current = false;
      timeoutRef.current = setTimeout(scheduleUpdate, delay);
    };

    scheduleUpdate();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [endsAt]);

  function getTimeRemaining(endsAt: number): TimeRemaining {
    const total = endsAt - new Date().getTime();
    const seconds = Math.max(0, Math.floor(total / 1000));
    return { total, seconds };
  }

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: "100%", position: "relative" }}>
      <NeonText style={{ color: "white", fontSize: timeLeft.seconds === 0 ? 85 : 150 }}>
        {timeLeft.seconds === 0 ? "Battle!" : timeLeft.seconds}
      </NeonText>
    </View>
  );
};

export default BigCountdownTimer;
