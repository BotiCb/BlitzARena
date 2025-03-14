import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";

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
    <View style={{ padding: 20, backgroundColor: "black", borderRadius: 10 }}>
      <Text style={{ color: "white", fontSize: 24 }}>
        {timeLeft.seconds}
      </Text>
    </View>
  );
};

export default BigCountdownTimer;
