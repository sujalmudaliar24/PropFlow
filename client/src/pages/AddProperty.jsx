import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import Navbar from '../components/Navbar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AddProperty.css';

gsap.registerPlugin(ScrollTrigger);

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
    const formRef = useRef(null);

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

    useEffect(() => {
        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray('.bento-item');
            items.forEach((item, i) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: 'top bottom-=50',
                        toggleActions: 'play none none none'
                    },
                    y: 40,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                    delay: i * 0.05
                });
            });
        }, formRef);

        return () => ctx.revert();
    }, []);

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

    const getImageLimits = () => {
        const bhk = parseInt(form.specifications.bedrooms);
        if (bhk >= 3 && bhk <= 5) return { min: 3, max: 8 };
        return { min: 3, max: 6 };
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const { max } = getImageLimits();

        if (selectedFiles.length + files.length > max) {
            setError(`You can only upload a maximum of ${max} images for this property.`);
            return;
        }

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

        const { min } = getImageLimits();
        if (selectedFiles.length < min) {
            setError(`Please upload at least ${min} images of the property.`);
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            // Append basic fields
            formData.append('propertyType', form.propertyType);
            formData.append('subType', form.subType);
            formData.append('transactionType', form.transactionType);
            formData.append('description', form.description);

            // Append nested objects as JSON strings
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
            <main className="add-property-page" ref={formRef}>
                <form onSubmit={handleSubmit} className="bento-form-grid">
                    {/* Header Card */}
                    <div className="bento-item form-header-card">
                        <h1>List Your <span className="highlight">Property</span></h1>
                        <p>Tell us about your asset to reach potential clients.</p>
                        {error && <div className="error-badge">{error}</div>}
                        {success && <div className="success-badge">{success}</div>}
                    </div>

                    {/* Basic Info Card */}
                    <div className="bento-item basic-info-card">
                        <h3>Type & Transaction</h3>
                        <div className="form-group">
                            <label>Property Category</label>
                            <select name="propertyType" value={form.propertyType} onChange={handleChange}>
                                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Sub Type</label>
                            <select name="subType" value={form.subType} onChange={handleChange}>
                                {SUB_TYPES[form.propertyType].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Listing For</label>
                            <div className="transaction-toggle">
                                <button
                                    type="button"
                                    className={form.transactionType === 'Sale' ? 'active' : ''}
                                    onClick={() => setForm(prev => ({ ...prev, transactionType: 'Sale' }))}
                                >Sale</button>
                                <button
                                    type="button"
                                    className={form.transactionType === 'Rent' ? 'active' : ''}
                                    onClick={() => setForm(prev => ({ ...prev, transactionType: 'Rent' }))}
                                >Rent</button>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bento-item location-card">
                        <h3>Location Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input name="location.city" value={form.location.city} onChange={handleChange} placeholder="Mumbai" required />
                            </div>
                            <div className="form-group">
                                <label>Area / Locality</label>
                                <input name="location.area" value={form.location.area} onChange={handleChange} placeholder="Vile Parle" required />
                            </div>
                            <div className="form-group">
                                <label>Pincode</label>
                                <input name="location.pincode" value={form.location.pincode} onChange={handleChange} placeholder="400057" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Society / Project Name</label>
                            <input name="location.society" value={form.location.society} onChange={handleChange} placeholder="Sun City" required />
                        </div>
                        <div className="form-group">
                            <label>Full Plot / Unit Address</label>
                            <textarea name="location.address" value={form.location.address} onChange={handleChange} rows="2" required />
                        </div>
                    </div>

                    {/* Specifications Card */}
                    <div className="bento-item specs-card">
                        <h3>Property Specs</h3>
                        <div className="specs-grid">
                            <div className="form-group">
                                <label>Carpet Area (sq.ft)</label>
                                <input name="specifications.carpetArea" type="number" value={form.specifications.carpetArea} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Bedrooms (BHK)</label>
                                <input name="specifications.bedrooms" type="number" value={form.specifications.bedrooms} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Bathrooms</label>
                                <input name="specifications.bathrooms" type="number" value={form.specifications.bathrooms} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Floor Info</label>
                                <div className="floor-inputs">
                                    <input name="specifications.floorNumber" type="number" placeholder="Floor" value={form.specifications.floorNumber} onChange={handleChange} required />
                                    <span>/</span>
                                    <input name="specifications.totalFloors" type="number" placeholder="Total" value={form.specifications.totalFloors} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Furnishing Status</label>
                                <select name="specifications.furnishingType" value={form.specifications.furnishingType} onChange={handleChange}>
                                    {FURNISHING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bento-item pricing-card">
                        <h3>Financials</h3>
                        {form.transactionType === 'Rent' ? (
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Monthly Rent</label>
                                    <input name="pricing.rentAmount" type="number" value={form.pricing.rentAmount} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Deposit</label>
                                    <input name="pricing.securityDeposit" type="number" value={form.pricing.securityDeposit} onChange={handleChange} required />
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Total Consideration (₹)</label>
                                <input name="pricing.cost" type="number" value={form.pricing.cost} onChange={handleChange} required />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Brokerage Fee</label>
                            <input name="pricing.brokerage" type="number" value={form.pricing.brokerage} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Image Card */}
                    <div className="bento-item image-card">
                        <div className="card-header-flex">
                            <h3>Gallery</h3>
                            <span className="limit-badge">
                                {selectedFiles.length} / {getImageLimits().max}
                            </span>
                        </div>
                        <p className="gallery-hint">Minimum 3 photos required. {getImageLimits().max === 8 ? 'Higher limit (8) active for ' + form.specifications.bedrooms + ' BHK.' : ''}</p>

                        <div className="image-upload-wrapper">
                            <input type="file" id="image-upload" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                            <label htmlFor="image-upload" className="upload-dropzone">
                                <span className="upload-icon">📸</span>
                                <div className="upload-text">
                                    <strong>Click to upload</strong>
                                    <span>or drag and drop images</span>
                                </div>
                                <small>Max 7MB • JPEG, PNG</small>
                            </label>
                        </div>
                        <div className="image-preview-strip">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="preview-bubble">
                                    <img src={src} alt="" />
                                    <button type="button" onClick={() => removeImage(index)} className="remove-bubble">×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bento-item desc-card">
                        <h3>Additional Details</h3>
                        <div className="form-group">
                            <label>Keywords</label>
                            <input name="keywords" value={form.keywords} onChange={handleChange} placeholder="Garden facing, Modular kitchen..." />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
                        </div>
                        <button type="submit" className="btn-submit-bento" disabled={loading}>
                            {loading ? 'Processing...' : 'Publish Property 🚀'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddProperty;
