import { UserProfile } from './userProfile';
import { EventDetails } from './eventDetails';

// type definitions (moved from component)
// uses only fields from event details interface
export type EventInfo = Pick<EventDetails, 'eventName' | 'eventDate' | 'location' | 'requiredSkills' | 'urgency'>;

// reusing user profile fields for volunteer info in notifications
export type VolunteerInfo = Pick<UserProfile, 'fullName' | 'skills' | 'availability'>;

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
  userId: string; 
  userRole: 'volunteer' | 'admin';
  eventInfo?: EventInfo;
  volunteerInfo?: VolunteerInfo;
  matchStats?: MatchStats;
}

// hardcoded data (simulating database)
const NOTIFICATIONS_DB: NotificationData[] = [
  // volunteer notifs
  {
    id: 1,
    userId: '2', // volunteer@test.com
    userRole: 'volunteer',
    type: 'assignment',
    title: 'New Event Assignment',
    message: 'You have been assigned to "Community Food Drive" on March 25th at Central Park.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    eventInfo: {
      eventName: 'Community Food Drive',
      eventDate: new Date('2024-03-25T09:00:00'),
      location: 'Central Park',
      requiredSkills: ['Food Service'],
      urgency: 'high'
    }
  },
  {
    id: 2,
    userId: '2', // volunteer@test.com
    userRole: 'volunteer',
    type: 'update',
    title: 'Event Update',
    message: 'The location for "Beach Cleanup" has been changed to Santa Monica Beach.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    isRead: false,
    eventInfo: {
      eventName: 'Beach Cleanup',
      eventDate: new Date('2024-03-28T08:00:00'),
      location: 'Santa Monica Beach',
      requiredSkills: ['Physical Labor'],
      urgency: 'medium'
    }
  },
  {
    id: 3,
    userId: '2', // volunteer@test.com
    userRole: 'volunteer',
    type: 'reminder',
    title: 'Event Reminder',
    message: 'Don\'t forget about "Senior Center Visit" tomorrow at 10:00 AM.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    eventInfo: {
      eventName: 'Senior Center Visit',
      eventDate: new Date('2024-03-22T10:00:00'),
      location: 'Sunrise Senior Center',
      requiredSkills: ['Healthcare', 'Community Outreach'],
      urgency: 'low'
    }
  },
  {
    id: 4,
    userId: '2', // volunteer@test.com
    userRole: 'volunteer',
    type: 'confirmation',
    title: 'Registration Confirmed',
    message: 'Your registration for "Tree Planting Initiative" has been confirmed.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true
  },

  // admin notifs
  {
    id: 5,
    userId: '1', // admin@test.com
    userRole: 'admin',
    type: 'volunteer_application',
    title: 'New Volunteer Application',
    message: 'Sarah Johnson has applied to volunteer for upcoming community events.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: false,
    volunteerInfo: {
      fullName: 'Sarah Johnson',
      skills: ['Event Planning', 'Communication'],
      availability: ['2025-01-18', '2025-01-19'] // changed to array of dates
    }
  },
  {
    id: 6,
    userId: '1', // admin@test.com
    userRole: 'admin',
    type: 'event_full',
    title: 'Event Capacity Reached',
    message: 'The "Community Garden Project" has reached maximum volunteer capacity (25/25).',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    isRead: false,
    eventInfo: {
      eventName: 'Community Garden Project',
      eventDate: new Date('2024-03-27T09:00:00'),
      location: 'Downtown Community Garden',
      requiredSkills: ['Gardening', 'Physical Labor'],
      urgency: 'medium'
    }
  },
  {
    id: 7,
    userId: '1', // admin@test.com
    userRole: 'admin',
    type: 'matching_complete',
    title: 'Volunteer Matching Complete',
    message: 'Automated matching has been completed for 15 volunteers across 8 upcoming events.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    isRead: true,
    matchStats: {
      volunteersMatched: 15,
      eventsCount: 8,
      efficiency: '94%'
    }
  },
  {
    id: 8,
    userId: '1', // admin@test.com
    userRole: 'admin',
    type: 'volunteer_dropout',
    title: 'Volunteer Withdrawal',
    message: 'Michael Chen has withdrawn from "Homeless Shelter Support" due to scheduling conflict.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
    eventInfo: {
      eventName: 'Homeless Shelter Support',
      eventDate: new Date('2024-03-26T07:00:00'),
      location: 'City Homeless Shelter',
      requiredSkills: ['Food Service', 'Community Outreach'],
      urgency: 'high'
    }
  }
];

// dal functions - pure database operations (no business logic!)

export async function getNotificationsByUserId(userId: string): Promise<NotificationData[]> {
  // simulate database query delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // in real implementation: select * from notifications where user_id = $1
  return NOTIFICATIONS_DB.filter(notif => notif.userId === userId);
}

export async function getNotificationsByUserRole(userRole: 'volunteer' | 'admin'): Promise<NotificationData[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // in real implementation: select * from notifications where user_role = $1
  return NOTIFICATIONS_DB.filter(notif => notif.userRole === userRole);
}

export async function updateNotificationReadStatus(
  notificationId: number, 
  isRead: boolean
): Promise<NotificationData | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // in real implementation: update notifications set is_read = $1 where id = $2
  const notification = NOTIFICATIONS_DB.find(n => n.id === notificationId);
  if (notification) {
    notification.isRead = isRead;
    return notification;
  }
  return null;
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 300));

  // in real implementation: update notifications set is_read = true where user_id = $1
  const userNotifications = NOTIFICATIONS_DB.filter(n => n.userId === userId);
  userNotifications.forEach(n => n.isRead = true);
  return userNotifications.length;
}

export async function deleteNotification(notificationId: number): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // in real implementation: delete from notifications where id = $1
  const index = NOTIFICATIONS_DB.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    NOTIFICATIONS_DB.splice(index, 1);
    return true;
  }
  return false;
}

export async function createNotification(data: Omit<NotificationData, 'id'>): Promise<NotificationData> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // in real implementation: insert into notifications (...) VALUES (...)
  const newNotification: NotificationData = {
    ...data,
    id: Math.max(...NOTIFICATIONS_DB.map(n => n.id), 0) + 1
  };
  NOTIFICATIONS_DB.push(newNotification);
  return newNotification;
}