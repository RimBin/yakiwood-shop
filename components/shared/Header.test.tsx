import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders logo and nav links', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: /yakiwood homepage/i })).toBeInTheDocument();

    const productLinks = screen.getAllByRole('link', { name: /^products$/i });
    expect(productLinks.some((link) => link.getAttribute('href') === '/products')).toBe(true);

    expect(screen.getByAltText(/cart/i)).toBeInTheDocument();
  });
});
