import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
    try {
        const { email, password, verifyPassword } = await request.json();

        // Validation
        if (!email || !password || !verifyPassword) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password !== verifyPassword) {
            return NextResponse.json(
                { error: 'Passwords do not match' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Check database connection and tables
        try {
            await db.query('SELECT 1');
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return NextResponse.json(
                { error: 'Database connection failed. Please check your database configuration.' },
                { status: 500 }
            );
        }

        // Check if user already exists
        try {
            const [existingUsers] = await db.query<RowDataPacket[]>(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return NextResponse.json(
                    { error: 'Email already registered' },
                    { status: 409 }
                );
            }
        } catch (tableError: any) {
            console.error('Table query error:', tableError);
            if (tableError.code === 'ER_NO_SUCH_TABLE') {
                return NextResponse.json(
                    { error: 'Database tables not created. Please run the database schema first.' },
                    { status: 500 }
                );
            }
            throw tableError;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if default role and organization exist, if not create them
        try {
            // Check/create default organization
            const [orgs] = await db.query<RowDataPacket[]>('SELECT id FROM organizations WHERE id = 1');
            if (orgs.length === 0) {
                // Create a temporary user first (we'll update it later)
                await db.query(
                    'INSERT INTO organizations (id, name, slug, owner_user_id) VALUES (1, ?, ?, 1) ON DUPLICATE KEY UPDATE id=id',
                    ['Default Organization', 'default']
                );
            }

            // Check/create default role
            const [roles] = await db.query<RowDataPacket[]>('SELECT id FROM roles WHERE id = 1');
            if (roles.length === 0) {
                await db.query(
                    'INSERT INTO roles (id, name, description, organization_id) VALUES (1, ?, ?, 1) ON DUPLICATE KEY UPDATE id=id',
                    ['User', 'Default user role']
                );
            }
        } catch (setupError: any) {
            console.error('Setup error:', setupError);
            // If foreign key constraints are the issue, provide helpful error
            if (setupError.code === 'ER_NO_REFERENCED_ROW_2') {
                return NextResponse.json(
                    { error: 'Database setup incomplete. Please ensure all tables are created properly.' },
                    { status: 500 }
                );
            }
        }

        // Insert new user
        try {
            const [result] = await db.query(
                'INSERT INTO users (email, password, name, role_id, organization_id) VALUES (?, ?, ?, ?, ?)',
                [email, hashedPassword, email.split('@')[0], 1, 1]
            );

            return NextResponse.json(
                {
                    message: 'User registered successfully',
                    userId: (result as any).insertId
                },
                { status: 201 }
            );
        } catch (insertError: any) {
            console.error('User insert error:', insertError);
            if (insertError.code === 'ER_NO_REFERENCED_ROW_2') {
                return NextResponse.json(
                    { error: 'Cannot create user: required roles or organizations not found in database.' },
                    { status: 500 }
                );
            }
            throw insertError;
        }

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: `Internal server error: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
