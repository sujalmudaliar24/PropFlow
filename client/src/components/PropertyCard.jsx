import React from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property, selected, onSelect, onDelete }) => {
    const isRent = property.transactionType === 'Rent';
    const price = isRent ? property.pricing?.rentAmount : property.pricing?.cost;

    const priceFormatted = price >= 10000000
        ? `₹${(price / 10000000).toFixed(2)} Cr`
        : price >= 100000
            ? `₹${(price / 100000).toFixed(2)} Lac`
            : `₹${price?.toLocaleString('en-IN') || 'N/A'}`;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const apiBase = import.meta.env.VITE_API_BASE_URL || apiUrl.replace(/\/api\/?$/, '');
    
    const imageUrl = property.images && property.images.length > 0
        ? `${apiBase}${property.images[0]}`
        : 'https://via.placeholder.com/400x300?text=No+Image';

    const statusClass = {
        Available: 'status-available',
        Sold: 'status-sold',
        Rented: 'status-rented',
        'Under Negotiation': 'status-negotiation',
    }[property.status] || '';

    return (
        <div className={`property-card ${selected ? 'property-card-selected' : ''}`}>
            {onSelect && (
                <div className="property-select" onClick={() => onSelect(property._id)}>
                    <div className={`select-checkbox ${selected ? 'checked' : ''}`}>
                        {selected && '✓'}
                    </div>
                </div>
            )}
            <div className="property-image">
                <img src={imageUrl} alt={property.location?.society} />
                <div className="property-type-tag">{property.subType}</div>
            </div>
            <div className="property-card-body">
                <div className="property-card-top">
                    <span className={`property-status ${statusClass}`}>{property.status}</span>
                    <span className="property-transaction-badge">{property.transactionType}</span>
                </div>
                <h3 className="property-title">{property.location?.society || 'Residential Property'}</h3>
                <p className="property-location">📍 {property.location?.area}, {property.location?.city}</p>
                <div className="property-details">
                    <div className="detail-item">
                        <span className="detail-label">{isRent ? 'Rent' : 'Cost'}</span>
                        <span className="detail-value price">{priceFormatted}{isRent && '/m'}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Carpet Area</span>
                        <span className="detail-value">{property.specifications?.carpetArea} sq.ft</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">BHK</span>
                        <span className="detail-value">{property.specifications?.bedrooms} BHK</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Floor</span>
                        <span className="detail-value">{property.specifications?.floorNumber}/{property.specifications?.totalFloors}</span>
                    </div>
                </div>
            </div>
            {onDelete && (
                <div className="property-card-actions">
                    <button className="btn-delete" onClick={() => onDelete(property._id)}>Delete</button>
                </div>
            )}
        </div>
    );
};

export default PropertyCard;
