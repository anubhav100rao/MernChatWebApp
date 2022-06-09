import { createSlice } from '@reduxjs/toolkit';

import appApi from '../services/appAPi';

export const userSlice = createSlice({
    name: 'user',
    initialState: null,
    reducers: {
        addNotifications: (state,{payload}) => {
            
            if(state.newMessage[payload]) {
                state.newMessage[payload] = state.newMessage[payload] + 1;
            } else {
                state.newMessage[payload] = 1;
            }
        },
        resetNotifications: (state, {payload}) => {
            delete state.newMessage[payload];
        },

    },

    extraReducers: (builder) => {
        // save user after signup
        builder.addMatcher(appApi.endpoints.signUpUser.matchFulfilled, (state, {payload}) => payload);

        // save user after login
        builder.addMatcher(appApi.endpoints.loginUser.matchFulfilled, (state, {payload}) => payload);
        
        //logout
        builder.addMatcher(appApi.endpoints.logoutUser.matchFulfilled, (state) => null);

    }   
})

export const {
    addNotifications,
    resetNotifications
} = userSlice.actions;

export default userSlice.reducer;