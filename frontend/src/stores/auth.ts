import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: string
  full_name: string
  email?: string
  sso_provider?: string
  sso_id?: string
  avatar_url?: string
  phone?: string
  is_profile_completed?: boolean
  has_password?: boolean
  role: string
  created_at: string
}

export interface GoogleUserInfo {
  email: string
  name: string
  sub: string
  picture: string
  [key: string]: unknown
}

export const useAuthStore = defineStore('auth', () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

  const defaultAvatarUrl = ref<string>(
    'https://ui-avatars.com/api/?background=E5E7EB&color=9CA3AF&name=Guest',
  )

  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  const profilePromise = ref<Promise<void> | null>(null)

  const fetchConfig = async () => {
    try {
      const resp = await fetch(`${API_URL}/auth/config`)
      const data = await resp.json()
      if (data.success) {
        defaultAvatarUrl.value = data.data.default_avatar_url
      }
    } catch (e) {
      console.error('Failed to fetch backend config', e)
    }
  }

  fetchConfig()

  const login = (jwt: string, userData: User) => {
    token.value = jwt
    user.value = userData
    localStorage.setItem('auth_token', jwt)
  }

  const logout = () => {
    token.value = null
    user.value = null
    profilePromise.value = null
    localStorage.removeItem('auth_token')
  }

  const fetchProfile = async () => {
    if (!token.value) return
    if (user.value) return

    if (profilePromise.value) {
      return profilePromise.value
    }

    profilePromise.value = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        })
        const data = await res.json()
        if (data.success) {
          user.value = data.data
        } else {
          logout()
        }
      } catch (e) {
        console.error('[AuthStore] Failed to fetch profile', e)
      } finally {
        profilePromise.value = null
      }
    })()

    return profilePromise.value
  }

  if (token.value && !user.value) {
    fetchProfile()
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  const isAdmin = () => {
    return user.value?.role === 'admin'
  }

  const isContributor = () => {
    return user.value?.role === 'contributor' || user.value?.role === 'admin'
  }

  const loginWithEmail = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (data.success) {
      login(data.data.token, data.data.user)
    }
    return data
  }

  const registerWithEmail = async (fullName: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password }),
    })
    return await res.json()
  }

  const loginWithSSO = async (userInfo: GoogleUserInfo) => {
    const res = await fetch(`${API_URL}/auth/sso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userInfo.email,
        full_name: userInfo.name,
        sso_provider: 'google',
        sso_id: userInfo.sub,
        avatar_url: userInfo.picture,
      }),
    })

    const data = await res.json()
    if (data.success) {
      login(data.data.token, data.data.user)
    }
    return data
  }

  return {
    token,
    user,
    defaultAvatarUrl,
    login,
    logout,
    fetchProfile,
    isAuthenticated,
    fetchConfig,
    loginWithEmail,
    registerWithEmail,
    loginWithSSO,
    isAdmin,
    isContributor,
  }
})
