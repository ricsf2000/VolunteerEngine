import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserProfileStatus, getUserProfileByUserId, createUserProfile, updateUserProfile } from '@/app/lib/dal/userProfile';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    console.log('API: Checking profile for userId:', userId);
    
    const { searchParams } = new URL(request.url);
    const statusOnly = searchParams.get('status') === 'true';
    
    if (statusOnly) {
      // Return just the profile completion status
      const result = await getUserProfileStatus(userId);
      console.log('API: Profile status result:', result);
      return NextResponse.json(result);
    } else {
      // Return full profile data
      const profile = await getUserProfileByUserId(userId);
      return NextResponse.json(profile);
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = (session.user as any).id;
    const profileData = await request.json();
    
    // Validate required fields
    if (!profileData.fullName?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!profileData.address1?.trim()) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    if (!profileData.city?.trim()) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }
    if (!profileData.state) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }
    if (profileData.zipCode?.length < 5) {
      return NextResponse.json({ error: 'Valid zip code is required' }, { status: 400 });
    }
    if (!profileData.skills?.length) {
      return NextResponse.json({ error: 'At least one skill is required' }, { status: 400 });
    }
    if (!profileData.availability?.length) {
      return NextResponse.json({ error: 'At least one availability date is required' }, { status: 400 });
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
    
    return NextResponse.json({ success: true, message: 'Profile saved successfully' });
    
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to save profile' }, { status: 500 });
  }
}