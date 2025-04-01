import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-10 
      bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-300 transition-colors duration-300">
      
      <h1 className="text-3xl font-bold text-center mb-4">About Us</h1>
      
      <p className="text-center max-w-2xl">
        Welcome to <span className="font-semibold">SweetFruit Delights</span>,  
        your one-stop destination for fresh fruits and delicious sweets!  
        We take pride in offering the best quality products, delivered straight to your doorstep.
      </p>

      <div className="mt-6 max-w-2xl">
        <h2 className="text-2xl font-semibold">Why Choose Us?</h2>
        <ul className="list-disc list-inside mt-2">
          <li>Fresh & Handpicked Fruits</li>
          <li>Wide Variety of Traditional & Modern Sweets</li>
          <li>Fast & Reliable Home Delivery</li>
          <li>Customer Satisfaction Guaranteed</li>
        </ul>
      </div>

      <div className="mt-6 max-w-2xl">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <p className="mt-2">
          Our mission is to bring freshness and sweetness to your life  
          by delivering high-quality fruits and sweets with convenience and care.
        </p>
      </div>
    </div>
  );
}
