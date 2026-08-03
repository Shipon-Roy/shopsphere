"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { IBrand } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface BrandFormProps {
  brand?: IBrand;
  mode: "create" | "edit";
}

export function BrandForm({ brand, mode }: BrandFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: brand?.name ?? "",
      description: brand?.description ?? "",
      isActive: brand?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: FormData) => {
    const url = mode === "edit" ? `/api/admin/brands/${brand?._id}` : "/api/admin/brands";
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Failed to save"); return; }
      toast.success(mode === "edit" ? "Brand updated!" : "Brand created!");
      router.push("/admin/brands");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-xl">
      <Card>
        <CardHeader><CardTitle>Brand Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} className={cn(errors.name && "border-destructive")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Active</p>
              <p className="text-xs text-muted-foreground">Visible to customers</p>
            </div>
            <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>
          {mode === "edit" ? "Save Changes" : "Create Brand"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/brands")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
