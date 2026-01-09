'use client';

import { useState, useEffect } from 'react';

interface User {
    id: number;
    email: string;
    name: string;
    role_id: number;
    organization_id: number;
}

interface Role {
    id: number;
    name: string;
}

interface Organization {
    id: number;
    name: string;
}

interface UserModalProps {
    user: User | null;
    isCreating: boolean;
    roles: Role[];
    organizations: Organization[];
    onClose: () => void;
    onSave: () => void;
}

export default function UserModal({
    user,
    isCreating,
    roles,
    organizations,
    onClose,
    onSave,
}: UserModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role_id: '',
        organization_id: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role_id: user.role_id.toString(),
                organization_id: user.organization_id.toString(),
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const url = isCreating ? '/api/users' : `/api/users/${user?.id}`;
            const method = isCreating ? 'POST' : 'PUT';

            const body: any = {
                name: formData.name,
                email: formData.email,
                role_id: parseInt(formData.role_id),
                organization_id: parseInt(formData.organization_id),
            };

            // Only include password if it's provided
            if (formData.password) {
                body.password = formData.password;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to save user');
                setLoading(false);
                return;
            }

            onSave();
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isCreating ? 'Create New User' : 'Edit User'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Enter full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            Password {isCreating ? '*' : '(leave blank to keep current)'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={isCreating}
                            disabled={loading}
                            placeholder={isCreating ? 'Enter password' : 'Enter new password'}
                            minLength={6}
                        />
                        {isCreating && (
                            <small className="form-hint">Minimum 6 characters</small>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="role_id">Role *</label>
                        <select
                            id="role_id"
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="organization_id">Organization *</label>
                        <select
                            id="organization_id"
                            name="organization_id"
                            value={formData.organization_id}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        >
                            <option value="">Select an organization</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isCreating ? 'Create User' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
