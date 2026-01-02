import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders with label text', () => {
      render(<Button label="Click me" />);
      expect(screen.getByText('Click me')).toBeTruthy();
    });

    it('renders with accessibility role button', () => {
      render(<Button label="Test" />);
      expect(screen.getByRole('button')).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('renders primary variant by default', () => {
      const { getByRole } = render(<Button label="Primary" />);
      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('renders secondary variant', () => {
      render(<Button label="Secondary" variant="secondary" />);
      expect(screen.getByText('Secondary')).toBeTruthy();
    });

    it('renders outline variant', () => {
      render(<Button label="Outline" variant="outline" />);
      expect(screen.getByText('Outline')).toBeTruthy();
    });

    it('renders ghost variant', () => {
      render(<Button label="Ghost" variant="ghost" />);
      expect(screen.getByText('Ghost')).toBeTruthy();
    });

    it('renders destructive variant', () => {
      render(<Button label="Delete" variant="destructive" />);
      expect(screen.getByText('Delete')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Button label="Small" size="sm" />);
      expect(screen.getByText('Small')).toBeTruthy();
    });

    it('renders medium size by default', () => {
      render(<Button label="Medium" />);
      expect(screen.getByText('Medium')).toBeTruthy();
    });

    it('renders large size', () => {
      render(<Button label="Large" size="lg" />);
      expect(screen.getByText('Large')).toBeTruthy();
    });
  });

  describe('states', () => {
    it('handles onPress callback', () => {
      const onPressMock = jest.fn();
      render(<Button label="Press me" onPress={onPressMock} />);

      fireEvent.press(screen.getByText('Press me'));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      const onPressMock = jest.fn();
      render(<Button label="Disabled" disabled onPress={onPressMock} />);

      fireEvent.press(screen.getByText('Disabled'));
      expect(onPressMock).not.toHaveBeenCalled();
    });

    it('shows loading indicator when isLoading is true', () => {
      render(<Button label="Loading" isLoading />);
      // ActivityIndicator is rendered
      expect(screen.getByText('Loading')).toBeTruthy();
    });

    it('is disabled when isLoading is true', () => {
      const onPressMock = jest.fn();
      render(<Button label="Loading" isLoading onPress={onPressMock} />);

      fireEvent.press(screen.getByText('Loading'));
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('accepts custom className', () => {
      render(<Button label="Custom" className="custom-class" />);
      expect(screen.getByText('Custom')).toBeTruthy();
    });
  });
});
