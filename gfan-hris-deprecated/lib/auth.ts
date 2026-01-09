// Authentication utility functions
export interface User {
    id: number;
    email: string;
    name: string;
    role_id: number;
    organization_id: number;
}

export function getUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

export function isAuthenticated(): boolean {
    return getUser() !== null;
}

export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}
