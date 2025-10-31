"use client";
import React, { useState, useEffect } from "react";

type VolunteerHistoryWithEvent = {
  id: string;
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

interface VolunteerHistoryClientProps {
  initialData: VolunteerHistoryWithEvent[];
}

export default function VolunteerHistoryClient({ initialData }: VolunteerHistoryClientProps) {
  const [volunteerHistories] = useState<VolunteerHistoryWithEvent[]>(initialData);
  const [filteredHistories, setFilteredHistories] = useState<VolunteerHistoryWithEvent[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");

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

        {/* No data message */}
        {filteredHistories.length === 0 && !searchTerm && (
          <div className="text-center py-8">
            <p className="text-slate-400">No volunteer history records found</p>
          </div>
        )}
      </div>
    </div>
  );
}