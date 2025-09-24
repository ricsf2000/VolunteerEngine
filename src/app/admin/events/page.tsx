"use client";
import React, { useState } from "react";
import Link from "next/link";
import NewEventModal from "@/components/event"; // <-- separate file import


type EventItem = {
id: number;
fullName: string;
eventName: string;
description: string;
location: string;
requiredSkills: string[];
urgency: string;
eventDate: string;
};


const dummyEvents: EventItem[] = [
{ id: 1, fullName: "Alex Johnson", eventName: "Community Food Drive", description: "Help organize and distribute food items.", location: "Central Park", requiredSkills: ["Logistics", "Communication"], urgency: "Medium", eventDate: "2025-03-25" },
{ id: 2, fullName: "Samira Khan", eventName: "Beach Cleanup", description: "Join us for a beach cleanup.", location: "Santa Monica Beach", requiredSkills: ["Crowd Control"], urgency: "Low", eventDate: "2025-03-28" },
];


export default function AdminEvents() {
const [open, setOpen] = useState(false);


return (
<div className="p-6">
<div className="mb-6 flex items-center justify-between">
<h1 className="text-3xl font-bold text-slate-100">Events</h1>
<div className="flex items-center gap-3">
<button onClick={() => setOpen(true)} className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white shadow transition-colors hover:bg-green-700">New Event</button>
</div>
</div>


<div className="space-y-4">
<p className="text-sm text-slate-400">TODO: Make sure to show volunteers participating in each event - Oscar</p>
{dummyEvents.map((e) => (
<div key={e.id} className="rounded-2xl border border-slate-800 bg-[#0b1a1e] p-5 shadow-lg">
<div className="flex flex-wrap items-center justify-between gap-2">
<div>
<h3 className="text-lg font-semibold text-slate-100">{e.eventName}</h3>
<p className="text-sm text-slate-400">Hosted by {e.fullName}</p>
</div>
<div className="text-sm text-slate-300">{new Date(e.eventDate).toLocaleDateString()}</div>
</div>
<p className="mt-3 text-slate-300">{e.description}</p>
<div className="mt-4 flex flex-wrap items-center gap-2">
<span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{e.location}</span>
{e.requiredSkills.map((s) => (
<span key={s} className="rounded-full bg-cyan-900/40 px-2.5 py-1 text-xs text-cyan-300">{s}</span>
))}
<span className="rounded-full bg-amber-900/40 px-2.5 py-1 text-xs text-amber-300">{e.urgency}</span>
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