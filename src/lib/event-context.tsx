"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ACTIVE_EVENT_KEY = "activeEventId";

interface EventContextValue {
  activeEventId: string | null;
  setActiveEventId: (id: string | null) => void;
}

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [activeEventId, setActiveEventIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_EVENT_KEY);
    if (stored) setActiveEventIdState(stored);
  }, []);

  function setActiveEventId(id: string | null) {
    setActiveEventIdState(id);
    if (id) {
      localStorage.setItem(ACTIVE_EVENT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_EVENT_KEY);
    }
  }

  return (
    <EventContext.Provider value={{ activeEventId, setActiveEventId }}>
      {children}
    </EventContext.Provider>
  );
}

export function useActiveEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useActiveEvent must be used within an EventProvider");
  }
  return context;
}