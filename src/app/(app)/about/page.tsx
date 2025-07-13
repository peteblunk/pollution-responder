import React from 'react';
import { useGameState } from '@/hooks/use-game-state';

export default function AboutPage() {
  const { state } = useGameState();
  const sectorName = state.character.unitName || 'Sector';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{sectorName} Pollution Response</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Publication Information</h2>
        <p className="text-gray-700">
          This is a fictional training scenario created for educational and development purposes. It is not an official publication of the U.S. Coast Guard.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="text-gray-700">
          For questions about this application, please contact the development team. This is not for reporting real-world incidents.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Credits and Contributors</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Development: Firebase Studio AI</li>
          <li>Concept & Scenario: Team Two Productions</li>
        </ul>
      </section>
    </div>
  );
};
