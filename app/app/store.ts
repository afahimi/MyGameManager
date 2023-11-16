import { configureStore } from '@reduxjs/toolkit'
import tableReducer from "./slicer/tableSlice"

const store = configureStore({
  reducer: {
    table: tableReducer,
  },
})

export default store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch