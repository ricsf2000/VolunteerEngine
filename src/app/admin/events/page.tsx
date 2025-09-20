import Link from 'next/link';

export default function AdminEvents() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link 
          href="/admin/events/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          New Event
        </Link>
      </div>
      
      <div className="space-y-4">
        <p>TODO: Make sure to show volunteers participating in each event - Oscar</p>
        <p>Dummy API call</p>  
        <p>events = getEvents()</p>
        <p>for e in events:</p>
        <p>create the div containing each event and fill it out</p>
        <p>getEvents() is a dummy call that always returns the same list of events that is hardcoded</p>
        <p>Full Name of Volunteer (50 characters, required)</p>
        <p>Event Name (100 characters, required)</p>
        <p>Event Description (Text area, required)</p>
        <p>Location (Text area, required)</p>
        <p>Required Skills (Multi-select dropdown, required)</p>
        <p>Urgency (Drop down, selection required)</p>
        <p>Event Date (Calendar, date picker)</p>
      </div>
    </div>
  );
}