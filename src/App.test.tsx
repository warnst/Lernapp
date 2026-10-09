import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '@/App';

describe('App', () => {
  it('zeigt auf der Startseite einen Hauptbereich', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
