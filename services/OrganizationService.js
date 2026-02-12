import axios from 'axios';
import { uri } from './URL';
import i18next from 'i18next';

/**
 * Service برای مدیریت API های کاربران سازمانی
 * مطابق با مستندات API در ORGANIZATION_ACCESS_CONTROL.md
 */
class OrganizationService {

  /**
   * دریافت وضعیت دسترسی کاربر سازمانی
   * API: GET /organization/profile/status
   */
  static async getAccessStatus(token) {
    try {
      const response = await axios.get(`${uri}/organization/profile/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': i18next.language || 'en' // Default language header
        }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('OrganizationService.getAccessStatus:', error);

      return {
        success: false,
        error: this._handleError(error),
        errorCode: error.response?.data?.error_code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * دریافت اطلاعات پروفایل سازمان
   * API: GET /organization/profile
   */
  static async getProfile(token) {
    try {
      const response = await axios.get(`${uri}/organization/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': i18next.language || 'en' // Default language header
        }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('OrganizationService.getProfile:', error);

      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * بروزرسانی اطلاعات پروفایل سازمان
   * API: PUT /organization/profile
   */
  static async updateProfile(token, profileData) {
    try {
      const response = await axios.put(`${uri}/organization/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Accept-Language': i18next.language || 'en' // Default language header
        }
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('OrganizationService.updateProfile:', error);

      return {
        success: false,
        error: this._handleError(error),
        validationErrors: error.response?.data?.errors || {}
      };
    }
  }

  /**
   * دریافت لیست قراردادهای آپلود شده
   * API: GET /organization/contracts
   */
  static async getContracts(token) {
    try {
      const response = await axios.get(`${uri}/organization/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': i18next.language || 'en' // Default language header
        }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('OrganizationService.getContracts:', error);

      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * آپلود قرارداد جدید
   * API: POST /organization/contracts/upload
   */
  static async uploadContract(token, contractFile, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('contract', {
        uri: contractFile.uri,
        type: contractFile.mimeType,
        name: contractFile.name,
      });

      const response = await axios.post(`${uri}/organization/contracts/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Accept-Language': i18next.language || 'en' // Default language header
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
        timeout: 120000 // 2 minutes timeout for file upload
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('OrganizationService.uploadContract:', error);

      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * دانلود فایل نمونه قرارداد
   * API: GET /organization/contract/template
   */
  static async getContractTemplate(token) {
    try {
      const response = await axios.get(`${uri}/organization/contract/template`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': i18next.language || 'en' // Default language header
        }
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('OrganizationService.getContractTemplate:', error);

      return {
        success: false,
        error: this._handleError(error)
      };
    }
  }

  /**
   * مدیریت خطاهای API
   * @private
   */
  static _handleError(error) {
    if (error.response) {
      // خطای HTTP از سرور
      const { status, data } = error.response;

      switch (status) {
        case 401:
          return 'عدم احراز هویت - لطفا مجدداً وارد شوید';
        case 403:
          if (data?.error_code === 'ACCESS_RESTRICTED') {
            return data?.message || 'دسترسی محدود - منتظر تایید ادمین باشید';
          }
          return 'عدم مجوز دسترسی';
        case 404:
          return 'اطلاعات مورد نظر یافت نشد';
        case 422:
          return 'اطلاعات وارد شده معتبر نیست';
        case 413:
          return 'حجم فایل بیش از حد مجاز است';
        case 500:
          return 'خطای سرور - لطفا دوباره تلاش کنید';
        default:
          return data?.message || `خطای ناشناخته (${status})`;
      }
    } else if (error.request) {
      // خطای شبکه
      return 'خطا در اتصال به سرور - اتصال اینترنت خود را بررسی کنید';
    } else {
      // سایر خطاها
      return error.message || 'خطای غیرمنتظره';
    }
  }

  /**
   * بررسی معتبر بودن فایل قرارداد
   */
  static validateContractFile(file) {
    const errors = [];

    // بررسی وجود فایل
    if (!file || !file.uri) {
      errors.push('فایل انتخاب نشده است');
      return { isValid: false, errors };
    }

    // بررسی نوع فایل
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.mimeType)) {
      errors.push('فقط فایل‌های PDF و تصاویر (JPG, PNG) مجاز هستند');
    }

    // بررسی حجم فایل (حداکثر 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push('حجم فایل نباید از 10 مگابایت بیشتر باشد');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * بررسی معتبر بودن داده‌های پروفایل
   */
  static validateProfileData(data) {
    const errors = {};

    // فیلدهای الزامی
    const requiredFields = {
      organization_name: 'نام سازمان',
      organization_code: 'کد سازمان',
      phone: 'شماره تلفن',
      email: 'ایمیل',
      address: 'آدرس',
      manager_name: 'نام مدیر',
      national_id: 'شماره ملی مدیر',
      registration_number: 'شماره ثبت'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!data[field] || !data[field].toString().trim()) {
        errors[field] = `${label} الزامی است`;
      }
    }

    // اعتبارسنجی ایمیل
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'فرمت ایمیل صحیح نیست';
    }

    // اعتبارسنجی شماره تلفن
    if (data.phone && !/^[0-9۰-۹\-\s\(\)]+$/.test(data.phone)) {
      errors.phone = 'فرمت شماره تلفن صحیح نیست';
    }

    // اعتبارسنجی کد ملی (10 رقم)
    if (data.national_id && !/^[0-9۰-۹]{10}$/.test(data.national_id.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) {
      errors.national_id = 'کد ملی باید 10 رقم باشد';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default OrganizationService;