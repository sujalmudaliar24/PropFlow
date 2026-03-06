import React, { useState, useEffect, useCallback } from 'react';
import { searchProperties, deleteProperty, shareProperties } from '../services/api';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import './Inventory.css';

const PROPERTY_TYPES = ['All', '1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Penthouse', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop'];
const TRANSACTION_TYPES = ['All', 'Sale', 'Rent', 'Lease'];
const FURNISHING_OPTIONS = ['All', 'Unfurnished', 'Semi-Furnished', 'Fully-Furnished'];

const Inventory = () => {
    const [properties, setProperties] = useState([]);
    const [totalProperties, setTotalProperties] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareForm, setShareForm] = useState({ clientName: '', clientPhone: '' });
    const [shareResult, setShareResult] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        q: '',
        type: 'All',
        transactionType: 'All',
        furnishing: 'All',
        minPrice: '',
        maxPrice: '',
        minArea: '',
        maxArea: '',
        neighborhood: '',
        city: '',
    });

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.q) params.q = filters.q;
            if (filters.type !== 'All') params.type = filters.type;
            if (filters.transactionType !== 'All') params.transactionType = filters.transactionType;
            if (filters.furnishing !== 'All') params.furnishing = filters.furnishing;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.minArea) params.minArea = filters.minArea;
            if (filters.maxArea) params.maxArea = filters.maxArea;
            if (filters.neighborhood) params.neighborhood = filters.neighborhood;
            if (filters.city) params.city = filters.city;

            const { data } = await searchProperties(params);
            setProperties(data.properties);
            setTotalProperties(data.totalProperties);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this property?')) return;
        try {
            await deleteProperty(id);
            setProperties((prev) => prev.filter((p) => p._id !== id));
            setTotalProperties((prev) => prev - 1);
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = async () => {
        try {
            const { data } = await shareProperties({
                propertyIds: selectedIds,
                clientName: shareForm.clientName,
                clientPhone: shareForm.clientPhone,
            });
            setShareResult(data);
        } catch (err) {
            console.error(err);
        }
    };

    const clearFilters = () => {
        setFilters({
            q: '', type: 'All', transactionType: 'All', furnishing: 'All',
            minPrice: '', maxPrice: '', minArea: '', maxArea: '',
            neighborhood: '', city: '',
        });
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="inventory-page">
                <div className="inventory-header">
                    <h1>Search Inventory</h1>
                    <p>{totalProperties} properties found</p>
                </div>

                {/* Filters */}
                <div className="filters-panel">
                    <div className="filter-row">
                        <div className="filter-group search-group">
                            <input
                                type="text"
                                placeholder="🔍 Search by location or title..."
                                value={filters.q}
                                onChange={(e) => handleFilterChange('q', e.target.value)}
                                className="filter-search"
                            />
                        </div>
                    </div>
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Neighborhood</label>
                            <input
                                type="text"
                                placeholder="e.g. Vile Parle"
                                value={filters.neighborhood}
                                onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>City</label>
                            <input
                                type="text"
                                placeholder="e.g. Mumbai"
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Type</label>
                            <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
                                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Transaction</label>
                            <select value={filters.transactionType} onChange={(e) => handleFilterChange('transactionType', e.target.value)}>
                                {TRANSACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Furnishing</label>
                            <select value={filters.furnishing} onChange={(e) => handleFilterChange('furnishing', e.target.value)}>
                                {FURNISHING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Min Price (₹)</label>
                            <input type="number" placeholder="0" value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Max Price (₹)</label>
                            <input type="number" placeholder="Any" value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Min Area (sq.ft)</label>
                            <input type="number" placeholder="0" value={filters.minArea}
                                onChange={(e) => handleFilterChange('minArea', e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Max Area (sq.ft)</label>
                            <input type="number" placeholder="Any" value={filters.maxArea}
                                onChange={(e) => handleFilterChange('maxArea', e.target.value)} />
                        </div>
                        <div className="filter-group filter-actions">
                            <button onClick={clearFilters} className="btn-clear">Clear Filters</button>
                        </div>
                    </div>
                </div>

                {/* Share bar */}
                {selectedIds.length > 0 && (
                    <div className="share-bar">
                        <span>{selectedIds.length} properties selected</span>
                        <button className="btn-whatsapp" onClick={() => setShowShareModal(true)}>
                            📱 Share via WhatsApp
                        </button>
                        <button className="btn-clear-selection" onClick={() => setSelectedIds([])}>
                            Clear Selection
                        </button>
                    </div>
                )}

                {/* Properties Grid */}
                {loading ? (
                    <div className="loading-state">Loading properties...</div>
                ) : properties.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🏠</span>
                        <h3>No properties found</h3>
                        <p>Try adjusting your filters or add new properties.</p>
                    </div>
                ) : (
                    <div className="properties-grid">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property._id}
                                property={property}
                                selected={selectedIds.includes(property._id)}
                                onSelect={handleSelect}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* Share Modal */}
                {showShareModal && (
                    <div className="modal-overlay" onClick={() => { setShowShareModal(false); setShareResult(null); }}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Share Properties via WhatsApp</h2>
                            {!shareResult ? (
                                <>
                                    <div className="form-group">
                                        <label>Client Name</label>
                                        <input
                                            type="text"
                                            placeholder="Client's name"
                                            value={shareForm.clientName}
                                            onChange={(e) => setShareForm({ ...shareForm, clientName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Client Phone (with country code)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 919876543210"
                                            value={shareForm.clientPhone}
                                            onChange={(e) => setShareForm({ ...shareForm, clientPhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button className="btn-whatsapp" onClick={handleShare}>Generate Message</button>
                                        <button className="btn-cancel" onClick={() => setShowShareModal(false)}>Cancel</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="share-preview">
                                        <pre>{shareResult.message}</pre>
                                    </div>
                                    <div className="modal-actions">
                                        <a href={shareResult.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                                            Open WhatsApp
                                        </a>
                                        <button className="btn-cancel" onClick={() => { setShowShareModal(false); setShareResult(null); setSelectedIds([]); }}>
                                            Done
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Inventory;
