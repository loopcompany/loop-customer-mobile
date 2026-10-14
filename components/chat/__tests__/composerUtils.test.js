/**
 * ایموجی و پیوست در پیام‌ها (بند ۸).
 */
import {
  MAX_ATTACHMENTS,
  formatFileSize,
  insertAtSelection,
  isImageAttachment,
  validateAttachment,
} from '../composerUtils';

describe('insertAtSelection', () => {
  it('inserts at the caret', () => {
    expect(insertAtSelection('سلام دنیا', { start: 4, end: 4 }, '😊')).toEqual({
      text: 'سلام😊 دنیا',
      caret: 6,
    });
  });

  it('replaces a selected range', () => {
    expect(insertAtSelection('abcdef', { start: 1, end: 3 }, 'X')).toEqual({
      text: 'aXdef',
      caret: 2,
    });
  });

  it('appends when the selection is unknown or out of range', () => {
    expect(insertAtSelection('ab', undefined, '!').text).toBe('ab!');
    expect(insertAtSelection('ab', { start: 99, end: 99 }, '!').text).toBe('ab!');
    expect(insertAtSelection(null, { start: 0, end: 0 }, '!').text).toBe('!');
  });
});

describe('validateAttachment', () => {
  it('accepts images and PDFs', () => {
    expect(validateAttachment({ name: 'a.jpg', mimeType: 'image/jpeg', size: 1000 }, 0)).toBeNull();
    expect(
      validateAttachment({ name: 'letter.pdf', mimeType: 'application/pdf', size: 1000 }, 0)
    ).toBeNull();
    expect(validateAttachment({ uri: 'file:///x/photo.png' }, 0)).toBeNull();
  });

  it('rejects other types, big files and too many files', () => {
    expect(validateAttachment({ name: 'a.zip', mimeType: 'application/zip' }, 0)).toMatch(
      'Only images'
    );
    expect(
      validateAttachment({ name: 'a.pdf', mimeType: 'application/pdf', size: 11 * 1024 * 1024 }, 0)
    ).toMatch('10 MB');
    expect(validateAttachment({ name: 'a.jpg', mimeType: 'image/jpeg' }, MAX_ATTACHMENTS)).toMatch(
      'up to 5'
    );
  });

  it('recognises server attachments by mime type or url', () => {
    expect(isImageAttachment({ mime_type: 'image/png' })).toBe(true);
    expect(isImageAttachment({ url: 'https://x/y/z.jpeg?sig=1' })).toBe(true);
    expect(isImageAttachment({ url: 'https://x/doc.pdf' })).toBe(false);
  });
});

it('formats file sizes', () => {
  expect(formatFileSize(512)).toBe('1 KB');
  expect(formatFileSize(2.4 * 1024 * 1024)).toBe('2.4 MB');
  expect(formatFileSize(undefined)).toBe('');
});
