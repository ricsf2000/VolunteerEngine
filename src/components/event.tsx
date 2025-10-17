"use client";
import React, { useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from "react";

/**
 * EventItem describes event object used by this component
 */
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
  volunteers: Array<{ id: number; name: string; status: "confirmed" | "pending" }>;
  maxVolunteers: number;
};

/**
 * Props for the NewEventModal component
 * - open: whether the modal dialog is visible
 * - onClose: callback to close the modal
 * - editingEvent: optional event to pre-fill the form for editing
 */
interface NewEventModalProps {
	open: boolean;
	onClose: () => void;
	editingEvent?: EventItem | null;
}

/**
 * NewEventModal
 * A controlled modal form used to create or edit an EventItem.
 * This component is UI-only (mocked persistence) and intentionally
 * does not call any API — it logs a payload to the console on submit.
 */
export default function NewEventModal({ open, onClose, editingEvent }: NewEventModalProps) {
	// Reference to the dialog container so we can focus the first input when opened
	const dialogRef = useRef<HTMLDivElement | null>(null);

	// Form field state (controlled inputs)
	const [eventName, setEventName] = useState("");
	const [description, setDescription] = useState("");
	const [location, setLocation] = useState("");
	const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
	const [urgency, setUrgency] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [eventTime, setEventTime] = useState("");

	// Validation errors keyed by field name
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Local saved flag to show success feedback (mock behavior)
	const [saved, setSaved] = useState(false);

	// Loading state to prevent double submission
	const [submitting, setSubmitting] = useState(false);

	// Static list of available skills (memoized to avoid recreating on each render)
	const allSkills = useMemo(() => ["Event Planning", "First Aid", "Crowd Control", "Logistics", "Communication"], []);
	const skillOptions = useMemo(() => allSkills.map(s => ({ text: s, value: s })), [allSkills]);

	/**
	 * validate
	 * Runs basic client-side validation and populates `errors` state.
	 * Returns true when the form is valid, false otherwise.
	 */
	const validate = () => {
		const e: Record<string, string> = {};

		// Event name: required and capped at 100 chars
		if (!eventName.trim()) e.eventName = "Event name is required";
		else if (eventName.length > 100) e.eventName = "Event name must be 100 characters or fewer";

		// Description and location are required
		if (!description.trim()) e.description = "Description is required";
		if (!location.trim()) e.location = "Location is required";

		// At least one skill must be selected
		if (requiredSkills.length === 0) e.requiredSkills = "Select at least one required skill";

		// Urgency (select) required
		if (!urgency) e.urgency = "Select urgency";

		// Date and time required
		if (!eventDate) e.eventDate = "Select an event date";
		if (!eventTime) e.eventTime = "Select an event time";

		setErrors(e);
		return Object.keys(e).length === 0;
	};

	/**
	 * handleSubmit
	 * Prevents default form submission, validates the form, then calls the backend API.
	 * Sends data to: API Route → Service (validation) → DAL (persistence)
	 */
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Prevent double submission
		if (submitting) return;

		setSaved(false);
		setErrors({}); // Clear previous errors
		if (!validate()) return; // bail out on validation errors

		setSubmitting(true); // Set loading state

		try {
			// Combine date and time into a single ISO date string
			const eventDateTime = new Date(`${eventDate}T${eventTime}`);

			// Build the payload matching backend expectations
			const payload = {
				eventName,
				description,
				location,
				requiredSkills,
				urgency: urgency.toLowerCase(), // Backend expects lowercase (low/medium/high)
				eventDate: eventDateTime.toISOString(),
			};

			// Call backend API
			const response = await fetch('/api/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				setErrors({ submit: error.error || 'Failed to save event' });
				return;
			}

			// Success! Show feedback and close modal after delay
			setSaved(true);
			setTimeout(() => {
				onClose(); // This will trigger parent to refresh event list
			}, 1500);

		} catch (error) {
			console.error('Error saving event:', error);
			setErrors({ submit: 'Failed to connect to server' });
		} finally {
			setSubmitting(false); // Always reset loading state
		}
	};

	/**
	 * toggleSkill
	 * Adds or removes a skill from the requiredSkills array 
	 */
	const toggleSkill = (skill: string) => {
		setRequiredSkills(prev => (prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]));
	};

	// Close on Escape key when the modal is open
	useEffect(() => {
		if (!open) return;
		const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	// Focus the first input element inside the dialog when it opens
	useEffect(() => {
		if (open && dialogRef.current) {
			const first = dialogRef.current.querySelector<HTMLInputElement>("input, textarea, select, button");
			first?.focus();
		}
	}, [open]);

	// When an editingEvent is provided, populate the form with its values. Otherwise reset.
	useEffect(() => {
		if (editingEvent) {
			setEventName(editingEvent.eventName);
			setDescription(editingEvent.description);
			setLocation(editingEvent.location);
			setRequiredSkills(editingEvent.requiredSkills);
			setUrgency(editingEvent.urgency);
			setEventDate(editingEvent.eventDate);
			setEventTime(editingEvent.eventTime);
		} else {
			// Clear for a new event
			setEventName("");
			setDescription("");
			setLocation("");
			setRequiredSkills([]);
			setUrgency("");
			setEventDate("");
			setEventTime("");
		}
		// Clear errors, saved flag, and submitting state whenever editingEvent changes
		setErrors({});
		setSaved(false);
		setSubmitting(false);
	}, [editingEvent]);

	// If not open, render nothing — the parent controls visibility
	if (!open) return null;
	return (
	    <div aria-modal role="dialog" className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6">
		    {/* Backdrop */}
		    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
		    <div ref={dialogRef} className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#0d1e22] shadow-2xl ring-1 ring-black/5">
				{/* Header with title and close button */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
					<div className="flex items-center gap-2">
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-900/40 text-cyan-300">🗓️</span>
						<h2 className="text-lg font-semibold text-slate-100">
							{editingEvent ? "Edit Event" : "Create a New Event"}
						</h2>
					</div>
					<button onClick={onClose} aria-label="Close" className="rounded-lg px-3 py-1 text-slate-300 hover:bg-slate-800/80 hover:text-white">✕</button>
				</div>

				{/* Form: controlled inputs wired to state above */}
				<form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
					{saved && (
						<div className="rounded-lg border border-emerald-700 bg-emerald-900/30 px-3 py-2 text-emerald-300">
							{editingEvent ? "Event updated successfully!" : "Event saved successfully!"}
						</div>
					)}
					{errors.submit && (
						<div className="rounded-lg border border-rose-700 bg-rose-900/30 px-3 py-2 text-rose-300">
							{errors.submit}
						</div>
					)}

					{/* Event Name */}
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

					{/* Description */}
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

					{/* Location */}
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

					{/* Required Skills*/}
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

					{/* Urgency select */}
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

					{/* Date and time inputs shown side-by-side */}
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

					{/* Submit button */}
					<div className="pt-2 pb-6">
						<button
							type="submit"
							disabled={submitting}
							className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{submitting ? (
								<>
									<span className="animate-spin">⏳</span>
									{editingEvent ? "Updating..." : "Creating..."}
								</>
							) : (
								<>{editingEvent ? "Update Event" : "Create Event"}</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}