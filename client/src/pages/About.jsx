import React from 'react';

function About() {
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-start pt-20 pb-10 px-4">
      {/* Content Box */}
      <div className="relative z-10 max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white">
          Eshan Fruit & Sweet Center
        </h1>

        {/* Welcome Message */}
        <p className="text-gray-600 dark:text-gray-300 text-justify">
          Welcome to <strong>Eshan Fruit & Sweet Center</strong>, a premier family-owned business nestled in the heart of Ambalangoda. Since 2025, we’ve been serving our customers the freshest fruits and finest traditional sweets, offering a delightful and authentic shopping experience.
        </p>

        {/* Our Mission */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 text-justify">
            At Eshan, our mission is to deliver premium fruits and handcrafted sweets that bring joy to every table.
          </p>
        </section>

        {/* Our Products */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Our Products</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>Fresh Fruits:</strong> A variety of local and exotic fruits.</li>
            <li><strong>Traditional Sweets:</strong> From <strong>kalu dodol</strong> to <strong>milk toffees</strong>.</li>
          </ul>
        </section>

        {/* Why Choose Us */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Why Choose Us?</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>Uncompromising Freshness:</strong> Daily sourced fruits.</li>
            <li><strong>Handcrafted Sweets:</strong> Made with love and quality.</li>
            <li><strong>Customer Satisfaction:</strong> Excellent service.</li>
            <li><strong>Wide Selection:</strong> For everyday or events.</li>
          </ul>
        </section>

        {/* Our Values */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Our Values</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>Commitment to Quality:</strong> Top-tier standards.</li>
            <li><strong>Sustainability:</strong> Eco-friendly sourcing.</li>
            <li><strong>Community Engagement:</strong> Support local.</li>
          </ul>
        </section>

        {/* Contact Us */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Contact Us</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>Phone:</strong> 0761541638</li>
            <li>
              <strong>Email:</strong>{' '}
              <a
                href=""
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
              >
                harshanaeshan2002@@gmail.com
              </a>
            </li>
            <li><strong>Address:</strong> Ambalangoda,Sri Lanka</li>
          </ul>
        </section>

        {/* Footer Message */}
        <p className="text-gray-600 dark:text-gray-300 text-justify">
          Visit us today and experience the sweetness of nature at Dhananjee Fruit & Sweet Center.
        </p>
      </div>
    </div>
  );
}

export default About;
