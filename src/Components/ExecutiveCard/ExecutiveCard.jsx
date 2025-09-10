import { Edit, Trash2, User } from "lucide-react";

const ExecutiveCard = ({ executive, onDelete, onEdit }) => {
  return (
    <div className="executive-card">
      {executive.profileImage ? (
        <img
          src={
            executive.profileImage.startsWith("data:image")
              ? executive.profileImage // ✅ base64 image
              : executive.profileImage // ✅ normal URL/blob
          }
          alt={`${executive.director}'s profile`}
          className="executive-image"
        />
      ) : (
        <div className="executive-placeholder">
          <User size={40} />
        </div>
      )}

      <h3>{executive.director}</h3>
      <p><strong>Hotel:</strong> {executive.hotelName}</p>
      <p><strong>Address:</strong> {executive.address || "N/A"}</p>
      <p><strong>Phone:</strong> {executive.telephone || executive.phone || "N/A"}</p>
      <p><strong>Role:</strong> {executive.role}</p>

      <div className="card-actions">
        <button
          onClick={() => onEdit(executive)}
          className="edit-btn"
          aria-label={`Edit ${executive.director}`}
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(executive.id, executive.director)}
          className="delete-btn"
          aria-label={`Delete ${executive.director}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ExecutiveCard;