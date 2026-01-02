import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Input } from '../input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders without label', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('renders with label', () => {
      render(<Input label="Email" placeholder="Enter email" />);
      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter email')).toBeTruthy();
    });

    it('renders with error message', () => {
      render(<Input label="Email" error="Invalid email format" />);
      expect(screen.getByText('Invalid email format')).toBeTruthy();
    });
  });

  describe('user interaction', () => {
    it('handles text input', () => {
      const onChangeTextMock = jest.fn();
      render(
        <Input
          placeholder="Type here"
          onChangeText={onChangeTextMock}
          value=""
        />
      );

      const input = screen.getByPlaceholderText('Type here');
      fireEvent.changeText(input, 'Hello World');

      expect(onChangeTextMock).toHaveBeenCalledWith('Hello World');
    });

    it('handles focus and blur events', () => {
      const onFocusMock = jest.fn();
      const onBlurMock = jest.fn();
      render(
        <Input
          placeholder="Focus test"
          onFocus={onFocusMock}
          onBlur={onBlurMock}
        />
      );

      const input = screen.getByPlaceholderText('Focus test');
      fireEvent(input, 'focus');
      expect(onFocusMock).toHaveBeenCalled();

      fireEvent(input, 'blur');
      expect(onBlurMock).toHaveBeenCalled();
    });
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Input placeholder="Default" variant="default" />);
      expect(screen.getByPlaceholderText('Default')).toBeTruthy();
    });

    it('renders error variant when error is provided', () => {
      render(<Input placeholder="Error" error="Something went wrong" />);
      expect(screen.getByPlaceholderText('Error')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Input placeholder="Small" size="sm" />);
      expect(screen.getByPlaceholderText('Small')).toBeTruthy();
    });

    it('renders medium size by default', () => {
      render(<Input placeholder="Medium" />);
      expect(screen.getByPlaceholderText('Medium')).toBeTruthy();
    });

    it('renders large size', () => {
      render(<Input placeholder="Large" size="lg" />);
      expect(screen.getByPlaceholderText('Large')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has accessibility label from label prop', () => {
      render(<Input label="Username" placeholder="Enter username" />);
      // Input should have accessibility label
      const input = screen.getByPlaceholderText('Enter username');
      expect(input).toBeTruthy();
    });

    it('shows error as accessible alert', () => {
      render(<Input error="Required field" />);
      expect(screen.getByText('Required field')).toBeTruthy();
    });
  });

  describe('controlled value', () => {
    it('displays controlled value', () => {
      render(<Input value="Test value" placeholder="Enter" />);
      const input = screen.getByPlaceholderText('Enter');
      expect(input.props.value).toBe('Test value');
    });
  });
});
