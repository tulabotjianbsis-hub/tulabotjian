"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMenuItem, updateMenuItem } from "@/lib/actions/menu";

const menuFormSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.preprocess((v) => Number(v), z.number().min(0.01, "Price must be greater than 0")),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  promoPrice: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().optional()),
});

type MenuFormData = z.infer<typeof menuFormSchema>;

interface MenuFormProps {
  initialData?: MenuFormData & { id?: string };
  categories: string[];
  onSuccess: () => void;
  isLoading?: boolean;
}

export function MenuForm({
  initialData,
  categories,
  onSuccess,
  isLoading,
}: MenuFormProps) {
  const [error, setError] = useState("");
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<MenuFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(menuFormSchema) as any,
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
      promoPrice: undefined,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchCategory = watch("category");

  const onSubmit = async (data: MenuFormData) => {
    try {
      setError("");
      if (isEditing) {
        await updateMenuItem(initialData!.id!, {
          name: data.name,
          description: data.description ?? null,
          price: data.price,
          categoryId: data.category,
          imageUrl: data.imageUrl ?? null,
          promoPrice: data.promoPrice ?? null,
        });
      } else {
        await createMenuItem({ ...data, categoryId: data.category });
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
        <Label htmlFor="name">Item Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Cappuccino"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description of the item"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("price")}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="promoPrice">Promo Price ($)</Label>
          <Input
            id="promoPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="Optional"
            {...register("promoPrice")}
          />
          {errors.promoPrice && (
            <p className="text-red-500 text-sm">{errors.promoPrice.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={watchCategory} onValueChange={(value) => { if (value !== null) setValue("category", value); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
            <SelectItem value="__new__">+ Add New Category</SelectItem>
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
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          placeholder="https://example.com/image.jpg"
          {...register("imageUrl")}
        />
        {errors.imageUrl && (
          <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Item" : "Create Item")}
      </Button>
    </form>
  );
}
