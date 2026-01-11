import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders logo and nav links', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /yakiwood homepage/i })).toBeInTheDocument();

    // next-intl is mocked in Jest and returns translation keys.
    // When useLocale() is 'lt', URLs are prefixed and slugs are translated.
    const productLinks = screen.getAllByRole('link', { name: /^nav\.produktai$/i });
    expect(productLinks.some((link) => link.getAttribute('href') === '/lt/produktai')).toBe(true);

    const configuratorLinks = screen.getAllByRole('link', { name: /^nav\.konfiguratorius3d$/i });
    expect(configuratorLinks.some((link) => link.getAttribute('href') === '/lt/konfiguratorius3d')).toBe(true);

    expect(screen.getByAltText(/cart/i)).toBeInTheDocument();
  });
});
