import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge, NotificationBadge, StatusBadge } from '../badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders label text', () => {
      render(<Badge label="New" />);
      expect(screen.getByText('New')).toBeTruthy();
    });

    it('renders as dot without text when dot prop is true', () => {
      const { queryByText } = render(<Badge label="New" dot />);
      expect(queryByText('New')).toBeNull();
    });
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Badge label="Default" variant="default" />);
      expect(screen.getByText('Default')).toBeTruthy();
    });

    it('renders primary variant', () => {
      render(<Badge label="Primary" variant="primary" />);
      expect(screen.getByText('Primary')).toBeTruthy();
    });

    it('renders success variant', () => {
      render(<Badge label="Success" variant="success" />);
      expect(screen.getByText('Success')).toBeTruthy();
    });

    it('renders error variant', () => {
      render(<Badge label="Error" variant="error" />);
      expect(screen.getByText('Error')).toBeTruthy();
    });

    it('renders warning variant', () => {
      render(<Badge label="Warning" variant="warning" />);
      expect(screen.getByText('Warning')).toBeTruthy();
    });

    it('renders info variant', () => {
      render(<Badge label="Info" variant="info" />);
      expect(screen.getByText('Info')).toBeTruthy();
    });

    it('renders outline variant', () => {
      render(<Badge label="Outline" variant="outline" />);
      expect(screen.getByText('Outline')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Badge label="SM" size="sm" />);
      expect(screen.getByText('SM')).toBeTruthy();
    });

    it('renders medium size by default', () => {
      render(<Badge label="MD" />);
      expect(screen.getByText('MD')).toBeTruthy();
    });

    it('renders large size', () => {
      render(<Badge label="LG" size="lg" />);
      expect(screen.getByText('LG')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has accessible text content', () => {
      render(<Badge label="Accessible" />);
      expect(screen.getByText('Accessible')).toBeTruthy();
    });

    it('has custom accessibility label', () => {
      render(<Badge label="Status" accessibilityLabel="Custom Label" />);
      expect(screen.getByLabelText('Custom Label')).toBeTruthy();
    });
  });
});

describe('NotificationBadge', () => {
  it('renders count', () => {
    render(<NotificationBadge count={5} />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('renders max count with plus', () => {
    render(<NotificationBadge count={150} maxCount={99} />);
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('does not render when count is 0 by default', () => {
    const { queryByText } = render(<NotificationBadge count={0} />);
    expect(queryByText('0')).toBeNull();
  });

  it('renders 0 when showZero is true', () => {
    render(<NotificationBadge count={0} showZero />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('uses error variant by default', () => {
    render(<NotificationBadge count={3} />);
    expect(screen.getByText('3')).toBeTruthy();
  });
});

describe('StatusBadge', () => {
  it('renders label with dot', () => {
    render(<StatusBadge label="Active" />);
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('renders without dot when showDot is false', () => {
    render(<StatusBadge label="Inactive" showDot={false} />);
    expect(screen.getByText('Inactive')).toBeTruthy();
  });

  it('has accessibility label for status', () => {
    render(<StatusBadge label="Online" />);
    expect(screen.getByLabelText('Status: Online')).toBeTruthy();
  });
});
