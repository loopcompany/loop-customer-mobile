// Mock API responses for testing
export const mockAPI = {
  // Mock successful registration
  registerSuccess: {
    success: true,
    message: 'کد تایید به شماره موبایل شما ارسال شد',
    data: {
      verification_id: 'mock_verification_123'
    }
  },

  // Mock registration error
  registerError: {
    success: false,
    message: 'خطا در ثبت نام',
    errors: {
      mobile: ['شماره موبایل قبلاً ثبت شده است'],
      email: ['فرمت ایمیل صحیح نیست']
    }
  },

  // Mock successful verification
  verificationSuccess: {
    success: true,
    message: 'ثبت نام با موفقیت انجام شد',
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
    user: {
      id: 1,
      name: 'کاربر تست',
      mobile: '09123456789',
      email: 'test@example.com',
      national_id: '1234567890'
    }
  },

  // Mock verification error
  verificationError: {
    success: false,
    message: 'کد وارد شده صحیح نیست'
  },

  // Mock resend success
  resendSuccess: {
    success: true,
    message: 'کد تایید مجدداً ارسال شد'
  }
};

// Function to simulate API delay
export const simulateDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock implementation for testing with correct /auth endpoints
export const mockAuthAPI = {
  // POST /auth/register
  register: async (userData) => {
    console.log('Mock API: POST /auth/register', userData);
    await simulateDelay(1500);
    
    // Simulate validation errors
    if (userData.mobile === '9000000000') {
      throw {
        response: {
          data: mockAPI.registerError
        }
      };
    }
    
    return mockAPI.registerSuccess;
  },

  // POST /auth/verify-registration
  verifyRegistrationCode: async (mobile, code) => {
    console.log('Mock API: POST /auth/verify-registration', { mobile, code });
    await simulateDelay(1000);
    
    // Simulate wrong code
    if (code !== '123456') {
      return mockAPI.verificationError;
    }
    
    return mockAPI.verificationSuccess;
  },

  // POST /auth/resend-verification-code
  resendVerificationCode: async (mobile) => {
    console.log('Mock API: POST /auth/resend-verification-code', { mobile });
    await simulateDelay(500);
    return mockAPI.resendSuccess;
  },

  // POST /auth/login
  login: async (credentials) => {
    console.log('Mock API: POST /auth/login', credentials);
    await simulateDelay(1000);
    return mockAPI.verificationSuccess;
  },

  // POST /auth/sendVerificationCode
  sendVerificationCode: async (mobile) => {
    console.log('Mock API: POST /auth/sendVerificationCode', { mobile });
    await simulateDelay(800);
    return mockAPI.registerSuccess;
  },

  // POST /auth/codeVerification
  codeVerification: async (mobile, code) => {
    console.log('Mock API: POST /auth/codeVerification', { mobile, code });
    await simulateDelay(1000);
    
    if (code !== '123456') {
      return mockAPI.verificationError;
    }
    
    return mockAPI.verificationSuccess;
  }
};