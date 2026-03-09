import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import Navbar from '../components/Navbar';
import './AddProperty.css';

const PROPERTY_TYPES = ['Residential', 'Commercial'];
const SUB_TYPES = {
    Residential: ['Villa', 'Apartment', 'Penthouse', 'Others'],
    Commercial: ['Office Space', 'Plot', 'Others']
};
const PARKING_TYPES = ['basement', 'ramp', 'stilt', 'automatic', 'open'];
const FURNISHING_TYPES = ['Unfurnished', 'Semi Furnished', 'Fully Furnished'];

const AddProperty = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [form, setForm] = useState({
        propertyType: 'Residential',
        subType: 'Apartment',
        transactionType: 'Sale',
        location: {
            city: '',
            area: '',
            society: '',
            address: '',
            pincode: '',
            landmark: '',
        },
        specifications: {
            carpetArea: '',
            builtUpArea: '',
            floorNumber: '',
            totalFloors: '',
            bedrooms: '',
            bathrooms: '',
            balcony: '',
            furnishingType: 'Unfurnished',
        },
        parking: {
            type: 'open',
            count: '',
        },
        pricing: {
            rentAmount: '',
            securityDeposit: '',
            cost: '',
            negotiable: true,
            brokerage: '',
        },
        keywords: '',
        description: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setForm(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            const val = type === 'checkbox' ? checked : value;
            setForm(prev => {
                const updated = { ...prev, [name]: val };
                // Reset subType if propertyType changes
                if (name === 'propertyType') {
                    updated.subType = SUB_TYPES[val][0];
                }
                return updated;
            });
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const previews = [];
        let hasError = false;

        files.forEach(file => {
            if (file.size > 7 * 1024 * 1024) {
                setError(`File ${file.name} is too large. Max size is 7MB.`);
                hasError = true;
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError(`File ${file.name} is not an image.`);
                hasError = true;
                return;
            }
            validFiles.push(file);
            previews.push(URL.createObjectURL(file));
        });

        if (!hasError) {
            setError('');
            setSelectedFiles(prev => [...prev, ...validFiles]);
            setImagePreviews(prev => [...prev, ...previews]);
        }
    };

    const removeImage = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const formData = new FormData();

            // Append basic fields
            formData.append('propertyType', form.propertyType);
            formData.append('subType', form.subType);
            formData.append('transactionType', form.transactionType);
            formData.append('description', form.description);

            // Append nested objects as JSON strings (handled by backend middleware update)
            formData.append('location', JSON.stringify(form.location));
            formData.append('specifications', JSON.stringify(form.specifications));
            formData.append('parking', JSON.stringify(form.parking));
            formData.append('pricing', JSON.stringify(form.pricing));

            // Keywords
            if (form.keywords) {
                const keywordsArray = form.keywords.split(',').map(k => k.trim());
                formData.append('keywords', JSON.stringify(keywordsArray));
            }

            // Append images
            selectedFiles.forEach(file => {
                formData.append('images', file);
            });

            await createProperty(formData);

            setUser({ ...user, propertyCount: (user.propertyCount || 0) + 1 });
            setSuccess('Property added successfully!');
            setTimeout(() => navigate('/inventory'), 1500);
        } catch (err) {
            console.error('Property creation error:', err);
            setError(err.response?.data?.message || 'Failed to add property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="add-property-page">
                <div className="form-container">
                    <h1>Add New Property</h1>
                    <form onSubmit={handleSubmit} className="property-form">
                        {error && <div className="auth-error">{error}</div>}
                        {success && <div className="form-success">{success}</div>}

                        {/* Basic Type Selection */}
                        <section className="form-section">
                            <h3>Property Type & Transaction</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Property Type *</label>
                                    <select name="propertyType" value={form.propertyType} onChange={handleChange}>
                                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Sub Type *</label>
                                    <select name="subType" value={form.subType} onChange={handleChange}>
                                        {SUB_TYPES[form.propertyType].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Transaction *</label>
                                    <select name="transactionType" value={form.transactionType} onChange={handleChange}>
                                        <option value="Sale">Sale</option>
                                        <option value="Rent">Rent</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Location */}
                        <section className="form-section">
                            <h3>Location Details</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input name="location.city" value={form.location.city} onChange={handleChange} placeholder="e.g. Mumbai" required />
                                </div>
                                <div className="form-group">
                                    <label>Area / Locality *</label>
                                    <input name="location.area" value={form.location.area} onChange={handleChange} placeholder="e.g. Vile Parle West" required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Society / Building Name *</label>
                                    <input name="location.society" value={form.location.society} onChange={handleChange} placeholder="e.g. Sun City Heights" required />
                                </div>
                                <div className="form-group">
                                    <label>Pincode *</label>
                                    <input name="location.pincode" value={form.location.pincode} onChange={handleChange} placeholder="400056" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Full Address *</label>
                                <textarea name="location.address" value={form.location.address} onChange={handleChange} placeholder="B-402, Plot No 12..." rows="2" required />
                            </div>
                            <div className="form-group">
                                <label>Landmark (optional)</label>
                                <input name="location.landmark" value={form.location.landmark} onChange={handleChange} placeholder="e.g. Near Mithibai College" />
                            </div>
                        </section>

                        {/* Specifications */}
                        <section className="form-section">
                            <h3>Property Specifications</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Carpet Area (sq.ft) *</label>
                                    <input name="specifications.carpetArea" type="number" value={form.specifications.carpetArea} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Built-up Area (sq.ft)</label>
                                    <input name="specifications.builtUpArea" type="number" value={form.specifications.builtUpArea} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Floor Number *</label>
                                    <input name="specifications.floorNumber" type="number" value={form.specifications.floorNumber} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Total Floors *</label>
                                    <input name="specifications.totalFloors" type="number" value={form.specifications.totalFloors} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bedrooms *</label>
                                    <input name="specifications.bedrooms" type="number" value={form.specifications.bedrooms} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Bathrooms *</label>
                                    <input name="specifications.bathrooms" type="number" value={form.specifications.bathrooms} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Balcony (optional)</label>
                                    <input name="specifications.balcony" type="number" value={form.specifications.balcony} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Furnishing Type *</label>
                                <select name="specifications.furnishingType" value={form.specifications.furnishingType} onChange={handleChange}>
                                    {FURNISHING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        </section>

                        {/* Parking */}
                        <section className="form-section">
                            <h3>Parking</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Parking Type</label>
                                    <select name="parking.type" value={form.parking.type} onChange={handleChange}>
                                        {PARKING_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>No. of Parking</label>
                                    <input name="parking.count" type="number" value={form.parking.count} onChange={handleChange} placeholder="e.g. 1" />
                                </div>
                            </div>
                        </section>

                        {/* Pricing */}
                        <section className="form-section">
                            <h3>Pricing Details</h3>
                            {form.transactionType === 'Rent' ? (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Rent Amount (₹) *</label>
                                        <input name="pricing.rentAmount" type="number" value={form.pricing.rentAmount} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Security Deposit (₹) *</label>
                                        <input name="pricing.securityDeposit" type="number" value={form.pricing.securityDeposit} onChange={handleChange} required />
                                    </div>
                                </div>
                            ) : (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Total Cost (₹) *</label>
                                        <input name="pricing.cost" type="number" value={form.pricing.cost} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <label>Negotiable</label>
                                        <input
                                            name="pricing.negotiable"
                                            type="checkbox"
                                            checked={form.pricing.negotiable}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px' }}
                                        />
                                        <span>{form.pricing.negotiable ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Brokerage (₹) *</label>
                                <input name="pricing.brokerage" type="number" value={form.pricing.brokerage} onChange={handleChange} required />
                            </div>
                        </section>

                        {/* Images Upload */}
                        <section className="form-section">
                            <h3>Property Images (Max 7MB per image)</h3>
                            <div className="image-upload-wrapper">
                                <input
                                    type="file"
                                    id="image-upload"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="image-upload" className="upload-btn">
                                    📸 Upload Images
                                </label>
                            </div>
                            <div className="image-previews">
                                {imagePreviews.map((src, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={src} alt={`Preview ${index}`} />
                                        <button type="button" onClick={() => removeImage(index)} className="remove-img">×</button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Additional */}
                        <section className="form-section">
                            <h3>Additional Info</h3>
                            <div className="form-group">
                                <label>Key Words (optional, comma separated)</label>
                                <input name="keywords" value={form.keywords} onChange={handleChange} placeholder="e.g. garden facing, near station, airy" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Any other details..." rows="3" />
                            </div>
                        </section>

                        <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '2rem' }}>
                            {loading ? 'Adding Property...' : 'Add Property'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddProperty;
