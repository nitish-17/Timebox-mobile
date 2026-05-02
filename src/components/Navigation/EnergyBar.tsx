import React, { useEffect, useState } from "react";
import type { EnergyConfig } from "../../types";

export const EnergyBar: React.FC<{ config: EnergyConfig }> = ({ config }) => {
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    const calculateEnergy = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startH, startM] = config.startTime.split(":").map(Number);
      const [endH, endM] = config.endTime.split(":").map(Number);

      const startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;

      // If end time is same or before start time, assume it's the next day
      if (endMinutes <= startMinutes) {
        endMinutes += 1440;
      }

      const totalDuration = endMinutes - startMinutes;

      const normalizedNow =
        currentMinutes < startMinutes ? currentMinutes + 1440 : currentMinutes;

      let elapsed = 0;
      if (normalizedNow >= startMinutes && normalizedNow <= endMinutes) {
        elapsed = normalizedNow - startMinutes;
      } else if (normalizedNow > endMinutes) {
        elapsed = totalDuration; // Stay at 0
      } else {
        elapsed = 0; // Stay at 100
      }

      const level = 100 - (elapsed / totalDuration) * 100;
      setEnergy(Math.max(0, Math.min(100, level)));
    };

    calculateEnergy();
    const interval = setInterval(calculateEnergy, 60000);
    return () => clearInterval(interval);
  }, [config]);

  return (
    <div className="w-full h-[2px] bg-sky-500/10 rounded-[1px] relative mt-1">
      <div 
        className="h-full bg-sky-400 transition-all duration-1000 ease-in-out relative rounded-[1px]"
        style={{ 
          width: `${energy}%`,
          boxShadow: `
            0 0 5px #0ba5e9,
            0 0 10px #0ba5e9,
            0 0 20px rgba(11, 165, 233, 0.4)
          `
        }}
      >
        <div className="absolute right-0 top-0 w-[4px] h-full bg-white blur-[1px] shadow-[0_0_10px_#fff]" />
      </div>
    </div>
  );
};
