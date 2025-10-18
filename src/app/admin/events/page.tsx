"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import NewEventModal from "@/components/event";


type Volunteer = {
  id: number;
  name: string;
  status: "confirmed" | "pending";
};

type EventItem = {
  id: number;
  fullName: string;
  eventName: string;
  description: string;
  location: string;
  requiredSkills: string[];
  urgency: string;
  eventDate: string;
  eventTime: string;
  volunteers: Volunteer[];
  maxVolunteers: number;
};


// API call function to fetch events from backend
const getEvents = async (): Promise<EventItem[]> => {
  const response = await fetch('/api/events', {
    cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
    throw new Error('Failed to fetch events from API');
  }

  const data = await response.json();

  // Transform backend data to match frontend format
  // Note: Backend may not have all fields (volunteers, fullName, eventTime)
  // You'll need to adjust this mapping based on your actual backend structure
  return data.map((event: any) => ({
    id: parseInt(event.id) || 0,
    fullName: event.createdBy || "Unknown",
    eventName: event.eventName,
    description: event.description,
    location: event.location,
    requiredSkills: event.requiredSkills || [],
    urgency: event.urgency || "medium",
    eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
    eventTime: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[1].slice(0, 5) : "00:00",
    maxVolunteers: event.maxVolunteers || 10,
    volunteers: event.volunteers || [] // This will come from volunteer history later
  }));
};

export default function AdminEvents() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);

  // Fetch events from backend API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("API call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete event function
  const handleDeleteEvent = async (eventId: number, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingEventId(eventId);
    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId.toString() }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to delete event: ${error.error || 'Unknown error'}`);
        return;
      }

      // Refresh the event list after successful deletion
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to connect to server');
    } finally {
      setDeletingEventId(null);
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Events</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Events</h1>
        <div className="rounded-lg border border-rose-700 bg-rose-900/30 p-4">
          <div className="flex items-center gap-2 text-rose-300">
            <span>⚠️</span>
            <h3 className="font-semibold">Error loading data</h3>
          </div>
          <p className="mt-2 text-rose-200">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-rose-700 px-4 py-2 text-sm hover:bg-rose-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">Events</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
          >
            Refresh Data
          </button>
          <button onClick={() => setOpen(true)} className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white shadow transition-colors hover:bg-green-700">New Event</button>
        </div>
      </div>
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="card rounded-2xl p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{e.eventName}</h3>
                <p className="text-sm text-slate-400">Hosted by {e.fullName}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-300">
                  {new Date(e.eventDate).toLocaleDateString()} at {new Date(`2000-01-01T${e.eventTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <button
                  onClick={() => {
                    setEditingEvent(e);
                    setOpen(true);
                  }}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => handleDeleteEvent(e.id, e.eventName)}
                  disabled={deletingEventId === e.id}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-sm font-medium text-white shadow transition-colors hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingEventId === e.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            <p className="mt-3 text-slate-300">{e.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{e.location}</span>
              {e.requiredSkills.map((s) => (
                <span key={s} className="rounded-full bg-cyan-900/40 px-2.5 py-1 text-xs text-cyan-300">{s}</span>
              ))}
              <span className="rounded-full bg-amber-900/40 px-2.5 py-1 text-xs text-amber-300">{e.urgency}</span>
            </div>

            {/* Volunteers Section */}
            <div className="mt-4 border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-100">
                  Volunteers ({e.volunteers.length})
                </h4>
                <div className="text-xs text-slate-400">
                  {e.volunteers.filter(v => v.status === "confirmed").length} confirmed, {e.volunteers.filter(v => v.status === "pending").length} pending
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {e.volunteers.length === 0 ? (
                  <span className="text-sm text-slate-500">No volunteers assigned yet</span>
                ) : (
                  e.volunteers.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${volunteer.status === "confirmed"
                          ? "bg-green-900/40 text-green-300"
                          : "bg-amber-900/40 text-amber-300"
                        }`}
                    >
                      <span>{volunteer.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${volunteer.status === "confirmed" ? "bg-green-400" : "bg-amber-400"
                        }`}></span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <NewEventModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingEvent(null);
          // Refresh the event list to show newly created/edited event
          fetchEvents();
        }}
        editingEvent={editingEvent}
      />
    </div>
  );
}
