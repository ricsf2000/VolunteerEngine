import Link from "next/link";

type AssignedEvent = {
  id: string;
  title: string;
  date: string;   // ISO or pretty string for now
  location: string;
  
};

type Activity = {
  id: string;
  text: string;
  when: string;
};

export default function VolunteerDashboard() {
  // TODO: replace with real user/session data
  const name = "User";

  // TODO: replace with real data from API/db
  const assigned: AssignedEvent[] = [
    { id: "e1", title: "Food Pantry – Morning Shift", date: "2025-10-01 09:30", location: "Main Warehouse" },
    { id: "e2", title: "Clothing Drive – Sorting",    date: "2025-10-05 13:00", location: "Community Center" },
    { id: "e3", title: "Distribution – Saturday",     date: "2025-9-12 08:00", location: "Lot B" },
    { id: "e4", title: "Distribution – Monday",     date: "2025-10-12 08:00", location: "Lot B" },
    { id: "e5", title: "Distribution – Tuesday",     date: "2025-11-12 08:00", location: "Lot B" },
    { id: "e6", title: "Distribution – Thursday",     date: "2025-12-12 08:00", location: "Lot B" },
    { id: "e7", title: "Distribution – Friday",     date: "2025-13-12 08:00", location: "Lot B" },
  ];

  const recent: Activity[] = [
    { id: "a1", text: "You completed 'Distribution – Saturday' (4 hrs)", when: "2 days ago" },
    { id: "a2", text: "Your availability was updated",                    when: "4 days ago" },
    { id: "a3", text: "You were assigned to 'Clothing Drive – Sorting'",  when: "1 week ago" },
    { id: "a4", text: "You were assigned to 'Clothing Drive – Cashier'",  when: "2 week ago" },
    { id: "a5", text: "You were assigned to 'Clothing Drive – Packing'",  when: "5 week ago" },
  ];

  

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold mb-1">Welcome,Volunteer!</h1>
      </header>

      

      {/* Main Content */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Assigned Events */}
<div className="lg:col-span-2 bg-black/30 rounded-lg shadow-sm p-6 md:h-[24rem] lg:h-[28rem] flex flex-col">
  <div className="flex items-center justify-between mb-4 shrink-0">
    <h2 className="text-xl font-semibold">Your Assigned Events</h2>
    <Link href="/volunteer/events" className="text-sm text-blue-300 hover:underline">
      Manage events →
    </Link>
  </div>

  {/* scrollable area with fade indicators */}
  <div className="relative flex-1 min-h-0">
    <div
      className="h-full overflow-y-auto overscroll-contain pr-2
                 [scrollbar-width:none] [-ms-overflow-style:none]
                 [&::-webkit-scrollbar]:hidden"
      tabIndex={0}
      aria-label="Assigned events list"
    >
      <ul className="space-y-3">
        {assigned.map(e => (
          <li key={e.id} className="rounded-md border border-white/10 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-sm text-white/70">
                {e.date} • {e.location}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/volunteer/events" className="text-sm text-blue-300 hover:underline">
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/* fade overlays (top/bottom) */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-8 z-20
                bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
<div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-20
                bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
  </div>
</div>

        {/* Notifications */}
            <div className="bg-black/30 rounded-lg shadow-sm p-6 md:h-[24rem] lg:h-[28rem] flex flex-col">
              <h2 className="text-xl font-semibold mb-4 shrink-0">Notifications</h2>

              {/* scrollable area with fade indicators */}
              <div className="relative flex-1 min-h-0">
                <div
                  className="h-full overflow-y-auto overscroll-contain pr-2
                            [scrollbar-width:none] [-ms-overflow-style:none]
                            [&::-webkit-scrollbar]:hidden"
                  tabIndex={0}
                  aria-label="Notifications list"
                >
                  <ul className="space-y-3">
                    {recent.map(a => (
                      <li key={a.id} className="rounded-md border border-white/10 p-3">
                        <div className="text-sm">{a.text}</div>
                        <div className="text-xs text-white/60 mt-1">{a.when}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* fade overlays (top/bottom) */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-8 z-20
                bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
<div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-20
                bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              </div>
            </div>
      </section>
    </div>
  );
}

function StatCard(props: { label: string; value: string; href: string; cta: string; border: string }) {
  return (
    <div className={`bg-black/30 border-2 ${props.border} rounded-lg p-4`}>
      <div className="text-sm text-white/70">{props.label}</div>
      <div className="text-3xl font-semibold my-1">{props.value}</div>
      <Link href={props.href} className="text-sm text-white/80 hover:underline">
        {props.cta}
      </Link>
    </div>
  );
}

