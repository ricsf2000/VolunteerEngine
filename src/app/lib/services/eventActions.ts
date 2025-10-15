'use server';

import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from '@/app/lib/dal/eventDetails';

/**
 * Get all events
 */
export async function getEvents() {
  try {
    const events = await getAllEvents();
    return { success: true, data: events };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

/**
 * Get a single event by ID
 */
export async function getEvent(id: string) {
  try {
    if (!id || id.trim().length === 0) {
      return { success: false, error: 'Event ID is required' };
    }

    const event = await getEventById(id);
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    return { success: true, data: event };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { success: false, error: 'Failed to fetch event' };
  }
}

/**
 * Create a new event with validation
 */
export async function createNewEvent(data: any) {
  try {
    // Validate event name
    if (!data.eventName || data.eventName.trim().length === 0) {
      return { success: false, error: 'Event name is required' };
    }
    if (data.eventName.length < 3) {
      return { success: false, error: 'Event name must be at least 3 characters' };
    }
    if (data.eventName.length > 100) {
      return { success: false, error: 'Event name cannot exceed 100 characters' };
    }

    // Validate description
    if (!data.description || data.description.trim().length === 0) {
      return { success: false, error: 'Description is required' };
    }
    if (data.description.length < 10) {
      return { success: false, error: 'Description must be at least 10 characters' };
    }
    if (data.description.length > 1000) {
      return { success: false, error: 'Description cannot exceed 1000 characters' };
    }

    // Validate location
    if (!data.location || data.location.trim().length === 0) {
      return { success: false, error: 'Location is required' };
    }
    if (data.location.length < 5) {
      return { success: false, error: 'Location must be at least 5 characters' };
    }
    if (data.location.length > 200) {
      return { success: false, error: 'Location cannot exceed 200 characters' };
    }

    // Validate required skills
    if (!data.requiredSkills || !Array.isArray(data.requiredSkills)) {
      return { success: false, error: 'Required skills must be an array' };
    }
    if (data.requiredSkills.length === 0) {
      return { success: false, error: 'At least one skill is required' };
    }
    if (data.requiredSkills.length > 10) {
      return { success: false, error: 'Cannot require more than 10 skills' };
    }
    // Validate that all skills are non-empty strings
    if (!data.requiredSkills.every((skill: any) => typeof skill === 'string' && skill.trim().length > 0)) {
      return { success: false, error: 'All skills must be non-empty strings' };
    }

    // Validate urgency
    const validUrgencies = ['low', 'medium', 'high', 'urgent'];
    if (!data.urgency) {
      return { success: false, error: 'Urgency is required' };
    }
    if (!validUrgencies.includes(data.urgency)) {
      return { success: false, error: 'Urgency must be low, medium, high, or urgent' };
    }

    // Validate event date
    if (!data.eventDate) {
      return { success: false, error: 'Event date is required' };
    }

    const eventDate = data.eventDate instanceof Date ? data.eventDate : new Date(data.eventDate);
    if (isNaN(eventDate.getTime())) {
      return { success: false, error: 'Invalid event date format' };
    }

    const now = new Date();
    if (eventDate <= now) {
      return { success: false, error: 'Event date must be in the future' };
    }

    // Create event
    const event = await createEvent({
      eventName: data.eventName.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      requiredSkills: data.requiredSkills.map((s: string) => s.trim()),
      urgency: data.urgency,
      eventDate: eventDate,
    });

    return { success: true, data: event };
  } catch (error: any) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message || 'Failed to create event' };
  }
}

/**
 * Update an existing event with validation
 */
export async function updateEventDetails(id: string, data: any) {
  try {
    if (!id || id.trim().length === 0) {
      return { success: false, error: 'Event ID is required' };
    }

    const existingEvent = await getEventById(id);
    if (!existingEvent) {
      return { success: false, error: 'Event not found' };
    }

    // Validate event name if provided
    if (data.eventName !== undefined) {
      if (!data.eventName || data.eventName.trim().length === 0) {
        return { success: false, error: 'Event name cannot be empty' };
      }
      if (data.eventName.length < 3) {
        return { success: false, error: 'Event name must be at least 3 characters' };
      }
      if (data.eventName.length > 100) {
        return { success: false, error: 'Event name cannot exceed 100 characters' };
      }
    }

    // Validate description if provided
    if (data.description !== undefined) {
      if (!data.description || data.description.trim().length === 0) {
        return { success: false, error: 'Description cannot be empty' };
      }
      if (data.description.length < 10) {
        return { success: false, error: 'Description must be at least 10 characters' };
      }
      if (data.description.length > 1000) {
        return { success: false, error: 'Description cannot exceed 1000 characters' };
      }
    }

    // Validate location if provided
    if (data.location !== undefined) {
      if (!data.location || data.location.trim().length === 0) {
        return { success: false, error: 'Location cannot be empty' };
      }
      if (data.location.length < 5) {
        return { success: false, error: 'Location must be at least 5 characters' };
      }
      if (data.location.length > 200) {
        return { success: false, error: 'Location cannot exceed 200 characters' };
      }
    }

    // Validate required skills if provided
    if (data.requiredSkills !== undefined) {
      if (!Array.isArray(data.requiredSkills)) {
        return { success: false, error: 'Required skills must be an array' };
      }
      if (data.requiredSkills.length === 0) {
        return { success: false, error: 'At least one skill is required' };
      }
      if (data.requiredSkills.length > 10) {
        return { success: false, error: 'Cannot require more than 10 skills' };
      }
      // Validate that all skills are non-empty strings
      if (!data.requiredSkills.every((skill: any) => typeof skill === 'string' && skill.trim().length > 0)) {
        return { success: false, error: 'All skills must be non-empty strings' };
      }
    }

    // Validate urgency if provided
    if (data.urgency !== undefined) {
      const validUrgencies = ['low', 'medium', 'high', 'urgent'];
      if (!validUrgencies.includes(data.urgency)) {
        return { success: false, error: 'Urgency must be low, medium, high, or urgent' };
      }
    }

    // Validate event date if provided
    if (data.eventDate !== undefined) {
      const eventDate = data.eventDate instanceof Date ? data.eventDate : new Date(data.eventDate);
      if (isNaN(eventDate.getTime())) {
        return { success: false, error: 'Invalid event date format' };
      }
      const now = new Date();
      if (eventDate <= now) {
        return { success: false, error: 'Event date must be in the future' };
      }
      data.eventDate = eventDate;
    }

    // Update event
    const updateData: any = {};
    if (data.eventName !== undefined) updateData.eventName = data.eventName.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.location !== undefined) updateData.location = data.location.trim();
    if (data.requiredSkills !== undefined) updateData.requiredSkills = data.requiredSkills.map((s: string) => s.trim());
    if (data.urgency !== undefined) updateData.urgency = data.urgency;
    if (data.eventDate !== undefined) updateData.eventDate = data.eventDate;

    const event = await updateEvent(id, updateData);
    if (!event) {
      return { success: false, error: 'Failed to update event' };
    }

    return { success: true, data: event };
  } catch (error: any) {
    console.error('Error updating event:', error);
    return { success: false, error: error.message || 'Failed to update event' };
  }
}

/**
 * Delete an event
 */
export async function deleteEventById(id: string) {
  try {
    if (!id || id.trim().length === 0) {
      return { success: false, error: 'Event ID is required' };
    }

    const existingEvent = await getEventById(id);
    if (!existingEvent) {
      return { success: false, error: 'Event not found' };
    }

    const deleted = await deleteEvent(id);
    if (!deleted) {
      return { success: false, error: 'Failed to delete event' };
    }

    return { success: true, message: 'Event deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { success: false, error: error.message || 'Failed to delete event' };
  }
}
