import { describe, expect, it } from 'vitest';

import {
  queryBuilderMock,
  queueSupabaseQueryResults,
} from '../../../tests/mocks/supabase';
import { getNotifications } from './api';

describe('notifications API', () => {
  it('scopes list and unread-count queries to the authenticated user', async () => {
    queueSupabaseQueryResults(
      {
        data: [
          {
            id: 'notification-a',
            user_id: 'resident-a',
            title: 'Atualização',
            type: 'ticket_updated',
            metadata: null,
            read_at: null,
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
        error: null,
      },
      { data: null, error: null, count: 1 }
    );

    await expect(getNotifications('resident-a')).resolves.toMatchObject({
      unreadCount: 1,
      notifications: [{ id: 'notification-a' }],
    });
    expect(queryBuilderMock.select).toHaveBeenCalledWith(
      'id, user_id, title, type, metadata, read_at, created_at'
    );
    expect(queryBuilderMock.eq).toHaveBeenCalledTimes(2);
    expect(queryBuilderMock.eq).toHaveBeenNthCalledWith(
      1,
      'user_id',
      'resident-a'
    );
    expect(queryBuilderMock.eq).toHaveBeenNthCalledWith(
      2,
      'user_id',
      'resident-a'
    );
  });

  it('identifies which of the parallel queries failed', async () => {
    queueSupabaseQueryResults(
      {
        data: null,
        error: {
          message: 'column notifications.metadata does not exist',
          code: '42703',
          details: 'PostgREST schema cache lookup failed',
          hint: 'Check the selected columns',
          status: 400,
        },
      },
      { data: null, error: null, count: 0 }
    );

    await expect(getNotifications('resident-a')).rejects.toMatchObject({
      operation: 'notifications.list',
      message: 'column notifications.metadata does not exist',
      code: '42703',
      status: 400,
    });
  });
});
