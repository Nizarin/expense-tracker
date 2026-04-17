import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Expense {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
}

interface ExpenseState {
  items: Expense[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selectedMonth: string;
  selectedCategory: string; // "" = all
}

const initialState: ExpenseState = {
  items: [],
  status: "idle",
  error: null,
  selectedMonth: new Date().toISOString().slice(0, 7),
  selectedCategory: "",
};

// ── Thunks ────────────────────────────────────────────────────────────────

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchAll",
  async ({ month, category }: { month: string; category?: string }, { rejectWithValue }) => {
    const params = new URLSearchParams({ month });
    if (category) params.set("category", category);
    const res = await fetch(`/api/expenses?${params}`);
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to fetch expenses");
    return data.expenses as Expense[];
  }
);

export const addExpense = createAsyncThunk(
  "expenses/add",
  async (payload: Omit<Expense, "_id">, { rejectWithValue }) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to add expense");
    return data.expense as Expense;
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/delete",
  async (id: string, { rejectWithValue }) => {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.error ?? "Failed to delete");
    }
    return id;
  }
);

export const updateExpense = createAsyncThunk(
  "expenses/update",
  async ({ id, ...body }: Partial<Expense> & { id: string }, { rejectWithValue }) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to update");
    return data.expense as Expense;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    setExpenseMonth(state, action: PayloadAction<string>) {
      state.selectedMonth = action.payload;
    },
    setExpenseCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchExpenses.fulfilled, (state, action) => { state.status = "succeeded"; state.items = action.payload; })
      .addCase(fetchExpenses.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; })

      .addCase(addExpense.fulfilled, (state, action) => { state.items.unshift(action.payload); })

      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e._id !== action.payload);
      })

      .addCase(updateExpense.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { setExpenseMonth, setExpenseCategory } = expenseSlice.actions;
export default expenseSlice.reducer;
