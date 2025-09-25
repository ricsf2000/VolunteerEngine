'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { volunteerMatchingApi } from '@/app/lib/volunteer-matching-api';

export default function VolunteerMatchingPage() 
{
  const [currentVolunteer, setCurrentVolunteer] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  
  const [volunteerName, setVolunteerName] = useState('');
  const [eventName, setEventName] = useState('');
  
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (showSuccessMessage && (volunteerName.trim() || eventName.trim())) {
      setShowSuccessMessage(false);
    }
  }, [volunteerName, eventName, showSuccessMessage]);

  const handleAutoFill = async () => 
  {
    setIsAutoFilling(true);
    try 
    {
      const volunteer = await volunteerMatchingApi.getRandomVolunteer();
      const event = await volunteerMatchingApi.getBestMatchForVolunteer();
      
      setCurrentVolunteer(volunteer);
      setCurrentEvent(event);

      setVolunteerName('');
      setEventName('');
    } 
    catch (error) 
    {
      console.error('auto-fill error:', error);
    } 
    finally 
    {
      setIsAutoFilling(false);
    }
  };

  const handleManualMatch = () => {
    if (volunteerName.trim() && eventName.trim()) {
      // Create mock volunteer and event objects for manual entry
      setCurrentVolunteer({
        id: 'manual',
        fullName: volunteerName.trim(),
        skills: ['Manual Entry'],
        city: 'N/A',
        state: 'N/A',
        availability: ['Manual Entry']
      });
      setCurrentEvent({
        id: 'manual',
        eventName: eventName.trim(),
        requiredSkills: ['Manual Entry'],
        eventDate: 'TBD',
        urgency: 'Manual Entry'
      });
    }
  };

  const handleSubmitMatch = async () => 
  {
    if (currentVolunteer && currentEvent) 
    {
      setIsSubmitting(true);
      try 
      {
        await volunteerMatchingApi.submitMatch(currentVolunteer.id, currentEvent.id);
        
        setCurrentVolunteer(null);
        setCurrentEvent(null);
        setVolunteerName('');
        setEventName('');
        setShowSuccessMessage(true);
        
        // success message will be hidden when user starts typing (via useEffect)
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

  return (
    <div>
      {/* header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Volunteer Matching System</h1>
        <p className="text-gray-400">Generate volunteer to event matches using our matching algorithm</p>
        
        {/* auto-fill button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleAutoFill}
            disabled={isAutoFilling || isSubmitting}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isAutoFilling ? 'animate-spin' : ''}`} />
            {isAutoFilling ? 'Finding...' : 'Auto-fill'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* input fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <strong>Volunteer Name</strong>
            </label>
            <input
              type="text"
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              placeholder="Enter volunteer name..."
              className="w-full p-3 rounded-lg card text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <strong>Event Name</strong>
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event name..."
              className="w-full p-3 rounded-lg card text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* create match button */}
        <div className="flex justify-center">
          <button
            onClick={handleManualMatch}
            disabled={!volunteerName.trim() || !eventName.trim() || isSubmitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Create Match
          </button>
        </div>

        {/* match summary section */}
        {currentVolunteer && currentEvent && (
          <div className="card border border-green-600 rounded-lg p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-green-400 text-xl">Match Summary</h3>
              
              {/* confirm button in top right */}
              <button
                onClick={handleSubmitMatch}
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2 text-sm"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Confirming...' : 'Confirm Match'}
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* volunteer info */}
              <div>
                <h4 className="font-semibold text-gray-200 mb-2">Volunteer</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong className="text-gray-200">Name:</strong> {currentVolunteer.fullName}</p>
                  <p><strong className="text-gray-200">Skills:</strong> {currentVolunteer.skills.join(', ')}</p>
                  <p><strong className="text-gray-200">Location:</strong> {currentVolunteer.city}, {currentVolunteer.state}</p>
                  <p><strong className="text-gray-200">Availability:</strong> {currentVolunteer.availability.join(', ')}</p>
                </div>
              </div>

              {/* event info */}
              <div>
                <h4 className="font-semibold text-gray-200 mb-2">Event</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong className="text-gray-200">Event:</strong> {currentEvent.eventName}</p>
                  <p><strong className="text-gray-200">Required Skills:</strong> {currentEvent.requiredSkills.join(', ')}</p>
                  <p><strong className="text-gray-200">Date:</strong> {currentEvent.eventDate}</p>
                  <p><strong className="text-gray-200">Urgency:</strong> {currentEvent.urgency}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* success message */}
        {showSuccessMessage && (
          <div className="flex items-center justify-center gap-2 card border border-green-600 rounded-lg p-4 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Match created successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}