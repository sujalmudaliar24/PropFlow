import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../services/api';
import { useAuth } from '../hooks/useAuthContext';
import Navbar from '../components/Navbar';
import './AddProperty.css';

const PROPERTY_TYPES = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Penthouse', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Other'];

const AddProperty = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        type: '1BHK',
        transactionType: 'Sale',
        price: '',
        carpetArea: '',
        builtUpArea: '',
        neighborhood: '',
        city: '',
        state: '',
        pincode: '',
        floor: '',
        totalFloors: '',
        furnishing: 'Unfurnished',
        status: 'Available',
        contactName: '',
        contactPhone: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const payload = {
                title: form.title,
                description: form.description,
                type: form.type,
                transactionType: form.transactionType,
                price: Number(form.price),
                carpetArea: Number(form.carpetArea),
                builtUpArea: form.builtUpArea ? Number(form.builtUpArea) : undefined,
                location: {
                    neighborhood: form.neighborhood,
                    city: form.city,
                    state: form.state,
                    pincode: form.pincode,
                },
                floor: form.floor ? Number(form.floor) : undefined,
                totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
                furnishing: form.furnishing,
                status: form.status,
                contactName: form.contactName,
                contactPhone: form.contactPhone,
            };

            await createProperty(payload);
            setUser({ ...user, propertyCount: (user.propertyCount || 0) + 1 });
            setSuccess('Property added successfully!');
            setTimeout(() => navigate('/inventory'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-layout">
            <Navbar />
            <main className="add-property-page">
                <h1>Add New Property</h1>
                <form onSubmit={handleSubmit} className="property-form">
                    {error && <div className="auth-error">{error}</div>}
                    {success && <div className="form-success">{success}</div>}

                    <section className="form-section">
                        <h3>Basic Info</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Title *</label>
                                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Spacious 2BHK in Vile Parle" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Type *</label>
                                <select name="type" value={form.type} onChange={handleChange}>
                                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Transaction *</label>
                                <select name="transactionType" value={form.transactionType} onChange={handleChange}>
                                    <option value="Sale">Sale</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Lease">Lease</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={form.status} onChange={handleChange}>
                                    <option value="Available">Available</option>
                                    <option value="Under Negotiation">Under Negotiation</option>
                                    <option value="Sold">Sold</option>
                                    <option value="Rented">Rented</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description..." rows="3" />
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>Location</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Neighborhood *</label>
                                <input name="neighborhood" value={form.neighborhood} onChange={handleChange} placeholder="e.g. Vile Parle" required />
                            </div>
                            <div className="form-group">
                                <label>City *</label>
                                <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>State</label>
                                <input name="state" value={form.state} onChange={handleChange} placeholder="e.g. Maharashtra" />
                            </div>
                            <div className="form-group">
                                <label>Pincode</label>
                                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="e.g. 400056" />
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>Pricing & Area</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Price (₹) *</label>
                                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 8500000" required />
                            </div>
                            <div className="form-group">
                                <label>Carpet Area (sq.ft) *</label>
                                <input name="carpetArea" type="number" value={form.carpetArea} onChange={handleChange} placeholder="e.g. 650" required />
                            </div>
                            <div className="form-group">
                                <label>Built-up Area (sq.ft)</label>
                                <input name="builtUpArea" type="number" value={form.builtUpArea} onChange={handleChange} placeholder="e.g. 800" />
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Floor</label>
                                <input name="floor" type="number" value={form.floor} onChange={handleChange} placeholder="e.g. 5" />
                            </div>
                            <div className="form-group">
                                <label>Total Floors</label>
                                <input name="totalFloors" type="number" value={form.totalFloors} onChange={handleChange} placeholder="e.g. 12" />
                            </div>
                            <div className="form-group">
                                <label>Furnishing</label>
                                <select name="furnishing" value={form.furnishing} onChange={handleChange}>
                                    <option value="Unfurnished">Unfurnished</option>
                                    <option value="Semi-Furnished">Semi-Furnished</option>
                                    <option value="Fully-Furnished">Fully-Furnished</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>Contact</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Name</label>
                                <input name="contactName" value={form.contactName} onChange={handleChange} placeholder="Owner/Agent name" />
                            </div>
                            <div className="form-group">
                                <label>Contact Phone</label>
                                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+91 98765 43210" />
                            </div>
                        </div>
                    </section>

                    <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Adding Property...' : 'Add Property'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AddProperty;
