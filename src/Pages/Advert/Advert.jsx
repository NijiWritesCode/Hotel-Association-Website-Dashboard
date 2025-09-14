import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import { Calendar, FileText, Image, CheckCircle, XCircle, X, Trash2, Edit2 } from 'lucide-react';
import './Advert.css';
import { db } from '../../Firebase_config';
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

const AdCard = ({ ad, onDelete, onChangeAd }) => {
  return (
    <div className="ad-card">
      {ad.imageUrl && (
        <img
          src={ad.imageUrl}
          alt={`${ad.title} image`}
          className="ad-image"
        />
      )}
      <h3>{ad.title}</h3>
      <p><strong>Description:</strong> {ad.description}</p>
      {ad.eventDate && <p><strong>Event Date:</strong> {new Date(ad.eventDate).toLocaleDateString()}</p>}
      <p><strong>Created:</strong> {ad.createdAt ? new Date(ad.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
      <div className="card-actions">
        <button
          onClick={() => onChangeAd(ad)}
          className="change-ad-btn"
          aria-label={`Change ${ad.title}`}
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(ad.id, ad.title)}
          className="delete-btn"
          aria-label={`Delete ${ad.title}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const Advert = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    action: null,
    message: '',
    onConfirm: () => {},
  });

  const collectionRef = collection(db, 'Advertisements');

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
    } else {
      setSelectedImage(null);
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

  const fetchAds = async () => {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const adList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAds(adList);
      setLoading(false);
    } catch (error) {
      showNotification('error', 'Failed to fetch advertisements. Please try again.');
      setError('Failed to fetch advertisements. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    return () => {
      if (selectedImage?.url) URL.revokeObjectURL(selectedImage.url);
    };
  }, []);

  const addAd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.title || !formData.description) {
      showNotification('error', 'Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const adData = {
      title: formData.title,
      description: formData.description,
      eventDate: formData.eventDate || null,
      imageUrl: selectedImage?.file ? await convertImageToBase64(selectedImage.file) : null,
    };

    try {
      const querySnapshot = await getDocs(collectionRef);
      if (!editingId && querySnapshot.size > 0) {
        showNotification('error', 'Only one advertisement can be added. Please delete or change the existing ad.');
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        adData.updatedAt = serverTimestamp();

        setModal({
          isOpen: true,
          action: 'update',
          message: `Are you sure you want to update the advertisement "${formData.title}"?`,
          onConfirm: async () => {
            try {
              const docRef = doc(db, 'Advertisements', editingId);
              await updateDoc(docRef, adData);
              showNotification('success', 'Advertisement updated successfully!');
              setEditingId(null);
              setFormData({
                title: '',
                description: '',
                eventDate: '',
              });
              setSelectedImage(null);
              scrollToTop();
              fetchAds();
            } catch (error) {
              showNotification('error', 'Failed to update advertisement: ' + error.message);
            } finally {
              setIsSubmitting(false);
              setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
            }
          },
        });
        setIsSubmitting(false);
      } else {
        adData.createdAt = serverTimestamp();
        adData.updatedAt = serverTimestamp();

        try {
          await addDoc(collectionRef, adData);
          showNotification('success', 'Advertisement added successfully!');
          setFormData({
            title: '',
            description: '',
            eventDate: '',
          });
          setSelectedImage(null);
          scrollToTop();
          fetchAds();
        } catch (error) {
          showNotification('error', 'Failed to add advertisement: ' + error.message);
        } finally {
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      showNotification('error', 'Failed to process advertisement: ' + error.message);
      setIsSubmitting(false);
    }
  };

  const deleteAd = (id, title) => {
    setModal({
      isOpen: true,
      action: 'delete',
      message: `Are you sure you want to delete the advertisement "${title}"?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'Advertisements', id));
          showNotification('success', 'Advertisement deleted successfully!');
          fetchAds();
        } catch (error) {
          showNotification('error', 'Failed to delete advertisement: ' + error.message);
        } finally {
          setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
        }
      },
    });
  };

  const changeAd = (ad) => {
    setFormData({
      title: ad.title,
      description: ad.description,
      eventDate: ad.eventDate || '',
    });
    setSelectedImage(ad.imageUrl ? { url: ad.imageUrl } : null);
    setEditingId(ad.id);
    scrollToTop();
  };

  const closeModal = () => {
    setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="advert">
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

        {/* ✅ Form only shows when ads.length === 0 */}
        {ads.length === 0 && (
          <div className="ad-form">
            <div className="ad-form-container">
              <h2>{editingId ? 'Change Advertisement' : 'Add a New Advertisement'}</h2>

              <div className="ad-form-fields">
                <label htmlFor="title" className="form-label">
                  <span>Advertisement Title *</span>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="title"
                      className="input-field"
                      placeholder="Enter advertisement title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                    <Calendar size={15} className="in_icon" />
                  </div>
                </label>

                <label htmlFor="description" className="form-label">
                  <span>Advertisement Description *</span>
                  <div className="input-wrapper">
                    <textarea
                      name="description"
                      className="input-field"
                      placeholder="Enter advertisement description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                    <FileText size={15} className="in_icon_t" />
                  </div>
                </label>

                <label htmlFor="image" className="form-label">
                  <span>Advertisement Image</span>
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

                <label htmlFor="eventDate" className="form-label">
                  <span>Event Date (Optional)</span>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="eventDate"
                      className="input-field"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <Calendar size={15} className="in_icon" />
                  </div>
                </label>
              </div>

              {selectedImage && (
                <div className="image-preview">
                  <span>Selected Image Preview</span>
                  <img
                    src={selectedImage.url}
                    alt="Selected advertisement image"
                    className="preview-image"
                  />
                </div>
              )}

              <div className="btn">
                <button onClick={addAd} className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update' : 'Add')}
                </button>
                {editingId && (
                  <button
                    onClick={() => {
                      setFormData({
                        title: '',
                        description: '',
                        eventDate: '',
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
        )}

        <div className="ad-display">
          <h2>Advertisement</h2>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>{error}</div>
          ) : ads.length === 0 ? (
            <p>No advertisement found.</p>
          ) : (
            <div className="ad-list">
              {ads.slice(0, 1).map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  onDelete={deleteAd}
                  onChangeAd={changeAd}
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

export default Advert;