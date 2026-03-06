import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuthContext';
import { getProperties } from '../services/api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const PLAN_LIMITS = {
    Starter: { maxProperties: 200, maxUsers: 1, price: '₹999' },
    Professional: { maxProperties: 2000, maxUsers: 5, price: '₹2,499' },
    Enterprise: { maxProperties: '∞', maxUsers: '∞', price: '₹4,999' },
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, available: 0, sold: 0, rented: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await getProperties({ limit: 1 });
                setStats((prev) => ({ ...prev, total: data.totalProperties }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    const planInfo = PLAN_LIMITS[user?.plan] || PLAN_LIMITS.Starter;

    return (
        <div className="app-layout">
            <Navbar />
            <main className="dashboard">
                <div className="dashboard-welcome">
                    <h1>Welcome back, <span className="gradient-text">{user?.name}</span> 👋</h1>
                    <p>Manage your real estate inventory and share with clients</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏘️</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Properties</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <span className="stat-value">{typeof planInfo.maxProperties === 'number' ? planInfo.maxProperties - stats.total : '∞'}</span>
                            <span className="stat-label">Remaining Quota</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📋</div>
                        <div className="stat-info">
                            <span className="stat-value">{user?.plan}</span>
                            <span className="stat-label">Current Plan</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <span className="stat-value">{planInfo.price}</span>
                            <span className="stat-label">Monthly Bill</span>
                        </div>
                    </div>
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/add-property" className="action-card">
                            <span className="action-icon">➕</span>
                            <span className="action-label">Add Property</span>
                        </Link>
                        <Link to="/inventory" className="action-card">
                            <span className="action-icon">🔍</span>
                            <span className="action-label">Search & Share</span>
                        </Link>
                        <Link to="/pricing" className="action-card">
                            <span className="action-icon">⬆️</span>
                            <span className="action-label">Upgrade Plan</span>
                        </Link>
                    </div>
                </div>

                <div className="plan-usage">
                    <h2>Plan Usage</h2>
                    <div className="usage-bar-container">
                        <div className="usage-label">
                            <span>Properties: {stats.total} / {planInfo.maxProperties}</span>
                            <span>{typeof planInfo.maxProperties === 'number'
                                ? `${Math.round((stats.total / planInfo.maxProperties) * 100)}%`
                                : '∞'}
                            </span>
                        </div>
                        <div className="usage-bar">
                            <div
                                className="usage-bar-fill"
                                style={{
                                    width: typeof planInfo.maxProperties === 'number'
                                        ? `${Math.min((stats.total / planInfo.maxProperties) * 100, 100)}%`
                                        : '5%'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
