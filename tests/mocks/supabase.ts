import { vi } from 'vitest';

export interface SupabaseResult<T = unknown> {
  data: T;
  error: {
    code?: string;
    message: string;
    details?: string;
    hint?: string;
    status?: string | number;
  } | null;
  count?: number | null;
}

type AuthStateCallback = (
  event: string,
  session: { user: unknown } | null
) => void;

const defaultResult: SupabaseResult<null> = {
  data: null,
  error: null,
  count: null,
};

let authStateCallback: AuthStateCallback | null = null;
let queryResults: SupabaseResult[] = [];

function nextQueryResult(): SupabaseResult {
  return queryResults.shift() ?? defaultResult;
}

export const queryBuilderMock = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  in: vi.fn(),
  is: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  range: vi.fn(),
  ilike: vi.fn(),
  or: vi.fn(),
  single: vi.fn(),
  maybeSingle: vi.fn(),
  then: vi.fn(
    (
      onFulfilled?: (result: SupabaseResult) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(nextQueryResult()).then(onFulfilled, onRejected)
  ),
};

export const storageBucketMock = {
  upload: vi.fn(),
  remove: vi.fn(),
  createSignedUrl: vi.fn(),
};

export const realtimeChannelMock = {
  on: vi.fn(),
  subscribe: vi.fn(),
};

export const supabaseMock = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
  storage: {
    from: vi.fn(),
  },
  channel: vi.fn(),
  removeChannel: vi.fn(),
};

export function queueSupabaseQueryResults(...results: SupabaseResult[]) {
  queryResults.push(...results);
}

export function emitAuthStateChange(
  event: string,
  session: { user: unknown } | null
) {
  authStateCallback?.(event, session);
}

export function resetSupabaseMock() {
  vi.clearAllMocks();
  queryResults = [];
  authStateCallback = null;

  queryBuilderMock.select.mockReturnValue(queryBuilderMock);
  queryBuilderMock.insert.mockReturnValue(queryBuilderMock);
  queryBuilderMock.update.mockReturnValue(queryBuilderMock);
  queryBuilderMock.delete.mockReturnValue(queryBuilderMock);
  queryBuilderMock.eq.mockReturnValue(queryBuilderMock);
  queryBuilderMock.in.mockReturnValue(queryBuilderMock);
  queryBuilderMock.is.mockReturnValue(queryBuilderMock);
  queryBuilderMock.order.mockReturnValue(queryBuilderMock);
  queryBuilderMock.limit.mockReturnValue(queryBuilderMock);
  queryBuilderMock.range.mockReturnValue(queryBuilderMock);
  queryBuilderMock.ilike.mockReturnValue(queryBuilderMock);
  queryBuilderMock.or.mockReturnValue(queryBuilderMock);
  queryBuilderMock.single.mockReturnValue(queryBuilderMock);
  queryBuilderMock.maybeSingle.mockReturnValue(queryBuilderMock);

  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
  supabaseMock.auth.signUp.mockResolvedValue({ data: null, error: null });
  supabaseMock.auth.signInWithPassword.mockResolvedValue({
    data: null,
    error: null,
  });
  supabaseMock.auth.signOut.mockResolvedValue({ error: null });
  supabaseMock.auth.onAuthStateChange.mockImplementation(callback => {
    authStateCallback = callback as AuthStateCallback;
    return {
      data: {
        subscription: { unsubscribe: vi.fn() },
      },
    };
  });

  supabaseMock.from.mockReturnValue(queryBuilderMock);
  supabaseMock.rpc.mockResolvedValue(defaultResult);

  storageBucketMock.upload.mockResolvedValue(defaultResult);
  storageBucketMock.remove.mockResolvedValue(defaultResult);
  storageBucketMock.createSignedUrl.mockResolvedValue({
    data: { signedUrl: 'https://storage.test/signed' },
    error: null,
  });
  supabaseMock.storage.from.mockReturnValue(storageBucketMock);

  realtimeChannelMock.on.mockReturnValue(realtimeChannelMock);
  realtimeChannelMock.subscribe.mockReturnValue(realtimeChannelMock);
  supabaseMock.channel.mockReturnValue(realtimeChannelMock);
  supabaseMock.removeChannel.mockResolvedValue('ok');
}

resetSupabaseMock();
