import axios from 'axios';
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { uri } from '../services/URL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

export const fetchSteps = createAsyncThunk('steps/steps', async (categoryId) => {
    const token = await AsyncStorage.getItem('userToken');
    return await axios
        .post(`${uri}/steps/fetch`,
            { categoryId: categoryId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Accept-Language': i18next.language || 'en' // Default language header
                }
            }
        )
        .then(response => {
            console.log('✅ [fetchSteps] مراحل دریافت شد. تعداد مراحل:', response?.data?.length);
            return response?.data;
        })
        .catch(error => {
            console.log('❌ [fetchSteps] خطا در دریافت مراحل:', error);
            console.log('❌ [fetchSteps] پاسخ خطا:', error.response?.data);
            throw new Error(error.response?.data?.message || error.message);
        })
})

const stepSlice = createSlice({
    name: 'steps',
    initialState: {
        loading: false,
        data: [],
        error: '',
        addressId: null,
        isUrgent: 0,
        date: null,
        time: null,
        femaleCount: 0,
        maleCount: 0,
        unspecifiedCount: 0,
        des: '',
        imagePath: '',
        files: [],
        extraData: [],
    },
    extraReducers: builder => {
        builder.addCase(fetchSteps.pending, state => { 
            state.loading = true
        })
        builder.addCase(fetchSteps.fulfilled, (state, action) => { 
            state.loading = false
            state.data = action.payload
            state.error = ''
        })
        builder.addCase(fetchSteps.rejected, (state, action) => { 
            state.loading = false
            state.data = []
            state.error = action.error.message
        })
    },
    reducers: {
        updateCheckbox: (state, action) => {
            const { fieldId, fieldDetailId, step } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const foundStep = newData[step].find(item => item.id == fieldId);
            if (foundStep) {
                const foundItem = foundStep.field_details.find((item) => item.id == fieldDetailId);
                if (foundItem.value == 0) { foundItem.value = 1 } else { foundItem.value = 0 };
            }
            return {
                ...state,
                data: newData,
            };
        },

        updateRadioButton: (state, action) => {
            const { fieldId, fieldDetailId, step } = action.payload;
            console.log('🔄 [stepSlice] updateRadioButton called:', { fieldId, fieldDetailId, step });

            const newData = JSON.parse(JSON.stringify(state.data));
            console.log('📦 [stepSlice] Current step data:', newData[step]);

            // پیدا کردن item اصلی (مثلاً service_schedule)
            const foundItem = newData[step].find(item => item.id == fieldId);

            if (!foundItem) {
                // اگر foundItem پیدا نشد، شاید fieldId یکی از field_details باشد
                console.log('⚠️ [stepSlice] item با id', fieldId, 'پیدا نشد، جستجو در field_details...');

                for (const item of newData[step]) {
                    if (item.field_details) {
                        const foundField = item.field_details.find(f => f.id == fieldId);
                        if (foundField && foundField.options) {
                            console.log('✅ [stepSlice] پیدا شد در field_details، به‌روزرسانی options');
                            foundField.options.forEach(opt => {
                                if (opt.id == fieldDetailId) {
                                    opt.value = 1;
                                    console.log('✅ [stepSlice] Set value=1 for option:', opt.id);
                                } else {
                                    opt.value = 0; 
                                }
                            });
                            return {
                                ...state,
                                data: newData,
                            };
                        }
                    }
                }
 
                return state;
            }

            console.log('🔍 [stepSlice] foundItem:', foundItem.id, 'type:', foundItem.type);

            // برای RadioButton معمولی
            if (foundItem.field_details && !foundItem.field_details.find(f => f.options)) {
                console.log('📋 [stepSlice] به‌روزرسانی RadioButton معمولی');
                foundItem.field_details.forEach(item => {
                    if (item.id == fieldDetailId) {
                        item.value = 1;
                        console.log('✅ [stepSlice] Set value=1 for:', item.id);
                    } else {
                        item.value = 0; 
                    }
                });
            }

            return {
                ...state,
                data: newData,
            };
        },

        increment: (state, action) => {
            const { fieldId, fieldDetailId, step } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const foundStep = newData[step].find(item => item.id == fieldId);
            if (foundStep) {
                const foundItem = foundStep.field_details.find((item) => item.id == fieldDetailId);
                if (foundItem) { foundItem.value += 1 }
            }
            return {
                ...state,
                data: newData,
            };
        },

        incrementfemaleCount: (state, action) => {
            state.femaleCount += 1;
        },

        decrementfemaleCount: (state, action) => {
            state.femaleCount -= 1;
        },

        incrementMaleCount: (state, action) => {
            state.maleCount += 1;
        },

        decrementMaleCount: (state, action) => {
            state.maleCount -= 1;
        },

        incrementUnspecifiedCount: (state, action) => {
            state.unspecifiedCount += 1;
        },

        decrementUnspecifiedCount: (state, action) => {
            state.unspecifiedCount -= 1;
        },

        // set counts directly (used by radio-style selection)
        setMaleCount: (state, action) => {
            state.maleCount = action.payload;
        },

        setFemaleCount: (state, action) => {
            state.femaleCount = action.payload;
        },

        setUnspecifiedCount: (state, action) => {
            state.unspecifiedCount = action.payload;
        },

        decrement: (state, action) => {
            const { fieldId, fieldDetailId, step } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const foundStep = newData[step].find(item => item.id == fieldId);
            if (foundStep) {
                const foundItem = foundStep.field_details.find((item) => item.id == fieldDetailId);
                if (foundItem) { foundItem.value -= 1 }
            }
            return {
                ...state,
                data: newData,
            };
        },

        incrementGenderData: (state, action) => {
            const { fieldId, step } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const foundStep = newData[step].find(item => item.id == fieldId);
            if (foundStep) {
                foundStep.value += 1
            }
            return {
                ...state,
                data: newData,
            };
        },

        decrementGenderData: (state, action) => {
            const { fieldId, step } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const foundStep = newData[step].find(item => item.id == fieldId);
            if (foundStep) {
                foundStep.value -= 1
            }
            return {
                ...state,
                data: newData,
            };
        },

        setGeneralData: (state, action) => {
            const { fieldId, value, step } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const foundStep = newData[step].find(item => item.id == fieldId);
            if (foundStep) {
                foundStep.value = value
            }
            return {
                ...state,
                data: newData,
            };
        },

        disableDateAndTime: (state, action) => {
            const { step } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const dateItem = newData[step].find(item => item.type === 'date');
            if (dateItem) {
                const newValue = dateItem.is_required == 1 ? 0 : 1
                dateItem.is_required = newValue;
                dateItem.value = null;
            }
            const timeItem = newData[step].find(item => item.type === 'time');
            if (timeItem) {
                const newValue = timeItem.is_required == 1 ? 0 : 1
                timeItem.is_required = newValue;
                timeItem.value = null;
            }
            return {
                ...state,
                data: newData,
                date: null,
                time: null
            };
        },

        // برای آپدیت فیلدهای nested در service_schedule
        updateServiceScheduleField: (state, action) => {
            const { step, fieldId, value } = action.payload;
            console.log('🔄 [stepSlice.updateServiceScheduleField] شروع:', { step, fieldId, value });

            const newData = JSON.parse(JSON.stringify(state.data));

            // پیدا کردن service_schedule item
            const serviceScheduleItem = newData[step]?.find(item => item.type === 'service_schedule');

            if (!serviceScheduleItem) { 
                return state;
            }

            // پیدا کردن فیلد مورد نظر در field_details
            const field = serviceScheduleItem.field_details?.find(f => f.id === fieldId);

            if (!field) { 
                return state;
            }

            // آپدیت value
            field.value = value;
            console.log('✅ [stepSlice.updateServiceScheduleField] value آپدیت شد:', fieldId, '→', value);

            return {
                ...state,
                data: newData,
            };
        },

        setInputValue: (state, action) => {
            const { fieldId, fieldDetailId, value, step } = action.payload;
            const newData = JSON.parse(JSON.stringify(state.data));
            const foundStep = newData[step].find(item => item.id == fieldId);
            if (foundStep) {
                const foundItem = foundStep.field_details.find((item) => item.id == fieldDetailId);
                if (foundItem) { foundItem.value = value }
            }
            return {
                ...state,
                data: newData,
            };
        },

        // setFile: (state, action) => {
        //     state.imagePath = action.payload;
        // },
        setFile: (state, action) => {
            const newFiles = Array.isArray(action.payload)
                ? action.payload
                : action.payload
                    ? [action.payload]
                    : [];

            if (!Array.isArray(state.files)) {
                state.files = [];
            }

            state.files = [
                ...state.files,
                ...newFiles,
            ];
        },
        removeFile: (state, action) => {
            state.files.splice(action.payload, 1);
        },
        clearFiles: (state) => {
            state.files = [];
        },

        // removeFile: (state, action) => {
        //     state.imagePath = '';
        // },

        toggleUrgent: (state) => {
            state.isUrgent = state?.isUrgent == 0 ? 1 : 0;
        },

        selectDate: (state, action) => {
            state.date = action.payload;
        },

        selectTime: (state, action) => {
            state.time = action.payload;
        },

        removeTime: (state, action) => {
            state.time = null;
            // پاک کردن value از item مربوط به time
            const newData = JSON.parse(JSON.stringify(state.data));
            newData.forEach(step => {
                const timeItem = step.find(item => item.type === 'time');
                if (timeItem) {
                    timeItem.value = null;
                }
            });
            state.data = newData;
        },

        setAddressId: (state, action) => {
            state.addressId = action.payload;
        },

        setDescription: (state, action) => {
            state.des = action.payload;
        },

        addStep: (state, action) => {
            const { fieldId, fieldDetailId, step, steps } = action.payload;
            const indexToInsert = step + 1;
            const mainData = JSON.parse(JSON.stringify(state.data));
            const extraData = JSON.parse(JSON.stringify(state.extraData));

            const check = extraData.find(item => item.fieldId == fieldId);
            if (check) {
                mainData.splice(indexToInsert, check.length);
                check.fieldDetailId = fieldDetailId;
                check.length = steps.length;
            } else {
                extraData.push({ fieldId: fieldId, fieldDetailId: fieldDetailId, length: steps.length });
            }
            const firstPart = mainData.slice(0, indexToInsert);
            const lastPart = mainData.slice(indexToInsert);
            const newnewState = firstPart.concat(steps, lastPart);
            return {
                ...state,
                data: newnewState,
                extraData: extraData,
            };
        },

        emptySteps: (state, action) => {
            state.loading = false;
            state.data = [];
            state.error = '';
            state.extraData = [];
            state.isUrgent = 0;
            state.addressId = null;
            state.des = '';
            state.imagePath = '';
            state.files = [];
            state.date = null;
            state.time = null;
            state.femaleCount = 0;
            state.maleCount = 0;
            state.unspecifiedCount = 0;
        },
    }
});
const selectStepData = (state) => state.step.data;

export const selectTotalPrice = createSelector(
    [selectStepData],
    (data) => {
        let total = 0;
        let showPrice = true;
        data.forEach(step => {
            step.forEach(field => {
                if (field.field_details) {
                    field.field_details.forEach(detail => {
                        const count = typeof detail.value === 'number' ? detail.value : detail.value ? 1 : 0;
                        const price = detail.price || 0;
                        if (field?.is_package == 0 && count * detail?.affect_on_price != 0) {
                            showPrice = false;
                        }
                        total += count * price;
                    });
                }
            });
        });
        return { total, showPrice };
    }
);

export const {
    removeTime,
    incrementGenderData,
    decrementGenderData,
    incrementfemaleCount,
    decrementfemaleCount,
    incrementMaleCount,
    decrementMaleCount,
    incrementUnspecifiedCount,
    decrementUnspecifiedCount,
    setMaleCount,
    setFemaleCount,
    setUnspecifiedCount,
    updateCheckbox,
    updateRadioButton,
    increment,
    decrement,
    toggleUrgent,
    selectDate,
    selectTime,
    setAddressId,
    setDescription,
    setGeneralData,
    setInputValue,
    setFile,
    removeFile,
    addExtraData,
    addStep,
    emptySteps,
    disableDateAndTime,
    updateServiceScheduleField,
    clearFiles,
} = stepSlice.actions;

export default stepSlice.reducer