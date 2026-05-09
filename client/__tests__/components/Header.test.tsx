/**
 * ===========================================
 * TEST: Header Component
 * ===========================================
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../src/components/layout/Header';

// Mock NextThemes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

describe('Header Component', () => {
  it('should render the logo and title', () => {
    render(<Header onHistoryClick={() => {}} historyCount={0} />);
    
    expect(screen.getByText('LinguaTranslate')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Translation')).toBeInTheDocument();
  });

  it('should display history count badge when greater than 0', () => {
    render(<Header onHistoryClick={() => {}} historyCount={5} />);
    
    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
  });

  it('should call onHistoryClick when history button is clicked', () => {
    const mockOnClick = jest.fn();
    render(<Header onHistoryClick={mockOnClick} historyCount={2} />);
    
    const historyButton = screen.getByRole('button', { name: /history/i });
    fireEvent.click(historyButton);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
