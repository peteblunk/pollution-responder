import React from 'react';

interface AboutPageProps {
  sectorName: string; // Prop to receive the Sector Name
}

const AboutPage: React.FC<AboutPageProps> = ({ sectorName }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sector {sectorName} Pollution Response</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Publication Information</h2>
        <p className="text-gray-700">
          {/* Placeholder for publication information */}
          [Insert Publication Information Here]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="text-gray-700">
          {/* Placeholder for contact information */}
          [Insert Contact Information Here]
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Credits and Contributors</h2>
        <ul className="list-disc list-inside text-gray-700">
          {/* Placeholder for credits and contributors */}
          <li>[Contributor Name/Role]</li>
          <li>[Contributor Name/Role]</li>
          {/* Add more list items as needed */}
        </ul>
      </section>
    </div>
  );
};

export default AboutPage;