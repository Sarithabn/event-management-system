import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <Link to="/" className="footer-logo">
          <span className="logo-icon">◈</span> EventSphere
        </Link>
        <p>The complete event management platform for organizers and attendees.</p>
      </div>
      <div className="footer-links">
        <div className="footer-col">
          <h4>Platform</h4>
          <Link to="/events">Browse Events</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/register?role=organizer">Become Organizer</Link>
        </div>
        <div className="footer-col">
          <h4>Categories</h4>
          <Link to="/events?category=conference">Conferences</Link>
          <Link to="/events?category=concert">Concerts</Link>
          <Link to="/events?category=workshop">Workshops</Link>
          <Link to="/events?category=festival">Festivals</Link>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} EventSphere. Built with ❤️ for event lovers.</p>
    </div>
  </footer>
);

export default Footer;
