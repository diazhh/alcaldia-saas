import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects, useProject, useCreateProject } from '@/hooks/useProjects';
import api from '@/lib/api';

// Mock axios
jest.mock('@/lib/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProjects', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches projects successfully', async () => {
    const mockData = {
      data: {
        data: {
          projects: [
            { id: '1', name: 'Proyecto 1' },
            { id: '2', name: 'Proyecto 2' },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        },
      },
    };

    api.get.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useProjects({}, 1, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data.projects).toHaveLength(2);
    expect(result.current.data.projects[0].name).toBe('Proyecto 1');
  });

  it('handles error when fetching projects', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProjects({}, 1, 10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe('useProject', () => {
  it('fetches single project successfully', async () => {
    const mockData = {
      data: {
        data: {
          id: '1',
          name: 'Proyecto 1',
          description: 'Descripción',
        },
      },
    };

    api.get.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useProject('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data.name).toBe('Proyecto 1');
  });

  it('does not fetch when projectId is not provided', () => {
    const { result } = renderHook(() => useProject(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useCreateProject', () => {
  it('creates project successfully', async () => {
    const mockData = {
      data: {
        data: {
          id: '1',
          name: 'Nuevo Proyecto',
        },
      },
    };

    api.post.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useCreateProject(), {
      wrapper: createWrapper(),
    });

    const projectData = {
      name: 'Nuevo Proyecto',
      budget: 100000,
      status: 'PLANNING',
    };

    await waitFor(() => {
      result.current.mutate(projectData);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.post).toHaveBeenCalledWith('/projects', projectData);
  });

  it('handles error when creating project', async () => {
    api.post.mockRejectedValueOnce(new Error('Validation error'));

    const { result } = renderHook(() => useCreateProject(), {
      wrapper: createWrapper(),
    });

    const projectData = {
      name: 'Proyecto Inválido',
    };

    await waitFor(() => {
      result.current.mutate(projectData);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
