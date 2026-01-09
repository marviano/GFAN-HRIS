'use client';

import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface DeleteConfirmModalProps {
    user: User;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmModal({
    user,
    onClose,
    onConfirm,
}: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to delete user');
                setLoading(false);
                return;
            }

            onConfirm();
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal modal-small">
                <div className="modal-header">
                    <h2 className="modal-title">Delete User</h2>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    <div className="delete-confirm-content">
                        <div className="delete-icon">⚠️</div>
                        <p className="delete-message">
                            Are you sure you want to delete this user?
                        </p>
                        <div className="delete-user-info">
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>
                        <p className="delete-warning">
                            This action cannot be undone.
                        </p>
                    </div>
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
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete User'}
                    </button>
                </div>
            </div>
        </>
    );
}
