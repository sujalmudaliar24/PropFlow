import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchProperties, deleteProperty, shareProperties } from '../services/api';
import Navbar from '../components/Navbar';
import PropertyCard from '../components/PropertyCard';
import gsap from 'gsap';
import './Inventory.css';

const PROPERTY_TYPES = ['All', 'Residential', 'Commercial'];
const TRANSACTION_TYPES = ['All', 'Sale', 'Rent'];

const Inventory = () => {
    const [properties, setProperties] = useState([]);
    const [totalProperties, setTotalProperties] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareForm, setShareForm] = useState({ clientName: '', clientPhone: '' });
    const [shareResult, setShareResult] = useState(null);
    const gridRef = useRef(null);

    // Filters
    const [filters, setFilters] = useState({
        q: '',
        type: 'All',
        transactionType: 'All',
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

    useEffect(() => {
        if (properties.length > 0 && gridRef.current) {
            gsap.from('.property-card', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.05,
                ease: 'power2.out',
                clearProps: 'all'
            });
        }
    }, [properties, loading]);

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
            q: '', type: 'All', transactionType: 'All',
            minPrice: '', maxPrice: '', minArea: '', maxArea: '',
            neighborhood: '', city: '',
        });
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="inventory-page">
                <div className="inventory-header">
                    <div>
                        <h1>Real Estate <span className="highlight">Inventory</span></h1>
                        <p>Discover and manage your prime properties</p>
                    </div>
                    <div className="inventory-stats-bento">
                        <div className="inv-stat">
                            <span className="inv-stat-val">{totalProperties}</span>
                            <span className="inv-stat-label">Total Listings</span>
                        </div>
                    </div>
                </div>

                {/* Filters as Bento-ish Panel */}
                <div className="bento-item filters-panel">
                    <div className="filter-row main-search">
                        <div className="filter-group search-group">
                            <input
                                type="text"
                                placeholder="🔍 Search properties, locations..."
                                value={filters.q}
                                onChange={(e) => handleFilterChange('q', e.target.value)}
                                className="filter-search"
                            />
                        </div>
                    </div>
                    <div className="filter-row grid-filters">
                        <div className="filter-group">
                            <label>Location</label>
                            <input
                                type="text"
                                placeholder="e.g. Vile Parle"
                                value={filters.neighborhood}
                                onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Property Type</label>
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
                        <div className="filter-group range-group">
                            <label>Price Range (₹)</label>
                            <div className="range-inputs">
                                <input type="number" placeholder="Min" value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
                                <input type="number" placeholder="Max" value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
                            </div>
                        </div>
                        <div className="filter-group action-group">
                            <button onClick={clearFilters} className="btn-text-only">Reset All</button>
                        </div>
                    </div>
                </div>

                {/* Share bar */}
                {selectedIds.length > 0 && (
                    <div className="share-bar-bento">
                        <span>{selectedIds.length} listings selected for your client</span>
                        <div className="share-actions">
                            <button className="btn-whatsapp-bento" onClick={() => setShowShareModal(true)}>
                                📱 Share via WhatsApp
                            </button>
                            <button className="btn-clear-selection" onClick={() => setSelectedIds([])}>
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Properties Grid */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Curating your listings...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="bento-item empty-state">
                        <span className="empty-icon">🏠</span>
                        <h3>No listings found</h3>
                        <p>Try refining your search criteria or add new properties.</p>
                        <Link to="/add-property" className="btn-primary-small">Add Property</Link>
                    </div>
                ) : (
                    <div className="properties-grid" ref={gridRef}>
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
