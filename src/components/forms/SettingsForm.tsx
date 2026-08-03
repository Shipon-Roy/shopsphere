"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const schema = z.object({
  appName: z.string().min(1, "App name is required").max(100),
  appUrl: z.string().url("Must be a valid URL"),
  supportEmail: z.string().email("Must be a valid email"),
  currency: z.string().length(3, "Currency code must be 3 characters").toUpperCase(),
  taxRate: z.coerce.number().min(0).max(100),
  shippingFee: z.coerce.number().nonnegative(),
  freeShippingThreshold: z.coerce.number().nonnegative(),
});

type FormData = z.infer<typeof schema>;

interface SettingsFormProps {
  defaults?: Partial<FormData>;
}

export function SettingsForm({ defaults }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      appName: defaults?.appName ?? "ShopSphere",
      appUrl: defaults?.appUrl ?? "http://localhost:3000",
      supportEmail: defaults?.supportEmail ?? "support@shopsphere.com",
      currency: defaults?.currency ?? "USD",
      taxRate: defaults?.taxRate ?? 5,
      shippingFee: defaults?.shippingFee ?? 10,
      freeShippingThreshold: defaults?.freeShippingThreshold ?? 100,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Failed to save"); return; }
      toast.success("Settings saved!");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const field = (id: keyof FormData) => ({
    className: cn(errors[id] && "border-destructive"),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-2xl">
      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic store information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="appName">Store Name *</Label>
              <Input id="appName" {...register("appName")} {...field("appName")} />
              {errors.appName && <p className="text-xs text-destructive">{errors.appName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appUrl">Store URL *</Label>
              <Input id="appUrl" type="url" {...register("appUrl")} {...field("appUrl")} />
              {errors.appUrl && <p className="text-xs text-destructive">{errors.appUrl.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supportEmail">Support Email *</Label>
            <Input id="supportEmail" type="email" {...register("supportEmail")} {...field("supportEmail")} />
            {errors.supportEmail && <p className="text-xs text-destructive">{errors.supportEmail.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Commerce */}
      <Card>
        <CardHeader>
          <CardTitle>Commerce</CardTitle>
          <CardDescription>Pricing, tax, and shipping settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency Code *</Label>
              <Input id="currency" maxLength={3} {...register("currency")} {...field("currency")} placeholder="USD" />
              {errors.currency && <p className="text-xs text-destructive">{errors.currency.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" step="0.1" min="0" max="100" {...register("taxRate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shippingFee">Flat Shipping Fee ($)</Label>
              <Input id="shippingFee" type="number" step="0.01" min="0" {...register("shippingFee")} />
            </div>
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
            <Input id="freeShippingThreshold" type="number" step="0.01" min="0" {...register("freeShippingThreshold")} />
            <p className="text-xs text-muted-foreground">Orders above this amount get free shipping. Set to 0 to disable.</p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
        Save Settings
      </Button>
    </form>
  );
}
