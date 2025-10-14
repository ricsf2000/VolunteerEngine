// src/app/lib/dal/notifications.ts

// Type definitions (moved from component)
export interface EventInfo {
  name: string;
  date: string;
  location?: string;
  time?: string;
  volunteers?: number;
  maxVolunteers?: number;
  openSpots?: number;
}

export interface VolunteerInfo {
  name: string;
  skills: string[];
  availability: string;
}

export interface MatchStats {
  volunteersMatched: number;
  eventsCount: number;
  efficiency: string;
}

export interface NotificationData {
  id: number;
  type: 'assignment' | 'update' | 'reminder' | 'confirmation' | 'volunteer_application' | 'event_full' | 'matching_complete' | 'volunteer_dropout' | 'cancellation';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  userId: number; // Add this - which user owns this notification
  userRole: 'volunteer' | 'admin';
  eventInfo?: EventInfo;
  volunteerInfo?: VolunteerInfo;
  matchStats?: MatchStats;
}

// Hardcoded data (simulating database)
const NOTIFICATIONS_DB: NotificationData[] = [
  // VOLUNTEER NOTIFICATIONS
  {
    id: 1,
    userId: 1,
    userRole: 'volunteer',
    type: 'assignment',
    title: 'New Event Assignment',
    message: 'You have been assigned to "Community Food Drive" on March 25th at Central Park.',
    timestamp: '2 hours ago',
    isRead: false,
    eventInfo: {
      name: 'Community Food Drive',
      date: 'March 25, 2024',
      location: 'Central Park',
      time: '9:00 AM - 2:00 PM'
    }
  },
  {
    id: 2,
    userId: 1,
    userRole: 'volunteer',
    type: 'update',
    title: 'Event Update',
    message: 'The location for "Beach Cleanup" has been changed to Santa Monica Beach.',
    timestamp: '5 hours ago',
    isRead: false,
    eventInfo: {
      name: 'Beach Cleanup',
      date: 'March 28, 2024',
      location: 'Santa Monica Beach',
      time: '8:00 AM - 12:00 PM'
    }
  },
  {
    id: 3,
    userId: 1,
    userRole: 'volunteer',
    type: 'reminder',
    title: 'Event Reminder',
    message: 'Don\'t forget about "Senior Center Visit" tomorrow at 10:00 AM.',
    timestamp: '1 day ago',
    isRead: true,
    eventInfo: {
      name: 'Senior Center Visit',
      date: 'March 22, 2024',
      location: 'Sunrise Senior Center',
      time: '10:00 AM - 1:00 PM'
    }
  },
  {
    id: 4,
    userId: 1,
    userRole: 'volunteer',
    type: 'confirmation',
    title: 'Registration Confirmed',
    message: 'Your registration for "Tree Planting Initiative" has been confirmed.',
    timestamp: '2 days ago',
    isRead: true
  },
  
  // ADMIN NOTIFICATIONS
  {
    id: 5,
    userId: 2,
    userRole: 'admin',
    type: 'volunteer_application',
    title: 'New Volunteer Application',
    message: 'Sarah Johnson has applied to volunteer for upcoming community events.',
    timestamp: '1 hour ago',
    isRead: false,
    volunteerInfo: {
      name: 'Sarah Johnson',
      skills: ['Event Planning', 'Communication'],
      availability: 'Weekends'
    }
  },
  {
    id: 6,
    userId: 2,
    userRole: 'admin',
    type: 'event_full',
    title: 'Event Capacity Reached',
    message: 'The "Community Garden Project" has reached maximum volunteer capacity (25/25).',
    timestamp: '3 hours ago',
    isRead: false,
    eventInfo: {
      name: 'Community Garden Project',
      date: 'March 27, 2024',
      volunteers: 25,
      maxVolunteers: 25
    }
  },
  {
    id: 7,
    userId: 2,
    userRole: 'admin',
    type: 'matching_complete',
    title: 'Volunteer Matching Complete',
    message: 'Automated matching has been completed for 15 volunteers across 8 upcoming events.',
    timestamp: '6 hours ago',
    isRead: true,
    matchStats: {
      volunteersMatched: 15,
      eventsCount: 8,
      efficiency: '94%'
    }
  },
  {
    id: 8,
    userId: 2,
    userRole: 'admin',
    type: 'volunteer_dropout',
    title: 'Volunteer Withdrawal',
    message: 'Michael Chen has withdrawn from "Homeless Shelter Support" due to scheduling conflict.',
    timestamp: '1 day ago',
    isRead: false,
    eventInfo: {
      name: 'Homeless Shelter Support',
      date: 'March 26, 2024',
      openSpots: 2
    }
  }
];

// DAL Functions - Pure database operations (no business logic!)

export async function getNotificationsByUserId(userId: number): Promise<NotificationData[]> {
  // Simulate database query delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In real implementation: SELECT * FROM notifications WHERE user_id = $1
  return NOTIFICATIONS_DB.filter(notif => notif.userId === userId);
}

export async function getNotificationsByUserRole(userRole: 'volunteer' | 'admin'): Promise<NotificationData[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In real implementation: SELECT * FROM notifications WHERE user_role = $1
  return NOTIFICATIONS_DB.filter(notif => notif.userRole === userRole);
}

export async function updateNotificationReadStatus(
  notificationId: number, 
  isRead: boolean
): Promise<NotificationData | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In real implementation: UPDATE notifications SET is_read = $1 WHERE id = $2
  const notification = NOTIFICATIONS_DB.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = isRead;
    return notification;
  }
  return null;
}

export async function markAllNotificationsAsRead(userId: number): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In real implementation: UPDATE notifications SET is_read = true WHERE user_id = $1
  const userNotifications = NOTIFICATIONS_DB.filter(n => n.userId === userId);
  userNotifications.forEach(n => n.isRead = true);
  return userNotifications.length;
}

export async function deleteNotification(notificationId: number): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In real implementation: DELETE FROM notifications WHERE id = $1
  const index = NOTIFICATIONS_DB.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    NOTIFICATIONS_DB.splice(index, 1);
    return true;
  }
  return false;
}

export async function createNotification(data: Omit<NotificationData, 'id'>): Promise<NotificationData> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // In real implementation: INSERT INTO notifications (...) VALUES (...)
  const newNotification: NotificationData = {
    ...data,
    id: Math.max(...NOTIFICATIONS_DB.map(n => n.id), 0) + 1
  };
  NOTIFICATIONS_DB.push(newNotification);
  return newNotification;
}