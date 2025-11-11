/**
 * Performance optimization utilities for organization access control
 * شامل debounce، throttle و سایر optimization های مربوط به UX/Performance
 */

import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Debounce function برای کاهش تعداد فراخوانی توابع
 * 
 * @param {Function} func - تابع مورد نظر
 * @param {number} wait - زمان انتظار (میلی‌ثانیه)
 * @param {boolean} immediate - آیا فراخوانی فوری انجام شود
 * @returns {Function} - تابع debounced شده
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
};

/**
 * Throttle function برای محدود کردن تعداد فراخوانی
 * 
 * @param {Function} func - تابع مورد نظر
 * @param {number} limit - حداکثر فراخوانی در واحد زمان (میلی‌ثانیه)
 * @returns {Function} - تابع throttled شده
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * React Hook برای debouncing values
 * 
 * @param {any} value - مقدار مورد نظر
 * @param {number} delay - تأخیر debounce (میلی‌ثانیه)
 * @returns {any} - مقدار debounced شده
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * React Hook برای debouncing callbacks
 * 
 * @param {Function} callback - تابع callback
 * @param {number} delay - تأخیر debounce (میلی‌ثانیه)
 * @param {Array} deps - dependency array
 * @returns {Function} - callback debounced شده
 */
export const useDebouncedCallback = (callback, delay, deps = []) => {
  const timeoutRef = useRef(null);
  
  return useCallback(
    debounce(callback, delay),
    [...deps, delay]
  );
};

/**
 * React Hook برای throttling callbacks
 * 
 * @param {Function} callback - تابع callback
 * @param {number} limit - محدودیت throttle (میلی‌ثانیه)
 * @param {Array} deps - dependency array
 * @returns {Function} - callback throttled شده
 */
export const useThrottledCallback = (callback, limit, deps = []) => {
  return useCallback(
    throttle(callback, limit),
    [...deps, limit]
  );
};

/**
 * حافظه cache ساده برای نتایج API
 */
class SimpleCache {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 دقیقه به صورت پیش‌فرض
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      this._trackMiss();
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      this._trackMiss();
      return null;
    }

    this._trackHit();
    return cached.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // پاک کردن cache های منقضی شده
  cleanup() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // آمار cache
  getStats() {
    const now = Date.now();
    let activeCount = 0;
    let expiredCount = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      totalEntries: this.cache.size,
      activeEntries: activeCount,
      expiredEntries: expiredCount,
      hitRate: this._hitRate || 0,
      missRate: this._missRate || 0,
      totalHits: this._totalHits || 0,
      totalMisses: this._totalMisses || 0
    };
  }

  // Track statistics
  _trackHit() {
    this._totalHits = (this._totalHits || 0) + 1;
    this._updateRates();
  }

  _trackMiss() {
    this._totalMisses = (this._totalMisses || 0) + 1;
    this._updateRates();
  }

  _updateRates() {
    const total = (this._totalHits || 0) + (this._totalMisses || 0);
    if (total > 0) {
      this._hitRate = ((this._totalHits || 0) / total * 100).toFixed(2);
      this._missRate = ((this._totalMisses || 0) / total * 100).toFixed(2);
    }
  }
}

/**
 * نمونه cache برای organization access status
 */
export const organizationAccessCache = new SimpleCache();

/**
 * React Hook برای مدیریت cache
 * 
 * @param {string} cacheKey - کلید cache
 * @param {Function} fetchFunction - تابع دریافت داده
 * @param {number} ttl - Time To Live (میلی‌ثانیه)
 * @returns {Object} - شامل data، loading، error، refetch
 */
export const useCachedFetch = (cacheKey, fetchFunction, ttl = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (forceRefresh = false) => {
    // چک کردن cache اگر force refresh نیست
    if (!forceRefresh) {
      const cached = organizationAccessCache.get(cacheKey);
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      
      // ذخیره در cache
      organizationAccessCache.set(cacheKey, result, ttl);
      
      return result;
    } catch (err) {
      setError(err.message || 'خطا در دریافت اطلاعات');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFunction, ttl]);

  // بارگذاری اولیه
  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    refetch: () => fetch(true),
    fetchFromCache: () => fetch(false)
  };
};

/**
 * Hook برای intersection observer (lazy loading)
 * مفید برای بارگذاری lazy component ها
 */
export const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasBeenVisible, options]);

  return { elementRef, isVisible, hasBeenVisible };
};

/**
 * Hook برای تأخیر در نمایش component (بهبود UX)
 * مفید برای جلوگیری از flash of loading state
 */
export const useDelayedLoading = (isLoading, delay = 200) => {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShouldShowLoading(true);
      }, delay);
    } else {
      setShouldShowLoading(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, delay]);

  return shouldShowLoading;
};

/**
 * تنظیمات optimized برای performance
 */
export const PERFORMANCE_CONFIGS = {
  // تأخیر debounce برای API calls
  API_DEBOUNCE_DELAY: 500,
  
  // تأخیر debounce برای user input
  INPUT_DEBOUNCE_DELAY: 300,
  
  // محدودیت throttle برای scroll events
  SCROLL_THROTTLE_LIMIT: 100,
  
  // TTL پیش‌فرض برای cache
  DEFAULT_CACHE_TTL: 5 * 60 * 1000, // 5 دقیقه
  
  // تأخیر برای نمایش loading state
  LOADING_DELAY: 200,
  
  // حداکثر سایز cache
  MAX_CACHE_SIZE: 50,
  
  // فاصله cleanup cache (هر 10 دقیقه)
  CACHE_CLEANUP_INTERVAL: 10 * 60 * 1000,
};

/**
 * تابع کمکی برای cleanup منظم cache
 */
export const startCacheCleanup = () => {
  const interval = setInterval(() => {
    organizationAccessCache.cleanup();
    
    // اگر cache خیلی بزرگ شد، پاک کن
    if (organizationAccessCache.size() > PERFORMANCE_CONFIGS.MAX_CACHE_SIZE) {
      organizationAccessCache.clear();
    }
    
    if (__DEV__) {
      console.log(`🧹 [Cache Cleanup] Size after cleanup: ${organizationAccessCache.size()}`);
    }
  }, PERFORMANCE_CONFIGS.CACHE_CLEANUP_INTERVAL);

  return () => clearInterval(interval);
};

export default {
  debounce,
  throttle,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  useCachedFetch,
  useIntersectionObserver,
  useDelayedLoading,
  organizationAccessCache,
  SimpleCache,
  PERFORMANCE_CONFIGS,
  startCacheCleanup
};