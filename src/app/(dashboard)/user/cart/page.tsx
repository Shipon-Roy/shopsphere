"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, COUNTRIES, PAYMENT_METHOD_CONFIG } from "@/constants";
import type { ICart, ShippingAddress, PaymentMethod } from "@/types";

export default function UserCartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<ICart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "", phone: "", address: "", city: "", state: "", zip: "", country: "United States",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setCart(json.data);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQty = async (productId: string, quantity: number) => {
    setUpdatingId(productId);
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error();
      await fetchCart();
      window.dispatchEvent(new Event("cart:updated"));
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId: string) => {
    setUpdatingId(productId);
    try {
      const res = await fetch(`/api/cart/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Item removed");
      await fetchCart();
      window.dispatchEvent(new Event("cart:updated"));
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const placeOrder = async () => {
    // Basic address validation
    const required = ["name", "phone", "address", "city", "state", "zip", "country"] as const;
    for (const field of required) {
      if (!shippingAddress[field]) {
        toast.error(`Please fill in ${field}`);
        return;
      }
    }

    setPlacingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress, paymentMethod }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Failed to place order"); return; }
      toast.success("Order placed successfully!");
      setCheckoutOpen(false);
      window.dispatchEvent(new Event("cart:updated"));
      router.push(`/user/orders/${json.data._id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPlacingOrder(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  // Totals
  const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shippingFee + tax;
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
    </div>
  );

  const hasItems = (cart?.items.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Cart"
        description={hasItems ? `${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart` : undefined}
      />

      {!hasItems ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our catalog and add items to your cart."
          action={{ label: "Shop Now", href: "/products" }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {cart!.items.map((item) => {
              const product = item.product;
              const isUpdating = updatingId === product._id;
              return (
                <div key={product._id} className="flex gap-4 rounded-xl border bg-card p-4">
                  {/* Image */}
                  <Link href={`/products/${product._id}`} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                    {product.images?.length > 0 ? (
                      <img src={`/api/products/${product._id}/image`} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Tag className="h-8 w-8 text-muted-foreground/40" />
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product._id}`} className="font-medium text-sm hover:text-primary transition-colors truncate block">
                      {product.name}
                    </Link>
                    <p className="text-sm font-semibold mt-1">{fmt(item.price)}</p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQty(product._id, item.quantity - 1)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center hover:bg-accent transition-colors disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(product._id, item.quantity + 1)}
                          disabled={isUpdating || item.quantity >= product.stock}
                          className="flex h-8 w-8 items-center justify-center hover:bg-accent transition-colors disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Button
                        variant="ghost" size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(product._id)}
                        disabled={isUpdating}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div className="text-right shrink-0">
                    <p className="font-bold">{fmt(item.price * item.quantity)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">{fmt(item.price)} each</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shippingFee === 0 ? "text-success font-medium" : ""}>
                      {shippingFee === 0 ? "Free" : fmt(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span>{fmt(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{fmt(total)}</span>
                  </div>
                </div>

                {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
                  <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-md px-3 py-2">
                    Add {fmt(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
                  </p>
                )}

                <Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)}>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Checkout dialog */}
      <ConfirmDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        title="Place Order"
        confirmLabel={placingOrder ? "Placing order…" : `Place Order (${fmt(total)})`}
        cancelLabel="Back to Cart"
        variant="default"
        loading={placingOrder}
        onConfirm={placeOrder}
        description=""
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Fill in your shipping details to complete the order.</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sa-name" className="text-xs">Full Name *</Label>
              <Input id="sa-name" value={shippingAddress.name} onChange={(e) => setShippingAddress((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sa-phone" className="text-xs">Phone *</Label>
              <Input id="sa-phone" value={shippingAddress.phone} onChange={(e) => setShippingAddress((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="sa-address" className="text-xs">Address *</Label>
            <Input id="sa-address" value={shippingAddress.address} onChange={(e) => setShippingAddress((p) => ({ ...p, address: e.target.value }))} placeholder="123 Main St" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sa-city" className="text-xs">City *</Label>
              <Input id="sa-city" value={shippingAddress.city} onChange={(e) => setShippingAddress((p) => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sa-state" className="text-xs">State *</Label>
              <Input id="sa-state" value={shippingAddress.state} onChange={(e) => setShippingAddress((p) => ({ ...p, state: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sa-zip" className="text-xs">ZIP *</Label>
              <Input id="sa-zip" value={shippingAddress.zip} onChange={(e) => setShippingAddress((p) => ({ ...p, zip: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Country *</Label>
            <Select value={shippingAddress.country} onValueChange={(v) => setShippingAddress((p) => ({ ...p, country: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-1">
            <Label className="text-xs">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}
