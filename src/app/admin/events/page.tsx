"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import NewEventModal from "@/components/event"; // <-- separate file import


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


// Dummy API call function
const getEvents = async (): Promise<EventItem[]> => {
  // Return mock data
  return [
    {
      id: 1,
      fullName: "Alex Johnson",
      eventName: "Community Food Drive",
      description: "Help organize and distribute food items to local families in need.",
      location: "Central Park",
      requiredSkills: ["Logistics", "Communication"],
      urgency: "Medium",
      eventDate: "2025-03-25",
      eventTime: "09:00",
      maxVolunteers: 15,
      volunteers: [
        { id: 1, name: "Sarah Wilson", status: "confirmed" },
        { id: 2, name: "Mike Chen", status: "confirmed" },
        { id: 3, name: "Emily Davis", status: "pending" },
        { id: 4, name: "James Rodriguez", status: "confirmed" },
        { id: 5, name: "Lisa Thompson", status: "pending" }
      ]
    },
    {
      id: 2,
      fullName: "Samira Khan",
      eventName: "Beach Cleanup",
      description: "Join us for a beach cleanup to preserve our coastline.",
      location: "Santa Monica Beach",
      requiredSkills: ["Crowd Control", "Physical Labor"],
      urgency: "Low",
      eventDate: "2025-03-28",
      eventTime: "08:00",
      maxVolunteers: 20,
      volunteers: [
        { id: 6, name: "David Park", status: "confirmed" },
        { id: 7, name: "Anna Martinez", status: "confirmed" },
        { id: 8, name: "Tom Anderson", status: "confirmed" }
      ]
    }
  ];
};


export default function AdminEvents() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call on component mount
  useEffect(() => {
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
<div key={e.id} className="rounded-2xl border border-slate-800 bg-[#0b1a1e] p-5 shadow-lg">
<div className="flex flex-wrap items-center justify-between gap-2">
<div>
<h3 className="text-lg font-semibold text-slate-100">{e.eventName}</h3>
<p className="text-sm text-slate-400">Hosted by {e.fullName}</p>
</div>
<div className="text-sm text-slate-300">
  {new Date(e.eventDate).toLocaleDateString()} at {new Date(`2000-01-01T${e.eventTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
volunteer.status === "confirmed"
? "bg-green-900/40 text-green-300"
: "bg-amber-900/40 text-amber-300"
}`}
>
<span>{volunteer.name}</span>
<span className={`w-1.5 h-1.5 rounded-full ${
volunteer.status === "confirmed" ? "bg-green-400" : "bg-amber-400"
}`}></span>
</div>
))
)}
</div>
</div>
</div>
))}
</div>


<NewEventModal open={open} onClose={() => setOpen(false)} />

</div>
);
}

// export default function AdminEvents() {
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Events</h1>
//         <Link 
//           href="/admin/events/new"
//           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
//         >
//           New Event
//         </Link>
//       </div>
      
//       <div className="space-y-4">
//         <p>TODO: Make sure to show volunteers participating in each event - Oscar</p>
//         <p>Dummy API call</p>  
//         <p>events = getEvents()</p>
//         <p>for e in events:</p>
//         <p>create the div containing each event and fill it out</p>
//         <p>getEvents() is a dummy call that always returns the same list of events that is hardcoded</p>
//         <p>Full Name of Volunteer (50 characters, required)</p>
//         <p>Event Name (100 characters, required)</p>
//         <p>Event Description (Text area, required)</p>
//         <p>Location (Text area, required)</p>
//         <p>Required Skills (Multi-select dropdown, required)</p>
//         <p>Urgency (Drop down, selection required)</p>
//         <p>Event Date (Calendar, date picker)</p>
//       </div>
//     </div>
//   );
// }