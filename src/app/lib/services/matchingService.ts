"use server";

import { auth } from '@/auth';
import { getEventById, getAllEvents, EventDetails } from '@/app/lib/dal/eventDetails';
import { getAllUserProfiles, UserProfile } from '@/app/lib/dal/userProfile';
import { getHistoryByUserId } from '@/app/lib/dal/volunteerHistory';

type MatchReason = string;
export type MatchResultItem = {
  volunteer: UserProfile;
  score: number;
  reasons: MatchReason[];
};

export type GetMatchesResult =
  | { status: 200; matches: MatchResultItem[] }
  | { status: 400 | 401 | 404; message: string };

function formatDateYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function extractStateAndZip(location: string): { state?: string; zip?: string } {
  // naive extraction: look for patterns like ", XX 12345" at end or within the string
  // matches state (2 letters) and 5-digit zip
  const stateZipMatch = location.match(/[,\s]([A-Z]{2})\s+(\d{5})(?:[^\d]|$)/);
  if (stateZipMatch) {
    return { state: stateZipMatch[1], zip: stateZipMatch[2] };
  }
  // fallback: try to find just state abbreviation
  const stateMatch = location.match(/[,\s]([A-Z]{2})(?:[^A-Z]|$)/);
  return { state: stateMatch ? stateMatch[1] : undefined, zip: undefined };
}

export async function getMatchesForEvent(eventId: string, k = 10): Promise<GetMatchesResult> {
  const session = await auth();
  if (!session?.user) {
    return { status: 401, message: 'Unauthorized' };
  }

  if (typeof eventId !== 'string' || eventId.trim().length === 0) {
    return { status: 400, message: 'Invalid eventId' };
  }

  const event = await getEventById(eventId);
  if (!event) {
    return { status: 404, message: 'Event not found' };
  }

  const volunteers = await getAllUserProfiles();
  // Exclude volunteers who already have any history with this event
  const histories = await Promise.all(volunteers.map(v => getHistoryByUserId(v.userId)));
  const historyByUser = new Map<string, Set<string>>();
  volunteers.forEach((v, i) => {
    const set = new Set((histories[i] || []).map(h => h.eventId));
    historyByUser.set(v.userId, set);
  });
  const eligibleVolunteers = volunteers.filter(v => !(historyByUser.get(v.userId)?.has(eventId)));

  const eventDateStr = formatDateYYYYMMDD(event.eventDate);
  const { state: eventState, zip: eventZip } = extractStateAndZip(event.location);

  // weights
  const W_SKILL = 5; // highest
  const W_AVAIL = 3; // medium
  const W_ZIP = 2;   // low
  const W_STATE = 1; // low

  const scored: MatchResultItem[] = eligibleVolunteers.map((v) => {
    let score = 0;
    const reasons: string[] = [];

    // Skills overlap
    const skillsOverlap = v.skills.filter(s => event.requiredSkills.includes(s));
    if (skillsOverlap.length > 0) {
      const s = skillsOverlap.length * W_SKILL;
      score += s;
      reasons.push(`Skills overlap (+${s}): ${skillsOverlap.join(', ')}`);
    }

    // Availability
    const available = v.availability.includes(eventDateStr);
    if (available) {
      score += W_AVAIL;
      reasons.push(`Available on event date ${eventDateStr} (+${W_AVAIL})`);
    }

    // Locality
    if (eventZip && v.zipCode === eventZip) {
      score += W_ZIP;
      reasons.push(`Exact ZIP match ${eventZip} (+${W_ZIP})`);
    } else if (eventState && v.state === eventState) {
      score += W_STATE;
      reasons.push(`Same state ${eventState} (+${W_STATE})`);
    }

    return { volunteer: v, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return { status: 200, matches: scored.slice(0, k) };
}


export type GlobalMatchItem = {
  volunteer: UserProfile;
  event: EventDetails;
  score: number;
  reasons: string[];
};

// Returns top K volunteer-event pairs using the same scoring rules as per-event matching.
// Read-only; no auth requirement here (auth is enforced at the route level if needed).
export async function getTopVolunteerEventMatches(k = 1): Promise<GlobalMatchItem[]> {
  const [events, volunteers] = await Promise.all([
    getAllEvents(),
    getAllUserProfiles(),
  ]);
  // Build exclusion map from volunteer history (exclude any event with any history entry)
  const histories = await Promise.all(volunteers.map(v => getHistoryByUserId(v.userId)));
  const historyByUser = new Map<string, Set<string>>();
  volunteers.forEach((v, i) => {
    const set = new Set((histories[i] || []).map(h => h.eventId));
    historyByUser.set(v.userId, set);
  });

  const W_SKILL = 5; // highest
  const W_AVAIL = 3; // medium
  const W_ZIP = 2;   // low
  const W_STATE = 1; // low

  type Scored = GlobalMatchItem & {
    skillOverlapCount: number;
    availabilityMatched: boolean;
    localityScore: number; // 2 zip, 1 state, 0 none
  };

  const scored: Scored[] = [];

  for (const v of volunteers) {
    const exclude = historyByUser.get(v.userId) || new Set<string>();
    for (const e of events) {
      if (exclude.has(e.id)) continue;
      
      let score = 0;
      const reasons: string[] = [];

      const skillsOverlap = v.skills.filter(s => e.requiredSkills.includes(s));
      const skillOverlapCount = skillsOverlap.length;
      if (skillOverlapCount > 0) {
        const s = skillOverlapCount * W_SKILL;
        score += s;
        reasons.push(`Skills overlap (+${s}): ${skillsOverlap.join(', ')}`);
      }

      const eventDateStr = formatDateYYYYMMDD(e.eventDate);
      const availabilityMatched = v.availability.includes(eventDateStr);
      if (availabilityMatched) {
        score += W_AVAIL;
        reasons.push(`Available on ${eventDateStr} (+${W_AVAIL})`);
      }

      const { state: es, zip: ez } = extractStateAndZip(e.location);
      let localityScore = 0;
      if (ez && v.zipCode === ez) {
        localityScore = W_ZIP;
        score += W_ZIP;
        reasons.push(`Exact ZIP match ${ez} (+${W_ZIP})`);
      } else if (es && v.state === es) {
        localityScore = W_STATE;
        score += W_STATE;
        reasons.push(`Same state ${es} (+${W_STATE})`);
      }

      if (score > 0) {
        scored.push({ volunteer: v, event: e, score, reasons, skillOverlapCount, availabilityMatched, localityScore });
      }
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.skillOverlapCount !== a.skillOverlapCount) return b.skillOverlapCount - a.skillOverlapCount;
    if (a.availabilityMatched !== b.availabilityMatched) return (b.availabilityMatched ? 1 : 0) - (a.availabilityMatched ? 1 : 0);
    if (b.localityScore !== a.localityScore) return b.localityScore - a.localityScore;
    // sooner event date first
    return a.event.eventDate.getTime() - b.event.eventDate.getTime();
  });

  return scored.slice(0, k).map(({ skillOverlapCount, availabilityMatched, localityScore, ...rest }) => rest);
}
