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
  participantStatus: "pending" | "confirmed";
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Dummy API call function that simulates real API behavior
const getVolunteerHistories = async (): Promise<VolunteerHistory[]> => {
  // Simulate network delay
  await delay(1000);
  
  // Simulate potential API error (10% chance for demo)
  if (Math.random() < 0.1) {
    throw new Error("Failed to fetch volunteer histories");
  }
  
  // Return mock data
  return [
    {
      id: 1,
      fullName: "Alex Johnson",
      eventName: "Community Food Drive",
      eventDescription: "Help organize and distribute food items to local families in need. Volunteers will assist with setup, distribution, and cleanup.",
      location: "Central Park, Main Pavilion",
      requiredSkills: ["Logistics", "Communication", "Customer Service"],
      urgency: "Medium",
      eventDate: "2025-03-25",
      participantStatus: "confirmed"
    },
    {
      id: 2,
      fullName: "Samira Khan",
      eventName: "Beach Cleanup",
      eventDescription: "Join us for a beach cleanup to help preserve our local coastline. Gloves and bags provided.",
      location: "Santa Monica Beach, Pier Area",
      requiredSkills: ["Crowd Control", "Physical Labor"],
      urgency: "Low",
      eventDate: "2025-03-28",
      participantStatus: "pending"
    },
    {
      id: 3,
      fullName: "Marcus Chen",
      eventName: "Youth Mentorship Program",
      eventDescription: "Weekly mentorship session with local youth. Help guide and inspire the next generation.",
      location: "Community Center, Room 205",
      requiredSkills: ["Mentoring", "Communication", "Patience"],
      urgency: "High",
      eventDate: "2025-04-02",
      participantStatus: "confirmed"
    },
    {
      id: 4,
      fullName: "Alex Johnson",
      eventName: "Homeless Shelter Support",
      eventDescription: "Evening shift at the homeless shelter serving meals and providing support.",
      location: "Downtown Shelter, 123 Main St",
      requiredSkills: ["Empathy", "Food Service", "Communication"],
      urgency: "High",
      eventDate: "2025-04-05",
      participantStatus: "pending"
    },
    {
      id: 5,
      fullName: "Taylor Smith",
      eventName: "Animal Shelter Assistance",
      eventDescription: "Help care for animals at the local shelter. Tasks include feeding, cleaning, and socializing with animals.",
      location: "Paws & Claws Animal Shelter",
      requiredSkills: ["Animal Care", "Cleaning", "Patience"],
      urgency: "Medium",
      eventDate: "2025-04-08",
      participantStatus: "confirmed"
    }
  ];
};

export default function AdminVolunteers() {
  const [volunteerHistories, setVolunteerHistories] = useState<VolunteerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call on component mount
  useEffect(() => {
    const fetchVolunteerHistories = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Making dummy API call to getVolunteerHistories...");
        
        const data = await getVolunteerHistories();
        setVolunteerHistories(data);
        
        console.log("API call successful, received data:", data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("API call failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteerHistories();
  }, []);

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
            <p className="text-sm text-slate-500">Making dummy API call</p>
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
      
      <div className="mb-4 flex items-center justify-between">
        <p className="text-slate-400">
          Showing {volunteerHistories.length} volunteer history records
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="rounded-lg bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
        >
          Refresh Data
        </button>
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
                  Event Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {volunteerHistories.map((vh) => (
                <tr key={vh.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                    {vh.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                    {vh.eventName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 max-w-md">
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
                    {new Date(vh.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vh.participantStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-6 p-4 rounded-lg bg-slate-900/30 border border-slate-800">
        <p className="text-sm text-slate-400">
          <strong>API Simulation:</strong> This page makes a dummy API call with:
        </p>
        <ul className="text-sm text-slate-500 mt-2 list-disc list-inside">
          <li>1 second simulated network delay</li>
          <li>10% chance of simulated API failure</li>
          <li>Async/await pattern like a real API</li>
          <li>Loading and error states</li>
        </ul>
      </div>
    </div>
  );
}
/*
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
*/