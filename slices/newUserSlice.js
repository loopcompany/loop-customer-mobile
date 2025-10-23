import { createSlice } from '@reduxjs/toolkit';

export const newUserSlice = createSlice({
    name: 'newUser',
    initialState: {
        age: 20,
        weight: 60,
        height: 165,
        name: null,
        activityLevel: 'Sedentary',
    },
    reducers: {
        setAge: (state, action) => {
            state.age = action.payload;
        },
        setWeight: (state, action) => {
            state.weight = action.payload;
        },
        setHeight: (state, action) => {
            state.height = action.payload;
        },
        setName: (state, action) => {
            state.name = action.payload;
        },
        setActivityLevel: (state, action) => {
            state.activityLevel = action.payload;
        },
        emptyNewUser: (state) => {
            state.age = 20;
            state.weight = 60;
            state.height = 165;
            state.name = null;
            state.activityLevel = 'Sedentary';
        }
    }
});

export const { setAge, setWeight, setHeight, setName, setActivityLevel, emptyNewUser } = newUserSlice.actions;

export default newUserSlice.reducer