export const buildRoute = {
  people: (checkId: string) => `/check/${checkId}/people`,
  items: (checkId: string) => `/check/${checkId}/items`,
  stats: (checkId: string) => `/check/${checkId}/stats`,
}
