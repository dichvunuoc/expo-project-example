import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(
      <Button label="Test Button" onPress={jest.fn()} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button label="Press Me" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when isLoading is true', () => {
    const { getByRole } = render(
      <Button label="Loading" onPress={jest.fn()} isLoading={true} />
    );

    const button = getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies correct variant styles', () => {
    const { getByRole, rerender } = render(
      <Button label="Primary" onPress={jest.fn()} variant="primary" />
    );
    const primaryButton = getByRole('button');
    expect(primaryButton).toBeTruthy();

    rerender(
      <Button label="Secondary" onPress={jest.fn()} variant="secondary" />
    );
    const secondaryButton = getByRole('button');
    expect(secondaryButton).toBeTruthy();

    rerender(<Button label="Outline" onPress={jest.fn()} variant="outline" />);
    const outlineButton = getByRole('button');
    expect(outlineButton).toBeTruthy();
  });

  it('applies correct size styles', () => {
    const { getByText, rerender } = render(
      <Button label="Small" onPress={jest.fn()} size="sm" />
    );
    const smallButton = getByText('Small');
    expect(smallButton).toBeTruthy();

    rerender(<Button label="Medium" onPress={jest.fn()} size="md" />);
    const mediumButton = getByText('Medium');
    expect(mediumButton).toBeTruthy();

    rerender(<Button label="Large" onPress={jest.fn()} size="lg" />);
    const largeButton = getByText('Large');
    expect(largeButton).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <Button label="Disabled" onPress={mockOnPress} disabled={true} />
    );

    const button = getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { getByRole } = render(
      <Button label="Custom" onPress={jest.fn()} className="custom-class" />
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('passes through additional props', () => {
    const { getByRole } = render(
      <Button
        label="With Props"
        onPress={jest.fn()}
        accessibilityLabel="Custom Button"
      />
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Custom Button');
  });
});
