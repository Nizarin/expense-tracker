import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface CategoryBreakdown { _id: string; total: number; }
export interface TrendPoint { _id: { year: number; month: number }; total: number; }
export interface GoalSummary { _id: string; title: string; targetAmount: number; currentAmount: number; }

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsAmount: number;
  investable: number;
  overspend: boolean;
  budgetUsedPct: number;
  expByCategory: CategoryBreakdown[];
  goals: GoalSummary[];
  incomeTrend: TrendPoint[];
  expenseTrend: TrendPoint[];
  settings: {
    savingsRatePercent: number;
    investmentRatePercent: number;
    monthlyBudgetLimit: number;
  };
}

interface DashboardState {
  summary: DashboardSummary | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selectedMonth: string;
}

const initialState: DashboardState = {
  summary: null,
  status: "idle",
  error: null,
  selectedMonth: new Date().toISOString().slice(0, 7),
};

// ── Thunk ─────────────────────────────────────────────────────────────────

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchSummary",
  async (month: string, { rejectWithValue }) => {
    const res = await fetch(`/api/dashboard/summary?month=${month}`);
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to fetch dashboard");
    return data as DashboardSummary;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardMonth(state, action) {
      state.selectedMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.status = "succeeded"; state.summary = action.payload; })
      .addCase(fetchDashboard.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; });
  },
});

export const { setDashboardMonth } = dashboardSlice.actions;
export default dashboardSlice.reducer;
