import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

// GET - Fetch single user by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        const [users] = await db.query<RowDataPacket[]>(
            `SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.role_id,
        u.organization_id,
        u.createdAt,
        r.name as role_name,
        o.name as organization_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user: users[0] });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PUT - Update user
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        const { email, password, name, role_id, organization_id } = await request.json();

        // Validation
        if (!email || !name || !role_id || !organization_id) {
            return NextResponse.json(
                { error: 'Email, name, role, and organization are required' },
                { status: 400 }
            );
        }

        // Check if email is taken by another user
        const [existingUsers] = await db.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, userId]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Build update query
        let query = 'UPDATE users SET email = ?, name = ?, role_id = ?, organization_id = ?';
        const queryParams: any[] = [email, name, role_id, organization_id];

        // Only update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            queryParams.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        queryParams.push(userId);

        await db.query(query, queryParams);

        return NextResponse.json({
            message: 'User updated successfully',
        });
    } catch (error: any) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;

        // Check if user exists
        const [users] = await db.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Delete user
        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        return NextResponse.json({
            message: 'User deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete user error:', error);

        // Handle foreign key constraint errors
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return NextResponse.json(
                { error: 'Cannot delete user: user has related records (employees, etc.)' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to delete user' },
            { status: 500 }
        );
    }
}
