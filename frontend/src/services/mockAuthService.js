const MOCK_USERS_KEY = "mockAuthUsers";

const DEFAULT_MOCK_USERS = [
  {
    id: "student-1",
    username: "student.demo",
    email: "student@demo.com",
    displayName: "Student Demo",
    password: "123456",
    role: "student",
  },
  {
    id: "instructor-1",
    username: "instructor.demo",
    email: "instructor@demo.com",
    displayName: "Instructor Demo",
    password: "123456",
    role: "instructor",
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createMockError(message, status = 400) {
  const error = new Error(message);
  error.response = {
    status,
    data: { message },
  };
  return error;
}

function sanitizeUser(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function getStoredUsers() {
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  if (!raw) {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_MOCK_USERS));
      return DEFAULT_MOCK_USERS;
    }
    return parsed;
  } catch {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export const mockAuthService = {
  login: async (username, password, role) => {
    await wait(250);

    const users = getStoredUsers();
    const normalizedUsername = (username || "").trim().toLowerCase();

    const foundUser = users.find(
      (user) =>
        user.username.toLowerCase() === normalizedUsername &&
        user.password === password &&
        (!role || user.role === role),
    );

    if (!foundUser) {
      throw createMockError("Sai username, mat khau hoac role.", 401);
    }

    return {
      accessToken: `mock-token-${Date.now()}`,
      user: sanitizeUser(foundUser),
    };
  },

  signup: async (data) => {
    await wait(300);

    const users = getStoredUsers();
    const normalizedEmail = (data.email || "").trim().toLowerCase();
    const normalizedUsername = (data.username || "").trim().toLowerCase();

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === normalizedEmail,
    );
    if (emailExists) {
      throw createMockError("Email da ton tai.", 409);
    }

    const usernameExists = users.some(
      (user) => user.username.toLowerCase() === normalizedUsername,
    );
    if (usernameExists) {
      throw createMockError("Username da ton tai.", 409);
    }

    const newUser = {
      id: `mock-${Date.now()}`,
      username: normalizedUsername,
      email: normalizedEmail,
      displayName: data.displayName || data.username,
      password: data.password,
      role: data.role || "student",
    };

    const nextUsers = [newUser, ...users];
    saveUsers(nextUsers);

    return {
      accessToken: `mock-token-${Date.now()}`,
      user: sanitizeUser(newUser),
    };
  },

  logout: async () => {
    await wait(120);
    return { message: "Mock logout success" };
  },

  refreshToken: async () => {
    await wait(120);
    return { accessToken: `mock-token-${Date.now()}` };
  },
};
