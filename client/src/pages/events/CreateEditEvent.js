import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import EventForm from '../../components/events/EventForm';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';

const CreateEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: notifError } = useNotif();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!id);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      eventsAPI.getOne(id).then(({ data }) => { setEvent(data.event); setFetchLoading(false); }).catch(() => navigate('/organizer/events'));
    }
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (isEdit) {
        await eventsAPI.update(id, formData);
        success('Event updated successfully!');
        navigate(`/organizer/events/${id}/edit`);
      } else {
        const { data } = await eventsAPI.create(formData);
        success('Event created! Now add tickets.');
        navigate(`/organizer/events/${data.event._id}/tickets`);
      }
    } catch (err) {
      notifError(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <DashboardLayout><Spinner fullPage /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>{isEdit ? '✏️ Edit Event' : '➕ Create New Event'}</h1>
            <p>{isEdit ? 'Update your event details' : 'Fill in the details for your event'}</p>
          </div>
        </div>
        <div className="form-page-wrapper">
          <EventForm initial={event || {}} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateEditEvent;
