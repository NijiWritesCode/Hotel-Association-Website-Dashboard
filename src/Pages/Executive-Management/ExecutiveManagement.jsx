import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import { User, Workflow, Hotel, Phone, Image, CheckCircle, XCircle, X, MapPin, Trash2, Edit } from 'lucide-react';
import './ExecutiveManagemen.css';
import { db } from '../../Firebase_config';
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ScrollRestoration } from 'react-router-dom';
import ExecutiveCard from '../../Components/ExecutiveCard/ExecutiveCard';

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

const ExecutiveManagement = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    hotelName: '',
    phone: '',
    role: '',
    address: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    action: null,
    message: '',
    onConfirm: () => {},
  });

  const collectionRef = collection(db, 'Executives');

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
    convertImageToBase64(file).then((base64) => {
      setSelectedImage({ base64, url: base64, file }); // store base64
    });
  }
}

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

  const fetchExecutives = async () => {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const executiveList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExecutives(executiveList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching executives:', error);
      setError('Failed to fetch executives. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, []);

  const addExecutive = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  if (!formData.name || !formData.hotelName || !formData.phone || !formData.role || !formData.address) {
    showNotification('error', 'Please fill in all required fields');
    setIsSubmitting(false);
    return;
  }

  // ✅ always use base64 for Firestore
  let imageBase64 = selectedImage?.base64 || null;

  const executiveData = {
    director: formData.name, // normalize under "director"
    hotelName: formData.hotelName,
    telephone: formData.phone,
    role: formData.role,
    address: formData.address,
    profileImage: imageBase64,
  };

  if (editingId) {
    executiveData.updatedAt = serverTimestamp();

    setModal({
      isOpen: true,
      action: 'update',
      message: `Are you sure you want to update ${formData.name}'s details?`,
      onConfirm: async () => {
        try {
          const docRef = doc(db, 'Executives', editingId);
          await updateDoc(docRef, executiveData);
          showNotification('success', 'Executive updated successfully!');
          setEditingId(null);
          setFormData({ name: '', hotelName: '', phone: '', role: '', address: '' });
          setSelectedImage(null);
          scrollToTop();
          fetchExecutives();
        } catch (error) {
          console.error('Error updating executive:', error);
          showNotification('error', 'Failed to update executive. Please try again.');
        } finally {
          setIsSubmitting(false);
          setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
        }
      },
    });
    setIsSubmitting(false);
  } else {
    executiveData.createdAt = serverTimestamp();
    executiveData.updatedAt = serverTimestamp();

    try {
      await addDoc(collectionRef, executiveData);
      showNotification('success', 'Executive added successfully!');
      setFormData({ name: '', hotelName: '', phone: '', role: '', address: '' });
      setSelectedImage(null);
      scrollToTop();
      fetchExecutives();
    } catch (error) {
      console.error('Error adding executive:', error);
      showNotification('error', 'Failed to add executive. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  };

  const deleteExecutive = (id, director) => {
  setModal({
    isOpen: true,
    action: 'delete',
    message: `Are you sure you want to delete ${director}?`,
    onConfirm: async () => {
      try {
        await deleteDoc(doc(db, 'Executives', id));
        showNotification('success', 'Executive deleted successfully!');
        fetchExecutives();
      } catch (error) {
        console.error('Error deleting executive:', error);
        showNotification('error', 'Failed to delete executive. Please try again.');
      } finally {
        setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
      }
    },
  });
  };

  const editExecutive = (executive) => {
    setFormData({
      name: executive.director,
      hotelName: executive.hotelName,
      phone: executive.telephone || executive.phone || '',
      role: executive.role,
      address: executive.address || '',
    });
    setSelectedImage(
      executive.profileImage ? { url: executive.profileImage, file: null } : null
    );
    setEditingId(executive.id);
    scrollToTop();
  };

  const closeModal = () => {
    setModal({ isOpen: false, action: null, message: '', onConfirm: () => {} });
    setIsSubmitting(false);
  };

  return (
    <>
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
          <h2>{editingId ? 'Edit Executive' : 'Add a New Executive'}</h2>

          <div className="exec-form-fields">
            <label htmlFor="name" className="form-label">
              <span>Director Name *</span>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <User size={15} className="in_icon" />
              </div>
            </label>

            <label htmlFor="hotel-name" className="form-label">
              <span>Hotel Name *</span>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="hotelName"
                  className="input-field"
                  placeholder="Enter hotel name"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                  required
                />
                <Hotel size={15} className="in_icon" />
              </div>
            </label>

            <label htmlFor="address" className="form-label">
              <span>Address *</span>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="address"
                  className="input-field"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
                <MapPin size={15} className="in_icon" />
              </div>
            </label>

            <label htmlFor="digits" className="form-label">
              <span>Phone Number *</span>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="phone"
                  className="input-field"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
                <Phone size={15} className="in_icon" />
              </div>
            </label>

            <label htmlFor="role" className="form-label">
              <span>Role *</span>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="role"
                  className="input-field"
                  placeholder="Enter role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                />
                <Workflow size={15} className="in_icon" />
              </div>
            </label>

            <label htmlFor="image" className="form-label">
              <span>Profile Image</span>
              <div className="input-wrapper">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-field"
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
                alt="Selected profile"
                className="preview-image"
              />
            </div>
          )}

          <div className="btn">
            <button onClick={addExecutive} className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update' : 'Add')}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setFormData({
                    name: '',
                    hotelName: '',
                    phone: '',
                    role: '',
                    address: '',
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

      <div className="executive-display">
        <h2>Executive List</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : executives.length === 0 ? (
          <p>No executives found.</p>
        ) : (
          <div className="executive-list">
            {executives.slice(0, 20).map((executive) => (
              <ExecutiveCard
                key={executive.id}
                executive={executive}
                onDelete={deleteExecutive}
                onEdit={editExecutive}
              />
            ))}
          </div>
        )}
      </div>
      <ScrollRestoration />
    </>
  );
};

export default ExecutiveManagement;