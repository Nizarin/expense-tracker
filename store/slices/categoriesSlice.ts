import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { CATEGORIES } from "@/lib/categories";

export interface CustomCategory {
  _id: string;
  name: string;
  colorHex: string;
}

interface CategoriesState {
  defaults: readonly string[];
  custom: CustomCategory[];
  all: string[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CategoriesState = {
  defaults: CATEGORIES,
  custom: [],
  all: [...CATEGORIES],
  status: "idle",
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to fetch categories");
    return data as { defaults: string[]; custom: CustomCategory[]; all: string[] };
  }
);

export const addCategory = createAsyncThunk(
  "categories/add",
  async (payload: { name: string; colorHex: string }, { rejectWithValue }) => {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return rejectWithValue(data.error ?? "Failed to add category");
    return data.category as CustomCategory;
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.error ?? "Failed to delete");
    }
    return id;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.status = "loading"; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.custom = action.payload.custom;
        state.all = action.payload.all;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      .addCase(addCategory.fulfilled, (state, action) => {
        state.custom.push(action.payload);
        state.all.push(action.payload.name);
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        const cat = state.custom.find((c) => c._id === action.payload);
        state.custom = state.custom.filter((c) => c._id !== action.payload);
        if (cat) state.all = state.all.filter((n) => n !== cat.name);
      });
  },
});

export default categoriesSlice.reducer;
