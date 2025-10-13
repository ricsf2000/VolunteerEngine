import { GET } from '@/app/api/states/route';
import * as statesDAL from '@/app/lib/dal/states';

// Mock the DAL module
jest.mock('@/app/lib/dal/states');
const mockGetAllStates = statesDAL.getAllStates as jest.MockedFunction<any>;

describe('/api/states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/states', () => {
    const mockStates = [
      { code: 'TX', name: 'Texas' },
      { code: 'CA', name: 'California' },
      { code: 'NY', name: 'New York' },
      { code: 'FL', name: 'Florida' }
    ];

    it('should return all states successfully', async () => {
      mockGetAllStates.mockResolvedValue(mockStates);

      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockStates);
      expect(mockGetAllStates).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no states found', async () => {
      mockGetAllStates.mockResolvedValue([]);

      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual([]);
      expect(mockGetAllStates).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      mockGetAllStates.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET();
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Internal server error');
      expect(mockGetAllStates).toHaveBeenCalledTimes(1);
    });

    it('should handle unexpected errors', async () => {
      mockGetAllStates.mockRejectedValue(new Error('Unexpected error'));

      const response = await GET();
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Internal server error');
    });

    it('should handle null response from DAL', async () => {
      mockGetAllStates.mockResolvedValue(null);

      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toBeNull();
    });

    it('should return correct content type', async () => {
      mockGetAllStates.mockResolvedValue(mockStates);

      const response = await GET();
      
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should call getAllStates exactly once', async () => {
      mockGetAllStates.mockResolvedValue(mockStates);

      await GET();
      
      expect(mockGetAllStates).toHaveBeenCalledTimes(1);
      expect(mockGetAllStates).toHaveBeenCalledWith();
    });

    it('should handle very large state lists', async () => {
      // Create a large mock states array
      const largeStatesList = Array.from({ length: 100 }, (_, i) => ({
        code: `S${i.toString().padStart(2, '0')}`,
        name: `State ${i}`
      }));
      
      mockGetAllStates.mockResolvedValue(largeStatesList);

      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveLength(100);
      expect(body[0]).toEqual({ code: 'S00', name: 'State 0' });
    });

    it('should preserve state data structure', async () => {
      const statesWithExtraFields = [
        { code: 'TX', name: 'Texas', abbreviation: 'TX', population: 29000000 },
        { code: 'CA', name: 'California', abbreviation: 'CA', population: 39000000 }
      ];
      
      mockGetAllStates.mockResolvedValue(statesWithExtraFields);

      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(statesWithExtraFields);
      expect(body[0]).toHaveProperty('population');
    });
  });
});