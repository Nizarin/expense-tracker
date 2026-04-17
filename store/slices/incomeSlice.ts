import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Income {
  _id: string;
  amount: number;
  type: string;
  note?: string;
  date: string;
  isRecurring: boolean;
  recurringDay?: number;
}

interface IncomeState {
  items: Income[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selectedMonth: string;
}

const initialState: IncomeState = {
  items: [],
  status: "idle",
  error: null,
  selectedMonth: new Date().toISOString().slice(0, 7),
};

// ── Thunks ────────────────────────────────────────────────────────────────

export const fetchIncome = createAsyncThunk(
  "income/fetchAll",
  async (month: string, { rejectWithValue }) => {
    const res = await fetch(`/api/income?month=${month}`);
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to fetch income");
    return data.incomes as Income[];
  }
);

export const addIncome = createAsyncThunk(
  "income/add",
  async (payload: Omit<Income, "_id">, { rejectWithValue }) => {
    const res = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to add income");
    return data.income as Income;
  }
);

export const deleteIncome = createAsyncThunk(
  "income/delete",
  async (id: string, { rejectWithValue }) => {
    const res = await fetch(`/api/income/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.error ?? "Failed to delete");
    }
    return id;
  }
);

export const updateIncome = createAsyncThunk(
  "income/update",
  async ({ id, ...body }: Partial<Income> & { id: string }, { rejectWithValue }) => {
    const res = await fetch(`/api/income/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to update");
    return data.income as Income;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────

const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {
    setSelectedMonth(state, action: PayloadAction<string>) {
      state.selectedMonth = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncome.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchIncome.fulfilled, (state, action) => { state.status = "succeeded"; state.items = action.payload; })
      .addCase(fetchIncome.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; })

      .addCase(addIncome.fulfilled, (state, action) => { state.items.unshift(action.payload); })

      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload);
      })

      .addCase(updateIncome.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { setSelectedMonth: setIncomeMonth } = incomeSlice.actions;
export default incomeSlice.reducer;
