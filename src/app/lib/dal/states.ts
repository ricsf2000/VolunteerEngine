import { prisma } from '@/app/lib/db';
import type { State } from '@/generated/prisma';

export async function getAllStates(): Promise<State[]> {
  try {
    const states = await prisma.state.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    return states;
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
}

export async function getStateByCode(code: string): Promise<State | null> {
  try {
    const state = await prisma.state.findUnique({
      where: {
        code: code
      }
    });
    return state;
  } catch (error) {
    console.error('Error fetching state by code:', error);
    return null;
  }
}