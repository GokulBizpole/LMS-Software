// utils/getErrorMessage.ts
interface ApiErrorLike {
  response?: { data?: { message?: string } };
  message?: string;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  const apiErr = err as ApiErrorLike;
  return apiErr?.response?.data?.message || apiErr?.message || fallback;
}
