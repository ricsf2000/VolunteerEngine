'use server';

import { auth } from '@/auth';
import { getUserProfileStatus, getUserProfileByUserId, createUserProfile, updateUserProfile } from '@/app/lib/dal/userProfile';

export async function getProfileStatus() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { isComplete: false };
    }
    
    const userId = (session.user as any).id;
    return await getUserProfileStatus(userId);
  } catch (error) {
    console.error('Error checking profile status:', error);
    return { isComplete: false };
  }
}

export async function saveProfile(profileData: any) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const userId = (session.user as any).id;
    
    // Validate required fields
    if (!profileData.fullName?.trim()) {
      return { success: false, error: 'Full name is required' };
    }
    if (!profileData.address1?.trim()) {
      return { success: false, error: 'Address is required' };
    }
    if (!profileData.city?.trim()) {
      return { success: false, error: 'City is required' };
    }
    if (!profileData.state) {
      return { success: false, error: 'State is required' };
    }
    if (profileData.zipCode.length < 5) {
      return { success: false, error: 'Valid zip code is required' };
    }
    if (profileData.skills.length === 0) {
      return { success: false, error: 'At least one skill is required' };
    }
    if (profileData.availability.length === 0) {
      return { success: false, error: 'At least one availability date is required' };
    }
    
    // Check if profile exists, create or update accordingly
    const existingProfile = await getUserProfileByUserId(userId);
    
    if (existingProfile) {
      await updateUserProfile(userId, profileData);
    } else {
      await createUserProfile({
        userId,
        ...profileData
      });
    }
    
    return { success: true, message: 'Profile saved successfully' };
    
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return { success: false, error: error.message || 'Failed to save profile' };
  }
}

export async function getProfile() {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }
    
    const userId = (session.user as any).id;
    console.log('Getting profile for userId:', userId);
    const profile = await getUserProfileByUserId(userId);
    console.log('Found profile:', profile);
    return profile;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
}