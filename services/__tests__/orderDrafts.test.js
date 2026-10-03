import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MAX_DRAFTS,
  deleteDraft,
  draftOwnerKey,
  getDraft,
  listDrafts,
  sanitizeDraftData,
  saveDraft,
} from '../orderDrafts';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('draftOwnerKey', () => {
  it('needs a user id and namespaces by account type', () => {
    expect(draftOwnerKey({ id: 7 }, 'organization')).toBe('organization:7');
    expect(draftOwnerKey({ id: 7 }, null)).toBe('user:7');
    expect(draftOwnerKey(null, 'organization')).toBeNull();
    expect(draftOwnerKey({ id: '' }, 'individual')).toBeNull();
  });
});

describe('sanitizeDraftData', () => {
  it('drops blob:/data: uris but keeps file uris and other values', () => {
    const data = {
      issue: { photos: ['blob:http://x/1', 'file:///a.jpg', 'data:image/png;base64,AAA'], note: 'n' },
      cover: 'blob:http://x/2',
      count: 3,
    };
    expect(sanitizeDraftData(data)).toEqual({
      issue: { photos: ['file:///a.jpg'], note: 'n' },
      count: 3,
    });
  });
});

describe('draft storage', () => {
  const owner = 'organization:1';

  it('saves, updates in place, lists newest first and deletes', async () => {
    await saveDraft(owner, { id: 'a', source: 'systematic', data: { x: 1 } });
    await new Promise((r) => setTimeout(r, 2));
    await saveDraft(owner, { id: 'b', source: 'systematic', data: { x: 2 } });
    await new Promise((r) => setTimeout(r, 2));
    await saveDraft(owner, { id: 'a', source: 'systematic', data: { x: 3 } });

    const drafts = await listDrafts(owner);
    expect(drafts.map((d) => d.id)).toEqual(['a', 'b']);
    expect((await getDraft(owner, 'a')).data).toEqual({ x: 3 });

    await deleteDraft(owner, 'a');
    expect((await listDrafts(owner)).map((d) => d.id)).toEqual(['b']);
  });

  it('keeps accounts apart', async () => {
    await saveDraft(owner, { id: 'a', source: 'systematic', data: {} });
    expect(await listDrafts('organization:2')).toEqual([]);
  });

  it('does nothing without an owner', async () => {
    expect(await saveDraft(null, { id: 'a', data: {} })).toBe(false);
    expect(await listDrafts(null)).toEqual([]);
  });

  it('caps the number of drafts', async () => {
    for (let i = 0; i < MAX_DRAFTS + 3; i += 1) {
      await saveDraft(owner, { id: `d${i}`, source: 'systematic', data: {} });
    }
    expect((await listDrafts(owner)).length).toBe(MAX_DRAFTS);
  });

  it('survives corrupted storage', async () => {
    await AsyncStorage.setItem('@loop/orderDrafts/organization:1', '{not json');
    expect(await listDrafts(owner)).toEqual([]);
  });
});
