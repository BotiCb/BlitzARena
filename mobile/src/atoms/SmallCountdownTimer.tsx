import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { CountdownTimerProps, TimeRemaining } from "./BigCountdownTimer";
import NeonText from "./NeonText";

const SmallCountdownTimer: React.FC<CountdownTimerProps> = ({ endsAt }) => {
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
    const total = Math.max(0, endsAt - Date.now());
    const seconds = Math.floor((total / 1000) % 60).toString().padStart(2, '0');
    const minutes = Math.floor(total / (1000 * 60));
    return { total, seconds, minutes };
  }

  return (
    <View style={{ padding: 20, borderRadius: 10 }}>
      <NeonText
      style={{
        color: timeLeft.minutes === 0 && Number(timeLeft.seconds) < 10 ? "red" : "white",
        fontSize: 24,
      }}
      >
      {timeLeft.minutes}:{timeLeft.seconds}
      </NeonText>
    </View>
  );
};

export default SmallCountdownTimer;