import { fetchMatches, postAssignment, checkAssignmentByNames, fetchGlobalMatches } from '@/app/lib/api/matches';

describe('lib/api/matches client helpers', () => {
  const origFetch = global.fetch;
  const origWindow = (global as any).window;

  beforeEach(() => {
    (global as any).window = { location: { origin: 'http://localhost' } } as any;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = origFetch as any;
    (global as any).window = origWindow;
    jest.clearAllMocks();
  });

  it('fetchMatches returns JSON on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ([{ score: 1 }]) });
    const data = await fetchMatches('evt');
    expect(global.fetch).toHaveBeenCalledWith('/api/matches/evt', expect.any(Object));
    expect(Array.isArray(data)).toBe(true);
  });

  it('fetchMatches throws on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ message: 'fail' }) });
    await expect(fetchMatches('evt')).rejects.toThrow('fail');
  });

  it('postAssignment posts and returns JSON on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: 'vh-1' }) });
    const data = await postAssignment('e1', 'v1');
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/api/assignments');
    expect(data).toEqual({ id: 'vh-1' });
  });

  it('postAssignment throws on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ message: 'nope' }) });
    await expect(postAssignment('e1', 'v1')).rejects.toThrow('nope');
  });

  it('checkAssignmentByNames builds URL and returns result', async () => {
    const result = { exists: false };
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => result });
    const data = await checkAssignmentByNames('Alice', 'Food');
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/api/assignments/check');
    expect(data).toEqual(result);
  });

  it('checkAssignmentByNames throws on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ message: 'bad' }) });
    await expect(checkAssignmentByNames('A', 'B')).rejects.toThrow('bad');
  });

  it('fetchGlobalMatches returns list on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ([]) });
    const data = await fetchGlobalMatches(2);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/api/matches/global');
    expect(Array.isArray(data)).toBe(true);
  });

  it('fetchGlobalMatches throws on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ message: 'oops' }) });
    await expect(fetchGlobalMatches(1)).rejects.toThrow('oops');
  });
});

