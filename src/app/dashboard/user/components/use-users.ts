'use client';

import { useState, useEffect, useCallback } from 'react';

import { User, UserFormData, UserFormError } from './types';
import { useDashboardToast } from '@/src/components/dashboard/toast/DashboardToastProvider';

export function useUsers() {
    const { showToast } = useDashboardToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        role: 'user',
    });
    const [formError, setFormError] = useState<UserFormError>(null);
    const [formLoading, setFormLoading] = useState(false);

    // ── Fetch users ────────────────────────────────────────────────────────

    const getUsers = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/users`, { method: 'GET' }).then((res) => res.json());

            setUsers(response.users || []);
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    // ── Form handlers ──────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError(null);
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role as 'user' | 'admin',
            });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'user' });
        }
        setShowModal(true);
        setFormError(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);

        try {
            const url = editingUser ? `/api/auth/users/${editingUser.id}` : '/api/auth/users';
            const method = editingUser ? 'PATCH' : 'POST';
            const body = editingUser
                ? { name: formData.name, email: formData.email, role: formData.role }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.json();

            if (!response.ok) {
                setFormError(data.errors || { formErrors: [data.message || 'Operation failed'], fieldErrors: {} });
                return;
            }

            handleCloseModal();

        } catch {
            setFormError({ formErrors: ['An unexpected error occurred'], fieldErrors: {} });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`/api/auth/users/${userId}`, { method: 'DELETE' });
            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Failed to delete user');
                return;
            }

            showToast('User deleted successfully', 'success', {
                onClose: () => window.location.reload(),
            });
        } catch {
            alert('An unexpected error occurred');
        }
    };

    return {
        // Data
        users,
        loading,
        error,

        // Modal state
        showModal,
        editingUser,
        formData,
        formError,
        formLoading,

        // Handlers
        handleChange,
        handleOpenModal,
        handleCloseModal,
        handleSubmit,
        handleDelete,
    };
}
