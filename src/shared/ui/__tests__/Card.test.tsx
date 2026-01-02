import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Card } from '../card';
import { Text } from '../text';

describe('Card', () => {
  describe('rendering', () => {
    it('renders children content', () => {
      render(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );
      expect(screen.getByText('Card Content')).toBeTruthy();
    });

    it('renders multiple children', () => {
      render(
        <Card>
          <Text>Title</Text>
          <Text>Description</Text>
        </Card>
      );
      expect(screen.getByText('Title')).toBeTruthy();
      expect(screen.getByText('Description')).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(
        <Card variant="default">
          <Text>Default</Text>
        </Card>
      );
      expect(screen.getByText('Default')).toBeTruthy();
    });

    it('renders elevated variant', () => {
      render(
        <Card variant="elevated">
          <Text>Elevated</Text>
        </Card>
      );
      expect(screen.getByText('Elevated')).toBeTruthy();
    });

    it('renders outlined variant', () => {
      render(
        <Card variant="outlined">
          <Text>Outlined</Text>
        </Card>
      );
      expect(screen.getByText('Outlined')).toBeTruthy();
    });
  });

  describe('padding', () => {
    it('renders small padding', () => {
      render(
        <Card padding="sm">
          <Text>Small Padding</Text>
        </Card>
      );
      expect(screen.getByText('Small Padding')).toBeTruthy();
    });

    it('renders medium padding by default', () => {
      render(
        <Card>
          <Text>Medium Padding</Text>
        </Card>
      );
      expect(screen.getByText('Medium Padding')).toBeTruthy();
    });

    it('renders large padding', () => {
      render(
        <Card padding="lg">
          <Text>Large Padding</Text>
        </Card>
      );
      expect(screen.getByText('Large Padding')).toBeTruthy();
    });
  });

  describe('custom className', () => {
    it('accepts custom className', () => {
      render(
        <Card className="custom-card">
          <Text>Custom Card</Text>
        </Card>
      );
      expect(screen.getByText('Custom Card')).toBeTruthy();
    });
  });

  describe('combined props', () => {
    it('renders with multiple props', () => {
      render(
        <Card variant="elevated" padding="lg" className="extra-class">
          <Text>Combined</Text>
        </Card>
      );
      expect(screen.getByText('Combined')).toBeTruthy();
    });
  });
});
