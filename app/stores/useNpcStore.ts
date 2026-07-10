import { defineStore } from 'pinia'
import { npcProfiles } from '~~/data/npcProfiles'
import { sortScheduleEvents } from '~~/utils/time'
import type { DayPlan, NpcProfile, ScheduleEvent } from '~~/types/npc'

export const useNpcStore = defineStore('npc', {
  state: () => ({
    profiles: npcProfiles as NpcProfile[],
    dayPlans: null as DayPlan[] | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getProfile: state => (npcId: string): NpcProfile | undefined => {
      return state.profiles.find(profile => profile.id === npcId)
    },

    getSchedule: state => (npcId: string): ScheduleEvent[] => {
      const plan = state.dayPlans?.find(item => item.npcId === npcId)
      if (!plan) {
        return []
      }
      return sortScheduleEvents(plan.schedule)
    },
  },

  actions: {
    setDayPlans(plans: DayPlan[]) {
      this.dayPlans = plans
      this.error = null
    },

    async fetchDayPlans(day = 1, options?: { refresh?: boolean }) {
      this.isLoading = true
      this.error = null

      try {
        const plans = await $fetch<DayPlan[]>('/api/generate-day', {
          method: 'POST',
          body: { day },
          query: options?.refresh ? { refresh: '1' } : undefined,
        })
        this.setDayPlans(plans)
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : String(error)
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
