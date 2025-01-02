// src/context/TimezoneContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const TimezoneContext = createContext();

export const TimezoneProvider = ({ children }) => {
  const [timezone, setTimezone] = useState(() => {
    const saved = localStorage.getItem("userTimezone");
    return saved || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  useEffect(() => {
    localStorage.setItem("userTimezone", timezone);
  }, [timezone]);

  const updateTimezone = (newTimezone) => {
    setTimezone(newTimezone);
  };

  return (
    <TimezoneContext.Provider value={{ timezone, updateTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }
  return context;
};
