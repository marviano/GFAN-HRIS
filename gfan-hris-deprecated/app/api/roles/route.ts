import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - Fetch all roles
export async function GET(request: NextRequest) {
    try {
        const [roles] = await db.query<RowDataPacket[]>(
            'SELECT id, name, description FROM roles ORDER BY name'
        );

        return NextResponse.json({ roles });
    } catch (error) {
        console.error('Get roles error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch roles' },
            { status: 500 }
        );
    }
}
