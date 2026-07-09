import { AuthUser } from "./auth";

type InMemoryUser = AuthUser & { id: string };

const usersById = new Map<string, InMemoryUser>();
const usersByEmailOrMobile = new Map<string, InMemoryUser>();

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createInMemoryUser(user: AuthUser) {
  // check exists
  const keyEmail = `email:${user.email}`;
  const keyMobile = `mobile:${user.mobile}`;
  if (usersByEmailOrMobile.has(keyEmail) || usersByEmailOrMobile.has(keyMobile)) {
    throw new Error("USER_EXISTS");
  }

  const id = genId();
  const stored: InMemoryUser = { id, ...user, createdAt: user.createdAt ?? new Date() };
  usersById.set(id, stored);
  usersByEmailOrMobile.set(keyEmail, stored);
  usersByEmailOrMobile.set(keyMobile, stored);

  return { id, ...user };
}

export function findInMemoryUserByCredentials(loginIdentifier: string, password: string) {
  const keyEmail = `email:${loginIdentifier}`;
  const keyMobile = `mobile:${loginIdentifier}`;
  const byEmail = usersByEmailOrMobile.get(keyEmail);
  if (byEmail && byEmail.password === password) return byEmail;
  const byMobile = usersByEmailOrMobile.get(keyMobile);
  if (byMobile && byMobile.password === password) return byMobile;
  return null;
}

export function findOrCreateInMemoryAdmin() {
  const keyEmail = `email:admin@mail.com`;
  const existing = usersByEmailOrMobile.get(keyEmail);
  if (existing) return existing;

  const adminUser: AuthUser = {
    name: "admin",
    email: "admin@mail.com",
    mobile: "0000000000",
    password: "admin123",
    role: "admin",
  };

  const id = genId();
  const stored: InMemoryUser = { id, ...adminUser, createdAt: new Date() };
  usersById.set(id, stored);
  usersByEmailOrMobile.set(keyEmail, stored);
  usersByEmailOrMobile.set(`mobile:${adminUser.mobile}`, stored);
  return stored;
}
