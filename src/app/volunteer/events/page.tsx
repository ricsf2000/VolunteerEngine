'use client';

import { useState } from "react";
import Link from "next/link";


type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  status: "Pending" | "Confirmed" | "Declined";
};

export default function VolunteerEvents() {
  const [events, setEvents] = useState<EventItem[]>([
    { id: "e1", title: "Food Pantry – Morning Shift", date: "2025-10-01 09:30", location: "Main Warehouse", status: "Pending" },
    { id: "e2", title: "Clothing Drive – Sorting",    date: "2025-10-05 13:00", location: "Community Center", status: "Pending" },
    { id: "e3", title: "Distribution – Saturday",     date: "2025-10-12 08:00", location: "Lot B",            status: "Confirmed" },
  ]);

  const confirmEvent = (id: string) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: "Confirmed" } : ev));
  };

  const declineEvent = (id: string) => {
  
  setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: "Declined" } : ev));
  };

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-1">Events</h1>
        <p className="text-white/70">Review your assignments and confirm attendance.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Events list card */}
        <div className="lg:col-span-3 bg-black/30 rounded-lg shadow-sm p-6 md:h-[26rem] lg:h-[30rem] flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-xl font-semibold">Your Assigned Events</h2>
            <Link
              href="/volunteer"
              className="text-sm text-blue-300 hover:underline [&::after]:content-[''] [&::after]:hidden"
            >
              Back to dashboard
            </Link>
          </div>

          <div className="relative flex-1 min-h-0">
            {/*  hidden scrollbar, still scrollable */}
            <div
              className="h-full overflow-y-auto overscroll-contain pr-2
                         [scrollbar-width:none] [-ms-overflow-style:none]
                         [&::-webkit-scrollbar]:hidden"
              tabIndex={0}
              aria-label="Assigned events list"
            >
              <ul className="space-y-3">
                {events.map(e => (
                  <li key={e.id} className="rounded-md border border-white/10 p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-sm text-white/70">
                        {e.date} • {e.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {e.status === "Confirmed" && (
                        <span className="px-2 py-1 rounded-full text-xs border bg-blue-600/20 border-blue-400 text-blue-200">
                          Confirmed
                        </span>
                      )}

                      {e.status === "Declined" && (
                        <span className="px-2 py-1 rounded-full text-xs border bg-red-600/20 border-red-400 text-red-200">
                          Declined
                        </span>
                      )}

                      {e.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => confirmEvent(e.id)}
                                  className="px-3 py-1 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                  Confirm
                                </button>

                               
                                <button
                                  onClick={() => declineEvent(e.id)}
                                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors focus:outline-none focus:underline"
                                  aria-label="Decline assignment"
                                >
                                  Decline
                                </button>
                              </>
                            )}

                      <Link href="/volunteer/events" className="text-sm text-blue-300 hover:underline">
                        Details
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* fade overlays (top/bottom) for scroll affordance */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 z-20 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-20 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            {/* hairlines */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px z-30 bg-white/10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px z-30 bg-white/10" />
          </div>
        </div>
      </section>
    </div>
  );
}
