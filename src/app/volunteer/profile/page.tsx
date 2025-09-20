export default function VolunteerProfile() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="space-y-4">
        <p>TODO: Implement this - Riccardo</p>
        <p>Full Name (50 characters, required)</p>
        <p>Address 1 (100 characters, required)</p>
        <p>Address 2 (100 characters, optional)</p>
        <p>City (100 characters, required)</p>
        <p>State (Drop Down, selection required; DB stores 2-character state code)</p>
        <p>Zip Code (9 characters; at least 5-character code required)</p>
        <p>Skills (multi-select dropdown, required)</p>
        <p>Preferences (text area, optional)</p>
        <p>Availability (date picker; multiple dates allowed; required)</p>

      </div>
    </div>
  );
}