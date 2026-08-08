"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

const currentUserStorageKey = "greenflow-current-user";

type AuthMode = "login" | "signup";

type AuthUser = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: "admin" | "user";
};

type CurrentUser = {
  username: string;
  name?: string;
  email?: string;
  mobile?: string;
  role: "admin" | "user";
};

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    loginIdentifier: "",
  });
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState<"success" | "error">("error");

  const resetAuthForm = () => {
    setAuthForm({
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      loginIdentifier: "",
    });
  };

  const saveCurrentUser = (user: CurrentUser) => {
    window.localStorage.setItem(currentUserStorageKey, JSON.stringify(user));
    window.dispatchEvent(new Event("auth:changed"));
  };

  const setFeedback = (message: string, type: "success" | "error") => {
    setAuthMessage(message);
    setAuthMessageType(type);
  };

  const handleAuthInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (mode === "signup") {
        if (!authForm.name.trim() || !authForm.email.trim() || !authForm.mobile.trim() || !authForm.password.trim()) {
          setFeedback("Please fill in your name, email, mobile, and password.", "error");
          return;
        }

        if (authForm.password !== authForm.confirmPassword) {
          setFeedback("Passwords do not match.", "error");
          return;
        }

        const response = await fetch(`/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authForm.name.trim(),
            email: authForm.email.trim(),
            mobile: authForm.mobile.trim(),
            password: authForm.password,
            confirmPassword: authForm.confirmPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setFeedback(data.message || "Unable to create account.", "error");
          return;
        }

        resetAuthForm();
        setFeedback("Account created successfully. Redirecting to login...", "success");
        window.setTimeout(() => {
          const returnTo = new URLSearchParams(window.location.search).get("returnTo");
          router.push(returnTo?.startsWith(`/${locale}`) ? `/${locale}/login?returnTo=${encodeURIComponent(returnTo)}` : `/${locale}/login`);
        }, 800);
        return;
      }

      if (!authForm.loginIdentifier.trim() || !authForm.password.trim()) {
        setFeedback("Please enter your email or mobile number and password.", "error");
        return;
      }

      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginIdentifier: authForm.loginIdentifier.trim(),
          password: authForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.message || "Invalid email/mobile or password.", "error");
        return;
      }

      saveCurrentUser({
        username: data.user.name || data.user.email,
        name: data.user.name || data.user.email,
        email: data.user.email,
        mobile: data.user.mobile,
        role: data.user.role,
      });
      resetAuthForm();
      setFeedback("Login successful. Redirecting...", "success");
      window.setTimeout(() => {
        const returnTo = new URLSearchParams(window.location.search).get("returnTo");
        router.push(returnTo?.startsWith(`/${locale}`) ? returnTo : `/${locale}`);
      }, 600);
    } catch {
      setFeedback("Unable to complete that action right now.", "error");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            {mode === "login" ? "Login to your account" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {mode === "login"
              ? "Use your registered email or mobile number to sign in."
              : "Sign up to access the admin and account features."}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} method="post" className="space-y-3" aria-live="polite">
          {mode === "signup" ? (
            <>
              <input
                name="name"
                value={authForm.name}
                onChange={handleAuthInputChange}
                placeholder="Full Name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                value={authForm.email}
                onChange={handleAuthInputChange}
                placeholder="Email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="mobile"
                value={authForm.mobile}
                onChange={handleAuthInputChange}
                placeholder="Mobile Number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={handleAuthInputChange}
                placeholder="Password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="confirmPassword"
                type="password"
                value={authForm.confirmPassword}
                onChange={handleAuthInputChange}
                placeholder="Confirm Password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </>
          ) : (
            <>
              <input
                name="loginIdentifier"
                value={authForm.loginIdentifier}
                onChange={handleAuthInputChange}
                placeholder="Email or Mobile"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="password"
                type="password"
                value={authForm.password}
                onChange={handleAuthInputChange}
                placeholder="Password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </>
          )}

          <button type="submit" className="w-full rounded-lg bg-brand-green px-3 py-2 text-sm font-semibold text-white">
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        {authMessage ? (
          <p className={`mt-4 text-sm ${authMessageType === "success" ? "text-green-600" : "text-slate-600"}`}>
            {authMessage}
          </p>
        ) : null}

        <p className="mt-5 text-center text-sm text-slate-600">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link href={`/${locale}/signup`} className="font-semibold text-brand-green-dark">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/${locale}/login`} className="font-semibold text-brand-green-dark">
                Login
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
