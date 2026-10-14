/**
 * لوگوموشن روی وب: اول با صدا؛ اگر مرورگر مسدود کرد، بی‌صدا و روشن شدن صدا
 * با اولین لمس کاربر.
 */
import { UNLOCK_EVENTS, playWithSoundOrMuted, unmuteOnFirstGesture } from '../autoplayWithSound';

const blocked = () => Object.assign(new Error('blocked'), { name: 'NotAllowedError' });

const fakeVideo = (play) => ({
  muted: true,
  volume: 0,
  paused: true,
  ended: false,
  play: jest.fn(play),
});

describe('playWithSoundOrMuted', () => {
  it('plays with sound when the browser allows it', async () => {
    const video = fakeVideo(() => Promise.resolve());
    await expect(playWithSoundOrMuted(video)).resolves.toBe('sound');
    expect(video.muted).toBe(false);
    expect(video.volume).toBe(1);
  });

  it('falls back to muted playback when sound is blocked', async () => {
    const video = fakeVideo(function play() {
      return this.muted ? Promise.resolve() : Promise.reject(blocked());
    });
    await expect(playWithSoundOrMuted(video)).resolves.toBe('muted');
    expect(video.muted).toBe(true);
    expect(video.play).toHaveBeenCalledTimes(2);
  });

  it('reports other failures without retrying', async () => {
    const video = fakeVideo(() => Promise.reject(new Error('network')));
    await expect(playWithSoundOrMuted(video)).resolves.toBe('failed');
    expect(video.play).toHaveBeenCalledTimes(1);
  });
});

describe('unmuteOnFirstGesture', () => {
  const target = () => {
    const handlers = {};
    return {
      handlers,
      addEventListener: jest.fn((name, fn) => {
        handlers[name] = fn;
      }),
      removeEventListener: jest.fn((name) => {
        delete handlers[name];
      }),
    };
  };

  it('turns the sound on at the first tap and stops listening', () => {
    const win = target();
    const video = { muted: true, volume: 0, paused: false, ended: false, play: jest.fn() };
    const onUnmuted = jest.fn();
    unmuteOnFirstGesture(win, video, onUnmuted);
    expect(Object.keys(win.handlers).sort()).toEqual([...UNLOCK_EVENTS].sort());

    win.handlers.pointerdown();
    expect(video.muted).toBe(false);
    expect(video.volume).toBe(1);
    expect(onUnmuted).toHaveBeenCalledTimes(1);
    expect(Object.keys(win.handlers)).toEqual([]);
  });

  it('can be cancelled before any gesture', () => {
    const win = target();
    const remove = unmuteOnFirstGesture(win, { muted: true }, jest.fn());
    remove();
    expect(Object.keys(win.handlers)).toEqual([]);
  });
});
