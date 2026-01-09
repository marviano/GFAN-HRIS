import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface User extends RowDataPacket {
    id: number;
    email: string;
    password: string;
    name: string;
    role_id: number;
    organization_id: number;
}

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const [users] = await db.query<User[]>(
            'SELECT id, email, password, name, role_id, organization_id FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const user = users[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Return user data (excluding password)
        return NextResponse.json(
            {
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role_id: user.role_id,
                    organization_id: user.organization_id,
                },
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
