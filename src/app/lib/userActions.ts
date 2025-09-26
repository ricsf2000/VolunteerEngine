// Client-side user actions that simulate API calls using localStorage
// These will be easy to replace with real API calls later

// Simulate API delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 100));

export async function getProfileStatus() {
  await simulateApiDelay();
  
  try {
    const savedProfile = localStorage.getItem('volunteerProfile');
    
    if (!savedProfile) {
      return { isComplete: false };
    }
    
    const profile = JSON.parse(savedProfile);
    
    const isComplete = !!(
      profile.fullName?.trim() &&
      profile.address1?.trim() &&
      profile.city?.trim() &&
      profile.state &&
      profile.zipCode?.length >= 5 &&
      profile.skills?.length > 0 &&
      profile.availability?.length > 0
    );
    
    return { isComplete, profile };
  } catch (error) {
    console.error('Error checking profile status:', error);
    return { isComplete: false };
  }
}

// API call to save user profile (simulated)
export async function apiSaveUserProfile(profileData: any) {
  await simulateApiDelay();
  
  console.log('API Call: POST /api/user/profile', profileData);
  
  // Simulate save to database with localStorage
  localStorage.setItem('volunteerProfile', JSON.stringify(profileData));
  
  return { success: true, message: 'Profile saved successfully' };
}

export async function saveProfile(profileData: any) {
  try {
    // Validate required fields before making API call
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
    
    // Make the API call
    const result = await apiSaveUserProfile(profileData);
    return result;
    
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return { success: false, error: error.message || 'Failed to save profile' };
  }
}

export async function getProfile() {
  await simulateApiDelay();
  
  try {
    const savedProfile = localStorage.getItem('volunteerProfile');
    if (!savedProfile) {
      return null;
    }
    
    return JSON.parse(savedProfile);
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
}