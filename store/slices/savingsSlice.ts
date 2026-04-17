import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface SavingsGoal {
  _id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isCompleted: boolean;
}

interface SavingsState {
  goals: SavingsGoal[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SavingsState = {
  goals: [],
  status: "idle",
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────

export const fetchGoals = createAsyncThunk(
  "savings/fetchAll",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/savings");
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to fetch goals");
    return data.goals as SavingsGoal[];
  }
);

export const addGoal = createAsyncThunk(
  "savings/add",
  async (payload: Omit<SavingsGoal, "_id" | "isCompleted">, { rejectWithValue }) => {
    const res = await fetch("/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to add goal");
    return data.goal as SavingsGoal;
  }
);

export const updateGoal = createAsyncThunk(
  "savings/update",
  async ({ id, ...body }: { id: string; currentAmount?: number; isCompleted?: boolean }, { rejectWithValue }) => {
    const res = await fetch(`/api/savings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to update goal");
    return data.goal as SavingsGoal;
  }
);

export const deleteGoal = createAsyncThunk(
  "savings/delete",
  async (id: string, { rejectWithValue }) => {
    const res = await fetch(`/api/savings/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.error ?? "Failed to delete");
    }
    return id;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────

const savingsSlice = createSlice({
  name: "savings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => { state.status = "loading"; state.error = null; })
      .addCase(fetchGoals.fulfilled, (state, action) => { state.status = "succeeded"; state.goals = action.payload; })
      .addCase(fetchGoals.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; })

      .addCase(addGoal.fulfilled, (state, action) => { state.goals.push(action.payload); })

      .addCase(updateGoal.fulfilled, (state, action) => {
        const idx = state.goals.findIndex((g) => g._id === action.payload._id);
        if (idx !== -1) state.goals[idx] = action.payload;
      })

      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g._id !== action.payload);
      });
  },
});

export default savingsSlice.reducer;
