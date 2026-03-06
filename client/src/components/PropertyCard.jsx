import React from 'react';
import './PropertyCard.css';

const PropertyCard = ({ property, selected, onSelect, onDelete }) => {
    const priceFormatted = property.price >= 10000000
        ? `₹${(property.price / 10000000).toFixed(2)} Cr`
        : property.price >= 100000
            ? `₹${(property.price / 100000).toFixed(2)} Lac`
            : `₹${property.price.toLocaleString('en-IN')}`;

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
            <div className="property-card-body">
                <div className="property-card-top">
                    <span className="property-type-badge">{property.type}</span>
                    <span className={`property-status ${statusClass}`}>{property.status}</span>
                </div>
                <h3 className="property-title">{property.title}</h3>
                <p className="property-location">📍 {property.location.neighborhood}, {property.location.city}</p>
                <div className="property-details">
                    <div className="detail-item">
                        <span className="detail-label">Price</span>
                        <span className="detail-value price">{priceFormatted}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Carpet Area</span>
                        <span className="detail-value">{property.carpetArea} sq.ft</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Type</span>
                        <span className="detail-value">{property.transactionType}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Furnishing</span>
                        <span className="detail-value">{property.furnishing}</span>
                    </div>
                </div>
                {property.floor && (
                    <p className="property-floor">🏢 Floor {property.floor}/{property.totalFloors || '-'}</p>
                )}
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
