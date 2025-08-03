
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  datas: {},
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setDatas: (state, action) => {
      state.datas = action.payload.datas;
    },
  },
});

export const { setDatas } = authSlice.actions;
export default authSlice.reducer;

