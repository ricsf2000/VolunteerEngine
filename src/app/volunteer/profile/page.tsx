'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Calendar, X, Save } from 'lucide-react';
import { Loading } from '@/components/Loading';


const SKILLS_OPTIONS = [
  'Event Planning',
  'Teaching/Training',
  'Marketing/Communications',
  'Food Service',
  'Fundraising',
  'Administrative Support',
  'Technology Support',
  'Healthcare',
  'Construction/Manual Labor',
  'Transportation',
  'Languages (Bilingual)',
  'Youth Mentoring',
  'Senior Care',
  'Animal Care',
  'Environmental Work',
  'Arts/Crafts',
  'Music/Performance',
  'Sports/Recreation',
  'Legal Services',
  'Photography/Videography'
];

export default function VolunteerProfile() {
  const [formData, setFormData] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    skills: [] as string[],
    preferences: '',
    availability: [] as string[]
  });

  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [newAvailabilityDate, setNewAvailabilityDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [states, setStates] = useState<{code: string, name: string}[]>([]);

  // Load existing profile data and states
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile data
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData) {
            setFormData(profileData);
          }
        }

        // Load states
        const statesResponse = await fetch('/api/states');
        if (statesResponse.ok) {
          const statesData = await statesResponse.json();
          setStates(statesData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (card: string, value: string) => {
    setFormData(prev => ({ ...prev, [card]: value }));
  };

  const handleStateSelect = (stateCode: string) => {
    setFormData(prev => ({ ...prev, state: stateCode }));
    setIsStateDropdownOpen(false);
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const addAvailabilityDate = () => {
    if (newAvailabilityDate && !formData.availability.includes(newAvailabilityDate)) {
      setFormData(prev => ({
        ...prev,
        availability: [...prev.availability, newAvailabilityDate]
      }));
      setNewAvailabilityDate('');
    }
  };

  const removeAvailabilityDate = (date: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter(d => d !== date)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('Profile saved successfully');
        // Reload page to update sidebar state
        window.location.reload();
      } else {
        console.error('Failed to save profile:', result.error);
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== '' &&
      formData.address1.trim() !== '' &&
      formData.city.trim() !== '' &&
      formData.state !== '' &&
      formData.zipCode.length >= 5 &&
      formData.skills.length > 0 &&
      formData.availability.length > 0
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div>
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          <Loading message="Loading profile" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div>
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <div className="rounded-lg max-w-4xl">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                maxLength={50}
                className="card w-full px-3 py-2   rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  "
                placeholder="Enter your full name"
                required
              />
              <p className="text-xs text-gray-400 mt-1">{formData.fullName.length}/50 characters</p>
            </div>

            {/* Address 1 */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="address1">
                Address 1 <span className="text-red-500">*</span>
              </label>
              <input
                id="address1"
                type="text"
                value={formData.address1}
                onChange={(e) => handleInputChange('address1', e.target.value)}
                maxLength={100}
                className="card w-full px-3 py-2   rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  "
                placeholder="Enter your street address"
                required
              />
              <p className="text-xs text-gray-400 mt-1">{formData.address1.length}/100 characters</p>
            </div>

            {/* Address 2 */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="address2">
                Address 2
              </label>
              <input
                id="address2"
                type="text"
                value={formData.address2}
                onChange={(e) => handleInputChange('address2', e.target.value)}
                maxLength={100}
                className="card  w-full px-3 py-2   rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apartment, suite, etc. (optional)"
              />
              <p className="text-xs text-gray-400 mt-1">{formData.address2.length}/100 characters</p>
            </div>

            {/* City, State, and Zip Code Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="city">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  maxLength={100}
                  className="card w-full px-3 py-2   rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your city"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">{formData.city.length}/100 characters</p>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                    className={`card w-full px-3 py-2   rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  text-left flex items-center justify-between ${formData.state ? 'text-white' : 'text-gray-400'}`}
                  >
                    <span>{formData.state ? states.find(s => s.code === formData.state)?.name : 'Select a state'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isStateDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-black   rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {states.map((state) => (
                        <button
                          key={state.code}
                          type="button"
                          onClick={() => handleStateSelect(state.code)}
                          className="text-white w-full px-3 py-2 text-left hover:bg-gray-500 "
                        >
                          {state.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="zipCode">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g, ''))}
                  maxLength={9}
                  className={`card w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                    formData.zipCode.length > 0 && formData.zipCode.length < 5
                      ? '!border-red-500 focus:!border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-transparent focus:ring-blue-500'
                  }`}
                  placeholder="Enter your zip code"
                  pattern="\d{5}(-\d{4})?"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">At least 5 digits required</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Skills <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSkillsDropdownOpen(!isSkillsDropdownOpen)}
                  className="card w-full px-3 py-2   rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500   text-left flex items-center justify-between"
                >
                  <span>
                    {formData.skills.length > 0 
                      ? `${formData.skills.length} skill${formData.skills.length > 1 ? 's' : ''} selected`
                      : 'Select your skills'
                    }
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isSkillsDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-black   rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {SKILLS_OPTIONS.map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center px-3 py-2 hover:bg-gray-500 cursor-pointer "
                      >
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="mr-3"
                        />
                        {skill}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {formData.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-800 text-blue-100"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="preferences">
                Preferences
              </label>
              <textarea
                id="preferences"
                value={formData.preferences}
                onChange={(e) => handleInputChange('preferences', e.target.value)}
                rows={4}
                className="card w-full px-3 py-2   rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  "
                placeholder="Tell us about your volunteer preferences, schedule constraints, or any other relevant information..."
              />
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Availability <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="date"
                  value={newAvailabilityDate}
                  onChange={(e) => setNewAvailabilityDate(e.target.value)}
                  className="card flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800 [color-scheme:dark]"
                />
                <button
                  type="button"
                  onClick={addAvailabilityDate}
                  disabled={!newAvailabilityDate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Add Date
                </button>
              </div>
              {formData.availability.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Available dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.availability.sort().map((date) => (
                      <span
                        key={date}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-800 "
                      >
                        {new Date(date).toLocaleDateString()}
                        <button
                          type="button"
                          onClick={() => removeAvailabilityDate(date)}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-6">
              <button
                onClick={handleSave}
                disabled={!isFormValid() || isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Profile...' : 'Save Profile'}
              </button>
              {!isFormValid() && (
                <p className="mt-2 text-sm text-red-500">
                  Please fill in all required fields to save your profile.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}