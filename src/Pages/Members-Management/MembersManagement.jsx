import React, { useEffect, useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import HotelCard from '../../Components/MembersCard/MemCard';
import './MembersManagement.css';
import { ArrowRight, IdCard, CheckCircle, XCircle, X, Search } from 'lucide-react';
import { ScrollRestoration } from 'react-router-dom';
import { User, Hotel, Mail, Phone } from 'lucide-react';
import { db } from '../../Firebase_config.jsx';
import { addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const MembersManagement = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(21);
  const [showWarning, setShowWarning] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sn: '',
    name: '',
    hotelName: '',
    address: '',
    digits: ''
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMemberId, setEditMemberId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    sn: '',
    name: '',
    hotelName: '',
    address: '',
    digits: ''
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState(null);

  const collectionRef = collection(db, 'Members');

  // --- Defensive getBadge
  const getBadge = (hotelName) => {
    const hn = (hotelName || '').toUpperCase();
    if (!hn) return 'Hotel';
    if (hn.includes("INT'L") || hn.includes('INTERNATIONAL')) return 'International';
    if (hn.includes('SUITE')) return 'Suites';
    if (hn.includes('GUEST HOUSE')) return 'Guest House';
    if (hn.includes('HOTEL & EVENT')) return 'Events';
    if (hn.includes('LOUNGE') || hn.includes('BAR')) return 'Lounge & Bar';
    return 'Hotel';
  };

  // --- Robust search that checks multiple fields and always uses strings
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setVisibleCount(21); // Reset visible count when searching
    setShowWarning(false);

    const trimmed = (searchValue || '').trim();
    if (!trimmed) {
      setFilteredMembers(members);
      return;
    }
    const searchLower = trimmed.toLowerCase();

    const filtered = members.filter((member) => {
      const sn = String(member.sn || '').toLowerCase();
      const director = String(member.director || member.name || '').toLowerCase();
      const address = String(member.address || '').toLowerCase();
      const hotel = String(member.hotelName || '').toLowerCase();
      const phone = String(member.telephone || member.phone || member.digits || '').toLowerCase();

      return (
        sn.includes(searchLower) ||
        director.includes(searchLower) ||
        address.includes(searchLower) ||
        hotel.includes(searchLower) ||
        phone.includes(searchLower)
      );
    });

    setFilteredMembers(filtered);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    handleSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredMembers(members);
    setVisibleCount(21);
    setShowWarning(false);
  };

  const handleSeeMore = () => {
    const currentMembers = searchTerm ? filteredMembers : members;
    if (visibleCount >= currentMembers.length) {
      setShowWarning(true);
    } else {
      setVisibleCount((prevCount) => prevCount + 21);
      setShowWarning(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
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
      behavior: 'smooth'
    });
  };

  const addMembers = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.sn || !formData.name || !formData.hotelName || !formData.address || !formData.digits) {
      showNotification('error', 'Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const memberData = {
        sn: formData.sn,
        hotelName: formData.hotelName,
        director: formData.name,
        address: formData.address,
        telephone: formData.digits
      };

      await addDoc(collectionRef, memberData);

      setFormData({
        sn: '',
        name: '',
        hotelName: '',
        address: '',
        digits: ''
      });

      const data = await getDocs(collectionRef);
      const membersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const sortedMembers = membersData.sort((a, b) => (a.sn || '').localeCompare(b.sn || ''));
      setMembers(sortedMembers);

      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        setFilteredMembers(sortedMembers);
      }

      showNotification('success', 'Member added successfully!');
      scrollToTop();
    } catch (error) {
      console.error('Error adding member:', error);
      showNotification('error', 'Failed to add member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmDelete = (id) => {
    setDeleteMemberId(id);
    setConfirmDeleteOpen(true);
  };

  const deleteMember = async () => {
    try {
      if (!deleteMemberId) return;
      const memberDoc = doc(db, 'Members', deleteMemberId);
      await deleteDoc(memberDoc);

      const updatedMembers = members.filter(member => member.id !== deleteMemberId);
      setMembers(updatedMembers);

      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        setFilteredMembers(updatedMembers);
      }

      showNotification('success', 'Member deleted successfully!');
      setConfirmDeleteOpen(false);
      setDeleteMemberId(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      showNotification('error', 'Failed to delete member. Please try again.');
    }
  };

  const openEditModal = (member) => {
    setEditMemberId(member.id);
    setEditFormData({
      sn: member.sn,
      name: member.director,
      hotelName: member.hotelName,
      address: member.address,
      digits: member.telephone || member.digits || member.phone || ''
    });
    setEditModalOpen(true);
  };

  const updateMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!editFormData.sn || !editFormData.name || !editFormData.hotelName || !editFormData.address || !editFormData.digits) {
      showNotification('error', 'Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const memberDoc = doc(db, 'Members', editMemberId);
      await updateDoc(memberDoc, {
        sn: editFormData.sn,
        hotelName: editFormData.hotelName,
        director: editFormData.name,
        address: editFormData.address,
        telephone: editFormData.digits
      });

      const data = await getDocs(collectionRef);
      const membersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const sortedMembers = membersData.sort((a, b) => (a.sn || '').localeCompare(b.sn || ''));
      setMembers(sortedMembers);

      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        setFilteredMembers(sortedMembers);
      }

      setEditModalOpen(false);
      setEditMemberId(null);
      setEditFormData({
        sn: '',
        name: '',
        hotelName: '',
        address: '',
        digits: ''
      });
      showNotification('success', 'Member updated successfully!');
    } catch (error) {
      console.error('Error updating member:', error);
      showNotification('error', 'Failed to update member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const getMembers = async () => {
      try {
        const data = await getDocs(collectionRef);
        const membersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const sortedMembers = membersData.sort((a, b) => (a.sn || '').localeCompare(b.sn || ''));
        setMembers(sortedMembers);
        setFilteredMembers(sortedMembers);
      } catch (err) {
        console.error('Error fetching members:', err);
        showNotification('error', 'Failed to fetch members.');
      }
    };

    getMembers();
  }, []);

  const membersToDisplay = searchTerm ? filteredMembers : members;

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

      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setEditModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <h2>Edit Member</h2>
            <form onSubmit={updateMember}>
              <label htmlFor="edit-sn">
                <span>S/N *</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="sn"
                    id="edit-sn"
                    value={editFormData.sn}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Enter serial number"
                  />
                  <IdCard size={15} className="in_icon" />
                </div>
              </label>
              <label htmlFor="edit-name">
                <span>Director Name *</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    id="edit-name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Enter director name"
                  />
                  <User size={15} className="in_icon" />
                </div>
              </label>
              <label htmlFor="edit-hotelName">
                <span>Hotel Name *</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="hotelName"
                    id="edit-hotelName"
                    value={editFormData.hotelName}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Enter hotel name"
                  />
                  <Hotel size={15} className="in_icon" />
                </div>
              </label>
              <label htmlFor="edit-address">
                <span>Address *</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="address"
                    id="edit-address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Enter address"
                  />
                  <Mail size={15} className="in_icon" />
                </div>
              </label>
              <label htmlFor="edit-digits">
                <span>Phone Number *</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="digits"
                    id="edit-digits"
                    value={editFormData.digits}
                    onChange={handleEditInputChange}
                    required
                    placeholder="Enter phone number"
                  />
                  <Phone size={15} className="in_icon" />
                </div>
              </label>
              <div className="modal-actions">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setConfirmDeleteOpen(false)}
              aria-label="Close confirmation modal"
            >
              <X size={20} />
            </button>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this member? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={deleteMember}
                disabled={isSubmitting}
                className="confirm-delete-button"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmDeleteOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="exec-form">
        <form onSubmit={addMembers}>
          <h2>ADD A NEW MEMBER</h2>
          <label htmlFor="sn">
            S/N *
            <div>
              <input
                type="text"
                name="sn"
                id="sn"
                value={formData.sn}
                onChange={handleInputChange}
                required
              />
              <IdCard size={15} className="in_icon" />
            </div>
          </label>
          <label htmlFor="name">
            Director Name *
            <div>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <User size={15} className="in_icon" />
            </div>
          </label>
          <label htmlFor="hotelName">
            Hotel Name *
            <div>
              <input
                type="text"
                name="hotelName"
                id="hotelName"
                value={formData.hotelName}
                onChange={handleInputChange}
                required
              />
              <Hotel size={15} className="in_icon" />
            </div>
          </label>
          <label htmlFor="address">
            Address *
            <div>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              <Mail size={15} className="in_icon" />
            </div>
          </label>
          <label htmlFor="digits">
            Phone Number *
            <div>
              <input
                type="text"
                name="digits"
                id="digits"
                value={formData.digits}
                onChange={handleInputChange}
                required
              />
              <Phone size={15} className="in_icon" />
            </div>
          </label>
          <div className="btn">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      <div className="header">
        <h1>Member List</h1>
        <div className="search-container">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search by name, hotel, address, phone or S/N..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="search-input"
              />
              <Search size={18} className="search-icon" />
            </div>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="clear-search"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="search-results">
              Found {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          )}
        </div>
      </div>

      <article>
        {membersToDisplay.slice(0, visibleCount).map((member) => (
          <HotelCard
            key={member.id}
            badge={getBadge(member.hotelName || '')}
            sn={member.sn}
            hotel_name={member.hotelName}
            director={member.director}
            address={member.address}
            contact={member.telephone || member.phone || member.digits || ''}
            onEdit={() => openEditModal(member)}
            onDelete={() => openConfirmDelete(member.id)}
          />
        ))}
        {membersToDisplay.length > visibleCount && (
          <button onClick={handleSeeMore}>
            See More
            <ArrowRight className="arrow" />
          </button>
        )}
        {showWarning && (
          <p className="warning">No more members to display.</p>
        )}
        {searchTerm && filteredMembers.length === 0 && (
          <p className="no-results">No members found matching your search.</p>
        )}
      </article>

      <ScrollRestoration />
    </>
  );
};

export default MembersManagement;
