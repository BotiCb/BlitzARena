import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { CountdownTimerProps, TimeRemaining } from "./BigCountdownTimer";


const SmallCountdownTimer: React.FC<CountdownTimerProps> = ({ endsAt }) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(getTimeRemaining(endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(endsAt);
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(interval);

      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [endsAt]);

  function getTimeRemaining(endsAt: string): TimeRemaining {
    const total = new Date(endsAt).getTime() - new Date().getTime();
    const seconds = (Math.max(0, Math.floor(total / 1000))%60).toString().padStart(2, '0');
    const minutes = Math.max(0, Math.floor(total / 60000));
    return { total, seconds, minutes };
  }

  return (
    <View style={{ padding: 20, backgroundColor: "black", borderRadius: 10 }}>
      <Text style={{ color: "white", fontSize: 24 }}>
        {timeLeft.minutes}:{timeLeft.seconds}
      </Text>
    </View>
  );
};

export default SmallCountdownTimer;
