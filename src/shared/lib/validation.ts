/**
 * Validation utilities for the application
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Email validation using regex
 * Validates common email formats with international support
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Email regex that supports international characters and modern email formats
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email.trim()) && email.length <= 254;
};

/**
 * Password validation with comprehensive security rules
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * - No spaces allowed
 */
export const isValidPassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }

  if (/\s/.test(password)) {
    errors.push('Password cannot contain spaces');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '123456789',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Phone number validation (supports international formats)
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all non-digit characters
  const cleanedPhone = phone.replace(/\D/g, '');

  // Check if it's a valid international phone number (10-15 digits)
  return cleanedPhone.length >= 10 && cleanedPhone.length <= 15;
};

/**
 * Username validation
 * - 3-30 characters
 * - Alphanumeric with underscores and hyphens
 * - Cannot start or end with underscore/hyphen
 */
export const isValidUsername = (username: string): ValidationResult => {
  const errors: string[] = [];

  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
    return { isValid: false, errors };
  }

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 30) {
    errors.push('Username must not exceed 30 characters');
  }

  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/;
  if (!usernameRegex.test(username)) {
    errors.push(
      'Username can only contain letters, numbers, underscores, and hyphens, and cannot start or end with underscore or hyphen'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * URL validation
 */
export const isValidURL = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Date validation
 */
export const isValidDate = (date: string): boolean => {
  if (!date || typeof date !== 'string') {
    return false;
  }

  const parsedDate = new Date(date);
  return (
    !isNaN(parsedDate.getTime()) && parsedDate.toString() !== 'Invalid Date'
  );
};

/**
 * Credit card validation (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return false;
  }

  // Remove spaces and dashes
  const cleanedNumber = cardNumber.replace(/[\s-]/g, '');

  // Check if it's all digits and valid length (13-19 digits)
  if (
    !/^\d+$/.test(cleanedNumber) ||
    cleanedNumber.length < 13 ||
    cleanedNumber.length > 19
  ) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleanedNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanedNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Generic field validation with custom rules
 */
export const validateField = (
  value: string,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  }
): ValidationResult => {
  const errors: string[] = [];

  if (!value || typeof value !== 'string') {
    if (rules.required) {
      errors.push('This field is required');
    }
    return { isValid: errors.length === 0, errors };
  }

  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters long`);
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Must not exceed ${rules.maxLength} characters`);
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push('Invalid format');
  }

  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
