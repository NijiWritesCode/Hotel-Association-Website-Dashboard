import React from 'react';
import './MemCard.css';

const HotelCard = ({ badge, sn, hotel_name, director, address, contact, onEdit, onDelete }) => {
  return (
    <div className="hotel-card">
      <div className="card-header">
        <span className="hotel-badge">{badge}</span>
        <span className="serial-number">{sn}</span>
      </div>
      <h2 className="hotel-name">{hotel_name}</h2>
      <div className="director-info">
        <span className="director-label">Director:</span>
        <span className="director-name">{director}</span>
      </div>
      <div className="location">
        <span className="location-icon">📍</span>
        <span className="address">{address}</span>
      </div>
      <div className="contact">
        <span className="contact-label">Contact</span>
        <div className="phone">
          <span className="phone-icon">📞</span>
          <span className="phone-number">
            <a href={`tel:${contact}`}>{contact}</a>
          </span>
        </div>
      </div>
      <div className="card-actions">
        <button className="edit-button" onClick={onEdit}>✏️</button>
        <button className="delete-button" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  );
};

export default HotelCard;