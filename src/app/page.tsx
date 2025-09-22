'use client';

import Link from "next/link";
import { useState } from "react";
import Modal from "@/components/Modal";
import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [modalRole, setModalRole] = useState<'admin' | 'volunteer'>('volunteer');
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Volunteer<span className="text-blue-500">Engine</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Efficiently matching volunteers with events based on skills, location, and availability
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-black/30 border-2 border-blue-300 rounded-lg p-8 text-center">
            <div className="bg-white w-16 h-16 border rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              I'm a Volunteer
            </h2>
            <p className="mb-6">
              Find meaningful opportunities that match your skills and availability
            </p>
            <Link
              href="/volunteer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Volunteer Login
            </Link>
            <div className="mt-3">
              <button
                onClick={() => {
                  setModalRole('volunteer');
                  setShowModal(true);
                }}
                className="text-sm text-white/70 hover:underline"
              >
                Register
              </button>
            </div>
          </div>

          <div className="bg-black/30 border-2 border-green-300 rounded-lg p-8 text-center">
            <div className="bg-white w-16 h-16 border rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              I'm an Administrator
            </h2>
            <p className="mb-6">
              Manage events and coordinate volunteers for your organization
            </p>
            <Link
              href="/admin"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Admin Login
            </Link>
            <div className="mt-3">
              <button
                onClick={() => {
                  setModalRole('admin');
                  setShowModal(true);
                }}
                className="text-sm text-white/70 hover:underline"
              >
                Register
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <h3 className="text-2xl font-semibold mb-8">
            How VolunteerEngine Works
          </h3>
          <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Create Profile</h4>
              <p className="text-sm">Set up your skills, location, and availability preferences</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Smart Matching</h4>
              <p className="text-sm">Our algorithm finds the perfect volunteer-event matches</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Make Impact</h4>
              <p className="text-sm">Participate in meaningful events and track your contributions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <RegistrationForm role={modalRole} />
      </Modal>
    </div>
  );
}
