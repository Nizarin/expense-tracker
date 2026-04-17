import { configureStore } from "@reduxjs/toolkit";
import incomeReducer from "@/store/slices/incomeSlice";
import expenseReducer from "@/store/slices/expenseSlice";
import savingsReducer from "@/store/slices/savingsSlice";
import categoriesReducer from "@/store/slices/categoriesSlice";
import settingsReducer from "@/store/slices/settingsSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    income: incomeReducer,
    expenses: expenseReducer,
    savings: savingsReducer,
    categories: categoriesReducer,
    settings: settingsReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
