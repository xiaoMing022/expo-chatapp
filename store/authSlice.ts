import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 定义用户类型
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// 模拟的默认用户数据
const MOCK_USER: User = {
  id: "u_001",
  name: "测试用户",
  email: "test@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=Felix",
  token: "mock-jwt-token-123456",
};

// --- 异步 Thunks ---

// 1. 登录 (模拟网络请求 + 存入 AsyncStorage)
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // 模拟 API 延时 1.5秒
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 简单的验证逻辑 (实际项目中这里是调用后端 API)
      if (!email || !password) {
        return rejectWithValue("账号或密码不能为空");
      }

      // 登录成功，使用模拟数据，但覆盖邮箱
      const userPayload = { ...MOCK_USER, email };

      // 将用户信息存入本地存储 (持久化)
      await AsyncStorage.setItem("user_session", JSON.stringify(userPayload));

      return userPayload;
    } catch (error) {
      return rejectWithValue("登录服务暂不可用");
    }
  }
);

// 2. 初始化检查 (APP启动时调用，检查是否有本地缓存)
export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const jsonValue = await AsyncStorage.getItem("user_session");
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      return rejectWithValue("读取本地数据失败");
    }
  }
);

// 3. 退出登录 (清除状态 + 清除本地存储)
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await AsyncStorage.removeItem("user_session");
});

// --- Slice 定义 ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 如果有同步的 reducer 写在这里
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理登录状态
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 处理初始化加载
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      // 处理退出
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;