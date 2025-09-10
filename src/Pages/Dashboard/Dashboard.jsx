import React, { useContext, useEffect, useState } from 'react';
import './Dashboard.css';
import Navbar from '../../Components/Navbar/Navbar';
import { PlusCircle, CreditCard, MapPin, Building, User, Phone, Calendar, X, CheckCircle, AlertCircle, Image } from 'lucide-react';
import { MemberContext } from '../../Context/MemberContext/MemContext';
import { ExecutiveContext } from '../../Context/Exec/ExecContext';
import { EventContext } from '../../Context/Event/EventContextProvider';
import { db } from '../../Firebase_config'; // adjust path to your firebase.js
import { collection, addDoc, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const { members, getMembers, setMembers } = useContext(MemberContext);
  const { executives, getExecutives, setExecutives } = useContext(ExecutiveContext);
  const { events, getEvents, setEvents } = useContext(EventContext);
  
  // Modal states
  const [memModal, setMemModal] = useState(false);
  const [execModal, setExecModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  
  // Form states
  const [memberForm, setMemberForm] = useState({
    sn: '',
    name: '',
    hotelName: '',
    address: '',
    digits: ''
  });
  
  const [executiveForm, setExecutiveForm] = useState({
    name: '',
    hotelName: '',
    phone: '',
    role: '',
    address: ''
  });
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: ''
  });
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: ''
  });
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getMembers();
    getExecutives();
    getEvents();
  }, []);

  // Notification helper
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
  };

  // Handlers
  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const handleExecutiveChange = (e) => {
    const { name, value } = e.target;
    setExecutiveForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  // Submissions
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const membersRef = collection(db, 'Members');

      await addDoc(membersRef, {
        sn: memberForm.sn,
        director: memberForm.name,
        hotelName: memberForm.hotelName,
        address: memberForm.address,
        phone: memberForm.digits,
      });

      const snapshot = await getDocs(membersRef);
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersData);

      setMemberForm({
        sn: '',
        name: '',
        hotelName: '',
        address: '',
        digits: ''
      });
      setMemModal(false);

      showNotification('success', 'Member added successfully!');
    } catch (error) {
      console.error("Error adding member:", error);
      showNotification('error', 'Failed to add member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleExecutiveSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    let base64Image = "";

    // Convert uploaded image to base64
    const fileInput = document.getElementById("exec-image");
    if (fileInput && fileInput.files[0]) {
      const file = fileInput.files[0];
      base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });
    }

    // Reference Executives collection
    const executivesRef = collection(db, "Executives");

    // Add new executive to Firestore
    await addDoc(executivesRef, {
    director: executiveForm.name,
    hotelName: executiveForm.hotelName,
    phone: executiveForm.phone,
    role: executiveForm.role,
    address: executiveForm.address,
    profileImage: base64Image || null, // ✅ matches ExecutiveCard
    createdAt: new Date()
  });


    // Fetch executives again
    const snapshot = await getDocs(executivesRef);
    const executivesData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setExecutives(executivesData);

    // Reset form
    setExecutiveForm({
      name: "",
      hotelName: "",
      phone: "",
      role: "",
      address: ""
    });

    // Close modal
    setExecModal(false);

    // Show success notification
    showNotification("success", "Executive added successfully!");
  } catch (error) {
    console.error("Error adding executive:", error);
    showNotification("error", "Failed to add executive. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  const handleEventSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    let base64Image = "";

    // Convert uploaded event image to base64
    const fileInput = document.getElementById("event-image");
    if (fileInput && fileInput.files[0]) {
      const file = fileInput.files[0];
      base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });
    }

    // Reference Events collection
    const eventsRef = collection(db, "Events");

    // Add new event to Firestore
    await addDoc(eventsRef, {
      title: eventForm.title,
      description: eventForm.description,
      imageUrl: base64Image || null, // ✅ event image stored as base64
      createdAt: new Date()
    });

    // Fetch events again
    const snapshot = await getDocs(eventsRef);
    const eventsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEvents(eventsData);

    // Reset form
    setEventForm({ title: "", description: "" });

    // Close modal
    setEventModal(false);

    // Success notification
    showNotification("success", "Event added successfully!");
  } catch (error) {
    console.error("Error adding event:", error);
    showNotification("error", "Failed to add event. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  // Close handlers
  const closeMemberModal = () => {
    setMemModal(false);
    setMemberForm({ sn: '', name: '', hotelName: '', address: '', digits: '' });
  };
  const closeExecutiveModal = () => {
    setExecModal(false);
    setExecutiveForm({ name: '', hotelName: '', phone: '', role: '', address: '' });
  };
  const closeEventModal = () => {
    setEventModal(false);
    setEventForm({ title: '', description: '' });
  };

  return (
    <div className='dash-wrapper'>
      <header><Navbar /></header>

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="notification-message">{notification.message}</div>
            <button className="notification-close" onClick={() => setNotification({ show: false, type: '', message: '' })}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <section className='dash-menu'>
        <div className="menu"><h2>Total Members</h2><p>{members.length}</p></div>
        <div className="menu"><h2>Total Executives</h2><p>{executives.length}</p></div>
        <div className="menu"><h2>Total Events</h2><p>{events.length}</p></div>
      </section>

      <section className="dash-actions">
        <div className="actions"><h2>Add Members</h2><PlusCircle size={30} className='icon' onClick={() => setMemModal(true)} /></div>
        <div className="actions"><h2>Add Executives</h2><PlusCircle size={30} className='icon' onClick={() => setExecModal(true)} /></div>
        <div className="actions"><h2>Add Events</h2><PlusCircle size={30} className='icon' onClick={() => setEventModal(true)} /></div>
      </section>

      {/* Member Modal */}
      {memModal && (
        <div className="modal-overlay" onClick={closeMemberModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMemberModal}><X size={20} /></button>
            <h2>ADD A NEW MEMBER</h2>
            <form onSubmit={handleMemberSubmit}>
              <label>
                <span>S/N *</span>
                <div className="input-wrapper">
                  <input type="text" name="sn" value={memberForm.sn} onChange={handleMemberChange} placeholder="Enter serial number" required />
                  <CreditCard size={15} className="in_icon" />
                </div>
              </label>

              <label>
                <span>Director Name *</span>
                <div className="input-wrapper">
                  <input type="text" name="name" value={memberForm.name} onChange={handleMemberChange} placeholder="Enter director's full name" required />
                  <User size={15} className="in_icon" />
                </div>
              </label>

              <label>
                <span>Hotel Name *</span>
                <div className="input-wrapper">
                  <input type="text" name="hotelName" value={memberForm.hotelName} onChange={handleMemberChange} placeholder="Enter hotel name" required />
                  <Building size={15} className="in_icon" />
                </div>
              </label>

              <label>
                <span>Address *</span>
                <div className="input-wrapper">
                  <input type="text" name="address" value={memberForm.address} onChange={handleMemberChange} placeholder="Enter complete address" required />
                  <MapPin size={15} className="in_icon" />
                </div>
              </label>

              <label>
                <span>Phone Number *</span>
                <div className="input-wrapper">
                  <input type="tel" name="digits" value={memberForm.digits} onChange={handleMemberChange} placeholder="Enter phone number" required />
                  <Phone size={15} className="in_icon" />
                </div>
              </label>

              <div className="modal-actions">
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Member'}</button>
                <button type="button" onClick={closeMemberModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Executive Modal */}
      {execModal && (
  <div className="modal-overlay" onClick={closeExecutiveModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={closeExecutiveModal}>
        <X size={20} />
      </button>
      <h2>ADD A NEW EXECUTIVE</h2>
      <form onSubmit={handleExecutiveSubmit}>
        <label htmlFor="exec-name">
          <span>Executive Name *</span>
          <div className="input-wrapper">
            <input
              type="text"
              name="name"
              id="exec-name"
              value={executiveForm.name}
              onChange={handleExecutiveChange}
              placeholder="Enter executive's full name"
              required
            />
            <User size={15} className="in_icon" />
          </div>
        </label>

        <label htmlFor="exec-hotelName">
          <span>Hotel Name *</span>
          <div className="input-wrapper">
            <input
              type="text"
              name="hotelName"
              id="exec-hotelName"
              value={executiveForm.hotelName}
              onChange={handleExecutiveChange}
              placeholder="Enter hotel name"
              required
            />
            <Building size={15} className="in_icon" />
          </div>
        </label>

        <label htmlFor="exec-phone">
          <span>Phone Number *</span>
          <div className="input-wrapper">
            <input
              type="tel"
              name="phone"
              id="exec-phone"
              value={executiveForm.phone}
              onChange={handleExecutiveChange}
              placeholder="Enter phone number"
              required
            />
            <Phone size={15} className="in_icon" />
          </div>
        </label>

        <label htmlFor="exec-role">
          <span>Role *</span>
          <div className="input-wrapper">
            <input
              type="text"
              name="role"
              id="exec-role"
              value={executiveForm.role}
              onChange={handleExecutiveChange}
              placeholder="Enter executive role"
              required
            />
            <CreditCard size={15} className="in_icon" />
          </div>
        </label>

        <label htmlFor="exec-address">
          <span>Address *</span>
          <div className="input-wrapper">
            <input
              type="text"
              name="address"
              id="exec-address"
              value={executiveForm.address}
              onChange={handleExecutiveChange}
              placeholder="Enter complete address"
              required
            />
            <MapPin size={15} className="in_icon" />
          </div>
        </label>

        {/* ✅ Profile Image field */}
        <label htmlFor="exec-image">
          <span>Profile Image</span>
          <div className="input-wrapper">
            <input
              type="file"
              name="image"
              id="exec-image"
              accept="image/*"
            />
            <Image size={15} className="in_icon" />
          </div>
        </label>

        <div className="modal-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Executive'}
          </button>
          <button type="button" onClick={closeExecutiveModal}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
      )}



      {/* Event Modal */}
      {eventModal && (
        <div className="modal-overlay" onClick={closeEventModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEventModal}>
              <X size={20} />
            </button>
            <h2>ADD A NEW EVENT</h2>
            <form onSubmit={handleEventSubmit}>
              <label htmlFor="event-title">
                <span>Event Title *</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="title"
                    id="event-title"
                    value={eventForm.title}
                    onChange={handleEventChange}
                    placeholder="Enter event title"
                    required
                  />
                  <Calendar size={15} className="in_icon" />
                </div>
              </label>

              <label htmlFor="event-description">
                <span>Description *</span>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="description"
                    id="event-description"
                    value={eventForm.description}
                    onChange={handleEventChange}
                    placeholder="Enter event description"
                    required
                  />
                  <User size={15} className="in_icon" />
                </div>
              </label>

              <label htmlFor="event-image">
                <span>Event Image</span>
                <div className="input-wrapper">
                  <input
                    type="file"
                    name="image"
                    id="event-image"
                    accept="image/*"
                  />
                  <Image size={15} className="in_icon" />
                </div>
              </label>

              <div className="modal-actions">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Event'}
                </button>
                <button type="button" onClick={closeEventModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
