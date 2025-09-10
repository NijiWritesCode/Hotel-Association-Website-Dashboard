import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import { Calendar, FileText, Image, CheckCircle, XCircle, X, Trash2, Edit } from 'lucide-react';
import './EventManagement.css';
import { db } from '../../Firebase_config.jsx';
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ScrollRestoration } from 'react-router-dom';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="modal-confirm-btn">
            Confirm
          </button>
          <button onClick={onCancel} className="modal-cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const EventCard = ({ event, onDelete, onEdit }) => {
  return (
    <div className="event-card">
      {event.imageUrl && (
        <img
          src={event.imageUrl.startsWith("data:image") ? event.imageUrl : URL.createObjectURL(event.imageUrl)}
          alt={`${event.title} image`}
          className="event-image"
        />
      )}
      <h3>{event.title}</h3>
      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Created:</strong> {event.createdAt ? new Date(event.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
      <div className="card-actions">
        <button
          onClick={() => onEdit(event)}
          className="edit-btn"
          aria-label={`Edit ${event.title}`}
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(event.id, event.title)}
          className="delete-btn"
          aria-label={`Delete ${event.title}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};


const EventManagement = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    action: null,
    message: '',
    onConfirm: () => {},
  });

  const collectionRef = collection(db, 'Events');

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage({ file, url: imageUrl });
      console.log('EventManagement: Image selected', imageUrl);
    } else {
      setSelectedImage(null);
      console.log('EventManagement: No image selected');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const eventList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventList);
      setLoading(false);
      console.log('EventManagement: Fetched events', eventList);
    } catch (error) {
      console.error('EventManagement: Error fetching events:', error);
      setError('Failed to fetch events. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('EventManagement: Mounting component');
    fetchEvents();
    return () => console.log('EventManagement: Unmounting component');
  }, []);

  const addEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title || !formData.description) {
      showNotification('error', 'Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    const eventData = {
      title: formData.title,
      description: formData.description,
      imageUrl: selectedImage?.file ? await convertImageToBase64(selectedImage.file) : null,
    };

    if (editingId) {
      eventData.updatedAt = serverTimestamp();

      setModal({
        isOpen: true,
        action: 'update',
        message: `Are you sure you want to update the event "${formData.title}"?`,
        onConfirm: async () => {
          try {
            const docRef = doc(db, 'Events', editingId);
            await updateDoc(docRef, eventData);
            showNotification('success', 'Event updated successfully!');
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
            });
            setSelectedImage(null);
            scrollToTop();
            fetchEvents();
          } catch (error) {
            console.error('EventManagement: Error updating event:', error);
            showNotification('error', 'Failed to update event. Please try again.');
          } finally {
            setIsSubmitting(false);
            setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
          }
        },
      });
      setIsSubmitting(false);
    } else {
      eventData.createdAt = serverTimestamp();
      eventData.updatedAt = serverTimestamp();

      try {
        await addDoc(collectionRef, eventData);
        showNotification('success', 'Event added successfully!');
        setFormData({
          title: '',
          description: '',
        });
        setSelectedImage(null);
        scrollToTop();
        fetchEvents();
      } catch (error) {
        console.error('EventManagement: Error adding event:', error);
        showNotification('error', 'Failed to add event. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const deleteEvent = (id, title) => {
    setModal({
      isOpen: true,
      action: 'delete',
      message: `Are you sure you want to delete the event "${title}"?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'Events', id));
          showNotification('success', 'Event deleted successfully!');
          fetchEvents();
        } catch (error) {
          console.error('EventManagement: Error deleting event:', error);
          showNotification('error', 'Failed to delete event. Please try again.');
        } finally {
          setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
        }
      },
    });
  };

  const editEvent = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
    });
    setSelectedImage(event.imageUrl ? { url: event.imageUrl } : null);
    setEditingId(event.id);
    scrollToTop();
  };

  const closeModal = () => {
    setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="home">
        <div className="nav">
          <Navbar />
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              {notification.type === 'success' ? (
                <CheckCircle size={20} className="notification-icon" />
              ) : (
                <XCircle size={20} className="notification-icon" />
              )}
              <span className="notification-message">{notification.message}</span>
              <button
                className="notification-close"
                onClick={dismissNotification}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={modal.isOpen}
          onConfirm={modal.onConfirm}
          onCancel={closeModal}
          message={modal.message}
        />

        <div className="exec-form">
          <div className="exec-form-container">
            <h2>{editingId ? 'Edit Event' : 'Add a New Event'}</h2>

            <div className="exec-form-fields">
              <label htmlFor="title" className="form-label">
                <span>Event Title *</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="title"
                    className="input-field"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  <Calendar size={15} className="in_icon" />
                </div>
              </label>

              <label htmlFor="description" className="form-label">
                <span>Event Description *</span>
                <div className="input-wrapper">
                  <textarea
                    name="description"
                    className="input-field"
                    placeholder="Enter event description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  <FileText size={15} className="in_icon_t" />
                </div>
              </label>

              <label htmlFor="image" className="form-label">
                <span>Event Image</span>
                <div className="input-wrapper">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input-field"
                    disabled={isSubmitting}
                  />
                  <Image size={15} className="in_icon" />
                </div>
              </label>
            </div>

            {selectedImage && (
              <div className="image-preview">
                <span>Selected Image Preview</span>
                <img
                  src={selectedImage.url}
                  alt="Selected event image"
                  className="preview-image"
                />
              </div>
            )}

            <div className="btn">
              <button onClick={addEvent} className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update' : 'Add')}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setFormData({
                      title: '',
                      description: '',
                    });
                    setSelectedImage(null);
                    setEditingId(null);
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="event-display">
          <h2>Event List</h2>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <div className="event-list">
              {events.slice(0, 20).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={deleteEvent}
                  onEdit={editEvent}
                />
              ))}
            </div>
          )}
        </div>
        <ScrollRestoration />
      </div>
    </>
  );
};

export default EventManagement;