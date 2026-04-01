export type Role = "teacher" | "student";

export type User = {
  id: string;
  role: Role;
};

const MOCK_USERS = [
  { id: "teacher1", password: "123456", role: "teacher" as Role },
  { id: "student1", password: "123456", role: "student" as Role },
];

const STORAGE_KEY = "kb_auth_user";
const REMEMBER_KEY = "kb_auth_remember";

export function login(id: string, password: string, role: Role, remember: boolean): User {
  const user = MOCK_USERS.find((u) => u.id === id && u.role === role);
  if (!user) {
    throw new Error("账号不存在");
  }
  if (user.password !== password) {
    throw new Error("密码错误");
  }

  const result: User = { id: user.id, role: user.role };
  if (remember) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    localStorage.setItem(REMEMBER_KEY, JSON.stringify({ id, role }));
  } else {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
  return result;
}

export function logout(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUser(): User | null {
  const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === "string" && (parsed.role === "teacher" || parsed.role === "student")) {
      return parsed as User;
    }
  } catch {}
  return null;
}

export function getRememberedCredentials(): { id: string; role: Role } | null {
  const raw = localStorage.getItem(REMEMBER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {}
  return null;
}
