import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { api } from '../utils/api';
import { 
  validateEmail, 
  validatePhone, 
  validatePassword, 
  validateFullName,
  formatPhone,
  PasswordStrength 
} from '../utils/validation';
import { debounce } from '../utils/debounce';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string; phone: string; role?: string }) => void;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState<string>('');
  const [phoneCheckError, setPhoneCheckError] = useState<string>('');
  
  // Refs for debouncing and race condition handling
  const emailCheckAbortController = useRef<AbortController | null>(null);
  const phoneCheckAbortController = useRef<AbortController | null>(null);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phoneCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset form when modal opens/closes or switches between login/register
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setTouched({});
      setApiError('');
      setPasswordStrength(null);
    }
  }, [isOpen, isLogin]);

  // Validate field on blur
  const handleBlur = useCallback(async (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (isLogin) {
      // For login, only validate email and password
      if (field === 'email') {
        const validation = validateEmail(value);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, email: validation.error }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      } else if (field === 'password') {
        if (!value) {
          setErrors(prev => ({ ...prev, password: 'Құпия сөз міндетті' }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.password;
            return newErrors;
          });
        }
      }
    } else {
      // For registration, validate all fields
      if (field === 'name') {
        const validation = validateFullName(value);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, name: validation.error }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.name;
            return newErrors;
          });
        }
      } else if (field === 'email') {
        const validation = validateEmail(value);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, email: validation.error }));
          setEmailCheckError('');
        } else {
          // Cancel previous check if any
          if (emailCheckAbortController.current) {
            emailCheckAbortController.current.abort();
          }
          if (emailCheckTimeoutRef.current) {
            clearTimeout(emailCheckTimeoutRef.current);
          }
          
          // Debounce email check (500ms)
          emailCheckTimeoutRef.current = setTimeout(async () => {
            const currentValue = value;
            const abortController = new AbortController();
            emailCheckAbortController.current = abortController;
            
            setCheckingEmail(true);
            setEmailCheckError('');
            
            try {
              const response = await api.checkEmail(currentValue, abortController.signal);
              
              // Check if request was aborted
              if (abortController.signal.aborted) {
                return;
              }
              
              if (response.exists) {
                setErrors(prev => ({ ...prev, email: 'Бұл email қолданыста. Басқа email енгізіңіз' }));
              } else {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.email;
                  return newErrors;
                });
              }
            } catch (error: any) {
              // Check if request was aborted
              if (abortController.signal.aborted) {
                return;
              }
              
              // Handle network errors
              if (error.message && !error.message.includes('aborted')) {
                setEmailCheckError('Қолжетімділікті тексеру кезінде қате орын алды');
                console.error('Email check error:', error);
              }
            } finally {
              if (!abortController.signal.aborted) {
                setCheckingEmail(false);
              }
            }
          }, 500);
        }
      } else if (field === 'phone') {
        const validation = validatePhone(value);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, phone: validation.error }));
          setPhoneCheckError('');
        } else {
          // Check if phone exists (only if phone is provided)
          if (value.trim() !== '') {
            // Cancel previous check if any
            if (phoneCheckAbortController.current) {
              phoneCheckAbortController.current.abort();
            }
            if (phoneCheckTimeoutRef.current) {
              clearTimeout(phoneCheckTimeoutRef.current);
            }
            
            // Debounce phone check (500ms)
            phoneCheckTimeoutRef.current = setTimeout(async () => {
              const currentValue = value.replace(/\D/g, '');
              const abortController = new AbortController();
              phoneCheckAbortController.current = abortController;
              
              setCheckingPhone(true);
              setPhoneCheckError('');
              
              try {
                const response = await api.checkPhone(currentValue, abortController.signal);
                
                // Check if request was aborted
                if (abortController.signal.aborted) {
                  return;
                }
                
                if (response.exists) {
                  setErrors(prev => ({ ...prev, phone: 'Бұл телефон нөмірі қолданыста. Басқа нөмір енгізіңіз' }));
                } else {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.phone;
                    return newErrors;
                  });
                }
              } catch (error: any) {
                // Check if request was aborted
                if (abortController.signal.aborted) {
                  return;
                }
                
                // Handle network errors
                if (error.message && !error.message.includes('aborted')) {
                  setPhoneCheckError('Қолжетімділікті тексеру кезінде қате орын алды');
                  console.error('Phone check error:', error);
                }
              } finally {
                if (!abortController.signal.aborted) {
                  setCheckingPhone(false);
                }
              }
            }, 500);
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.phone;
              return newErrors;
            });
          }
        }
      } else if (field === 'password') {
        const validation = validatePassword(value);
        setPasswordStrength(validation.strength || null);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, password: validation.error }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.password;
            return newErrors;
          });
        }
      } else if (field === 'confirmPassword') {
        const currentPassword = formData.password;
        if (value !== currentPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Құпия сөздер сәйкес келмейді' }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.confirmPassword;
            return newErrors;
          });
        }
      }
    }
  }, [isLogin, formData]);

  // Handle phone input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
    
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  // Handle password change with strength calculation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    
    if (!isLogin && value) {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength || null);
    } else {
      setPasswordStrength(null);
    }
    
    // Clear error when user starts typing
    if (errors.password) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
    
    // Re-validate confirm password if it's been touched
    if (touched.confirmPassword && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Құпия сөздер сәйкес келмейді' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error || 'Email міндетті';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Құпия сөз міндетті';
    } else if (!isLogin) {
      // Only validate password strength for registration, not login
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.error || 'Құпия сөз міндетті';
      }
    }

    if (!isLogin) {
      // Name validation
      const nameValidation = validateFullName(formData.name);
      if (!nameValidation.valid) {
        newErrors.name = nameValidation.error || 'Аты-жөні міндетті';
      }

      // Phone validation
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.error || 'Телефон нөмірі міндетті';
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Құпия сөздер сәйкес келмейді';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        const response = await api.login({
          email: formData.email,
          password: formData.password,
        });
        
        onLogin({
          name: response.user.fullName || 'Қолданушы',
          email: response.user.email,
          phone: response.user.phone || '',
        });
      } else {
        // Register - normalize phone (remove formatting)
        const normalizedPhone = formData.phone.replace(/\D/g, '');
        
        const response = await api.register({
          fullName: formData.name,
          email: formData.email,
          phone: normalizedPhone || undefined,
          password: formData.password,
        });
        
        // Auto login after registration
        const loginResponse = await api.login({
          email: formData.email,
          password: formData.password,
        });
        
        onLogin({
          name: loginResponse.user.fullName || formData.name,
          email: loginResponse.user.email,
          phone: loginResponse.user.phone || formData.phone,
          role: loginResponse.user.role || 'USER',
        });
      }
      
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setTouched({});
      setPasswordStrength(null);
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Better error messages
      let errorMessage = 'Қате орын алды. Қайталап көріңіз.';
      
      if (error.message) {
        if (error.message.includes('Серверге қосылу мүмкін емес') || 
            error.message.includes('бэкенд') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('fetch')) {
          errorMessage = 'Бэкенд сервері іске қосылмаған. Бэкендті бастап көріңіз (порт 3000).';
        } else {
          errorMessage = error.message;
        }
      }
      
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-md shadow-[0px_4px_24px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="border-b border-[#D9D9D9] p-6 flex items-center justify-between">
          <h2>{isLogin ? 'Кіру' : 'Тіркелу'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <>
              <Input
                label="Аты-жөні"
                placeholder="Мысал: Нұрлан Ахметов"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={(e) => handleBlur('name', e.target.value)}
                error={touched.name ? errors.name : undefined}
              />
              <div>
                <Input
                  label="Телефон"
                  type="tel"
                  placeholder="+7 (700) 123-45-67"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={(e) => handleBlur('phone', e.target.value)}
                  error={touched.phone ? (errors.phone || phoneCheckError) : undefined}
                  disabled={checkingPhone}
                />
                {checkingPhone && (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 size={14} className="animate-spin text-[#2ECC71]" />
                    <span className="body-s text-[#4D4D4D]">Тексеру...</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <Input
              label="Email"
              type="email"
              placeholder="Мысал: user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={(e) => handleBlur('email', e.target.value)}
              error={touched.email ? (errors.email || emailCheckError) : undefined}
              disabled={checkingEmail}
            />
            {checkingEmail && (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 size={14} className="animate-spin text-[#2ECC71]" />
                <span className="body-s text-[#4D4D4D]">Тексеру...</span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Құпия сөз"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handlePasswordChange}
              onBlur={(e) => handleBlur('password', e.target.value)}
              error={touched.password ? errors.password : undefined}
            />
            {!isLogin && passwordStrength && (
              <>
                <PasswordStrengthIndicator strength={passwordStrength} password={formData.password} />
                <div className="mt-2 p-3 bg-[#F5F5F5] rounded-lg">
                  <p className="body-s text-[#4D4D4D] mb-2">Құпия сөз талаптары:</p>
                  <ul className="space-y-1 text-xs text-[#4D4D4D]">
                    <li className={formData.password.length >= 8 ? 'text-[#2ECC71]' : ''}>
                      {formData.password.length >= 8 ? '✓' : '○'} Кемінде 8 символ
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-[#2ECC71]' : ''}>
                      {/[A-Z]/.test(formData.password) ? '✓' : '○'} Кемінде бір бас әріп
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'text-[#2ECC71]' : ''}>
                      {/[0-9]/.test(formData.password) ? '✓' : '○'} Кемінде бір сан
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {!isLogin && (
            <Input
              label="Құпия сөзді растау"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (touched.confirmPassword) {
                  if (e.target.value !== formData.password) {
                    setErrors(prev => ({ ...prev, confirmPassword: 'Құпия сөздер сәйкес келмейді' }));
                  } else {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                  }
                }
              }}
              onBlur={(e) => {
                setTouched(prev => ({ ...prev, confirmPassword: true }));
                if (e.target.value !== formData.password) {
                  setErrors(prev => ({ ...prev, confirmPassword: 'Құпия сөздер сәйкес келмейді' }));
                } else {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.confirmPassword;
                    return newErrors;
                  });
                }
              }}
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
            />
          )}

          {apiError && (
            <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg">{apiError}</div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full mt-6"
            disabled={loading || checkingEmail || checkingPhone}
          >
            {loading ? 'Жүктелуде...' : (isLogin ? 'Кіру' : 'Тіркелу')}
          </Button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setTouched({});
                setApiError('');
                setPasswordStrength(null);
              }}
              className="body-s text-[#2ECC71] hover:underline"
            >
              {isLogin ? 'Аккаунт жоқ па? Тіркелу' : 'Аккаунт бар ма? Кіру'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
