'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import UserModal from '@/components/UserModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface User {
    id: number;
    email: string;
    name: string;
    role_id: number;
    organization_id: number;
    role_name: string;
    organization_name: string;
    createdAt: string;
}

interface Role {
    id: number;
    name: string;
}

interface Organization {
    id: number;
    name: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        } else {
            setLoading(false);
            fetchUsers();
            fetchRoles();
            fetchOrganizations();
        }
    }, [router, page, limit, search, roleFilter]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(roleFilter && { role_id: roleFilter }),
            });

            const response = await fetch(`/api/users?${params}`);
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users);
                setTotal(data.pagination.total);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            if (response.ok) {
                setRoles(data.roles);
            }
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const fetchOrganizations = async () => {
        try {
            const response = await fetch('/api/organizations');
            const data = await response.json();
            if (response.ok) {
                setOrganizations(data.organizations);
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        }
    };

    const handleCreateUser = () => {
        setSelectedUser(null);
        setIsCreating(true);
        setShowUserModal(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsCreating(false);
        setShowUserModal(true);
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleUserSaved = () => {
        setShowUserModal(false);
        fetchUsers();
    };

    const handleUserDeleted = () => {
        setShowDeleteModal(false);
        fetchUsers();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="users-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">Manage system users and their roles</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateUser}>
                        <span className="btn-icon">➕</span>
                        Add User
                    </button>
                </div>

                <div className="users-filters">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="search-input"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(parseInt(e.target.value));
                            setPage(1);
                        }}
                        className="filter-select"
                    >
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                    </select>
                </div>

                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Organization</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-state">
                                        <div className="empty-icon">👥</div>
                                        <p>No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td className="user-name">{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className="role-badge">{user.role_name}</span>
                                        </td>
                                        <td>{user.organization_name}</td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon-action btn-edit"
                                                    onClick={() => handleEditUser(user)}
                                                    title="Edit user"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-icon-action btn-delete"
                                                    onClick={() => handleDeleteUser(user)}
                                                    title="Delete user"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            ← Previous
                        </button>

                        <div className="pagination-info">
                            Page {page} of {totalPages} ({total} total users)
                        </div>

                        <button
                            className="pagination-btn"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                        >
                            Next →
                        </button>
                    </div>
                )}

                {showUserModal && (
                    <UserModal
                        user={selectedUser}
                        isCreating={isCreating}
                        roles={roles}
                        organizations={organizations}
                        onClose={() => setShowUserModal(false)}
                        onSave={handleUserSaved}
                    />
                )}

                {showDeleteModal && selectedUser && (
                    <DeleteConfirmModal
                        user={selectedUser}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={handleUserDeleted}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
