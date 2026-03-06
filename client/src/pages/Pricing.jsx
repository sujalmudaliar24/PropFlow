import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuthContext';
import './Pricing.css';

const plans = [
    {
        name: 'Starter',
        price: '₹999',
        period: '/ month',
        features: ['1 User', '200 Properties', 'Basic Search & Filters', 'WhatsApp Sharing', 'Email Support'],
        highlighted: false,
    },
    {
        name: 'Professional',
        price: '₹2,499',
        period: '/ month',
        features: ['5 Users', '2,000 Properties', 'Advanced Search & Filters', 'WhatsApp Sharing', 'Priority Support', 'Bulk Import'],
        highlighted: true,
    },
    {
        name: 'Enterprise',
        price: '₹4,999',
        period: '/ month',
        features: ['Unlimited Users', 'Unlimited Properties', 'Advanced Search & Filters', 'WhatsApp API Integration', '24/7 Dedicated Support', 'Custom Branding', 'Analytics Dashboard'],
        highlighted: false,
    },
];

const Pricing = () => {
    const { user } = useAuth();

    return (
        <div className="app-layout">
            {user && <Navbar />}
            <main className="pricing-page">
                <div className="pricing-header">
                    <h1>Choose Your Plan</h1>
                    <p>Scale your real estate business with the right plan</p>
                </div>
                <div className="pricing-grid">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`pricing-card ${plan.highlighted ? 'pricing-card-highlighted' : ''}`}>
                            {plan.highlighted && <div className="pricing-badge">Most Popular</div>}
                            <h2 className="plan-name">{plan.name}</h2>
                            <div className="plan-price">
                                <span className="price-amount">{plan.price}</span>
                                <span className="price-period">{plan.period}</span>
                            </div>
                            <ul className="plan-features">
                                {plan.features.map((feature) => (
                                    <li key={feature}>✓ {feature}</li>
                                ))}
                            </ul>
                            <button
                                className={`plan-btn ${user?.plan === plan.name ? 'plan-btn-current' : ''}`}
                                disabled={user?.plan === plan.name}
                            >
                                {user?.plan === plan.name ? 'Current Plan' : 'Upgrade'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Pricing;
