"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Card, CardContent } from "@/components/ui/card";

import { createOrder } from "@/lib/actions/orders";

const orderFormSchema = z.object({
  type: z.enum(["DINE_IN", "TAKE_OUT"]),
  tableNumber: z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : Number(v)), z.number().optional()),
  items: z.array(
    z.object({
      menuItemId: z.string().min(1, "Item is required"),
      quantity: z.preprocess((v) => Number(v), z.number().min(1, "Quantity must be at least 1")),
    })
  ),
  specialInstructions: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface OrderFormProps {
  menuItems: MenuItem[];
  onSuccess: () => void;
  isLoading?: boolean;
}

export function OrderForm({
  menuItems,
  onSuccess,
  isLoading,
}: OrderFormProps) {
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    control,
    setValue,
  } = useForm<OrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(orderFormSchema) as any,
    defaultValues: {
      type: "DINE_IN",
      tableNumber: undefined,
      items: [{ menuItemId: "", quantity: 1 }],
      specialInstructions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchType = watch("type");
  const watchItems = watch("items");

  const totalAmount = useMemo(() => {
    return watchItems.reduce((sum, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);
  }, [watchItems, menuItems]);

  const onSubmit = async (data: OrderFormData) => {
    try {
      setError("");

      // Validate at least one item
      if (!data.items || data.items.length === 0 || !data.items[0].menuItemId) {
        setError("Please add at least one item to the order");
        return;
      }

      // Validate table number for dine-in
      if (data.type === "DINE_IN" && !data.tableNumber) {
        setError("Table number is required for dine-in orders");
        return;
      }

      const validItems = data.items.filter((item) => item.menuItemId);
      if (validItems.length === 0) {
        setError("Please add at least one item to the order");
        return;
      }

      await createOrder({
        items: validItems,
        tableNumber: data.type === "DINE_IN" && data.tableNumber ? String(data.tableNumber) : undefined,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Order Type */}
      <div className="space-y-2">
        <Label>Order Type *</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="DINE_IN"
              {...register("type")}
            />
            <span>🍽️ Dine In</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="TAKE_OUT"
              {...register("type")}
            />
            <span>📦 Take Out</span>
          </label>
        </div>
      </div>

      {/* Table Number (for dine-in) */}
      {watchType === "DINE_IN" && (
        <div className="space-y-2">
          <Label htmlFor="tableNumber">Table Number *</Label>
          <Input
            id="tableNumber"
            type="number"
            min="1"
            placeholder="e.g., 5"
            {...register("tableNumber")}
          />
          {errors.tableNumber && (
            <p className="text-red-500 text-sm">{errors.tableNumber.message}</p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Items *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ menuItemId: "", quantity: 1 })}
          >
            + Add Item
          </Button>
        </div>

        {fields.map((field, index) => {
          const selectedMenuItem = menuItems.find(
            (m) => m.id === watchItems[index]?.menuItemId
          );

          return (
            <Card key={field.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">Item {index + 1}</h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`items.${index}.menuItemId`}>
                      Menu Item *
                    </Label>
                    <Select
                      value={watchItems[index]?.menuItemId || ""}
                      onValueChange={(value) =>
                        value !== null && setValue(`items.${index}.menuItemId`, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - ${item.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`items.${index}.quantity`}
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`)}
                        className="flex-1"
                      />
                      {selectedMenuItem && (
                        <div className="flex items-center px-3 bg-gray-100 rounded text-sm font-semibold">
                          ${(selectedMenuItem.price * (watchItems[index]?.quantity || 1)).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedMenuItem && (
                  <div className="text-xs text-gray-600">
                    {selectedMenuItem.category}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {errors.items && (
          <p className="text-red-500 text-sm">{errors.items.message}</p>
        )}
      </div>

      {/* Special Instructions */}
      <div className="space-y-2">
        <Label htmlFor="specialInstructions">Special Instructions</Label>
        <Textarea
          id="specialInstructions"
          placeholder="Optional special requests or notes"
          rows={3}
          {...register("specialInstructions")}
        />
      </div>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Items:</span>
            <span className="font-semibold">
              {watchItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-blue-600">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? "Creating Order..." : "Create Order"}
      </Button>
    </form>
  );
}
