import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuthContext';
import { getProperties } from '../services/api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Dashboard.css';

gsap.registerPlugin(ScrollTrigger);

const PLAN_LIMITS = {
    Starter: { maxProperties: 200, maxUsers: 1, price: '₹999' },
    Professional: { maxProperties: 2000, maxUsers: 5, price: '₹2,499' },
    Enterprise: { maxProperties: '∞', maxUsers: '∞', price: '₹4,999' },
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, available: 0, sold: 0, rented: 0 });
    const dashboardRef = useRef(null);

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

        // GSAP Animation with ScrollTrigger
        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray('.bento-item');

            items.forEach((item, i) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    },
                    y: 60,
                    opacity: 0,
                    duration: 1,
                    ease: 'expo.out',
                    delay: i * 0.05
                });
            });

            gsap.from('.welcome-text', {
                x: -50,
                opacity: 0,
                duration: 1.2,
                delay: 0.3,
                ease: 'power4.out'
            });
        }, dashboardRef);

        return () => ctx.revert();
    }, []);

    const planInfo = PLAN_LIMITS[user?.plan] || PLAN_LIMITS.Starter;

    return (
        <div className="app-layout" ref={dashboardRef}>
            <Navbar />
            <main className="dashboard">
                <div className="dashboard-grid">
                    {/* Welcome Card */}
                    <div className="bento-item welcome-card">
                        <div className="welcome-text">
                            <h1>Welcome back, <span className="highlight">{user?.name}</span> 👋</h1>
                            <p>Your real estate portfolio is looking great today. Here's a quick overview of your metrics.</p>
                        </div>
                        <div className="welcome-action">
                            <Link to="/add-property" className="btn-primary-bento">
                                ➕ Add New Property
                            </Link>
                        </div>
                    </div>

                    {/* Stats Section as Bento Items */}
                    <div className="bento-item stat-box total">
                        <span className="box-icon">🏘️</span>
                        <h3>{stats.total}</h3>
                        <p>Total Assets</p>
                    </div>

                    <div className="bento-item stat-box remaining">
                        <span className="box-icon">📊</span>
                        <h3>{typeof planInfo.maxProperties === 'number' ? planInfo.maxProperties - stats.total : '∞'}</h3>
                        <p>Quota Left</p>
                    </div>

                    {/* Plan Card */}
                    <div className="bento-item plan-card">
                        <h3>Current Plan: {user?.plan}</h3>
                        <div className="usage-details">
                            <div className="usage-header">
                                <span>Portfolio Usage</span>
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
                        <Link to="/pricing" className="btn-secondary-bento">
                            View Plan Details ⬆️
                        </Link>
                    </div>

                    {/* Quick Access Grid within Dashboard Grid */}
                    <div className="bento-item action-box search">
                        <Link to="/inventory">
                            <span className="box-icon">🔍</span>
                            <h3>Inventory</h3>
                            <p>Search & Share Properties</p>
                        </Link>
                    </div>

                    <div className="bento-item action-box billing">
                        <span className="box-icon">💰</span>
                        <h3>{planInfo.price}</h3>
                        <p>Next Billing Cycle</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
