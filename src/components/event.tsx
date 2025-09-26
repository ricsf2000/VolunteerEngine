"use client";
import React, { useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from "react";


interface NewEventModalProps {
open: boolean;
onClose: () => void;
}


export default function NewEventModal({ open, onClose }: NewEventModalProps) {
const dialogRef = useRef<HTMLDivElement | null>(null);
const [eventName, setEventName] = useState("");
const [description, setDescription] = useState("");
const [location, setLocation] = useState("");
const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
const [urgency, setUrgency] = useState("");
const [eventDate, setEventDate] = useState("");
const [eventTime, setEventTime] = useState("");
const [errors, setErrors] = useState<Record<string, string>>({});
const [saved, setSaved] = useState(false);


const allSkills = useMemo(() => ["Event Planning", "First Aid", "Crowd Control", "Logistics", "Communication"], []);
const skillOptions = useMemo(() => allSkills.map(s => ({ text: s, value: s })), [allSkills]);
const validate = () => {
const e: Record<string, string> = {};
if (!eventName.trim()) e.eventName = "Event name is required";
else if (eventName.length > 100) e.eventName = "Event name must be 100 characters or fewer";
if (!description.trim()) e.description = "Description is required";
if (!location.trim()) e.location = "Location is required";
if (requiredSkills.length === 0) e.requiredSkills = "Select at least one required skill";
if (!urgency) e.urgency = "Select urgency";
if (!eventDate) e.eventDate = "Select an event date";
if (!eventTime) e.eventTime = "Select an event time";
setErrors(e);
return Object.keys(e).length === 0;
};


const handleSubmit = (e: FormEvent) => {
e.preventDefault();
setSaved(false);
if (!validate()) return;
const payload = { eventName, description, location, requiredSkills, urgency, eventDate, eventTime };
console.log("submit", payload);
setSaved(true);
};

const toggleSkill = (skill: string) => {
	setRequiredSkills(prev => (prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]));
};





useEffect(() => {
if (!open) return;
const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
window.addEventListener("keydown", onKey);
return () => window.removeEventListener("keydown", onKey);
}, [open, onClose]);


useEffect(() => {
if (open && dialogRef.current) {
const first = dialogRef.current.querySelector<HTMLInputElement>("input, textarea, select, button");
first?.focus();
}
}, [open]);


if (!open) return null;
return (
<div aria-modal role="dialog" className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
<div ref={dialogRef} className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0d1e22] shadow-2xl ring-1 ring-black/5">
<div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
<div className="flex items-center gap-2">
<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-900/40 text-cyan-300">🗓️</span>
<h2 className="text-lg font-semibold text-slate-100">Create a New Event</h2>
</div>
<button onClick={onClose} aria-label="Close" className="rounded-lg px-3 py-1 text-slate-300 hover:bg-slate-800/80 hover:text-white">✕</button>
</div>


<form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
{saved && (
<div className="rounded-lg border border-emerald-700 bg-emerald-900/30 px-3 py-2 text-emerald-300">Event saved (mock).</div>
)}


<div>
<label className="mb-1 block text-sm font-medium text-slate-200">Event Name</label>
<input
type="text"
value={eventName}
onChange={(e: ChangeEvent<HTMLInputElement>) => setEventName(e.target.value)}
maxLength={100}
className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-600"
placeholder="Community Food Drive"
/>
<div className="mt-1 text-xs text-slate-400">{eventName.length}/100</div>
{errors.eventName && <div className="mt-1 text-sm text-rose-400">{errors.eventName}</div>}
</div>


<div>
<label className="mb-1 block text-sm font-medium text-slate-200">Event Description</label>
<textarea
value={description}
onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
	placeholder="Short description of the event"
	className="w-full min-h-[100px] rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-600"
/>
{errors.description && <div className="mt-1 text-sm text-rose-400">{errors.description}</div>}
</div>

<div>
	<label className="mb-1 block text-sm font-medium text-slate-200">Location</label>
	<textarea
		value={location}
		onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setLocation(e.target.value)}
		placeholder="Where the event will take place"
		className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-600"
	/>
	{errors.location && <div className="mt-1 text-sm text-rose-400">{errors.location}</div>}
</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-slate-200">Required Skills</label>
					<div className="flex flex-wrap gap-2">
						{allSkills.map((skill) => (
							<button
								type="button"
								key={skill}
								onClick={() => toggleSkill(skill)}
								className={`px-2 py-1 rounded ${requiredSkills.includes(skill) ? 'bg-cyan-600 text-black' : 'bg-slate-800 text-slate-200'}`}
							>
								{skill}
							</button>
						))}
					</div>
					{errors.requiredSkills && <div className="mt-1 text-sm text-rose-400">{errors.requiredSkills}</div>}
				</div>

<div>
	<label className="mb-1 block text-sm font-medium text-slate-200">Urgency</label>
	<select
		value={urgency}
		onChange={(e: ChangeEvent<HTMLSelectElement>) => setUrgency(e.target.value)}
		className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
	>
		<option value="">Select urgency</option>
		<option value="Low">Low</option>
		<option value="Medium">Medium</option>
		<option value="High">High</option>
	</select>
	{errors.urgency && <div className="mt-1 text-sm text-rose-400">{errors.urgency}</div>}
</div>

<div className="grid grid-cols-2 gap-4">
	<div>
		<label className="mb-1 block text-sm font-medium text-slate-200">Event Date</label>
		<input
			type="date"
			value={eventDate}
			onChange={(e: ChangeEvent<HTMLInputElement>) => setEventDate(e.target.value)}
			className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
		/>
		{errors.eventDate && <div className="mt-1 text-sm text-rose-400">{errors.eventDate}</div>}
	</div>

	<div>
		<label className="mb-1 block text-sm font-medium text-slate-200">Event Time</label>
		<input
			type="time"
			value={eventTime}
			onChange={(e: ChangeEvent<HTMLInputElement>) => setEventTime(e.target.value)}
			className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
		/>
		{errors.eventTime && <div className="mt-1 text-sm text-rose-400">{errors.eventTime}</div>}
	</div>
</div>

<div className="pt-2">
	<button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-black font-medium">Create Event</button>
</div>
</form>
</div>
</div>
);
}

// export default function NewEvent() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">New Event</h1>
      
//       <div className="space-y-4">
//         <p>TODO: Implement this-Oscar</p>
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