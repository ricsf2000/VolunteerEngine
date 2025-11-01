// src/app/volunteer/events/page.tsx
'use client';

import React, { useState, useEffect } from "react";

import {
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
  status: "pending" | "confirmed" | "cancelled";
  historyId: string;           // volunteer history record ID
};

// Clear urgency visuals: chip color + icon color
const urgencyUI: Record<EventItem["urgency"], { chip: string; icon: string }> = {
  High:   { chip: "bg-rose-900/40 text-rose-300",       icon: "text-rose-300" },
  Medium: { chip: "bg-amber-900/40 text-amber-300",     icon: "text-amber-300" },
  Low:    { chip: "bg-emerald-900/40 text-emerald-300", icon: "text-emerald-300" },
};

const WORD_LIMIT = 40;

export default function VolunteerEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Fetch only events that admin has matched this volunteer to
  useEffect(() => {
    const fetchVolunteerEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch volunteer's history first - this determines which events they see
        const historyResponse = await fetch(`/api/volunteerHistory`, {
          cache: 'no-store',
        });

        if (!historyResponse.ok) {
          throw new Error('Failed to fetch volunteer assignments');
        }

        const volunteerHistory = await historyResponse.json();

        // Only proceed if volunteer has been matched to events
        if (!volunteerHistory || volunteerHistory.length === 0) {
          setEvents([]);
          return;
        }

        // Get event details for only the matched events
        const eventIds = volunteerHistory.map((h: any) => h.eventId);
        const eventsResponse = await fetch(`/api/events`, {
          cache: 'no-store',
        });

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch event details');
        }

        const allEventsData = await eventsResponse.json();
        
        // Filter to only events the volunteer has been matched to
        const matchedEventsData = allEventsData.filter((event: any) => 
          eventIds.includes(event.id)
        );

        // Transform events data to match frontend format
        const transformedEvents: EventItem[] = matchedEventsData.map((event: any) => {
          // Find the history entry for this event
          const historyEntry = volunteerHistory.find((h: any) => h.eventId === event.id);

          // Normalize urgency to match the urgencyUI keys
          let urgency: "Low" | "Medium" | "High" = "Medium";
          if (event.urgency) {
            const normalizedUrgency = event.urgency.toLowerCase();
            if (normalizedUrgency === "high") urgency = "High";
            else if (normalizedUrgency === "low") urgency = "Low";
            else urgency = "Medium";
          }

          return {
            id: event.id,
            historyId: historyEntry.id,
            eventName: event.eventName || "Unnamed Event",
            description: event.description || "",
            location: event.location || "",
            requiredSkills: event.requiredSkills || [],
            urgency: urgency,
            eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
            eventTime: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[1].slice(0, 5) : undefined,
            status: historyEntry.participantStatus,
          };
        });

        setEvents(transformedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your assigned events");
        console.error("API call failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerEvents();
  }, []);


  const confirmEvent = async (historyId: string, eventId: string) => {
    try {
      const response = await fetch(`/api/volunteerHistory?id=${historyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm event');
      }

      // Update local state
      setEvents(prev => prev.map(e => (e.id === eventId ? { ...e, status: "confirmed" } : e)));
    } catch (err) {
      console.error("Failed to confirm event:", err);
      alert("Failed to confirm event. Please try again.");
    }
  };

  const declineEvent = async (historyId: string, eventId: string) => {
    try {
      const response = await fetch(`/api/volunteerHistory?id=${historyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline event');
      }

      // Remove declined event from the list
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error("Failed to decline event:", err);
      alert("Failed to decline event. Please try again.");
    }
  };

  const cancelEvent = async (historyId: string, eventId: string) => {
    try {
      const response = await fetch(`/api/volunteerHistory?id=${historyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel event');
      }

      // Remove cancelled event from the list
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error("Failed to cancel event:", err);
      alert("Failed to cancel event. Please try again.");
    }
  };


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

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Your Event Assignments</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading your assigned events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Your Event Assignments</h1>
        <div className="rounded-lg border border-rose-700 bg-rose-900/30 p-4">
          <div className="flex items-center gap-2 text-rose-300">
            <span>⚠️</span>
            <h3 className="font-semibold">Error loading assignments</h3>
          </div>
          <p className="mt-2 text-rose-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Your Event Assignments</h1>
      <p className="text-slate-300 mb-6">View events that administrators have matched you with based on your skills and availability. Accept or decline each assignment.</p>

      <div className="space-y-4">
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          events.filter(e => e.status !== 'cancelled').map(e => {
            const { isLong, short } = truncateWords(e.description, WORD_LIMIT);
            const isExpanded = !!expanded[e.id];

            return (
              <div key={e.id} className="card rounded-2xl p-5 shadow-lg">
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
                    {e.status === "confirmed" ? (
                      <>
                        <span className="px-2 py-1 rounded-full text-xs border bg-blue-600/20 border-blue-400 text-blue-200">
                          Confirmed
                        </span>
                        <button
                          onClick={() => cancelEvent(e.historyId, e.id)}
                          title="Cancel Registration"
                          aria-label="Cancel Registration"
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    ) : e.status === "pending" ? (
                      <>
                        <span className="px-2 py-1 rounded-full text-xs border bg-amber-600/20 border-amber-400 text-amber-200">
                          Pending Match
                        </span>
                        <button
                          onClick={() => confirmEvent(e.historyId, e.id)}
                          title="Accept Match"
                          aria-label="Accept Match"
                          className="text-green-300 hover:text-green-200 text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => declineEvent(e.historyId, e.id)}
                          title="Decline Match"
                          aria-label="Decline Match"
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </button>
                      </>
                    ) : null}
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
      <h3 className="text-lg font-semibold text-slate-100 mb-2">No Event Assignments Yet</h3>
      <p className="text-slate-400">Administrators will match you with events based on your skills, availability, and preferences. Check back soon!</p>
    </div>
  );
}
