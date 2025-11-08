import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uri } from '../services/URL';

export const fetchSteps = createAsyncThunk('steps/steps', async (categoryId) => {
    return await axios
        .post(`${uri}/steps/fetch`, { categoryId: categoryId })
        .then(response => response?.data)
        .catch(error => {
            console.log(error);
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
            const newData = JSON.parse(JSON.stringify(state.data));
            const foundStep = newData[step].find(item => item.id == fieldId);
            if (foundStep) {
                foundStep.field_details.forEach(item => {
                    if (item.id == fieldDetailId) { item.value = 1 } else { item.value = 0 }
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

        setFile: (state, action) => {
            state.imagePath = action.payload;
        },

        removeFile: (state, action) => {
            state.imagePath = '';
        },

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
            state.date = null;
            state.time = null;
            state.femaleCount = 0;
            state.maleCount = 0;
            state.unspecifiedCount = 0;
        },
    }
});

export const selectTotalPrice = (state) => {
    const data = state.step.data;
    let total = 0;
    data.forEach(step => {
        step.forEach(field => {
            if (field.field_details) {
                field.field_details.forEach(detail => {
                    const count = typeof detail.value === 'number' ? detail.value : detail.value ? 1 : 0;
                    const price = detail.price || 0;
                    total += count * price;
                });
            }
        });
    });
    return total;
};

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
    disableDateAndTime
} = stepSlice.actions;

export default stepSlice.reducer