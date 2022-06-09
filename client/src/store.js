import { configureStore } from '@reduxjs/toolkit';
import userSlice from './features/userSlice';
import appApi from './services/appAPi';

// persist our store
import storage from 'redux-persist/lib/storage';

import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';

import thunk from 'redux-thunk';

// reducers

const reducers = combineReducers({
    user: userSlice,
    [appApi.reducerPath]: appApi.reducer,
})

const persistConfig = {
    key: 'root',
    storage,
    blackList: [appApi.reducerPath],
}

// persist out store

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
    reducer: persistedReducer,
    middleware: [thunk, appApi.middleware],
})

export default store;