export type MatchSuggestion = {
  volunteer: {
    userId: string;
    fullName: string;
    skills: string[];
    city: string;
    state: string;
    zipCode: string;
    availability: string[];
  };
  score: number;
  reasons: string[];
};

export async function fetchMatches(eventId: string): Promise<MatchSuggestion[]> {
  const res = await fetch(`/api/matches/${encodeURIComponent(eventId)}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to fetch matches');
  }
  return res.json();
}

export async function postAssignment(eventId: string, volunteerId: string) {
  const res = await fetch(`/api/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ eventId, volunteerId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to create assignment');
  }
  return res.json();
}

export async function checkAssignmentByNames(volunteerName: string, eventName: string): Promise<{
  exists: boolean;
  volunteer?: {
    userId: string;
    fullName: string;
    skills: string[];
    city: string;
    state: string;
    zipCode: string;
    availability: string[];
  };
  event?: {
    id: string;
    eventName: string;
    requiredSkills?: string[];
    eventDate: string;
    urgency?: string;
  };
}> {
  const url = new URL(`/api/assignments/check`, window.location.origin);
  url.searchParams.set('volunteerName', volunteerName);
  url.searchParams.set('eventName', eventName);
  const res = await fetch(url.toString(), { method: 'GET', credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to check assignment');
  }
  return res.json();
}

export type GlobalMatch = {
  volunteer: MatchSuggestion['volunteer'];
  event: {
    id: string;
    eventName: string;
    eventDate: string; // ISO string from API
  };
  score: number;
  reasons: string[];
};

export async function fetchGlobalMatches(top: number = 1): Promise<GlobalMatch[]> {
  const url = new URL(`/api/matches/global`, window.location.origin);
  if (top != null) url.searchParams.set('top', String(top));
  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to fetch global matches');
  }
  return res.json();
}
