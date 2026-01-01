export interface SongRequest {
  id: string
  guestName: string
  songName: string
  youtubeLink?: string
  status: 'pending' | 'next' | 'ongoing' | 'completed'
  submittedAt: Date
}

export interface Room {
  id: string
  hostId: string
  ownerId?: string  // Firebase Auth user ID (if created by logged-in user)
  createdAt: Date
  expiresAt: Date  // TTL - room will be auto-deleted after this time
  queue: SongRequest[]
}

// Room TTL configuration
export const ROOM_TTL_HOURS = 24 // Rooms expire after 24 hours

export interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
}

