import { PayloadAction, createSlice } from "@reduxjs/toolkit";


interface tableState {
    selectedTable: string
}
  
const initialState : tableState = {
    selectedTable: "CHARACTERINFO"
}

export const tableSlice = createSlice({
    name: 'table',
    initialState,
    reducers: {
        changeSelectedTable: (state, action : PayloadAction<string>) => {
            state.selectedTable = action.payload;
        }
    }
})

export const { changeSelectedTable } = tableSlice.actions
export default tableSlice.reducer