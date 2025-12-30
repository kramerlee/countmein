import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import QueueItem from '../QueueItem.vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import type { SongRequest } from '@/types'

// Create i18n instance for tests
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      queue: {
        pending: 'Pending',
        next: 'Next',
        ongoing: 'Ongoing',
        completed: 'Completed',
        upNext: 'Up Next',
        nowSinging: 'Now Singing',
        start: 'Start',
        startSinging: 'Start Singing',
        complete: 'Complete'
      }
    }
  }
})

const createRequest = (overrides: Partial<SongRequest> = {}): SongRequest => ({
  id: 'req_123',
  guestName: 'John Doe',
  songName: 'Bohemian Rhapsody',
  status: 'pending',
  submittedAt: new Date(),
  ...overrides
})

const mountComponent = (props: { request: SongRequest; position?: number; readonly?: boolean }) => {
  return mount(QueueItem, {
    props,
    global: {
      plugins: [[PrimeVue, {}], i18n],
      components: { Button }
    }
  })
}

describe('QueueItem', () => {
  describe('rendering', () => {
    it('should display song name and guest name', () => {
      const request = createRequest()
      const wrapper = mountComponent({ request })

      expect(wrapper.text()).toContain('Bohemian Rhapsody')
      expect(wrapper.text()).toContain('John Doe')
    })

    it('should display position number for pending requests', () => {
      const request = createRequest({ status: 'pending' })
      const wrapper = mountComponent({ request, position: 3 })

      expect(wrapper.find('.position').text()).toBe('3')
    })

    it('should display status badge with correct label', () => {
      const testCases = [
        { status: 'pending' as const, label: 'Pending' },
        { status: 'next' as const, label: 'Up Next' },
        { status: 'ongoing' as const, label: 'Now Singing' },
        { status: 'completed' as const, label: 'Completed' }
      ]

      testCases.forEach(({ status, label }) => {
        const request = createRequest({ status })
        const wrapper = mountComponent({ request })
        expect(wrapper.find('.status-badge').text()).toBe(label)
      })
    })
  })

  describe('youtube preview', () => {
    it('should display youtube thumbnail when link is provided', () => {
      const request = createRequest({
        youtubeLink: 'https://youtube.com/watch?v=fJ9rUzIMcZQ'
      })
      const wrapper = mountComponent({ request })

      const thumb = wrapper.find('.youtube-thumb')
      expect(thumb.exists()).toBe(true)
      expect(thumb.attributes('src')).toContain('fJ9rUzIMcZQ')
    })

    it('should not display youtube preview when no link', () => {
      const request = createRequest()
      const wrapper = mountComponent({ request })

      expect(wrapper.find('.youtube-preview').exists()).toBe(false)
    })

    it('should open youtube link in new tab on click', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
      const request = createRequest({
        youtubeLink: 'https://youtube.com/watch?v=fJ9rUzIMcZQ'
      })
      const wrapper = mountComponent({ request })

      wrapper.find('.youtube-preview').trigger('click')

      expect(openSpy).toHaveBeenCalledWith(
        'https://youtube.com/watch?v=fJ9rUzIMcZQ',
        '_blank'
      )
    })
  })

  describe('actions', () => {
    it('should emit update-status with next when Next button clicked', async () => {
      const request = createRequest({ status: 'pending' })
      const wrapper = mountComponent({ request })

      const nextButton = wrapper.find('.action-btn.next')
      await nextButton.trigger('click')

      expect(wrapper.emitted('update-status')).toBeTruthy()
      expect(wrapper.emitted('update-status')![0]).toEqual(['next'])
    })

    it('should emit update-status with ongoing when Start button clicked', async () => {
      const request = createRequest({ status: 'pending' })
      const wrapper = mountComponent({ request })

      const startButton = wrapper.find('.action-btn.start')
      await startButton.trigger('click')

      expect(wrapper.emitted('update-status')).toBeTruthy()
      expect(wrapper.emitted('update-status')![0]).toEqual(['ongoing'])
    })

    it('should emit update-status with completed when Complete button clicked', async () => {
      const request = createRequest({ status: 'ongoing' })
      const wrapper = mountComponent({ request })

      const completeButton = wrapper.find('.action-btn.complete')
      await completeButton.trigger('click')

      expect(wrapper.emitted('update-status')).toBeTruthy()
      expect(wrapper.emitted('update-status')![0]).toEqual(['completed'])
    })

    it('should emit remove when delete button clicked', async () => {
      const request = createRequest()
      const wrapper = mountComponent({ request })

      const removeButton = wrapper.find('.action-btn.remove')
      await removeButton.trigger('click')

      expect(wrapper.emitted('remove')).toBeTruthy()
    })

    it('should not show action buttons in readonly mode', () => {
      const request = createRequest()
      const wrapper = mountComponent({ request, readonly: true })

      expect(wrapper.find('.item-actions').exists()).toBe(false)
    })
  })

  describe('status-specific styling', () => {
    it('should apply ongoing status class', () => {
      const request = createRequest({ status: 'ongoing' })
      const wrapper = mountComponent({ request })

      expect(wrapper.find('.queue-item').classes()).toContain('status-ongoing')
    })

    it('should apply next status class', () => {
      const request = createRequest({ status: 'next' })
      const wrapper = mountComponent({ request })

      expect(wrapper.find('.queue-item').classes()).toContain('status-next')
    })
  })
})
