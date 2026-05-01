import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsAPI } from '../../services/api';
import EventCard from '../../components/events/EventCard';
import Spinner from '../../components/common/Spinner';
import { useDebounce } from '../../hooks/useHooks';

const CATEGORIES = ['', 'conference', 'concert', 'workshop', 'sports', 'exhibition', 'festival', 'networking', 'other'];

const EventsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data } = await eventsAPI.getAll({ search: debouncedSearch, category, page, limit: 12 });
        setEvents(data.events);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    setSearchParams({ ...(debouncedSearch && { search: debouncedSearch }), ...(category && { category }) });
  }, [debouncedSearch, category, page]);

  return (
    <div className="events-list-page">
      <div className="events-list-header">
        <div className="container">
          <h1>Browse Events</h1>
          <p>{total} events found</p>
          <div className="events-filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                placeholder="Search events, cities..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              {search && <button className="search-clear" onClick={() => setSearch('')}>×</button>}
            </div>
            <div className="filter-tabs">
              {CATEGORIES.map(c => (
                <button
                  key={c || 'all'}
                  className={`filter-tab ${category === c ? 'active' : ''}`}
                  onClick={() => { setCategory(c); setPage(1); }}
                >
                  {c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="events-loading"><Spinner /></div>
        ) : events.length === 0 ? (
          <div className="events-empty">
            <div className="empty-icon">🔍</div>
            <h3>No events found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setCategory(''); }}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="events-grid">
              {events.map(event => <EventCard key={event._id} event={event} />)}
            </div>
            {pages > 1 && (
              <div className="pagination">
                <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <div className="page-numbers">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                </div>
                <button className="btn btn-ghost" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventsList;
