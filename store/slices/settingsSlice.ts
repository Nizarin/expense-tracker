import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface UserSettings {
  savingsRatePercent: number;
  investmentRatePercent: number;
  monthlyBudgetLimit: number; // paise
  monthlyIncome: number;      // paise
  currency: string;
}

interface SettingsState {
  data: UserSettings | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  status: "idle",
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to fetch settings");
    return data.settings as UserSettings;
  }
);

export const saveSettings = createAsyncThunk(
  "settings/save",
  async (payload: Partial<UserSettings>, { rejectWithValue }) => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to save settings");
    return data.settings as UserSettings;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.status = "loading"; })
      .addCase(fetchSettings.fulfilled, (state, action) => { state.status = "succeeded"; state.data = action.payload; })
      .addCase(fetchSettings.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; })

      .addCase(saveSettings.fulfilled, (state, action) => { state.data = action.payload; });
  },
});

export default settingsSlice.reducer;
