/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

const FooterSection = ({ title, links }: { title: string; links: { href: string; label: string }[] }) => (
  <div className="footer-section">
    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">{title}</h3>  {/* Adding margin-bottom for better spacing */}
    <ul className="space-y-2">  {/* Reduce space between items */}
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="text-base text-gray-400 hover:text-white">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ iconPath, href }: { iconPath: string; href: string }) => (
  <Link href={href} className="text-gray-400 hover:text-white">
    {/* <img src={iconPath} alt="social icon" className="h-6 w-6" /> */}
    <Image src={iconPath} alt="social icon" width={24} height={24} className="h-6 w-6 text-gray-400" />
  </Link>
);

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="flex flex-wrap justify-between">
          
          {/* Logo and Social Media */}
          <div className="space-y-8 mr-6 w-full lg:w-1/4 mb-8">
            <span className="text-3xl font-bold text-white">Travel Smart</span>
            <p className="text-gray-400 text-base">
              Your AI-powered travel assistant for smart, personalized travel itineraries, packing, and expenses.
            </p>
            {/* <div className="flex space-x-6">
              <SocialIcon iconPath='/icons/x.svg' href="#" />
              <SocialIcon iconPath='/icons/facebook.svg' href="#" />
            </div> */}
          </div>

          {/* Services, Support, Company, and Legal */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
            <FooterSection
              title="Services"
              links={[
                { href: "/flights", label: "Flights" },
                { href: "/hotels", label: "Hotels" },
                { href: "/itineraries", label: "Itineraries" },
                { href: "/packing-assistant", label: "Packing Assistant" },
                { href: "/expense-tracker", label: "Expense Tracker" },
              ]}
            />
            <FooterSection
              title="Support"
              links={[
                { href: "/faq", label: "FAQ" },
                { href: "/help", label: "Help Center" },
                { href: "/contact", label: "Contact Us" },
                { href: "/feedback", label: "Feedback" },
              ]}
            />
            <FooterSection
              title="Company"
              links={[
                { href: "/about", label: "About" },
                { href: "/careers", label: "Careers" },
                { href: "/press", label: "Press" },
                { href: "/partners", label: "Partners" },
              ]}
            />
            <FooterSection
              title="Legal"
              links={[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/accessibility", label: "Accessibility" },
                { href: "/cookies", label: "Cookies Policy" },
              ]}
            />
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
          <div className="flex items-center">
            <Mail className="h-6 w-6 mr-3 text-gray-400" />
            <p>support@travelsmart.com</p>
          </div>
          <div className="flex items-center">
            <Phone className="h-6 w-6 mr-3 text-gray-400" />
            <p>+1 (123) 456-7890</p>
          </div>
          <div className="flex items-center">
            <MapPin className="h-6 w-6 mr-3 text-gray-400" />
            <p>123 Travel St., Travel City, USA</p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            © {new Date().getFullYear()} Travel Smart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
