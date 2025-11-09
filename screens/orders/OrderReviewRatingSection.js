// OrderReviewRatingSection.js - ثبت نظر و امتیاز
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useSelector } from 'react-redux';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3, themeColor4, themeColor7 } from '../../theme/Color';
import Button from '../../components/Button';
import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import { submitReview, checkReviewForOrder } from '../../services/ReviewApi';

export default function OrderReviewRatingSection({ orderId, technicianId, orderStatus, finishedAt }) {
  const [scores, setScores] = useState({
    application: '',
    technician: '',
    support: '',
  });
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasReview, setHasReview] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const token = useSelector(state => state.auth.token);

  // بررسی شرایط فعال بودن: status=2 و finished_at پر باشد
  const isEnabled = orderStatus == 2 && finishedAt;

  useEffect(() => {
    if (isEnabled && orderId) {
      checkExistingReview();
    }
  }, [isEnabled, orderId]);

  const checkExistingReview = async () => {
    setLoading(true);
    try {
      // استفاده از service برای چک کردن نظر قبلی
      const existingReview = await checkReviewForOrder(token, orderId);
      
      if (existingReview) {
        setHasReview(true);
        setReviewData(existingReview);
      }
    } catch (error) {
      console.log('Error checking review:', error);
    } finally {
      setLoading(false);
    }
  };

  const setRating = (key, value) => {
    setScores({ ...scores, [key]: value });
  };

  const convertRatingToNumber = (rating) => {
    const ratingMap = {
      'خوب': 5,
      'متوسط': 3,
      'ضعیف': 1
    };
    return ratingMap[rating] || 3;
  };

  const handleSubmit = async () => {
    // بررسی انتخاب همه امتیازات
    if (!scores.application || !scores.technician || !scores.support) {
      showToastOrAlert('لطفاً همه امتیازات را انتخاب کنید');
      return;
    }

    setSubmitLoading(true);
    try {
      const reviewPayload = {
        technician_id: technicianId,
        order_id: orderId,
        application_rate: convertRatingToNumber(scores.application),
        technician_rate: convertRatingToNumber(scores.technician),
        support_rate: convertRatingToNumber(scores.support),
      };

      // فقط اگر توضیحات وجود داشت اضافه کن
      if (description.trim()) {
        reviewPayload.description = description.trim();
      }

      console.log('Submitting review:', reviewPayload);

      // استفاده از service
      const response = await submitReview(reviewPayload, token);

      if (response?.success) {
        showToastOrAlert(response?.message || 'نظر شما با موفقیت ثبت شد');
        setHasReview(true);
        setReviewData(response?.data?.review);
      }
    } catch (error) {
      console.error('Review submission error:', error);
      const message = error?.response?.data?.message || 'خطا در ثبت نظر';
      showToastOrAlert(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const convertNumberToRating = (number) => {
    if (number >= 4) return 'خوب';
    if (number >= 2) return 'متوسط';
    return 'ضعیف';
  };

  // اگر شرایط فعال شدن وجود نداشت
  if (!isEnabled) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={themeColor1.bgColor(1)} />
        <Text style={[NewStyles.text10, { marginTop: 10 }]}>در حال بارگذاری...</Text>
      </View>
    );
  }

  // اگر قبلاً نظر ثبت شده
  if (hasReview && reviewData) {
    return (
      <View style={styles.container}>
        <View style={styles.reviewedContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={50} color={themeColor7.bgColor(1)} />
          <Text style={[NewStyles.title10, { marginTop: 10, textAlign: 'center' }]}>
            شما قبلاً نظر خود را ثبت کرده‌اید
          </Text>

          <View style={styles.resultCard}>
            <View style={styles.resultRow}>
              <Text style={NewStyles.text10}>امتیاز اپلیکیشن:</Text>
              <Text style={[NewStyles.text10, { color: themeColor0.bgColor(1) }]}>
                {convertNumberToRating(reviewData.application_rate)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={NewStyles.text10}>امتیاز تکنسین:</Text>
              <Text style={[NewStyles.text10, { color: themeColor0.bgColor(1) }]}>
                {convertNumberToRating(reviewData.technician_rate)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={NewStyles.text10}>امتیاز پشتیبانی:</Text>
              <Text style={[NewStyles.text10, { color: themeColor0.bgColor(1) }]}>
                {convertNumberToRating(reviewData.support_rate)}
              </Text>
            </View>

            {reviewData.description && (
              <View style={styles.descriptionContainer}>
                <Text style={NewStyles.text10}>نظر شما:</Text>
                <Text style={[NewStyles.text10, { marginTop: 5, opacity: 0.8 }]}>
                  {reviewData.description}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // فرم ثبت نظر
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[NewStyles.text10, { textAlign: 'center', marginBottom: 15 }]}>
          کاربر گرامی، لطفاً نظر خود را درباره این سفارش ثبت کنید.
        </Text>

        {/* اپلیکیشن لوپ */}
        <View style={styles.categoryContainer}>
          <Text style={NewStyles.title10}>اپلیکیشن لوپ</Text>
        </View>
        <View style={styles.rateRow}>
          {['خوب', 'متوسط', 'ضعیف'].map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.rateButton,
                scores.application === label && styles.activeButton,
              ]}
              onPress={() => setRating('application', label)}
            >
              <Text style={NewStyles.text10}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* تکنسین لوپ */}
        <View style={styles.categoryContainer}>
          <Text style={NewStyles.title10}>تکنسین لوپ</Text>
        </View>
        <View style={styles.rateRow}>
          {['خوب', 'متوسط', 'ضعیف'].map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.rateButton,
                scores.technician === label && styles.activeButton,
              ]}
              onPress={() => setRating('technician', label)}
            >
              <Text style={NewStyles.text10}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* پشتیبانی لوپ */}
        <View style={styles.categoryContainer}>
          <Text style={NewStyles.title10}>پشتیبانی لوپ</Text>
        </View>
        <View style={styles.rateRow}>
          {['خوب', 'متوسط', 'ضعیف'].map((label) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.rateButton,
                scores.support === label && styles.activeButton,
              ]}
              onPress={() => setRating('support', label)}
            >
              <Text style={NewStyles.text10}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* توضیح بیشتر */}
        <Text style={[NewStyles.text10, { marginTop: 10, marginBottom: 6 }]}>
          توضیح بیشتری دارید؟ بنویسید:
        </Text>
        <TextInput
          placeholder="توضیحات (اختیاری)..."
          style={styles.commentInput}
          multiline
          value={description}
          onChangeText={setDescription}
          maxLength={1000}
        />
      </View>

      <View style={{ marginTop: 15 }}>
        <Button
          title={submitLoading ? 'در حال ارسال...' : 'ثبت نظر'}
          onPress={handleSubmit}
          disabled={submitLoading || !scores.application || !scores.technician || !scores.support}
          loading={submitLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: '5%',
    gap: 12,
  },
  section: {
    marginBottom: 10,
  },
  categoryContainer: {
    backgroundColor: themeColor1.bgColor(1),
    ...NewStyles.border10,
    padding: 10,
    marginVertical: 10,
    ...NewStyles.center,
  },
  rateRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rateButton: {
    backgroundColor: themeColor3.bgColor(0.3),
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: themeColor1.bgColor(1),
  },
  commentInput: {
    ...NewStyles.textInput,
    backgroundColor: themeColor4.bgColor(1),
    height: 100,
    ...NewStyles.border10,
    padding: 10,
    textAlignVertical: 'top',
    ...NewStyles.text10,
  },
  loadingContainer: {
    paddingHorizontal: '5%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewedContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    width: '100%',
    backgroundColor: themeColor4.bgColor(1),
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
  },
  resultRow: {
    ...NewStyles.rowWrapper,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: themeColor3.bgColor(0.1),
  },
  descriptionContainer: {
    paddingTop: 10,
  },
});
