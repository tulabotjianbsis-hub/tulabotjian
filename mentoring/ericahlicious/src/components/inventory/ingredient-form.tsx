"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createIngredient, updateIngredient } from "@/lib/actions/inventory";

const ingredientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.preprocess((v) => Number(v), z.number().min(0, "Stock must be non-negative")),
  unit: z.string().min(1, "Unit is required"),
  supplier: z.string().optional(),
  expiryDate: z.string().optional(),
});

type IngredientFormData = z.infer<typeof ingredientFormSchema>;

interface IngredientFormProps {
  initialData?: IngredientFormData & { id?: string };
  categories: string[];
  onSuccess: () => void;
  isLoading?: boolean;
}

const UNITS = ["kg", "g", "L", "ml", "pieces", "dozen", "box", "bag"];

export function IngredientForm({
  initialData,
  categories,
  onSuccess,
  isLoading,
}: IngredientFormProps) {
  const [error, setError] = useState("");
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<IngredientFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ingredientFormSchema) as any,
    defaultValues: initialData || {
      name: "",
      category: "",
      stock: 0,
      unit: "kg",
      supplier: "",
      expiryDate: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchCategory = watch("category");
  const watchUnit = watch("unit");

  const onSubmit = async (data: IngredientFormData) => {
    try {
      setError("");
      const expiryDate = data.expiryDate ? new Date(data.expiryDate) : undefined;

      if (isEditing) {
        await updateIngredient(initialData!.id!, {
          name: data.name,
          categoryId: data.category,
          unit: data.unit,
          supplier: data.supplier || undefined,
          expiryDate: expiryDate,
        });
      } else {
        await createIngredient({
          name: data.name,
          categoryId: data.category,
          stock: data.stock,
          unit: data.unit,
          supplier: data.supplier || undefined,
          expiryDate: expiryDate,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Ingredient Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Espresso Beans"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={watchCategory} onValueChange={(value) => { if (value !== null) setValue("category", value); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
              <SelectItem value="__new__">+ New Category</SelectItem>
            </SelectContent>
          </Select>
          {watchCategory === "__new__" && (
            <Input
              placeholder="New category name"
              onBlur={(e) => {
                if (e.target.value) setValue("category", e.target.value);
              }}
            />
          )}
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select value={watchUnit} onValueChange={(value) => { if (value !== null) setValue("unit", value); }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit && (
            <p className="text-red-500 text-sm">{errors.unit.message}</p>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="stock">Initial Stock *</Label>
          <Input
            id="stock"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            {...register("stock")}
          />
          {errors.stock && (
            <p className="text-red-500 text-sm">{errors.stock.message}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            placeholder="Optional supplier name"
            {...register("supplier")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            type="date"
            {...register("expiryDate")}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading
          ? isEditing
            ? "Updating..."
            : "Creating..."
          : isEditing
            ? "Update Ingredient"
            : "Create Ingredient"}
      </Button>
    </form>
  );
}
