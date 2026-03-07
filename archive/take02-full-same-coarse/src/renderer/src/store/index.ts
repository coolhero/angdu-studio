import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { FLUSH, PAUSE, PERSIST, PURGE, persistReducer, persistStore, REGISTER, REHYDRATE } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import runtimeReducer from './runtime'
import settingsReducer from './settings'
import shortcutsReducer from './shortcuts'

const rootReducer = combineReducers({
  runtime: runtimeReducer,
  settings: settingsReducer,
  shortcuts: shortcutsReducer
})

const persistConfig = {
  key: 'cherry-studio',
  version: 1,
  storage,
  blacklist: ['runtime'] // runtime state is not persisted
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
