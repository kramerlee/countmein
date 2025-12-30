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
import { db } from '@/firebase'
import type { Room, SongRequest, Notification } from '@/types'

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

    const room: Room = {
      id: roomId,
      hostId,
      createdAt: new Date(),
      queue: []
    }

    try {
      isLoading.value = true
      error.value = null

      await setDoc(doc(db, 'rooms', roomId), {
        ...room,
        createdAt: Timestamp.fromDate(room.createdAt)
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
      const roomDoc = await getDoc(doc(db, 'rooms', roomId))
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
        doc(db, 'rooms', roomId),
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
      const roomDoc = await getDoc(doc(db, 'rooms', roomId))
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
      youtubeLink: youtubeLink || undefined,
      status: 'pending',
      submittedAt: new Date()
    }

    try {
      isLoading.value = true
      error.value = null

      const roomRef = doc(db, 'rooms', roomId)

      // Convert Date to Timestamp for Firestore
      const firestoreRequest = {
        ...request,
        submittedAt: Timestamp.fromDate(request.submittedAt)
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

  async function updateRequestStatus(
    roomId: string,
    requestId: string,
    status: SongRequest['status']
  ) {
    if (!currentRoom.value) return

    try {
      const roomRef = doc(db, 'rooms', roomId)
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

      // Convert dates to Timestamps
      const firestoreQueue = updatedQueue.map(r => ({
        ...r,
        submittedAt: r.submittedAt instanceof Date
          ? Timestamp.fromDate(r.submittedAt)
          : r.submittedAt
      }))

      await updateDoc(roomRef, { queue: firestoreQueue })
    } catch (err) {
      error.value = 'Failed to update status'
      console.error('Error updating request status:', err)
    }
  }

  async function removeRequest(roomId: string, requestId: string) {
    if (!currentRoom.value) return

    try {
      const roomRef = doc(db, 'rooms', roomId)
      const requestToRemove = currentRoom.value.queue.find(r => r.id === requestId)

      if (requestToRemove) {
        // Convert to Firestore format for removal
        const firestoreRequest = {
          ...requestToRemove,
          submittedAt: requestToRemove.submittedAt instanceof Date
            ? Timestamp.fromDate(requestToRemove.submittedAt)
            : requestToRemove.submittedAt
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

  return {
    currentRoom,
    notifications,
    currentHostId,
    isLoading,
    error,
    queue,
    pendingRequests,
    nextRequest,
    ongoingRequest,
    completedRequests,
    createRoom,
    subscribeToRoom,
    roomExists,
    addSongRequest,
    updateRequestStatus,
    removeRequest,
    addNotification,
    removeNotification,
    unsubscribeFromRoom,
    isHost
  }
})
