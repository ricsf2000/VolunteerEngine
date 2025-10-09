import { NextResponse } from 'next/server';
import { getAllStates } from '@/app/lib/dal/states';

export async function GET() {
  try {
    const states = await getAllStates();
    return NextResponse.json(states);
  } catch (error) {
    console.error('Error getting states:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}