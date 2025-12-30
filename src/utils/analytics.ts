/**
 * Analytics & Conversion Tracking
 * 
 * Tracks user actions to measure conversion rates from landing page.
 * Uses Cloudflare Web Analytics beacon for event tracking.
 * 
 * Key Metrics:
 * - Landing page views
 * - CTA clicks (Get Started, Learn More)
 * - Room creations (Host conversion)
 * - Room joins (Guest conversion)
 * - Song submissions (Engagement)
 */

// Event categories for conversion funnel
export type EventCategory = 
  | 'landing'      // Landing page interactions
  | 'conversion'   // Key conversion actions
  | 'engagement'   // User engagement actions
  | 'navigation'   // Navigation events

// Specific trackable events
export type TrackableEvent = 
  // Landing page events
  | 'landing_view'
  | 'landing_cta_get_started'
  | 'landing_cta_learn_more'
  | 'landing_scroll_features'
  | 'landing_scroll_how_it_works'
  | 'landing_scroll_get_started'
  // Conversion events
  | 'room_create_start'
  | 'room_create_success'
  | 'room_join_start'
  | 'room_join_success'
  // Engagement events
  | 'song_submit'
  | 'qr_code_view'
  | 'qr_code_share'
  | 'link_copy'
  // Navigation events
  | 'language_switch'
  | 'theme_toggle'

interface EventData {
  event: TrackableEvent
  category: EventCategory
  label?: string
  value?: number
  timestamp: number
}

// Session storage key for tracking
const SESSION_KEY = 'cmi_analytics_session'
const EVENTS_KEY = 'cmi_analytics_events'

// Get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

// Get stored events for this session
function getStoredEvents(): EventData[] {
  try {
    const stored = sessionStorage.getItem(EVENTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Store event locally (for debugging/analysis)
function storeEvent(event: EventData): void {
  try {
    const events = getStoredEvents()
    events.push(event)
    // Keep only last 100 events per session
    const trimmed = events.slice(-100)
    sessionStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed))
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Track a conversion/engagement event
 */
export function trackEvent(
  event: TrackableEvent,
  category: EventCategory,
  label?: string,
  value?: number
): void {
  const eventData: EventData = {
    event,
    category,
    timestamp: Date.now(),
    ...(label && { label }),
    ...(value !== undefined && { value })
  }

  // Store locally for session analysis
  storeEvent(eventData)

  // Log in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event, { category, label, value })
  }

  // Cloudflare Web Analytics tracks page views automatically
  // Custom events are stored locally for session analysis
  // For advanced tracking, integrate with a custom analytics backend
}

/**
 * Track landing page view
 */
export function trackLandingView(): void {
  trackEvent('landing_view', 'landing')
}

/**
 * Track CTA button clicks on landing page
 */
export function trackLandingCTA(cta: 'get_started' | 'learn_more'): void {
  trackEvent(
    cta === 'get_started' ? 'landing_cta_get_started' : 'landing_cta_learn_more',
    'landing',
    cta
  )
}

/**
 * Track section scroll visibility
 */
export function trackSectionView(section: 'features' | 'how_it_works' | 'get_started'): void {
  const eventMap = {
    features: 'landing_scroll_features',
    how_it_works: 'landing_scroll_how_it_works',
    get_started: 'landing_scroll_get_started'
  } as const
  
  trackEvent(eventMap[section], 'landing', section)
}

/**
 * Track room creation (Host conversion)
 */
export function trackRoomCreate(success: boolean, roomId?: string): void {
  if (success) {
    trackEvent('room_create_success', 'conversion', roomId)
  } else {
    trackEvent('room_create_start', 'conversion')
  }
}

/**
 * Track room join (Guest conversion)
 */
export function trackRoomJoin(success: boolean, roomId?: string): void {
  if (success) {
    trackEvent('room_join_success', 'conversion', roomId)
  } else {
    trackEvent('room_join_start', 'conversion')
  }
}

/**
 * Track song submission (Engagement)
 */
export function trackSongSubmit(roomId: string): void {
  trackEvent('song_submit', 'engagement', roomId)
}

/**
 * Track QR code interactions
 */
export function trackQRCode(action: 'view' | 'share', roomId: string): void {
  trackEvent(
    action === 'view' ? 'qr_code_view' : 'qr_code_share',
    'engagement',
    roomId
  )
}

/**
 * Track link copy
 */
export function trackLinkCopy(roomId: string): void {
  trackEvent('link_copy', 'engagement', roomId)
}

/**
 * Track language switch
 */
export function trackLanguageSwitch(locale: string): void {
  trackEvent('language_switch', 'navigation', locale)
}

/**
 * Track theme toggle
 */
export function trackThemeToggle(theme: 'light' | 'dark'): void {
  trackEvent('theme_toggle', 'navigation', theme)
}

/**
 * Get conversion metrics for current session
 */
export function getSessionMetrics(): {
  sessionId: string
  events: EventData[]
  conversions: {
    roomsCreated: number
    roomsJoined: number
    songsSubmitted: number
  }
  landingEngagement: {
    ctaClicks: number
    sectionsViewed: string[]
  }
} {
  const events = getStoredEvents()
  
  return {
    sessionId: getSessionId(),
    events,
    conversions: {
      roomsCreated: events.filter(e => e.event === 'room_create_success').length,
      roomsJoined: events.filter(e => e.event === 'room_join_success').length,
      songsSubmitted: events.filter(e => e.event === 'song_submit').length
    },
    landingEngagement: {
      ctaClicks: events.filter(e => 
        e.event === 'landing_cta_get_started' || 
        e.event === 'landing_cta_learn_more'
      ).length,
      sectionsViewed: [...new Set(
        events
          .filter(e => e.event.startsWith('landing_scroll_'))
          .map(e => e.label)
          .filter(Boolean)
      )] as string[]
    }
  }
}

