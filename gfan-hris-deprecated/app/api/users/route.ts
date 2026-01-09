import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

// GET - Fetch all users with pagination and filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const roleId = searchParams.get('role_id') || '';

        const offset = (page - 1) * limit;

        // Build query
        let query = `
      SELECT 
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
      WHERE 1=1
    `;
        const params: any[] = [];

        // Add search filter
        if (search) {
            query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        // Add role filter
        if (roleId) {
            query += ` AND u.role_id = ?`;
            params.push(roleId);
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
        const [countResult] = await db.query<RowDataPacket[]>(countQuery, params);
        const total = countResult[0].total;

        // Add pagination
        query += ` ORDER BY u.createdAt DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Execute query
        const [users] = await db.query<RowDataPacket[]>(query, params);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST - Create new user
export async function POST(request: NextRequest) {
    try {
        const { email, password, name, role_id, organization_id } = await request.json();

        // Validation
        if (!email || !password || !name || !role_id || !organization_id) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const [existingUsers] = await db.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (email, password, name, role_id, organization_id) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, name, role_id, organization_id]
        );

        return NextResponse.json(
            {
                message: 'User created successfully',
                userId: (result as any).insertId,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create user' },
            { status: 500 }
        );
    }
}
