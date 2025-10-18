 "use client";
import React, { useState, useEffect } from "react";

type VolunteerHistory = {
  id: number;
  fullName: string;
  eventName: string;
  eventDescription: string;
  location: string;
  requiredSkills: string[];
  urgency: string;
  eventDate: string;
  eventTime: string;
  participantStatus: "pending" | "confirmed";
};

// API call function to fetch all volunteer history records
const getVolunteerHistories = async (): Promise<VolunteerHistory[]> => {
  const response = await fetch('/api/volunteerHistory', {
    cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
    throw new Error('Failed to fetch volunteer history from API');
  }

  const data = await response.json();

  // Transform backend data to match frontend format
  return data.map((entry: any) => ({
    id: parseInt(entry.id) || 0,
    fullName: entry.userName || "Unknown User",
    eventName: entry.eventName || "Unnamed Event",
    eventDescription: entry.eventDescription || "",
    location: entry.eventLocation || "",
    requiredSkills: entry.eventSkills || [],
    urgency: entry.eventUrgency ? (entry.eventUrgency.charAt(0).toUpperCase() + entry.eventUrgency.slice(1)) : "Medium",
    eventDate: entry.eventDate ? new Date(entry.eventDate).toISOString().split('T')[0] : "",
    eventTime: entry.eventDate ? new Date(entry.eventDate).toISOString().split('T')[1].slice(0, 5) : "00:00",
    participantStatus: entry.status === "confirmed" ? "confirmed" : "pending"
  }));
};

export default function AdminVolunteers() {
  const [volunteerHistories, setVolunteerHistories] = useState<VolunteerHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<VolunteerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate API call on component mount
  useEffect(() => {
    const fetchVolunteerHistories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getVolunteerHistories();
        setVolunteerHistories(data);
        setFilteredHistories(data);

      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("API call failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerHistories();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHistories(volunteerHistories);
      return;
    }

    const filtered = volunteerHistories.filter(vh => {
      const searchLower = searchTerm.toLowerCase();

      // Search in name, event name, location
      if (vh.fullName.toLowerCase().includes(searchLower) ||
          vh.eventName.toLowerCase().includes(searchLower) ||
          vh.location.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in skills array
      if (vh.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower))) {
        return true;
      }

      // Search in urgency
      if (vh.urgency.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in status
      if (vh.participantStatus.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in event date and time
      const dateStr = new Date(vh.eventDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).toLowerCase();
      const timeStr = new Date(`2000-01-01T${vh.eventTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}).toLowerCase();
      if (dateStr.includes(searchLower) || timeStr.includes(searchLower)) {
        return true;
      }

      return false;
    });

    setFilteredHistories(filtered);
  }, [searchTerm, volunteerHistories]);

  const getStatusBadge = (status: "pending" | "confirmed") => {
    const styles = {
      pending: "bg-amber-900/40 text-amber-300",
      confirmed: "bg-green-900/40 text-green-300"
    };
    
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      High: "bg-rose-900/40 text-rose-300",
      Medium: "bg-amber-900/40 text-amber-300",
      Low: "bg-green-900/40 text-green-300"
    };
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${styles[urgency as keyof typeof styles] || styles.Medium}`}>
        {urgency}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Volunteer History</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading volunteer histories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-6">Volunteer History</h1>
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
      <h1 className="text-3xl font-bold text-slate-100 mb-6">Volunteer History</h1>
      
      <div className="mb-4 space-y-4">
        {/* Search bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, event, location, skills, urgency, status, date, or time..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600"
          >
            Refresh Data
          </button>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between">
          <p className="text-slate-400">
            Showing {filteredHistories.length} of {volunteerHistories.length} volunteer history records
            {searchTerm && (
              <span className="ml-2 text-cyan-400">
                (filtered by: "{searchTerm}")
              </span>
            )}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              Clear search
            </button>
          )}
        </div>
      </div>
      
      <div className="rounded-2xl border border-slate-800 bg-[#0b1a1e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Event Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Required Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Event Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredHistories.map((vh) => (
                <tr key={vh.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                    {vh.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                    {vh.eventName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 min-w-96 max-w-none">
                    {vh.eventDescription}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {vh.location}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {vh.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full bg-cyan-900/40 px-2 py-1 text-xs text-cyan-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUrgencyBadge(vh.urgency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <div>
                      {new Date(vh.eventDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(`2000-01-01T${vh.eventTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vh.participantStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No results message */}
        {filteredHistories.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-slate-400">No volunteer history records found for "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-sm text-cyan-400 hover:text-cyan-300"
            >
              Clear search to show all records
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
