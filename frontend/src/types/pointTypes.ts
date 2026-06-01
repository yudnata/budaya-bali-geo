export interface GeoPoint {
  id?: number
  name: string
  latitude: number
  longitude: number
  category_id: number
  address?: string
  tahun_berdiri?: string
  description?: string
  cover_image?: string
  owner_id?: string
  owner_name?: string
  owner_email?: string
  owner_avatar?: string
  status?: 'draft' | 'pending' | 'approved' | 'rejected'
  blog_content?: string
  rejection_note?: string
  created_at?: string
  updated_at?: string
}

export interface ObjectType {
  id: number
  name: string
  icon: string
}
