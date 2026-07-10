import { defineStore } from 'pinia'

export const useSimulationStore = defineStore('simulation', {
  state: () => ({
    focusedNpcId: null as string | null,
    isDetailPanelOpen: false,
  }),

  actions: {
    setFocus(npcId: string) {
      this.focusedNpcId = npcId
    },

    clearFocus() {
      this.focusedNpcId = null
    },

    openDetailPanel() {
      this.isDetailPanelOpen = true
    },

    closeDetailPanel() {
      this.isDetailPanelOpen = false
    },

    resetSession() {
      this.focusedNpcId = null
      this.isDetailPanelOpen = false
    },
  },
})
