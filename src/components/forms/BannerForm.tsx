"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { IBanner } from "@/types";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  subtitle: z.string().max(300).optional(),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  buttonText: z.string().max(50).optional(),
  order: z.coerce.number().int().nonnegative(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface BannerFormProps {
  banner?: IBanner;
  mode: "create" | "edit";
}

export function BannerForm({ banner, mode }: BannerFormProps) {
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
      title: banner?.title ?? "",
      subtitle: banner?.subtitle ?? "",
      link: banner?.link ?? "",
      buttonText: banner?.buttonText ?? "",
      order: banner?.order ?? 0,
      isActive: banner?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, link: data.link || undefined, buttonText: data.buttonText || undefined, subtitle: data.subtitle || undefined };
    const url = mode === "edit" ? `/api/admin/banners/${banner?._id}` : "/api/admin/banners";
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Failed to save"); return; }
      toast.success(mode === "edit" ? "Banner updated!" : "Banner created!");
      router.push("/admin/banners");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-xl">
      <Card>
        <CardHeader><CardTitle>Banner Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register("title")} className={cn(errors.title && "border-destructive")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" {...register("subtitle")} placeholder="Optional tagline" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link">Link URL</Label>
            <Input id="link" type="url" {...register("link")} placeholder="https://example.com/products" className={cn(errors.link && "border-destructive")} />
            {errors.link && <p className="text-xs text-destructive">{errors.link.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input id="buttonText" {...register("buttonText")} placeholder="Shop Now" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order">Display Order</Label>
              <Input id="order" type="number" min="0" {...register("order")} />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Active</p>
              <p className="text-xs text-muted-foreground">Show this banner on the storefront</p>
            </div>
            <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting}>
          {mode === "edit" ? "Save Changes" : "Create Banner"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/banners")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
