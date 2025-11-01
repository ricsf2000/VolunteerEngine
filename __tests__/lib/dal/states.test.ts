




import {
  getAllStates,
  getStateByCode,
} from '@/app/lib/dal/states';
import { prisma } from '@/app/lib/db';

describe('states DAL', () => {
  describe('getAllStates', () => {
    it('should return array of states', async () => {
      const states = await getAllStates();

      expect(Array.isArray(states)).toBe(true);
      expect(states.length).toBe(50);
      expect(states[0]).toHaveProperty('code');
      expect(states[0]).toHaveProperty('name');
    });

    it('should return empty array on database error', async () => {
      jest.spyOn(prisma.state, 'findMany').mockRejectedValueOnce(new Error('Database error'));
      
      const states = await getAllStates();
      
      expect(states).toEqual([]);
    });
  });

  describe('getStateByCode', () => {
    it('should return state for valid code', async () => {
      const state = await getStateByCode('TX');

      expect(state).toBeTruthy();
      expect(state?.code).toBe('TX');
      expect(state?.name).toBe('Texas');
    });

    it('should return null for invalid code', async () => {
      const state = await getStateByCode('XX');

      expect(state).toBeNull();
    });

    it('should be case sensitive', async () => {
      const state = await getStateByCode('tx');

      expect(state).toBeNull();
    });

    it('should return null on database error', async () => {
      jest.spyOn(prisma.state, 'findUnique').mockRejectedValueOnce(new Error('Database error'));
      
      const state = await getStateByCode('TX');
      
      expect(state).toBeNull();
    });
  });
});