import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Slices/authSlice.jsx';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const persistConfig = {
  key: 'root',
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);


const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
  },
});

export const persistor = persistStore(store);
export default store;

