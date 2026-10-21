export type HealthResponse = {
  status: string
  service: string
}

export async function getHealth(): Promise<HealthResponse> {
  const apiUrl = import.meta.env.VITE_API_URL

  const response = await fetch(`${apiUrl}/health`)

  if (!response.ok) {
    throw new Error('Backend health check failed')
  }

  return response.json()
}