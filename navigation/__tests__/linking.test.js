/**
 * `/folder` was retired in favour of `/list`. Bookmarks and old links still
 * point at it, so the linking config rewrites the path instead of dumping the
 * visitor on React Navigation's fallback route — that rewrite is pinned here.
 */
import { getStateFromPath, linkingConfig } from '../linking';
import { routes } from '../routes';

/** @returns {{ name: string, params?: object }} the screen a URL resolves to */
const resolve = (path) => {
  const state = getStateFromPath(path, linkingConfig);
  return state.routes[state.routes.length - 1];
};

describe('linking path rewrites', () => {
  it('sends the retired /folder path to the home page', () => {
    expect(resolve('/folder').name).toBe('List');
  });

  it('tolerates the trailing-slash form', () => {
    expect(resolve('/folder/').name).toBe('List');
  });

  it('keeps the query string when rewriting', () => {
    expect(resolve('/folder?ref=email')).toMatchObject({
      name: 'List',
      params: { ref: 'email' },
    });
  });

  it('leaves live paths alone', () => {
    expect(resolve('/list').name).toBe('List');
    expect(resolve('/login').name).toBe('LoginScreen');
  });

  it('no longer registers a /folder route', () => {
    expect(routes.some((route) => route.path === 'folder')).toBe(false);
    expect(routes.some((route) => route.name === 'FolderScreen')).toBe(false);
  });
});
