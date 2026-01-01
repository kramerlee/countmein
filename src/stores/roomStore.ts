import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore'
import { getDb, isFirebaseConfigured } from '@/firebase'
import type { Room, SongRequest, Notification } from '@/types'
import { ROOM_TTL_HOURS } from '@/types'

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function generateHostId(): string {
  return `host_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Convert Firestore timestamps to Date objects
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data }
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = (result[key] as Timestamp).toDate()
    } else if (Array.isArray(result[key])) {
      result[key] = (result[key] as Record<string, unknown>[]).map(item => {
        if (typeof item === 'object' && item !== null) {
          return convertTimestamps(item)
        }
        return item
      })
    }
  }
  return result
}

export const useRoomStore = defineStore('room', () => {
  const currentRoom = ref<Room | null>(null)
  const notifications = ref<Notification[]>([])
  const currentHostId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let unsubscribe: Unsubscribe | null = null

  // Check if Firebase is configured
  const isConfigured = computed(() => isFirebaseConfigured)

  const queue = computed(() => currentRoom.value?.queue ?? [])

  const pendingRequests = computed(() =>
    queue.value.filter(r => r.status === 'pending')
  )

  const nextRequest = computed(() =>
    queue.value.find(r => r.status === 'next')
  )

  const ongoingRequest = computed(() =>
    queue.value.find(r => r.status === 'ongoing')
  )

  const completedRequests = computed(() =>
    queue.value.filter(r => r.status === 'completed')
  )

  async function createRoom(): Promise<Room> {
    const roomId = generateRoomId()
    const hostId = generateHostId()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + ROOM_TTL_HOURS * 60 * 60 * 1000)

    const room: Room = {
      id: roomId,
      hostId,
      createdAt: now,
      expiresAt,
      queue: []
    }

    try {
      isLoading.value = true
      error.value = null

      await setDoc(doc(getDb(), 'rooms', roomId), {
        ...room,
        createdAt: Timestamp.fromDate(room.createdAt),
        expiresAt: Timestamp.fromDate(room.expiresAt)
      })

      currentHostId.value = hostId
      localStorage.setItem(`countmein_host_${roomId}`, hostId)

      return room
    } catch (err) {
      error.value = 'Failed to create room'
      console.error('Error creating room:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function subscribeToRoom(roomId: string): Promise<boolean> {
    // Unsubscribe from previous room if any
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    try {
      isLoading.value = true
      error.value = null

      // Check if room exists first
      const roomDoc = await getDoc(doc(getDb(), 'rooms', roomId))
      if (!roomDoc.exists()) {
        error.value = 'Room not found'
        return false
      }

      // Check if current user is host
      const savedHostId = localStorage.getItem(`countmein_host_${roomId}`)
      if (savedHostId) {
        currentHostId.value = savedHostId
      }

      // Subscribe to real-time updates
      const previousQueueLength = currentRoom.value?.queue.length ?? 0

      unsubscribe = onSnapshot(
        doc(getDb(), 'rooms', roomId),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = convertTimestamps(snapshot.data() as Record<string, unknown>) as unknown as Room
            const newQueueLength = data.queue?.length ?? 0

            // Show notification if new request added (only for host)
            if (
              currentHostId.value &&
              currentRoom.value &&
              newQueueLength > previousQueueLength
            ) {
              const latestRequest = data.queue[data.queue.length - 1]
              if (latestRequest) {
                addNotification(
                  `${latestRequest.guestName} requested "${latestRequest.songName}"`,
                  'info'
                )
              }
            }

            currentRoom.value = data
          } else {
            currentRoom.value = null
          }
        },
        (err) => {
          console.error('Error listening to room:', err)
          error.value = 'Connection lost'
        }
      )

      return true
    } catch (err) {
      error.value = 'Failed to connect to room'
      console.error('Error subscribing to room:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function roomExists(roomId: string): Promise<boolean> {
    try {
      const roomDoc = await getDoc(doc(getDb(), 'rooms', roomId))
      return roomDoc.exists()
    } catch (err) {
      console.error('Error checking room:', err)
      return false
    }
  }

  async function addSongRequest(
    roomId: string,
    guestName: string,
    songName: string,
    youtubeLink?: string
  ): Promise<SongRequest | null> {
    const request: SongRequest = {
      id: generateRequestId(),
      guestName,
      songName,
      status: 'pending',
      submittedAt: new Date()
    }

    // Only add youtubeLink if it has a value (Firebase doesn't accept undefined)
    if (youtubeLink) {
      request.youtubeLink = youtubeLink
    }

    try {
      isLoading.value = true
      error.value = null

      const roomRef = doc(getDb(), 'rooms', roomId)

      // Convert Date to Timestamp for Firestore
      // Also filter out any undefined values to be safe
      const firestoreRequest: Record<string, unknown> = {
        id: request.id,
        guestName: request.guestName,
        songName: request.songName,
        status: request.status,
        submittedAt: Timestamp.fromDate(request.submittedAt)
      }

      if (request.youtubeLink) {
        firestoreRequest.youtubeLink = request.youtubeLink
      }

      await updateDoc(roomRef, {
        queue: arrayUnion(firestoreRequest)
      })

      return request
    } catch (err) {
      error.value = 'Failed to submit request'
      console.error('Error adding song request:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Helper to convert SongRequest to Firestore-safe object (no undefined values)
  function toFirestoreRequest(r: SongRequest): Record<string, unknown> {
    const result: Record<string, unknown> = {
      id: r.id,
      guestName: r.guestName,
      songName: r.songName,
      status: r.status,
      submittedAt: r.submittedAt instanceof Date
        ? Timestamp.fromDate(r.submittedAt)
        : r.submittedAt
    }
    if (r.youtubeLink) {
      result.youtubeLink = r.youtubeLink
    }
    return result
  }

  async function updateRequestStatus(
    roomId: string,
    requestId: string,
    status: SongRequest['status']
  ) {
    if (!currentRoom.value) return

    try {
      const roomRef = doc(getDb(), 'rooms', roomId)
      const updatedQueue = currentRoom.value.queue.map(r => {
        // If setting to 'next', clear any existing 'next' status
        if (status === 'next' && r.status === 'next' && r.id !== requestId) {
          return { ...r, status: 'pending' as const }
        }
        // If setting to 'ongoing', mark existing 'ongoing' as completed
        if (status === 'ongoing' && r.status === 'ongoing' && r.id !== requestId) {
          return { ...r, status: 'completed' as const }
        }
        // Update the target request
        if (r.id === requestId) {
          return { ...r, status }
        }
        return r
      })

      // Convert to Firestore-safe format (no undefined values)
      const firestoreQueue = updatedQueue.map(toFirestoreRequest)

      await updateDoc(roomRef, { queue: firestoreQueue })
    } catch (err) {
      error.value = 'Failed to update status'
      console.error('Error updating request status:', err)
    }
  }

  async function removeRequest(roomId: string, requestId: string) {
    if (!currentRoom.value) return

    try {
      const roomRef = doc(getDb(), 'rooms', roomId)
      const requestToRemove = currentRoom.value.queue.find(r => r.id === requestId)

      if (requestToRemove) {
        // Convert to Firestore format for removal (exclude undefined values)
        const firestoreRequest: Record<string, unknown> = {
          id: requestToRemove.id,
          guestName: requestToRemove.guestName,
          songName: requestToRemove.songName,
          status: requestToRemove.status,
          submittedAt: requestToRemove.submittedAt instanceof Date
            ? Timestamp.fromDate(requestToRemove.submittedAt)
            : requestToRemove.submittedAt
        }

        if (requestToRemove.youtubeLink) {
          firestoreRequest.youtubeLink = requestToRemove.youtubeLink
        }

        await updateDoc(roomRef, {
          queue: arrayRemove(firestoreRequest)
        })
      }
    } catch (err) {
      error.value = 'Failed to remove request'
      console.error('Error removing request:', err)
    }
  }

  function addNotification(message: string, type: Notification['type'] = 'info') {
    const notification: Notification = {
      id: `notif_${Date.now()}`,
      message,
      type,
      timestamp: new Date()
    }
    notifications.value.push(notification)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function unsubscribeFromRoom() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    currentRoom.value = null
  }

  function isHost(roomId: string): boolean {
    const savedHostId = localStorage.getItem(`countmein_host_${roomId}`)
    return savedHostId !== null && savedHostId === currentHostId.value
  }

  // Computed: time remaining until room expires
  const expiresIn = computed(() => {
    if (!currentRoom.value?.expiresAt) return null
    const now = new Date()
    const expiresAt = currentRoom.value.expiresAt instanceof Date 
      ? currentRoom.value.expiresAt 
      : new Date(currentRoom.value.expiresAt)
    const diff = expiresAt.getTime() - now.getTime()
    if (diff <= 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  })

  // Extend room TTL by specified hours (default: 24 hours)
  async function extendRoomTTL(roomId: string, hours: number = ROOM_TTL_HOURS): Promise<boolean> {
    if (!currentRoom.value) return false

    try {
      const roomRef = doc(getDb(), 'rooms', roomId)
      const currentExpiry = currentRoom.value.expiresAt instanceof Date 
        ? currentRoom.value.expiresAt 
        : new Date(currentRoom.value.expiresAt)
      
      // Extend from current expiry or now, whichever is later
      const baseTime = Math.max(currentExpiry.getTime(), Date.now())
      const newExpiresAt = new Date(baseTime + hours * 60 * 60 * 1000)

      await updateDoc(roomRef, {
        expiresAt: Timestamp.fromDate(newExpiresAt)
      })

      addNotification(`Room extended by ${hours} hours`, 'success')
      return true
    } catch (err) {
      error.value = 'Failed to extend room'
      console.error('Error extending room TTL:', err)
      return false
    }
  }

  return {
    currentRoom,
    notifications,
    currentHostId,
    isLoading,
    error,
    isConfigured,
    queue,
    pendingRequests,
    nextRequest,
    ongoingRequest,
    completedRequests,
    expiresIn,
    createRoom,
    subscribeToRoom,
    roomExists,
    addSongRequest,
    updateRequestStatus,
    removeRequest,
    addNotification,
    removeNotification,
    unsubscribeFromRoom,
    isHost,
    extendRoomTTL
  }
})
