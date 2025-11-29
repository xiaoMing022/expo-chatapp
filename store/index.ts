import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// 导出 RootState 和 AppDispatch 类型，方便在组件中使用 TypeScript 提示
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;