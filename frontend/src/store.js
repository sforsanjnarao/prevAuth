// import { configureStore } from '@reduxjs/toolkit'
// import authReducer from './features/authSlice'

// export const store = configureStore({
//     reducer:{
//         auth: authReducer,
//     }
// })

// store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
// import authReducer from './features/authSlice'; // example slice
import rootReducer from './features/rootReducer';

// persist config
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // only persist the auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);