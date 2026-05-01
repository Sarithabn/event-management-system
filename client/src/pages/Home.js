import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from './../services/api';
import EventCard from './../components/events/EventCard';
import Spinner from './../components/common/Spinner';

const CATEGORIES = ['conference', 'concert', 'workshop', 'sports', 'exhibition', 'festival', 'networking'];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, recentRes] = await Promise.all([
          eventsAPI.getFeatured(),
          eventsAPI.getAll({ limit: 8, status: 'published' })
        ]);
        setFeatured(featuredRes.data.events);
        setRecent(recentRes.data.events);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/events?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🌐 The Event Platform</div>
          <h1 className="hero-title">
            Discover &amp; Book<br />
            <span className="hero-title-accent">Extraordinary Events</span>
          </h1>
          <p className="hero-subtitle">
            From intimate workshops to massive festivals — find, book, and manage events all in one place.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search events, cities, categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>
          <div className="hero-cats">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/events?category=${cat}`} className="hero-cat-chip">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item"><span className="stat-num">10K+</span><span className="stat-label">Events Hosted</span></div>
          <div className="stat-item"><span className="stat-num">500K+</span><span className="stat-label">Tickets Sold</span></div>
          <div className="stat-item"><span className="stat-num">1200+</span><span className="stat-label">Organizers</span></div>
          <div className="stat-item"><span className="stat-num">98%</span><span className="stat-label">Satisfaction</span></div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">⭐ Featured Events</h2>
              <p className="section-sub">Hand-picked by our team</p>
            </div>
            <Link to="/events" className="btn btn-outline">View All</Link>
          </div>
          {loading ? <Spinner /> : (
            <div className="events-grid">
              {featured.map(ev => <EventCard key={ev._id} event={ev} />)}
            </div>
          )}
        </section>
      )}

      {/* Recent */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">🗓️ Upcoming Events</h2>
            <p className="section-sub">Don't miss what's happening</p>
          </div>
          <Link to="/events" className="btn btn-outline">Browse All</Link>
        </div>
        {loading ? <Spinner /> : recent.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🎭</p>
            <h3>No events yet</h3>
            <p>Check back soon or create your own event!</p>
            <Link to="/register?role=organizer" className="btn btn-primary">Become an Organizer</Link>
          </div>
        ) : (
          <div className="events-grid">
            {recent.map(ev => <EventCard key={ev._id} event={ev} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to host your own event?</h2>
          <p>Join thousands of organizers who trust EventSphere to manage their events from start to finish.</p>
          <div className="cta-buttons">
            <Link to="/register?role=organizer" className="btn btn-primary btn-lg">Start as Organizer</Link>
            <Link to="/events" className="btn btn-ghost btn-lg">Explore Events</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
