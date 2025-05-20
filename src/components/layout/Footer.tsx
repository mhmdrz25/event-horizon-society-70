
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white pt-12 pb-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gold">ScienceHub</h3>
            <p className="text-navy-foreground">
              University Scientific Association platform for sharing knowledge, 
              announcing events, and connecting with fellow scientists.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/announcements" className="hover:text-gold transition-colors">Announcements</Link></li>
              <li><Link to="/events" className="hover:text-gold transition-colors">Events</Link></li>
              <li><Link to="/submission" className="hover:text-gold transition-colors">Submit Article</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 text-gold">Contact</h4>
            <address className="not-italic">
              <p>University Science Department</p>
              <p>Email: contact@sciencehub.edu</p>
              <p>Phone: +1 (555) 123-4567</p>
            </address>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-navy-foreground/80">
          <p>&copy; {new Date().getFullYear()} ScienceHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
