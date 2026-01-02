import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from '../text';

describe('Text', () => {
  describe('rendering', () => {
    it('renders children text', () => {
      render(<Text>Hello World</Text>);
      expect(screen.getByText('Hello World')).toBeTruthy();
    });

    it('renders nested text', () => {
      render(
        <Text>
          Hello <Text>World</Text>
        </Text>
      );
      expect(screen.getByText(/Hello/)).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Text variant="default">Default</Text>);
      expect(screen.getByText('Default')).toBeTruthy();
    });

    it('renders muted variant', () => {
      render(<Text variant="muted">Muted</Text>);
      expect(screen.getByText('Muted')).toBeTruthy();
    });

    it('renders primary variant', () => {
      render(<Text variant="primary">Primary</Text>);
      expect(screen.getByText('Primary')).toBeTruthy();
    });

    it('renders destructive variant', () => {
      render(<Text variant="destructive">Destructive</Text>);
      expect(screen.getByText('Destructive')).toBeTruthy();
    });

    it('renders success variant', () => {
      render(<Text variant="success">Success</Text>);
      expect(screen.getByText('Success')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders extra small size', () => {
      render(<Text size="xs">XS</Text>);
      expect(screen.getByText('XS')).toBeTruthy();
    });

    it('renders small size', () => {
      render(<Text size="sm">Small</Text>);
      expect(screen.getByText('Small')).toBeTruthy();
    });

    it('renders medium size by default', () => {
      render(<Text>Medium</Text>);
      expect(screen.getByText('Medium')).toBeTruthy();
    });

    it('renders large size', () => {
      render(<Text size="lg">Large</Text>);
      expect(screen.getByText('Large')).toBeTruthy();
    });

    it('renders extra large size', () => {
      render(<Text size="xl">XL</Text>);
      expect(screen.getByText('XL')).toBeTruthy();
    });

    it('renders 2xl size', () => {
      render(<Text size="2xl">2XL</Text>);
      expect(screen.getByText('2XL')).toBeTruthy();
    });

    it('renders 3xl size', () => {
      render(<Text size="3xl">3XL</Text>);
      expect(screen.getByText('3XL')).toBeTruthy();
    });
  });

  describe('weights', () => {
    it('renders normal weight by default', () => {
      render(<Text>Normal</Text>);
      expect(screen.getByText('Normal')).toBeTruthy();
    });

    it('renders medium weight', () => {
      render(<Text weight="medium">Medium</Text>);
      expect(screen.getByText('Medium')).toBeTruthy();
    });

    it('renders semibold weight', () => {
      render(<Text weight="semibold">Semibold</Text>);
      expect(screen.getByText('Semibold')).toBeTruthy();
    });

    it('renders bold weight', () => {
      render(<Text weight="bold">Bold</Text>);
      expect(screen.getByText('Bold')).toBeTruthy();
    });
  });

  describe('custom className', () => {
    it('accepts custom className', () => {
      render(<Text className="custom-class">Custom</Text>);
      expect(screen.getByText('Custom')).toBeTruthy();
    });
  });

  describe('combined props', () => {
    it('renders with multiple variant props', () => {
      render(
        <Text variant="primary" size="lg" weight="bold">
          Combined
        </Text>
      );
      expect(screen.getByText('Combined')).toBeTruthy();
    });
  });
});
