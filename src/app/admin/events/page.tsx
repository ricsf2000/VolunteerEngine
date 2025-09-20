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
        <p>TODO: Make sure to show volunteers participating in each event</p>
      </div>
    </div>
  );
}