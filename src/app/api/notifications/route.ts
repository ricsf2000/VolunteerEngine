import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserNotifications, 
  toggleNotificationReadStatus,
  markAllUserNotificationsAsRead,
  removeNotification 
} from '@/app/lib/services/notificationActions';

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const notifications = await getUserNotifications();

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications (for updates)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notificationId, currentStatus } = body;
    
    if (action === 'toggle-read') {
      const updated = await toggleNotificationReadStatus(notificationId, currentStatus);
      return NextResponse.json({ notification: updated }, { status: 200 });
    }
    
    if (action === 'mark-all-read') {
      const result = await markAllUserNotificationsAsRead();
      return NextResponse.json(result, { status: 200 });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    const result = await removeNotification(notificationId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}