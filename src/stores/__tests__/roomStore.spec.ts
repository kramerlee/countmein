import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRoomStore } from '../roomStore'

// Mock Firebase
vi.mock('@/firebase', () => ({
  db: {}
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  getDoc: vi.fn().mockResolvedValue({ exists: () => true, data: () => ({}) }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  onSnapshot: vi.fn(() => {
    // Return unsubscribe function
    return vi.fn()
  }),
  arrayUnion: vi.fn((item) => item),
  arrayRemove: vi.fn((item) => item),
  Timestamp: {
    fromDate: vi.fn((date) => date)
  }
}))

describe('roomStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.useFakeTimers()
  })

  describe('createRoom', () => {
    it('should create a room with a unique 6-character ID', async () => {
      const store = useRoomStore()
      const room = await store.createRoom()

      expect(room.id).toHaveLength(6)
      expect(room.hostId).toContain('host_')
      expect(room.queue).toEqual([])
      expect(room.createdAt).toBeInstanceOf(Date)
    })

    it('should store hostId in localStorage', async () => {
      const store = useRoomStore()
      const room = await store.createRoom()

      const savedHostId = localStorage.getItem(`countmein_host_${room.id}`)
      expect(savedHostId).toBe(room.hostId)
    })
  })

  describe('roomExists', () => {
    it('should return true for existing room', async () => {
      const { getDoc } = await import('firebase/firestore')
      const mockGetDoc = getDoc as Mock
      mockGetDoc.mockResolvedValueOnce({ exists: () => true })

      const store = useRoomStore()
      const exists = await store.roomExists('TESTID')

      expect(exists).toBe(true)
    })

    it('should return false for non-existing room', async () => {
      const { getDoc } = await import('firebase/firestore')
      const mockGetDoc = getDoc as Mock
      mockGetDoc.mockResolvedValueOnce({ exists: () => false })

      const store = useRoomStore()
      const exists = await store.roomExists('NONEXISTENT')

      expect(exists).toBe(false)
    })
  })

  describe('notifications', () => {
    it('should add notification with correct properties', () => {
      const store = useRoomStore()

      store.addNotification('Test message', 'info')

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].message).toBe('Test message')
      expect(store.notifications[0].type).toBe('info')
    })

    it('should auto-remove notification after 5 seconds', () => {
      const store = useRoomStore()

      store.addNotification('Test message', 'info')

      expect(store.notifications).toHaveLength(1)

      vi.advanceTimersByTime(5000)

      expect(store.notifications).toHaveLength(0)
    })

    it('should manually remove notification by id', () => {
      const store = useRoomStore()

      store.addNotification('Test message', 'info')
      const notificationId = store.notifications[0].id

      store.removeNotification(notificationId)

      expect(store.notifications).toHaveLength(0)
    })
  })

  describe('isHost', () => {
    it('should return true when hostId matches localStorage', async () => {
      const store = useRoomStore()
      const room = await store.createRoom()

      expect(store.isHost(room.id)).toBe(true)
    })

    it('should return false when no hostId in localStorage', () => {
      const store = useRoomStore()

      expect(store.isHost('RANDOMID')).toBe(false)
    })
  })

  describe('computed getters', () => {
    it('should return empty arrays when no room', () => {
      const store = useRoomStore()

      expect(store.queue).toEqual([])
      expect(store.pendingRequests).toEqual([])
      expect(store.completedRequests).toEqual([])
    })

    it('should return undefined for next/ongoing when no room', () => {
      const store = useRoomStore()

      expect(store.nextRequest).toBeUndefined()
      expect(store.ongoingRequest).toBeUndefined()
    })
  })

  describe('unsubscribeFromRoom', () => {
    it('should clear currentRoom', () => {
      const store = useRoomStore()

      store.unsubscribeFromRoom()

      expect(store.currentRoom).toBeNull()
    })
  })
})
