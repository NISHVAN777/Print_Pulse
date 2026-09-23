"use client";

import { createContext, useContext, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Intent = "access" | "demo";

type EarlyAccessApi = {
  open: (intent?: Intent) => void;
};

const EarlyAccessContext = createContext<EarlyAccessApi | null>(null);

export function useEarlyAccess() {
  const ctx = useContext(EarlyAccessContext);
  if (!ctx) throw new Error("useEarlyAccess must be used inside EarlyAccessProvider");
  return ctx;
}

export function EarlyAccessProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<Intent>("access");
  const [sent, setSent] = useState(false);

  function openDialog(next: Intent = "access") {
    setIntent(next);
    setSent(false);
    setOpen(true);
  }

  return (
    <EarlyAccessContext.Provider value={{ open: openDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {sent ? (
            <>
              <DialogHeader>
                <DialogTitle>Request noted.</DialogTitle>
                <DialogDescription>
                  This preview does not send email. In the product, a specialist would follow up with a
                  morning-edition walkthrough on your brands.
                </DialogDescription>
              </DialogHeader>
              <Button type="button" onClick={() => setOpen(false)}>
                Close
              </Button>
            </>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <DialogHeader>
                <DialogTitle>{intent === "demo" ? "Request a demo" : "Get early access"}</DialogTitle>
                <DialogDescription>
                  Tell us the brands and languages you need on the desk. We will use a real regional page,
                  not a slide.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" name="name" placeholder="Ananya Mehta" required />
                <Field label="Work email" name="email" type="email" placeholder="you@agency.com" required />
              </div>
              <Field label="Organisation" name="org" placeholder="Northwind Communications" required />
              <div className="space-y-1.5">
                <Label htmlFor="brief">Brands and languages</Label>
                <Textarea
                  id="brief"
                  name="brief"
                  required
                  placeholder="PayU · Hindi, Tamil, Telugu · crisis desk"
                />
              </div>
              <Button type="submit" className="w-full">
                {intent === "demo" ? "Request demo" : "Request early access"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </EarlyAccessContext.Provider>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const id = `ea-${name}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} placeholder={placeholder} required={required} />
    </div>
  );
}
