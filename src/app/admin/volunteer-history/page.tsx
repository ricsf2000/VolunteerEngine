export default function AdminVolunteers() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Volunteer History</h1>
      
      <div className="space-y-4">
        <p>TODO: All volunteer participation history should be viewable MAKE ONE BIG TABLE WITH COLUMNS FOR ALL FIELDS - Oscar</p>
        <p>Dummy API call</p>  
        <p>volunteer-histories = getVolunteerHistories()</p>
        <p>for vh in volunteer-histories:</p>
        <p>create entry in table for each volunteer history</p>
        <p>getVolunteerHistories() is a dummy call that always returns the same list of volunteer histories that is hardcoded</p>
        <p>Columns in table:</p>
        <p>Full Name (50 characters, required)</p>
        <p>Event Name (100 characters, required)</p>
        <p>Event Description (Text area, required)</p>
        <p>Location (Text area, required)</p>
        <p>Required Skills (Multi-select dropdown, required)</p>
        <p>Urgency (Drop down, selection required)</p>
        <p>Event Date (Calendar, date picker)</p>
        <p>Participant Status (Status is either "pending" for when they have been assigned but user has not accepted vs confirmed when they have "accepted" the event assignment)</p>
      </div>
    </div>
  );
}