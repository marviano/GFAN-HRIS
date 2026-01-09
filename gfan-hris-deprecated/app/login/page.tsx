'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        verifyPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (activeTab === 'register') {
                // Register
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        verifyPassword: formData.verifyPassword,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || 'Registration failed');
                    setLoading(false);
                    return;
                }

                // Auto-login after registration
                setActiveTab('login');
                setFormData({ ...formData, verifyPassword: '' });
                setError('Registration successful! Please login.');
                setLoading(false);
            } else {
                // Login
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || 'Login failed');
                    setLoading(false);
                    return;
                }

                // Store user data in localStorage (simple approach)
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect to home
                router.push('/');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    return (
        <div className="auth-container">
            <div className="auth-background"></div>

            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">GFAN HRIS</h1>
                    <p className="auth-subtitle">Human Resource Information System</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('login');
                            setError('');
                            setFormData({ email: '', password: '', verifyPassword: '' });
                        }}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('register');
                            setError('');
                            setFormData({ email: '', password: '', verifyPassword: '' });
                        }}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className={`auth-message ${error.includes('successful') ? 'success' : 'error'}`}>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your password"
                            disabled={loading}
                        />
                    </div>

                    {activeTab === 'register' && (
                        <div className="form-group">
                            <label htmlFor="verifyPassword">Verify Password</label>
                            <input
                                type="password"
                                id="verifyPassword"
                                name="verifyPassword"
                                value={formData.verifyPassword}
                                onChange={handleInputChange}
                                required
                                placeholder="Re-enter your password"
                                disabled={loading}
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
}
