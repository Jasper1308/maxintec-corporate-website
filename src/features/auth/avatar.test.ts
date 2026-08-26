import { describe, expect, it } from 'vitest';

import { queueSupabaseQueryResults, storageBucketMock, supabaseMock } from '../../../tests/mocks/supabase';
import { getOwnAvatarUrl, uploadOwnAvatar, validateAvatar } from './avatar';

describe('private profile image', () => {
  it('validates supported image type and size', () => {
    expect(() => validateAvatar(new File(['x'], 'avatar.gif', { type: 'image/gif' }))).toThrow('JPG');
    expect(() => validateAvatar(new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'avatar.png', { type: 'image/png' }))).toThrow('2 MB');
  });
  it('uses the authenticated user in the private path and profile update', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-a' } }, error: null });
    queueSupabaseQueryResults({ data: { id: 'user-a' }, error: null });
    const path = await uploadOwnAvatar(new File(['image'], 'avatar.png', { type: 'image/png' }), null);
    expect(path).toMatch(/^user-a\/[0-9a-f-]+\.png$/);
    expect(storageBucketMock.upload).toHaveBeenCalledWith(path, expect.any(File), expect.objectContaining({ upsert: false }));
  });
  it('creates a temporary private URL only for the authenticated owner', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-a' } }, error: null });
    await expect(getOwnAvatarUrl('user-a/avatar.png')).resolves.toContain('storage.test');
    await expect(getOwnAvatarUrl('user-b/avatar.png')).rejects.toThrow('Imagem indisponível');
  });
});
