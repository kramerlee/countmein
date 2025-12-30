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
  createdAt: Date
  queue: SongRequest[]
}

export interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
}

