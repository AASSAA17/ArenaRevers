// Phone validation for Kazakhstan format
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { valid: false, error: 'Телефон нөмірі міндетті' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Kazakhstan phone format: +7 followed by 10 digits
  // Accept formats: +77001234567 (11 digits), 77001234567 (11 digits), 7001234567 (10 digits)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('7')) {
    return { valid: true };
  }
  
  // Accept 10 digits (will be normalized to 11 with 7 prefix)
  if (digitsOnly.length === 10) {
    return { valid: true };
  }

  return { 
    valid: false, 
    error: 'Дұрыс телефон нөмірін енгізіңіз. Мысал: +7 (700) 123-45-67 немесе 77001234567' 
  };
};

// Phone formatting mask
export const formatPhone = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // If starts with 7, keep it, otherwise add +7
  let formatted = digits;
  if (digits.length > 0 && !digits.startsWith('7')) {
    formatted = '7' + digits;
  }
  
  // Limit to 11 digits (7 + 10)
  formatted = formatted.slice(0, 11);
  
  // Format: +7 (XXX) XXX-XX-XX
  if (formatted.length === 0) return '';
  if (formatted.length <= 1) return `+${formatted}`;
  if (formatted.length <= 4) return `+7 (${formatted.slice(1)}`;
  if (formatted.length <= 7) return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4)}`;
  if (formatted.length <= 9) return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7)}`;
  return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`;
};

// Password strength validation
export type PasswordStrength = 'weak' | 'medium' | 'strong';

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (password.length < 8) return 'weak';
  
  let strength = 0;
  
  // Check for uppercase letters
  if (/[A-Z]/.test(password)) strength++;
  
  // Check for lowercase letters
  if (/[a-z]/.test(password)) strength++;
  
  // Check for numbers
  if (/[0-9]/.test(password)) strength++;
  
  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  // Check length
  if (password.length >= 12) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: PasswordStrength } => {
  if (!password || password.trim() === '') {
    return { valid: false, error: 'Құпия сөз міндетті' };
  }

  // Maximum length check (prevent DoS attacks)
  if (password.length > 128) {
    return { 
      valid: false, 
      error: 'Құпия сөз 128 символдан аспауы керек',
      strength: 'weak'
    };
  }

  if (password.length < 8) {
    return { 
      valid: false, 
      error: 'Құпия сөз кемінде 8 символ болуы керек',
      strength: 'weak'
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase) {
    return { 
      valid: false, 
      error: 'Құпия сөзде кемінде бір бас әріп болуы керек',
      strength: getPasswordStrength(password)
    };
  }

  if (!hasNumber) {
    return { 
      valid: false, 
      error: 'Құпия сөзде кемінде бір сан болуы керек',
      strength: getPasswordStrength(password)
    };
  }

  return { valid: true, strength: getPasswordStrength(password) };
};

// Full name validation
export const validateFullName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Аты-жөні міндетті' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Аты-жөні кемінде 2 символ болуы керек' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Аты-жөні 100 символдан аспауы керек' };
  }

  // Only letters, spaces, and common name characters (hyphens, apostrophes)
  if (!/^[a-zA-Zа-яА-ЯёЁәіңғұқөһӘІҢҒҰҚӨҺ\s\-']+$/.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Аты-жөні тек әріптерден, бос орындардан және дефис/апострофтан тұруы керек. Мысал: Нұрлан Ахметов' 
    };
  }

  return { valid: true };
};

// Email validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email міндетті' };
  }

  const trimmed = email.trim();

  // Maximum length check (RFC 5321)
  if (trimmed.length > 254) {
    return { 
      valid: false, 
      error: 'Email тым ұзын. Максимум 254 символ' 
    };
  }

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { 
      valid: false, 
      error: 'Дұрыс email енгізіңіз. Мысал: user@example.com' 
    };
  }

  // Check for consecutive dots
  if (trimmed.includes('..')) {
    return { 
      valid: false, 
      error: 'Email дұрыс емес. Тізбектелген нүктелерге рұқсат етілмейді' 
    };
  }

  return { valid: true };
};

