/**
 * React Query Keys factory untuk domain Dashboard.
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
}
