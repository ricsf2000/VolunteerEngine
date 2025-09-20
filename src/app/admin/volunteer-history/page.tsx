export default function AdminVolunteers() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Volunteer History</h1>
      
      <div className="space-y-4">
        <p>TODO: All volunteer participation history should be viewable MAKE ONE BIG TABLE WITH COLUMNS FOR ALL FIELDS - Oscar</p>
        <p>Dummy API call</p>  
        <p>events = getEvents()</p>
        <p>for e in events:</p>
        <p>create the div containing each event and fill it out</p>
        <p>getEvents() is a dummy call that always returns the same list of events that is hardcoded</p>
        <p>Full Name (50 characters, required)</p>
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