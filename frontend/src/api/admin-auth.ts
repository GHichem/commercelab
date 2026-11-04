const apiUrl =
  import.meta.env.VITE_API_URL

export async function loginAdmin(
  username: string,
  password: string,
) {
  const response =
    await fetch(
      `${apiUrl}/admin/auth/login`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        credentials:
          'include',

        body:
          JSON.stringify({
            username,
            password,
          }),
      },
    )

  if (!response.ok) {
    const data =
      await response
        .json()
        .catch(
          () => null,
        )

    throw new Error(
      data?.message ??
        'Login failed.',
    )
  }
}

export async function checkAdminSession() {
  const response =
    await fetch(
      `${apiUrl}/admin/auth/me`,
      {
        credentials:
          'include',
      },
    )

  return response.ok
}

export async function logoutAdmin() {
  await fetch(
    `${apiUrl}/admin/auth/logout`,
    {
      method: 'POST',
      credentials:
        'include',
    },
  )
}