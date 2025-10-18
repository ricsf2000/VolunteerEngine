import Link from "next/link";
import { getUserNotifications } from '@/app/lib/services/notificationActions';
import { getHistoryByUserId } from '@/app/lib/dal/volunteerHistory';
import { getEventById } from '@/app/lib/dal/eventDetails';
import { auth } from '@/auth';
import { EventDetails } from '@/app/lib/dal/eventDetails';
import { VolunteerHistory } from '@/app/lib/dal/volunteerHistory';

type AssignedEventWithHistory = EventDetails & {
  historyId: string;
  participantStatus: VolunteerHistory['participantStatus'];
  registrationDate: Date;
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
}

function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function getVolunteerData() {
  const session = await auth();
  if (!session?.user) {
    return { assigned: [], notifications: [] };
  }

  const userId = (session.user as any).id;
  
  // Get volunteer history and notifications in parallel
  const [history, notifications] = await Promise.all([
    getHistoryByUserId(userId),
    getUserNotifications()
  ]);

  // Get event details for each history entry
  const assignedEvents: AssignedEventWithHistory[] = [];
  for (const historyItem of history) {
    if (historyItem.participantStatus === 'confirmed' || historyItem.participantStatus === 'pending') {
      const event = await getEventById(historyItem.eventId);
      if (event) {
        assignedEvents.push({
          ...event,
          historyId: historyItem.id,
          participantStatus: historyItem.participantStatus,
          registrationDate: historyItem.registrationDate
        });
      }
    }
  }

  return { assigned: assignedEvents, notifications };
}

export default async function VolunteerDashboard() {
  const { assigned, notifications } = await getVolunteerData();

  

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold mb-1">Welcome,Volunteer!</h1>
      </header>

      

      {/* Main Content */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Assigned Events */}
<div className="lg:col-span-2 card rounded-lg p-6 h-[40rem] flex flex-col">
  <div className="flex items-center justify-between mb-4 shrink-0">
    <h2 className="text-xl font-semibold">Your Assigned Events</h2>
    <Link href="/volunteer/events" className="text-sm text-blue-300 hover:underline">
      Manage events →
    </Link>
  </div>

  {/* scrollable area */}
  <div className="flex-1 min-h-0">
    <div
      className="h-full overflow-y-auto overscroll-contain pr-2 space-y-1
                 [scrollbar-width:none] [-ms-overflow-style:none]
                 [&::-webkit-scrollbar]:hidden"
      tabIndex={0}
      aria-label="Assigned events list"
    >
      <div className="space-y-3">
        {assigned.length === 0 ? (
          <div className="rounded-md border border-white/10 p-4 text-center text-white/60">
            No assigned events
          </div>
        ) : (
          assigned.map(e => (
            <div key={e.historyId} className="rounded-md border border-white/10 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{e.eventName}</div>
              <div className="text-sm text-white/70">
                {formatEventDate(e.eventDate)} • {e.location}
              </div>
              <div className="text-xs text-white/50 mt-1">
                Status: {e.participantStatus} • Urgency: {e.urgency}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/volunteer/events" className="text-sm text-blue-300 hover:underline">
                View
              </Link>
            </div>
          </div>
          ))
        )}
      </div>
    </div>

  </div>
</div>

        {/* Notifications */}
            <div className="card rounded-lg p-6 h-[30rem] flex flex-col">
              <h2 className="text-xl font-semibold mb-4 shrink-0">Notifications</h2>

              {/* scrollable area */}
              <div className="flex-1 min-h-0">
                <div
                  className="h-full overflow-y-auto overscroll-contain pr-2
                            [scrollbar-width:none] [-ms-overflow-style:none]
                            [&::-webkit-scrollbar]:hidden"
                  tabIndex={0}
                  aria-label="Notifications list"
                >
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <div className="rounded-md border border-white/10 p-3 text-center text-white/60">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div key={notification.id} className={`rounded-md border border-white/10 p-3 ${
                          !notification.isRead ? 'bg-blue-900/20 border-blue-300/30' : ''
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{notification.title}</div>
                              <div className="text-sm text-white/80 mt-1">{notification.message}</div>
                              <div className="text-xs text-white/60 mt-2">
                                {formatTimeAgo(notification.timestamp)}
                              </div>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-1 ml-2 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
      </section>
    </div>
  );
}


