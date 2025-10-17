'use server';

import { auth } from '@/auth';
import * as volunteerHistoryDAL from '../dal/volunteerHistory';
import type { CreateVolunteerHistoryInput, EnrichedVolunteerHistory } from '../dal/volunteerHistory';

/**
 * Standard response format for all service functions
 */
type ServiceResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Get volunteer history for the authenticated user (with enriched event/user data)
 *
 * @param userId - Optional user ID (if not provided, uses authenticated user)
 * @returns User's volunteer history with event and user details or error
 */
export async function getHistory(userId?: string): Promise<ServiceResponse<EnrichedVolunteerHistory[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Use provided userId or get from session
    const targetUserId = userId || (session.user as any).id;

    // Authorization: users can only see their own history (unless admin)
    const sessionUserId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== 'admin' && sessionUserId !== targetUserId) {
      return { success: false, error: 'Unauthorized to view this history' };
    }

    // Use enriched history with event and user details
    const history = await volunteerHistoryDAL.getEnrichedHistoryByUserId(targetUserId);
    return { success: true, data: history };

  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    return { success: false, error: 'Failed to fetch volunteer history' };
  }
}

/**
 * Get a single history entry by ID
 *
 * @param id - History entry ID
 * @returns History entry or error
 */
export async function getHistoryById(id: string): Promise<ServiceResponse<volunteerHistoryDAL.VolunteerHistory>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate ID
    if (!id || id.trim().length === 0) {
      return { success: false, error: 'History ID is required' };
    }

    // Use dedicated DAL lookup by ID
    const entry = await volunteerHistoryDAL.getHistoryById(id);
    if (!entry) {
      return { success: false, error: 'History entry not found' };
    }

    // Authorization: only admins or the owner can view the entry
    const sessionUserId = (session.user as any).id;
    const userRole = (session.user as any).role;
    if (userRole !== 'admin' && entry.userId !== sessionUserId) {
      return { success: false, error: 'Unauthorized to view this history' };
    }

    return { success: true, data: entry };

  } catch (error) {
    console.error('Error fetching history entry:', error);
    return { success: false, error: 'Failed to fetch history entry' };
  }
}

/**
 * Create a new volunteer history entry with validation
 *
 * Assignment Requirements:
 * - userId (required)
 * - eventId (required)
 * - participantStatus (required, enum: pending/confirmed/cancelled/no-show)
 * - registrationDate (required)
 *
 * @param data - History entry data to create
 * @returns Created history entry or validation error
 */
export async function createHistoryEntry(data: any): Promise<ServiceResponse<volunteerHistoryDAL.VolunteerHistory>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // ===== VALIDATION: User ID =====
    if (!data.userId || data.userId.trim().length === 0) {
      return { success: false, error: 'User ID is required' };
    }

    // Authorization: only admins can create history for other users
    const sessionUserId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== 'admin' && data.userId !== sessionUserId) {
      return { success: false, error: 'Unauthorized to create history for other users' };
    }

    // ===== VALIDATION: Event ID =====
    if (!data.eventId || data.eventId.trim().length === 0) {
      return { success: false, error: 'Event ID is required' };
    }

    // ===== VALIDATION: Participant Status =====
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'no-show'];
    if (!data.participantStatus) {
      return { success: false, error: 'Participant status is required' };
    }
    if (!validStatuses.includes(data.participantStatus)) {
      return { success: false, error: 'Participant status must be pending, confirmed, cancelled, or no-show' };
    }

    // ===== VALIDATION: Registration Date =====
    if (!data.registrationDate) {
      return { success: false, error: 'Registration date is required' };
    }

    // Convert string date to Date object if needed
    const registrationDate = data.registrationDate instanceof Date
      ? data.registrationDate
      : new Date(data.registrationDate);

    // Check if date is valid
    if (isNaN(registrationDate.getTime())) {
      return { success: false, error: 'Invalid registration date format' };
    }

    // ===== CREATE HISTORY ENTRY =====
    const historyInput: CreateVolunteerHistoryInput = {
      userId: data.userId.trim(),
      eventId: data.eventId.trim(),
      participantStatus: data.participantStatus,
      registrationDate: registrationDate,
    };

    const history = await volunteerHistoryDAL.createVolunteerHistory(historyInput);
    return { success: true, data: history };

  } catch (error) {
    console.error('Error creating history entry:', error);
    return { success: false, error: 'Failed to create history entry' };
  }
}

/**
 * Update participation status for a history entry
 *
 * @param id - History entry ID
 * @param status - New participation status
 * @returns Updated history entry or error
 */
export async function updateHistoryStatus(
  id: string,
  status: string
): Promise<ServiceResponse<volunteerHistoryDAL.VolunteerHistory>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // ===== VALIDATION: History ID =====
    if (!id || id.trim().length === 0) {
      return { success: false, error: 'History ID is required' };
    }

    // ===== VALIDATION: Status =====
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'no-show'];
    if (!status) {
      return { success: false, error: 'Status is required' };
    }
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Status must be pending, confirmed, cancelled, or no-show' };
    }

    // Check if history entry exists and user has permission
    // Note: For now we'll assume authorization is handled at API level
    // In production, you'd verify the history belongs to the user

    // ===== UPDATE STATUS =====
    const updated = await volunteerHistoryDAL.updateVolunteerHistory(id, {
      participantStatus: status as any,
    });

    if (!updated) {
      return { success: false, error: 'History entry not found' };
    }

    return { success: true, data: updated };

  } catch (error) {
    console.error('Error updating history status:', error);
    return { success: false, error: 'Failed to update history status' };
  }
}

/**
 * Get all volunteer history entries (admin only) with enriched data
 *
 * @returns All history entries with event and user details or error
 */
export async function getAllHistory(): Promise<ServiceResponse<EnrichedVolunteerHistory[]>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Only admins can view all history
    const userRole = (session.user as any).role;
    if (userRole !== 'admin') {
      return { success: false, error: 'Unauthorized - Admin access required' };
    }

    // Get all enriched history
    const history = await volunteerHistoryDAL.getAllEnrichedHistory();
    return { success: true, data: history };

  } catch (error) {
    console.error('Error fetching all history:', error);
    return { success: false, error: 'Failed to fetch history' };
  }
}
