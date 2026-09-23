"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const [ready, setReady] = useState(false);
  const login = mode === "login";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="mesh hidden flex-col justify-between p-10 text-white lg:flex">
        <Link href="/">
          <Logo className="text-white" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4b5fd]">The morning desk</p>
          <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight">
            The paper publishes at 6:05. You should already know.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Hindi, Tamil, Telugu and the rest of the edition, translated, scored, and still attached to the page they came from.
          </p>
        </div>
        <p className="text-xs text-white/50">Sample interface. No account is created.</p>
      </section>
      <section className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:invisible">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h2 className="text-3xl font-semibold">
            {login ? "Log in to the desk" : "Create a desk"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {login
              ? "Use any email. This preview opens the sample PayU dashboard."
              : "Tell us who the desk is for. You will land in the same sample data."}
          </p>
          {ready ? (
            <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5">
              <p className="text-sm leading-relaxed">
                Preview only. Nothing was stored. Continue into the sample morning desk.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Open the dashboard</Link>
              </Button>
            </div>
          ) : (
            <form
              className="mt-8 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setReady(true);
              }}
            >
              {!login && (
                <Field id="name" label="Full name" type="text" placeholder="Ananya Mehta" />
              )}
              <Field id="email" label="Work email" type="email" placeholder="ananya@agency.com" />
              <Field id="password" label="Password" type="password" placeholder="At least 8 characters" />
              {!login && (
                <Field id="org" label="Organisation" type="text" placeholder="Northwind Communications" />
              )}
              <Button type="submit" className="w-full">
                {login ? "Continue" : "Create account"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-sm text-muted-foreground">
            {login ? "New to PrintPulse?" : "Already have a desk?"}{" "}
            <Link href={login ? "/signup" : "/login"} className="font-semibold text-foreground hover:underline">
              {login ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required minLength={type === "password" ? 8 : undefined} placeholder={placeholder} />
    </div>
  );
}
