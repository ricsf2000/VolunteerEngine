// src/app/volunteer/events/page.tsx
'use client';

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wrench,
} from "lucide-react";

type EventItem = {
  id: string;
  eventName: string;           // <= 100 chars (enforced on admin side)
  description: string;         // textarea
  location: string;            // textarea
  requiredSkills: string[];    // multi-select
  urgency: "Low" | "Medium" | "High"; // select
  eventDate: string;           // ISO "YYYY-MM-DD"
  eventTime?: string;          // "HH:mm" (optional)
  status: "Pending" | "Confirmed";
};

// Clear urgency visuals: chip color + icon color
const urgencyUI: Record<EventItem["urgency"], { chip: string; icon: string }> = {
  High:   { chip: "bg-rose-900/40 text-rose-300",       icon: "text-rose-300" },
  Medium: { chip: "bg-amber-900/40 text-amber-300",     icon: "text-amber-300" },
  Low:    { chip: "bg-emerald-900/40 text-emerald-300", icon: "text-emerald-300" },
};

const WORD_LIMIT = 40;

export default function VolunteerEvents() {
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "e1",
      eventName: "Community Food Drive",
      description: "Help organize and distribute food items to local families in need.",
      location: "Central Park",
      requiredSkills: ["Logistics", "Communication"],
      urgency: "Medium",
      eventDate: "2025-10-01",
      eventTime: "09:30",
      status: "Pending",
    },
    {
      id: "e2",
      eventName: "Clothing Drive – Sorting",
      // Long on purpose to trigger 'Read more'
      description:
        "Sort and prepare donated clothing for distribution. You’ll work with a small team to separate items by size and type, check quality, fold and label donations, and help assemble bundles for families. Comfortable shoes recommended. This event is great for first-time volunteers and anyone who enjoys fast but organized teamwork. Brief orientation included at the start, and refreshments are provided throughout the shift. If you have labeling or inventory experience, please note it in your profile so we can place you at the intake station.",
      location: "Community Center",
      requiredSkills: ["Organization", "Teamwork"],
      urgency: "Low",
      eventDate: "2025-10-05",
      eventTime: "13:00",
      status: "Pending",
    },
    {
      id: "e3",
      eventName: "Distribution – Saturday",
      description: "Assist with setup and distribution at the weekend event.",
      location: "Lot B",
      requiredSkills: ["Lifting", "Customer Service"],
      urgency: "High",
      eventDate: "2025-10-12",
      eventTime: "08:00",
      status: "Confirmed",
    },
  ]);

  // Track which cards are expanded: id -> boolean
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const confirmEvent = (id: string) =>
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, status: "Confirmed" } : e)));

  const declineEvent = (id: string) =>
    setEvents(prev => prev.filter(e => e.id !== id)); // remove card (like notifications delete)

  const toggleExpand = (id: string) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const prettyDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const prettyTime = (t?: string) =>
    t
      ? new Date(`2000-01-01T${t}`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const truncateWords = (text: string, limit = WORD_LIMIT) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return { isLong: false, short: text };
    return { isLong: true, short: words.slice(0, limit).join(" ") + "…" };
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Events</h1>
      <p className="text-slate-300 mb-6">These are your assigned events. Confirm or decline as needed based on your availability.</p>

      <div className="space-y-4">
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          events.map(e => {
            const { isLong, short } = truncateWords(e.description, WORD_LIMIT);
            const isExpanded = !!expanded[e.id];

            return (
              <div key={e.id} className="rounded-2xl border border-slate-800 bg-[#0b1a1e] p-5 shadow-lg">
                {/* Top row: title + date/time + actions/status */}
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-100 flex-1">
                    {e.eventName.length > 100 ? e.eventName.slice(0, 100) + "…" : e.eventName}
                  </h3>

                  <div className="text-sm text-slate-300">
                    {prettyDate(e.eventDate)}
                    {prettyTime(e.eventTime) ? ` at ${prettyTime(e.eventTime)}` : ""}
                  </div>

                  <div className="ml-auto flex items-center gap-3">
                    {e.status === "Confirmed" ? (
                      <span className="px-2 py-1 rounded-full text-xs border bg-blue-600/20 border-blue-400 text-blue-200">
                        Confirmed
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => confirmEvent(e.id)}
                          title="Confirm"
                          aria-label="Confirm"
                          className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Confirm
                        </button>
                        <button
                          onClick={() => declineEvent(e.id)}
                          title="Decline"
                          aria-label="Decline"
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Description (collapsible) */}
                <div className="mt-3">
                  {/* text + fade live in this relative wrapper */}
                  <div className="relative">
                    <p className="text-slate-300">
                      {isLong && !isExpanded ? short : e.description}
                    </p>

                    {/* fade only covers the text, not the button */}
                    {isLong && !isExpanded && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-10 bg-gradient-to-t from-[#0b1a1e] to-transparent" />
                    )}
                  </div>

                  {/* button sits ABOVE the fade */}
                  {isLong && (
                    <button
                      onClick={() => toggleExpand(e.id)}
                      aria-expanded={isExpanded}
                      className="mt-2 relative z-20 text-blue-300 hover:text-blue-200 text-sm font-medium inline-flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          Show less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Chips: location, grouped skills, urgency */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {/* Location */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                    <MapPin className="w-4 h-4" />
                    {e.location}
                  </span>

                  {/* Skills group */}
                  <div
                    className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1"
                    role="group"
                    aria-label="Skills needed"
                  >
                    <span className="inline-flex items-center gap-1 text-xs text-white/70 mr-1">
                      <Wrench className="w-4 h-4" />
                      <span className="uppercase tracking-wide">Skills needed:</span>
                    </span>

                    {e.requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-cyan-900/40 px-2 py-0.5 text-[11px] leading-5 text-cyan-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Urgency */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${urgencyUI[e.urgency].chip}`}
                    title={`Urgency: ${e.urgency}`}
                    aria-label={`Urgency level ${e.urgency}`}
                  >
                    <AlertTriangle className={`w-4 h-4 ${urgencyUI[e.urgency].icon}`} />
                    <span className="uppercase tracking-wide text-white/70">Urgency:</span>
                    <span className="font-semibold">{e.urgency}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 rounded-2xl border border-slate-800 bg-[#0b1a1e] shadow-lg">
      <h3 className="text-lg font-semibold text-slate-100 mb-2">No assigned events</h3>
      <p className="text-slate-400">You’ll see events here when you’re assigned to one.</p>
    </div>
  );
}
