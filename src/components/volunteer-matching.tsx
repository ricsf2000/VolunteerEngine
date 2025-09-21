'use client';

import React, { useState, useEffect } from 'react';
import { Users, Calendar, RefreshCw, CheckCircle, Loader2, Zap } from 'lucide-react';

// volunteer data interface
interface volunteerData 
{
  id: number;
  name: string;
  skills: string[];
  availability: string;
}

// event data interface  
interface eventData 
{
  id: number;
  name: string;
  requirements: string[];
  date: string;
}

// dummy volunteer data for testing
const dummyVolunteers: volunteerData[] = 
[
  { id: 1, name: 'Sarah Johnson', skills: ['teaching', 'organizing'], availability: 'weekends' },
  { id: 2, name: 'Mike Chen', skills: ['tech support', 'setup'], availability: 'evenings' },
  { id: 3, name: 'Emma Rodriguez', skills: ['cooking', 'serving'], availability: 'flexible' },
  { id: 4, name: 'David Thompson', skills: ['mentoring', 'counseling'], availability: 'weekdays' },
  { id: 5, name: 'Lisa Park', skills: ['photography', 'social media'], availability: 'weekends' }
];

// dummy event data for testing
const dummyEvents: eventData[] = 
[
  { id: 1, name: 'Community Food Drive', requirements: ['organizing', 'setup'], date: '2025-10-15' },
  { id: 2, name: 'Tech Workshop for Seniors', requirements: ['tech support', 'teaching'], date: '2025-10-20' },
  { id: 3, name: 'Youth Mentorship Program', requirements: ['mentoring', 'counseling'], date: '2025-10-25' },
  { id: 4, name: 'Charity Gala Photography', requirements: ['photography', 'social media'], date: '2025-11-01' },
  { id: 5, name: 'Homeless Shelter Meal Service', requirements: ['cooking', 'serving'], date: '2025-10-30' }
];

// fake api for testing
const fakeApi = 
{
  // simulate loading time
  delay: () => new Promise(resolve => setTimeout(resolve, 800)),
  
  async getVolunteers(): Promise<volunteerData[]> 
  {
    await this.delay();
    return dummyVolunteers;
  },
  
  async getEvents(): Promise<eventData[]> 
  {
    await this.delay();
    return dummyEvents;
  },
  
  async getBestMatches(volunteerId: number): Promise<number[]> 
  {
    await this.delay();
    // simple matching logic based on volunteer skills
    const matchingLogic = 
    {
      1: [1, 2], // Sarah: Food Drive, Tech Workshop
      2: [2, 1], // Mike: Tech Workshop, Food Drive  
      3: [5, 1], // Emma: Meal Service, Food Drive
      4: [3, 2], // David: Mentorship, Tech Workshop
      5: [4, 1]  // Lisa: Photography, Food Drive
    };
    return matchingLogic[volunteerId as keyof typeof matchingLogic] || [];
  },
  
  async submitMatch(volunteerId: number, eventId: number): Promise<{ success: boolean }> 
  {
    await this.delay();
    return { success: true };
  }
};

export default function volunteerMatchingForm() 
{
  // state vars for data
  const [volunteersList, setVolunteersList] = useState<volunteerData[]>([]);
  const [eventsList, setEventsList] = useState<eventData[]>([]);
  const [matchedEventsList, setMatchedEventsList] = useState<eventData[]>([]);
  
  // state vars for selections
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
  // state vars for loading states
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingMatching, setIsLoadingMatching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // state for success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // load initial data when component mounts
  useEffect(() => 
  {
    loadVolunteers();
    loadEvents();
  }, []);

  // func to load volunteers from api
  const loadVolunteers = async () => 
  {
    setIsLoadingVolunteers(true);
    try 
    {
      const data = await fakeApi.getVolunteers();
      setVolunteersList(data);
    } 
    catch (error) 
    {
      console.error('couldnt load volunteers:', error);
    } 
    finally 
    {
      setIsLoadingVolunteers(false);
    }
  };

  // func to load events from api
  const loadEvents = async () => 
  {
    setIsLoadingEvents(true);
    try 
    {
      const data = await fakeApi.getEvents();
      setEventsList(data);
    } 
    catch (error) 
    {
      console.error('couldnt load events:', error);
    } 
    finally 
    {
      setIsLoadingEvents(false);
    }
  };

  // handle volunteer selection and find matches
  const handleVolunteerSelect = async (volunteerId: string) => 
  {
    setSelectedVolunteerId(volunteerId);
    setSelectedEventId('');
    
    if (volunteerId) 
    {
      setIsLoadingMatching(true);
      try 
      {
        const matchIds = await fakeApi.getBestMatches(parseInt(volunteerId));
        const matches = eventsList.filter(event => matchIds.includes(event.id));
        setMatchedEventsList(matches);
        
        // auto-select the best match if available
        if (matches.length > 0) 
        {
          setSelectedEventId(matches[0].id.toString());
        }
      } 
      catch (error) 
      {
        console.error('error getting matches:', error);
      } 
      finally 
      {
        setIsLoadingMatching(false);
      }
    } 
    else 
    {
      setMatchedEventsList([]);
    }
  };

  // auto fill function for random matching
  const handleAutoFill = async () => 
  {
    setIsLoadingVolunteers(true);
    setIsLoadingEvents(true);
    setIsLoadingMatching(true);
    
    try 
    {
      // simulate auto-filling process
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const randomVolunteer = volunteersList[Math.floor(Math.random() * volunteersList.length)];
      if (randomVolunteer) 
      {
        await handleVolunteerSelect(randomVolunteer.id.toString());
      }
    } 
    catch (error) 
    {
      console.error('auto-fill error:', error);
    } 
    finally 
    {
      setIsLoadingVolunteers(false);
      setIsLoadingEvents(false);
      setIsLoadingMatching(false);
    }
  };

  // submit the match
  const handleSubmitMatch = async () => 
  {
    if (selectedVolunteerId && selectedEventId) 
    {
      setIsSubmitting(true);
      try 
      {
        await fakeApi.submitMatch(parseInt(selectedVolunteerId), parseInt(selectedEventId));
        setShowSuccessMessage(true);
        
        // reset form after success
        setTimeout(() => 
        {
          setShowSuccessMessage(false);
          setSelectedVolunteerId('');
          setSelectedEventId('');
          setMatchedEventsList([]);
        }, 2000);
      } 
      catch (error) 
      {
        console.error('failed to submit match:', error);
      } 
      finally 
      {
        setIsSubmitting(false);
      }
    }
  };

  // get selected volunteer data
  const selectedVolunteerData = volunteersList.find(v => v.id.toString() === selectedVolunteerId);
  const selectedEventData = eventsList.find(e => e.id.toString() === selectedEventId);

  // check if any loading state is active
  const isAnyLoading = isLoadingVolunteers || isLoadingEvents || isLoadingMatching || isSubmitting;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      {/* header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Volunteer Matching System</h1>
        <p className="text-gray-400">Match volunteers to events based on their skills and availability</p>
      </div>

      <div className="space-y-6">
        {/* auto-fill button */}
        <div className="flex justify-end">
          <button
            onClick={handleAutoFill}
            disabled={isAnyLoading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
            Auto-Fill Match
          </button>
        </div>

        {/* volunteer selection dropdown */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-lg font-semibold text-gray-200">
            <Users className="w-5 h-5 text-green-400" />
            Volunteer Name
          </label>
          <select
            value={selectedVolunteerId}
            onChange={(e) => handleVolunteerSelect(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-gray-200"
            disabled={isLoadingVolunteers}
          >
            <option value="">
              {isLoadingVolunteers ? 'Loading volunteers...' : 'Select a volunteer'}
            </option>
            {volunteersList.map(volunteer => (
              <option key={volunteer.id} value={volunteer.id}>
                {volunteer.name} - Skills: {volunteer.skills.join(', ')} - Available: {volunteer.availability}
              </option>
            ))}
          </select>
        </div>

        {/* event selection dropdown */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-lg font-semibold text-gray-200">
            <Calendar className="w-5 h-5 text-green-400" />
            Matched Events
            {isLoadingMatching && (
              <span className="text-sm text-green-400 font-normal flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Finding best matches...
              </span>
            )}
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-gray-200"
            disabled={isLoadingEvents || isLoadingMatching || !selectedVolunteerId}
          >
            <option value="">
              {isLoadingEvents ? 'Loading events...' : 
               isLoadingMatching ? 'Finding matches...' :
               !selectedVolunteerId ? 'Select a volunteer first' : 
               'Select an event'}
            </option>
            {(matchedEventsList.length > 0 ? matchedEventsList : eventsList).map(event => (
              <option key={event.id} value={event.id}>
                {event.name} - {event.date} - Needs: {event.requirements.join(', ')}
              </option>
            ))}
          </select>
        </div>

        {/* match summary section */}
        {selectedVolunteerData && selectedEventData && (
          <div className="bg-gray-800 border border-green-600 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2">Match Summary</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong className="text-gray-200">Volunteer:</strong> {selectedVolunteerData.name}</p>
              <p><strong className="text-gray-200">Skills:</strong> {selectedVolunteerData.skills.join(', ')}</p>
              <p><strong className="text-gray-200">Event:</strong> {selectedEventData.name}</p>
              <p><strong className="text-gray-200">Requirements:</strong> {selectedEventData.requirements.join(', ')}</p>
              <p><strong className="text-gray-200">Date:</strong> {selectedEventData.date}</p>
            </div>
          </div>
        )}

        {/* submit button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmitMatch}
            disabled={!selectedVolunteerId || !selectedEventId || isAnyLoading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Match
          </button>
        </div>

        {/* success message */}
        {showSuccessMessage && (
          <div className="flex items-center justify-center gap-2 bg-gray-800 border border-green-600 rounded-lg p-4 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Match created successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}