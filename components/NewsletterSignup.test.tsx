import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsletterSignup from './NewsletterSignup';

// Mock fetch
global.fetch = jest.fn();

describe('NewsletterSignup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<NewsletterSignup />);
    
    expect(screen.getByText('Gaukite naujienas')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jūsų el. paštas')).toBeInTheDocument();
    expect(screen.getByText(/Sutinku gauti naujienas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prenumeruoti' })).toBeInTheDocument();
  });

  it('hides title when showTitle is false', () => {
    render(<NewsletterSignup showTitle={false} />);
    
    expect(screen.queryByText('Gaukite naujienas')).not.toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<NewsletterSignup />);
    
    const emailInput = screen.getByPlaceholderText('Jūsų el. paštas');
    const consentCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: 'Prenumeruoti' });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitButton);
    
    // Wait a moment to ensure any async operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should not call API with invalid email
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('requires consent checkbox', async () => {
    render(<NewsletterSignup />);
    
    const emailInput = screen.getByPlaceholderText('Jūsų el. paštas');
    const submitButton = screen.getByRole('button', { name: 'Prenumeruoti' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    // Wait a moment to ensure any async operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should not call API without consent
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits form successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Success' }),
    });

    render(<NewsletterSignup />);
    
    const emailInput = screen.getByPlaceholderText('Jūsų el. paštas');
    const consentCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: 'Prenumeruoti' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sėkmingai užsiprenumeravote naujienas/i)).toBeInTheDocument();
    });
    
    // Just check that fetch was called with correct endpoint and method
    expect(global.fetch).toHaveBeenCalledWith('/api/newsletter', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('handles API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'API Error' }),
    });

    render(<NewsletterSignup />);
    
    const emailInput = screen.getByPlaceholderText('Jūsų el. paštas');
    const consentCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: 'Prenumeruoti' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true }),
      }), 100))
    );

    render(<NewsletterSignup />);
    
    const emailInput = screen.getByPlaceholderText('Jūsų el. paštas');
    const consentCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: 'Prenumeruoti' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Prenumeruojama...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.getByText('Prenumeruoti')).toBeInTheDocument();
    });
  });

  it('includes name field when provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<NewsletterSignup />);
    
    const nameInput = screen.getByPlaceholderText('Vardas (neprivaloma)');
    const emailInput = screen.getByPlaceholderText('Jūsų el. paštas');
    const consentCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: 'Prenumeruoti' });
    
    fireEvent.change(nameInput, { target: { value: 'Jonas' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    // Verify name is included
    const callArg = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(callArg.body);
    expect(body.name).toBe('Jonas');
    expect(body.email).toBe('test@example.com');
  });

  it('passes correct variant to API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<NewsletterSignup variant="modal" />);
    
    const emailInput = screen.getByPlaceholderText('Jūsų el. paštas');
    const consentCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: 'Prenumeruoti' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/newsletter',
        expect.objectContaining({
          body: expect.stringContaining('"source":"modal"'),
        })
      );
    });
  });

  it('clears form after successful submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<NewsletterSignup />);
    
    const nameInput = screen.getByPlaceholderText('Vardas (neprivaloma)') as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText('Jūsų el. paštas') as HTMLInputElement;
    const consentCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Prenumeruoti' });
    
    fireEvent.change(nameInput, { target: { value: 'Jonas' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(consentCheckbox);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(consentCheckbox.checked).toBe(false);
    });
  });
});
