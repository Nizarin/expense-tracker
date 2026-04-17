"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCategories,
  addCategory,
  deleteCategory,
} from "@/store/slices/categoriesSlice";

export default function CategoryManager() {
  const dispatch = useAppDispatch();
  const { custom } = useAppSelector((s) => s.categories);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await dispatch(addCategory({ name, colorHex: color }));
    if (addCategory.rejected.match(result)) {
      setError((result.payload as string) ?? "Failed");
    } else {
      setName("");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 space-y-4">
      <p className="font-medium text-zinc-700 dark:text-zinc-200">
        Manage Categories
      </p>

      <div>
        <p className="text-xs text-zinc-400 mb-2">Default</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {custom.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 mb-2">Custom</p>
          <div className="flex flex-wrap gap-2">
            {custom.map((c) => (
              <span
                key={c._id}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-white"
                style={{ backgroundColor: c.colorHex }}
              >
                {c.name}
                <button
                  onClick={() => dispatch(deleteCategory(c._id))}
                  className="opacity-70 hover:opacity-100"
                  aria-label={`Delete ${c.name}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-end gap-3">
        <div>
          <label className="text-xs text-zinc-500">New Category</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Gym"
            required
            maxLength={50}
            className="mt-1 w-40 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 h-9 w-12 cursor-pointer rounded-lg border border-zinc-200 p-1 dark:border-zinc-700"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add
        </button>
      </form>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
