"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { serviceKeys } from "@/data/services";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navItems = ["home", "services", "gallery", "blog", "about", "contact"] as const;
const authStorageKey = "greenflow-auth-users";
const currentUserStorageKey = "greenflow-current-user";
const adminDefaultUsername = "admin";
const adminDefaultPassword = "admin123";

type AuthMode = "login" | "signup" | "none";
type AuthUser = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: "admin" | "user";
};

type CurrentUser = {
  username: string;
  role: "admin" | "user";
};

export function Header() {
  const t = useTranslations("nav");
  const tCta = useTranslations("cta");
  const tServices = useTranslations("services.items");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [servicesHoverOpen, setServicesHoverOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("none");
  const emptyAuthForm = {
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    loginIdentifier: "",
  };
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authMessage, setAuthMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const syncCurrentUser = () => {
      try {
        const savedUser = window.localStorage.getItem(currentUserStorageKey);
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    syncCurrentUser();
    window.addEventListener("storage", syncCurrentUser);
    window.addEventListener("auth:changed", syncCurrentUser);

    return () => {
      window.removeEventListener("storage", syncCurrentUser);
      window.removeEventListener("auth:changed", syncCurrentUser);
    };
  }, [locale]);

  useEffect(() => {
    setServicesMenuOpen(false);
    setServicesHoverOpen(false);
  }, [locale]);

  const href = (key: typeof navItems[number]) => {
    const paths: Record<typeof navItems[number], string> = {
      home: `/${locale}`,
      services: `/${locale}/services`,
      gallery: `/${locale}/gallery`,
      blog: `/${locale}/blog`,
      about: `/${locale}/about`,
      contact: `/${locale}/contact`,
    };
    return paths[key];
  };

  const handleAuthInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetAuthForm = () => {
    setAuthForm(emptyAuthForm);
  };

  const toggleAuthMode = (mode: AuthMode) => {
    setAuthMode((prev) => (prev === mode ? "none" : mode));
    resetAuthForm();
    setAuthMessage("");
  };

  const saveCurrentUser = (user: CurrentUser) => {
    window.localStorage.setItem(currentUserStorageKey, JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleAuthSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const rawUsers = window.localStorage.getItem(authStorageKey);
      const users: AuthUser[] = rawUsers ? JSON.parse(rawUsers) : [];

      if (authMode === "signup") {
        if (!authForm.name.trim() || !authForm.email.trim() || !authForm.mobile.trim() || !authForm.password.trim()) {
          setAuthMessage("Please fill in your name, email, mobile, and password.");
          return;
        }

        if (authForm.password !== authForm.confirmPassword) {
          setAuthMessage("Passwords do not match.");
          return;
        }

        if (users.some((user) => user.email === authForm.email.trim() || user.mobile === authForm.mobile.trim())) {
          setAuthMessage("An account with that email or mobile already exists.");
          return;
        }

        const newUser: AuthUser = {
          name: authForm.name.trim(),
          email: authForm.email.trim(),
          mobile: authForm.mobile.trim(),
          password: authForm.password,
          role: authForm.email.trim().toLowerCase() === `${adminDefaultUsername}@mail.com` ? "admin" : "user",
        };

        users.push(newUser);
        window.localStorage.setItem(authStorageKey, JSON.stringify(users));
        setAuthMessage("Account created. Please log in.");
        resetAuthForm();
        setAuthMode("login");
        return;
      }

      if (!authForm.loginIdentifier.trim() || !authForm.password.trim()) {
        setAuthMessage("Please enter your email or mobile number and password.");
        return;
      }

      const matchedUser = users.find(
        (user) =>
          (user.email === authForm.loginIdentifier.trim() || user.mobile === authForm.loginIdentifier.trim()) &&
          user.password === authForm.password,
      );

      if (matchedUser) {
        saveCurrentUser({ username: matchedUser.name || matchedUser.email, role: matchedUser.role });
        setAuthMessage("Login successful.");
        resetAuthForm();
        return;
      }

      if (
        authForm.loginIdentifier.trim().toLowerCase() === adminDefaultUsername &&
        authForm.password === adminDefaultPassword
      ) {
        const adminUser: AuthUser = {
          name: adminDefaultUsername,
          email: `${adminDefaultUsername}@mail.com`,
          mobile: "0000000000",
          password: adminDefaultPassword,
          role: "admin",
        };

        const nextUsers = users.filter((user) => user.email !== `${adminDefaultUsername}@mail.com`);
        nextUsers.push(adminUser);
        window.localStorage.setItem(authStorageKey, JSON.stringify(nextUsers));
        saveCurrentUser({ username: adminUser.name, role: adminUser.role });
        setAuthMessage("Admin login successful.");
        resetAuthForm();
        return;
      }

      setAuthMessage("Invalid email/mobile or password.");
    } catch {
      setAuthMessage("Unable to complete that action right now.");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(currentUserStorageKey);
    setCurrentUser(null);
    setAuthMessage("");
    window.dispatchEvent(new Event("auth:changed"));
  };

  const renderAuthFormContent = () => (
    <>
      <form onSubmit={handleAuthSubmit} method="post" className="mt-3 space-y-2" aria-live="polite">
        {authMode === "signup" ? (
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
          <input
            name="loginIdentifier"
            value={authForm.loginIdentifier}
            onChange={handleAuthInputChange}
            placeholder="Email or Mobile"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        )}
        {authMode === "login" ? (
          <input
            name="password"
            type="password"
            value={authForm.password}
            onChange={handleAuthInputChange}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        ) : null}
        <button type="submit" className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          {authMode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
      {authMessage ? <p className="mt-3 text-sm text-slate-600">{authMessage}</p> : null}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo locale={locale} />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navItems.map((key) => {
            if (key === "services") {
              return (
                <div
                  key={key}
                  className="group relative"
                  onMouseEnter={() => setServicesHoverOpen(true)}
                  onMouseLeave={() => setServicesHoverOpen(false)}
                  onFocus={() => setServicesHoverOpen(true)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setServicesHoverOpen(false);
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setServicesMenuOpen((prev) => !prev)}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-green hover:text-white"
                    aria-expanded={servicesMenuOpen || servicesHoverOpen}
                  >
                    <span>{t(key)}</span>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {(servicesMenuOpen || servicesHoverOpen) ? (
                    <div
                      className="absolute left-0 top-full z-[60] mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                      onMouseEnter={() => setServicesHoverOpen(true)}
                      onMouseLeave={() => setServicesHoverOpen(false)}
                    >
                      {serviceKeys.map((serviceKey) => (
                        <Link
                          key={serviceKey}
                          href={`/${locale}/services/${serviceKey}`}
                          onClick={() => setServicesMenuOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-brand-green"
                        >
                          {tServices(`${serviceKey}.title`)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                key={key}
                href={href(key)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-brand-green hover:text-white"
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {!currentUser ? (
            <>
              <Link
                href={`/${locale}/login`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href={`/${locale}/signup`}
                className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {currentUser.role === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-lg border border-slate-300 bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          )}
          <Link
            href={`/${locale}/contact`}
            className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
          >
            {tCta("contact")}
          </Link>
        </div>

        {!currentUser && authMode !== "none" ? (
          <div className="absolute right-4 top-full z-[60] mt-2 hidden w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:block">
            {renderAuthFormContent()}
          </div>
        ) : null}

        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {navItems.map((key) => {
              if (key === "services") {
                return (
                  <div key={key} className="rounded-lg bg-slate-100 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setServicesMenuOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between text-base font-medium text-slate-700"
                    >
                      <span>{t(key)}</span>
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {servicesMenuOpen ? (
                      <div className="mt-2 space-y-1 border-t border-slate-200 pt-2">
                        {serviceKeys.map((serviceKey) => (
                          <Link
                            key={serviceKey}
                            href={`/${locale}/services/${serviceKey}`}
                            onClick={() => {
                              setServicesMenuOpen(false);
                              setOpen(false);
                            }}
                            className="block rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-green"
                          >
                            {tServices(`${serviceKey}.title`)}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <Link
                  key={key}
                  href={href(key)}
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-base font-medium text-slate-700 transition hover:bg-brand-green hover:text-white"
                >
                  {t(key)}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 flex items-center justify-between">
            <LanguageSwitcher />
            <Link
              href={`/${locale}/contact`}
              onClick={() => setOpen(false)}
              className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white"
            >
              {tCta("contact")}
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {!currentUser ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Login
                  </Link>
                  <Link
                    href={`/${locale}/signup`}
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-brand-green px-3 py-2 text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </div>

                {authMode !== "none" ? renderAuthFormContent() : null}
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-700">Signed in as {currentUser.username}</p>
                {currentUser.role === "admin" ? (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="inline-flex rounded-lg bg-brand-green px-3 py-2 text-sm font-semibold text-white"
                  >
                    Admin
                  </Link>
                ) : null}
                <button type="button" onClick={handleLogout} className="block text-sm font-semibold text-slate-700">
                  Logout
                </button>
              </div>
            )}

            {authMessage ? <p className="mt-3 text-sm text-slate-600">{authMessage}</p> : null}
          </div>

        </div>
      )}
    </header>
  );
}
