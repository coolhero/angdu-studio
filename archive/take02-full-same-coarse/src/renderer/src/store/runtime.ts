import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppInfo } from '@shared/types'

interface RuntimeState {
  appInfo: AppInfo | null
  isInitialized: boolean
}

const initialState: RuntimeState = {
  appInfo: null,
  isInitialized: false
}

const runtimeSlice = createSlice({
  name: 'runtime',
  initialState,
  reducers: {
    setAppInfo(state, action: PayloadAction<AppInfo>) {
      state.appInfo = action.payload
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload
    }
  }
})

export const { setAppInfo, setInitialized } = runtimeSlice.actions
export default runtimeSlice.reducer
