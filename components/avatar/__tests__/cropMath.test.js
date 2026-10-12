/**
 * برش دایره‌ای عکس پروفایل: مستطیل برش باید مربع، داخل عکس و دقیقاً همان
 * ناحیه‌ای باشد که کاربر داخل دایره می‌بیند.
 */
import { clampOffset, coverScale, cropRect, displaySize, touchDistance } from '../cropMath';

const landscape = { imageWidth: 2000, imageHeight: 1000, viewport: 300 };

describe('cropMath', () => {
  it('covers the viewport at zoom 1', () => {
    expect(coverScale(2000, 1000, 300)).toBeCloseTo(0.3);
    const size = displaySize({ ...landscape, zoom: 1 });
    expect(size.height).toBeCloseTo(300);
    expect(size.width).toBeCloseTo(600);
  });

  it('crops the centred square at rest', () => {
    expect(cropRect({ ...landscape, zoom: 1, tx: 0, ty: 0 })).toEqual({
      originX: 500,
      originY: 0,
      width: 1000,
      height: 1000,
    });
  });

  it('follows a drag to the left edge', () => {
    const { tx, ty } = clampOffset({ ...landscape, zoom: 1, tx: 10_000, ty: 50 });
    expect(tx).toBeCloseTo(150);
    expect(ty).toBe(0); // no vertical slack at zoom 1
    expect(cropRect({ ...landscape, zoom: 1, tx, ty })).toMatchObject({
      originX: 0,
      originY: 0,
      width: 1000,
    });
  });

  it('shrinks the crop when zoomed in', () => {
    const rect = cropRect({ ...landscape, zoom: 2, tx: 0, ty: 0 });
    expect(rect.width).toBe(500);
    expect(rect.height).toBe(500);
    expect(rect.originX).toBe(750);
    expect(rect.originY).toBe(250);
  });

  it('never leaves the image bounds', () => {
    const rect = cropRect({ ...landscape, zoom: 2, tx: -9999, ty: 9999 });
    expect(rect.originX + rect.width).toBeLessThanOrEqual(2000);
    expect(rect.originY).toBeGreaterThanOrEqual(0);
  });

  it('measures pinch distance', () => {
    expect(
      touchDistance([
        { pageX: 0, pageY: 0 },
        { pageX: 3, pageY: 4 },
      ])
    ).toBe(5);
    expect(touchDistance([{ pageX: 0, pageY: 0 }])).toBe(0);
  });
});
