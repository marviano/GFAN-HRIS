import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - Fetch all organizations
export async function GET(request: NextRequest) {
    try {
        const [organizations] = await db.query<RowDataPacket[]>(
            'SELECT id, name, slug FROM organizations ORDER BY name'
        );

        return NextResponse.json({ organizations });
    } catch (error) {
        console.error('Get organizations error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        );
    }
}
