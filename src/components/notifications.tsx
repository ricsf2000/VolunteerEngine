'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Clock, MapPin, Users, Calendar, CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { Loading } from './Loading';

// Import types from DAL
import type { NotificationData } from '@/app/lib/dal/notifications';

type UserRole = 'volunteer' | 'admin';

// helper func to get the right icon for notif type
const getIcon = (type: string) => {
  switch (type) {
    case 'assignment':
    case 'volunteer_application':
      return <Users className="w-5 h-5" />;
    case 'update':
    case 'event_full':
      return <AlertCircle className="w-5 h-5" />;
    case 'reminder':
      return <Clock className="w-5 h-5" />;
    case 'confirmation':
    case 'matching_complete':
      return <CheckCircle className="w-5 h-5" />;
    case 'cancellation':
    case 'volunteer_dropout':
      return <X className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
};

// helper func for notif card colors
const getCardColors = (isRead: boolean, userRole: UserRole) => {
  if (isRead) {
    return 'border-l-gray-600 card';
  }
  return userRole === 'volunteer' 
    ? 'border-l-blue-500 card'
    : 'border-l-green-500 card';
};

// helper func for icon colors
const getIconColors = (isRead: boolean, userRole: UserRole) => {
  if (isRead) {
    return 'text-gray-500';
  }
  return userRole === 'volunteer' ? 'text-blue-400' : 'text-green-400';
};

interface NotificationsProps {
  userRole: UserRole;
}

export default function Notifications({ userRole }: NotificationsProps) {
  // state vars
  const [notificationsList, setNotificationsList] = useState<NotificationData[]>([]);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // load notifs when component mounts or user role changes
  useEffect(() => {
    loadNotifications();
  }, [userRole]);

  // func to load all notifs from API
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notifications?role=${userRole}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotificationsList(data.notifications);
    } catch (error) {
      console.error('Could not load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // toggle read/unread status via API
  const toggleReadStatus = async (id: number, currentStatus: boolean) => {
    setLoadingAction(`toggle-${id}`);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-read',
          notificationId: id,
          currentStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle read status');
      }
      
      const data = await response.json();
      
      // Update local state
      setNotificationsList(prev =>
        prev.map(notif => notif.id === id ? data.notification : notif)
      );
    } catch (error) {
      console.error('Failed to toggle read status:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  // mark all notifs as read via API
  const markAllAsRead = async () => {
    setLoadingAction('mark-all');
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }
      
      // Update local state
      setNotificationsList(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  // delete a notif via API
  const deleteNotification = async (id: number) => {
    setLoadingAction(`delete-${id}`);
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      // Update local state
      setNotificationsList(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  // filter notifs based on current filter
  const filteredNotifications = notificationsList.filter(notif => {
    if (currentFilter === 'unread') return !notif.isRead;
    return true;
  });

  // count unread notifs
  const unreadCount = notificationsList.filter(notif => !notif.isRead).length;
  const activeButtonColor = userRole === 'volunteer' ? 'bg-blue-600' : 'bg-green-600';
  const primaryColor = userRole === 'volunteer' ? 'blue' : 'green';

  // loading screen
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Loading message="Loading notifications" className="py-12" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className={`w-8 h-8 text-${primaryColor}-400`} />
          <p className="text-gray-400">
            {userRole === 'volunteer' ? 'Stay updated on your volunteer activities' : 'Manage volunteer program notifications'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${primaryColor}-900/20 text-${primaryColor}-400 border border-${primaryColor}-800`}>
            {unreadCount} unread
          </span>
        </div>
      </div>

      {/* filter buttons */}
      <div className="flex items-center justify-between mb-6 card rounded-lg shadow-sm p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentFilter === 'all' 
                ? `${activeButtonColor} text-white`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({notificationsList.length})
          </button>

          <button
            onClick={() => setCurrentFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentFilter === 'unread' 
                ? `${activeButtonColor} text-white`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={loadingAction === 'mark-all'}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingAction === 'mark-all' && <Loader2 className="w-4 h-4 animate-spin" />}
            Mark All Read
          </button>
        )}
      </div>

      {/* notifs list */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 card rounded-lg shadow-sm">
            <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-200 mb-2">No notifications found</h3>
            <p className="text-gray-400">
              {currentFilter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : "No notifications to display."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 rounded-lg shadow-sm transition-all hover:shadow-md ${
                getCardColors(notification.isRead, userRole)
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-full ${getIconColors(notification.isRead, userRole)}`}>
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-100' : 'text-gray-400'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-gray-400">{notification.timestamp}</span>
                          {!notification.isRead && (
                            <div className={`w-2 h-2 rounded-full ${
                              userRole === 'volunteer' ? 'bg-blue-400' : 'bg-green-400'
                            }`}></div>
                          )}
                        </div>
                      </div>
                      
                      <p className={`mb-3 ${!notification.isRead ? 'text-gray-300' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      
                      {/* event details section */}
                      {notification.eventInfo && (
                        <div className={`rounded-lg p-3 mb-3 space-y-1 ${
                          !notification.isRead 
                            ? `bg-gray-700/50`
                            : 'bg-gray-700/30'
                        }`}>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className={`w-4 h-4 ${!notification.isRead ? 'text-gray-300' : 'text-gray-500'}`} />
                            <span className={`font-medium ${!notification.isRead ? 'text-gray-200' : 'text-gray-400'}`}>
                              {notification.eventInfo.name}
                            </span>
                          </div>
                          <div className={`flex items-center gap-4 text-sm ${!notification.isRead ? 'text-gray-300' : 'text-gray-500'}`}>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{notification.eventInfo.date}</span>
                              {notification.eventInfo.time && <span>• {notification.eventInfo.time}</span>}
                            </div>
                            {notification.eventInfo.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{notification.eventInfo.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* volunteer details (admins only) */}
                      {notification.volunteerInfo && (
                        <div className={`rounded-lg p-3 mb-3 ${
                          !notification.isRead 
                            ? `bg-gray-700/50`
                            : 'bg-gray-700/30'
                        }`}>
                          <div className="text-sm">
                            <div className={`font-medium mb-1 ${!notification.isRead ? 'text-gray-200' : 'text-gray-400'}`}>
                              {notification.volunteerInfo.name}
                            </div>
                            <div className={`${!notification.isRead ? 'text-gray-300' : 'text-gray-500'}`}>
                              Skills: {notification.volunteerInfo.skills.join(', ')} • 
                              Available: {notification.volunteerInfo.availability}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* matching statistics (admins only) */}
                      {notification.matchStats && (
                        <div className={`rounded-lg p-3 mb-3 ${
                          !notification.isRead 
                            ? `bg-gray-700/50`
                            : 'bg-gray-700/30'
                        }`}>
                          <div className={`text-sm ${!notification.isRead ? 'text-gray-300' : 'text-gray-500'}`}>
                            {notification.matchStats.volunteersMatched} volunteers matched across {notification.matchStats.eventsCount} events 
                            ({notification.matchStats.efficiency} efficiency)
                          </div>
                        </div>
                      )}

                      {/* action buttons */}
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => toggleReadStatus(notification.id, notification.isRead)}
                          disabled={loadingAction === `toggle-${notification.id}`}
                          className={`text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-${primaryColor}-400 hover:text-${primaryColor}-300`}
                        >
                          {loadingAction === `toggle-${notification.id}` && <Loader2 className="w-3 h-3 animate-spin" />}
                          {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          disabled={loadingAction === `delete-${notification.id}`}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {loadingAction === `delete-${notification.id}` && <Loader2 className="w-3 h-3 animate-spin" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}