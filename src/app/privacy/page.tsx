'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-cream pt-32 pb-24 px-6 md:px-12">
      <SEOHead 
        title="Privacy Policy - Taste of Village"
        description="Privacy Policy for Taste of Village."
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-pine mb-8 tracking-tight">
          Privacy Policy
        </h1>
        
        <div className="prose prose-pine max-w-none text-pine/80 space-y-6">
          <p className="text-lg">Last Updated: {new Date().toLocaleDateString('en-GB')}</p>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">1. Introduction</h2>
            <p>
              Taste of Village ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or place an order with us. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, delivery address, email address, and telephone number, that you voluntarily give to us when you register with the site or when you choose to participate in various activities related to the site, such as placing an order.</li>
              <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, or exchange information about our services. All financial information is stored by our payment processor, and we do not retain your full credit card information.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the site.</li>
              <li><strong>Location Data:</strong> We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using our mobile application, to provide location-based services (like finding the nearest branch).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">3. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and manage your restaurant orders, payments, and deliveries.</li>
              <li>Create and manage your account and loyalty rewards.</li>
              <li>Send you administrative information, such as order confirmations and updates.</li>
              <li>Deliver targeted advertising, coupons, newsletters, and other information regarding promotions and the site to you.</li>
              <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
              <li>Increase the efficiency and operation of the site.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">4. Disclosure of Your Information</h2>
            <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
              <li><strong>Marketing Communications:</strong> With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes, as permitted by law.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">5. Tracking Technologies</h2>
            <p>
              We may use cookies, web beacons, tracking pixels, and other tracking technologies on the site to help customize the site and improve your experience. When you access the site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">6. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">7. Policy for Children</h2>
            <p>
              We do not knowingly solicit information from or market to children under the age of 13. If we learn that we have collected personal information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">8. Controls for Do-Not-Track Features</h2>
            <p>
              Most web browsers and some mobile operating systems include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. No uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-pine font-bold mt-8">9. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="font-bold">
              Email: sales@faloodaandco.co.uk
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
