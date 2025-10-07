import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('react-datepicker/dist/react-datepicker.css', () => ({}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  }) as any
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
