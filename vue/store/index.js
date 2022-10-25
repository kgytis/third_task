import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    menus: [],
    hostname: '',
    lang: 'en',
    fullscreen: false,
    spinning: 0,
    spintip: null,
    passwordNotChanged: true,
    filtersStorage: {},
    interfaces: []
  },
  mutations: {
    setInterfaces (state, payload) {
      state.interfaces = payload
    },
    setFiltersStorage (state, update) {
      state.filtersStorage = update
    },
    setChanged (state, passwordNotChanged) {
      state.passwordNotChanged = passwordNotChanged
    },
    setMenus (state, menus) {
      state.menus = menus
    },
    setLang (state, lang) {
      state.lang = lang
    },
    setHostname (state, hostname) {
      state.hostname = hostname
    },
    toggleFullscreen (state) {
      state.fullscreen = !state.fullscreen
    },
    spin (state, config) {
      if (typeof config === 'boolean') {
        config = {
          show: config
        }
      } else if (typeof config === 'string') {
        config = {
          show: true,
          tip: config
        }
      }

      config = config || { show: true }

      if (typeof config.show === 'undefined') {
        config.show = true
      }

      if (typeof config.tip === 'string') {
        state.spintip = config.tip
      } else {
        state.spintip = null
      }

      if (config.show) {
        state.spinning++
      } else {
        state.spinning--
      }
    }
  },
  actions: {
    setFiltersStorage (context, payload) {
      const { sStorage, filters } = payload
      const filtersState = Object.fromEntries(
        Object.entries(sStorage).filter(([key]) => {
          return key.includes('filter_id_')
        })
      )
      // reseting filter
      for (const key in filtersState) {
        filtersState[key] = 'false'
      }
      for (const key in filtersState) {
        filters.forEach((filter) => {
          if (key === filter) {
            return (filtersState[key] = 'true')
          }
        })
      }
      for (const key in filtersState) {
        if (sessionStorage[key]) {
          sessionStorage[key] = filtersState[key]
        }
      }
      context.commit('setFiltersStorage', filtersState)
    }
  }
})
