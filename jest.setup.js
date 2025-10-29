// Jest setup file
try {
  // Only load jest-dom when jsdom is the environment
  const env = typeof window !== "undefined" && typeof document !== "undefined";
  if (env) {
    require("@testing-library/jest-dom");
  }
} catch {}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
  useParams() {
    return {};
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";
