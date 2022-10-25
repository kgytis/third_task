<template>
  <div class="parentDiv">
    <div style="background-color: #ffffff; padding: 10px">
      <h1 v-if="filteredInfo.length === 0">
        No data to display. Select filters.
      </h1>
      <a-row :gutter="16" :loading="loading">
        <custom-card
          v-for="(data, i) in filteredInfo"
          :key="i"
          :data="data"
          :loading="loading"
        ></custom-card>
      </a-row>
      <button-group
        @drawerOpen="toggleDrawer"
        :drawerVisible="drawerVisible"
      ></button-group>
    </div>
    <a-drawer
      title="Basic Drawer"
      placement="right"
      :closable="false"
      :visible="drawerVisible"
    >
      <filter-form
        :filters="filtersArray"
        @filterChanged="setFilterStorage"
      ></filter-form>
    </a-drawer>
  </div>
</template>

<script>
import ButtonGroup from './components/ButtonGroup.vue'
import FilterForm from './components/FilterForm.vue'
import CustomCard from './components/CustomCard.vue'
// import SummaryConfig from './summaryConfig.js'
import { addToConfig } from './summaryConfig.js'

export default {
  components: {
    ButtonGroup,
    FilterForm,
    CustomCard
  },
  timers: {
    update: { time: 2000, autostart: true, immediate: true, repeat: true },
    updateCpuUsage: {
      time: 1000,
      autostart: true,
      immediate: true,
      repeat: true
    }
  },
  data() {
    return {
      // data responsible for card creation (what type of data is passed to each card component)
      type: {
        time: 'time',
        date: 'date',
        number: 'number',
        percentage: 'percentage'
      },
      // data displayed in cards
      systemInfo: {},
      cardInfo: [],
      // data for default values of system
      lastCPUTime: null,
      cpuPercentage: 100,
      memPercentage: 100,
      // state handlers (loading for data fetch and visibility for drawer)
      loading: true,
      drawerVisible: false,
      // drawer filler array
      filtersArray: [],
      // workaround to display last added network intrf to an end (for further details refer to respective method)
      interfaces: [],
      testing: {}
      // default values for filters when information is loaded
      // defaultStorage: {
      //   filter_id_lan: SummaryConfig.lan.isVisible,
      //   filter_id_wan: SummaryConfig.wan.isVisible,
      //   filter_id_wan6: SummaryConfig.wan6.isVisible,
      //   filter_id_syslogs: SummaryConfig.syslogs.isVisible,
      //   filter_id_netlogs: SummaryConfig.netlogs.isVisible
      // }
    }
  },
  computed: {
    // this computed prop holds what fetched data should be displayed -> only with isVisiblie prop = true
    filteredInfo() {
      return this.cardInfo.filter((card) => {
        return card.isVisible === true
      })
    },
    // this comp. prop. holds data from store (it contains newest sessionStorage values)
    storage() {
      return this.$store.state.filtersStorage
    },
    configuration() {}
  },
  methods: {
    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible
    },
    // FILTERING LOGIC ===============================================================
    // this method responsible for setting options in drawer, not filtering itself
    setFilterArray() {
      if (this.cardInfo.length > 0) {
        this.filtersArray = this.cardInfo.map((card) => {
          return { name: card.name, isVisible: card.isVisible, id: card.id }
        })
      }
    },
    // this method dispatches action to fill storage array with isVisible values
    setFilterStorage(filters) {
      this.$store.dispatch('setFiltersStorage', {
        filters: filters,
        sStorage: { ...sessionStorage }
      })
    },
    // =============================================================================
    // SYSTEM INFO LOGIC ============================================================
    async getSystemInfo() {
      await this.$system
        .getInfo()
        .then(({ release, localtime, uptime, memory }) => {
          const id = 'sys'
          const toConfig = {
            id: `filter_id_${id}`,
            name: 'system',
            isVisible: false
          } 
          new addToConfig(toConfig)
          this.testRun()
          if (sessionStorage[`filter_id_${id}`] === undefined) {
            sessionStorage.setItem(`filter_id_${id}`, false)
          }
          this.systemInfo = {
            id: id,
            name: 'System',
            isVisible: this.storage[`filter_id_${id}`] === 'true',
            extraHeader: {
              content: `CPU Load (${this.cpuPercentage}%)`,
              percentage: this.cpuPercentage
            },
            data: [
              {
                label: { value: 'Router uptime' },
                output: { value: uptime, type: this.type.time }
              },
              {
                label: { value: 'Local devices time' },
                output: { value: localtime * 1000, type: this.type.date }
              },
              {
                label: { value: `Memmory usage (${this.memPercentage}%)` },
                output: {
                  value: this.memPercentage,
                  type: this.type.percentage
                }
              },
              {
                label: { value: 'Firmware version' },
                output: { value: release.revision }
              }
            ]
          }
          this.memPercentage = Math.floor(
            ((memory.total - memory.free) / memory.total) * 100
          )
        })
    },
    async update() {
      await this.$system
        .getInfo()
        .then(({ release, localtime, uptime, memory }) => {
          this.systemInfo = {
            ...this.systemInfo,
            extraHeader: {
              content: `CPU Load (${this.cpuPercentage}%)`,
              percentage: this.cpuPercentage
            },
            data: [
              {
                label: { value: 'Router uptime' },
                output: { value: uptime, type: this.type.time }
              },
              {
                label: { value: 'Local devices time' },
                output: { value: localtime * 1000, type: this.type.date }
              },
              {
                label: { value: `Memmory usage (${this.memPercentage}%)` },
                output: {
                  value: this.memPercentage,
                  type: this.type.percentage
                }
              },
              {
                label: { value: 'Firmware version' },
                output: { value: release.revision }
              }
            ]
          }
          this.memPercentage = Math.floor(
            ((memory.total - memory.free) / memory.total) * 100
          )
        })
    },
    // Method responsible for CPU usage info extraction
    async getCpuUsage() {
      await this.$rpc.call('system', 'cpu_time').then((times) => {
        if (!this.lastCPUTime) {
          this.cpuPercentage = 0
          this.lastCPUTime = times
          return
        }
        const idle1 = this.lastCPUTime[3]
        const idle2 = times[3]

        let total1 = 0
        let total2 = 0

        this.lastCPUTime.forEach((t) => {
          total1 += t
        })

        times.forEach((t) => {
          total2 += t
        })

        this.cpuPercentage = Math.floor(
          ((total2 - total1 - (idle2 - idle1)) / (total2 - total1)) * 100
        )
        this.lastCPUTime = times
      })
    },
    // Method responsible for CPU usage info update
    updateCpuUsage() {
      this.getCpuUsage()
    },
    // =============================================================================
    // INTERFACE LOGIC =============================================================
    async getNetworkInfo() {
      await this.$network.load().then(() => {
        const interfaces = this.$network.getInterfaces()
        // this.$store.commit('setInterfaces', this.$network.getInterfaces())
        interfaces.forEach((intrf) => {
          const newIntrfObj = this.setIntrfObj(intrf)
          new addToConfig({
            id: `filter_id_${newIntrfObj.id}`,
            name: newIntrfObj.name,
            isVisible: newIntrfObj.isVisible
          })
          this.testRun()
          if (newIntrfObj.default) {
            this.cardInfo.push(newIntrfObj)
          } else {
            this.interfaces.push(newIntrfObj)
          }
        })
      })
    },
    setIntrfObj(intrf) {
      if (sessionStorage[`filter_id_${intrf.name}`] === undefined) {
        sessionStorage.setItem(`filter_id_${intrf.name}`, true)
      }
      return {
        id: `${intrf.name}`,
        name: intrf.name,
        default:
          intrf.name === 'lan' || intrf.name === 'wan' || intrf.name === 'wan6'
            ? true
            : false,
        // when creating, better access sessionStorage directly
        // if accessing through storage prop -> at that time there is no commit to store, thus not updated value will be displayed
        isVisible: sessionStorage[`filter_id_${intrf.name}`] === 'true',
        data: [
          {
            label: { value: 'Type' },
            output: {
              value: intrf.status.up
                ? `Wired (${intrf.status.device})`
                : `Unwired (${intrf.status.device})`
            }
          },
          {
            label: { value: 'IP Address' },
            output: {
              value:
                ['ipv4-address'] in intrf.status
                  ? intrf.status['ipv4-address'][0].address
                  : 'IP has not been setted yet'
            }
          }
        ]
      }
    },
    // =============================================================================
    // LOGS LOGIC =============================================================
    // Method responsible for network interface card info extraction
    setLogData(allLogs, logCardType) {
      const lastLogs = allLogs.slice(Math.max(allLogs.length - 5, 1))
      let finalLogs = []
      if (logCardType === 'system') {
        finalLogs = lastLogs.map((log) => {
          return {
            label: {
              value: new Date(log.datetime).getTime(),
              type: this.type.date
            },
            output: { value: log.msg }
          }
        })
      } else if (logCardType === 'network') {
        finalLogs = lastLogs.map((log) => {
          return {
            label: { value: log.time * 1000, type: this.type.date },
            output: { value: log.text }
          }
        })
      }
      return finalLogs
    },
    // Method responsible for system log info extraction + handle to display 5 latest
    async getSystemLogs() {
      const id = 'syslogs'
      if (sessionStorage[`filter_id_${id}`] === undefined) {
        sessionStorage.setItem(`filter_id_${id}`, true)
      }
      // need to push only last 5
      await this.$rpc.call('system', 'syslog').then(({ log }) => {
        const allLogs = log.map((v, i) => {
          v.key = i
          return v
        })
        this.cardInfo.push({
          id: id,
          name: 'Recent system events',
          isVisible: this.storage[`filter_id_${id}`] === 'true',
          data: this.setLogData(allLogs, 'system')
        })
      })
    },
    // Method responsible for network log info extraction + handle to display 5 latest
    async getNetworkLogs() {
      const id = 'netlogs'
      if (sessionStorage[`filter_id_${id}`] === undefined) {
        sessionStorage.setItem(`filter_id_${id}`, true)
      }
      const allLogs = await this.$rpc
        .ubus('log', 'read_db', { table: 'NETWORK' })
        .then((response) => {
          return response.log
        })
      this.cardInfo.push({
        id: id,
        name: 'Recent network events',
        isVisible: this.storage[`filter_id_${id}`] === 'true',
        data: this.setLogData(allLogs, 'network')
      })
    },
    // =============================================================================
    // WIRELESS LOGIC ==============================================================
    // Method responsible for wireless cards info extraction
    async getWireless() {
      const devices = await this.$wireless.getDevices().then((res) => {
        return res
      })
      const promises = []
      devices.forEach((dev) => {
        promises.push(this.$rpc.ubus('iwinfo', 'info', { device: dev }))
      })
      let wirelessDev = []
      wirelessDev = await Promise.all(promises).then((res) => {
        return res
      })
      wirelessDev.forEach((dev) => {
        if (sessionStorage[`filter_id_${dev.ssid}`] === undefined) {
          sessionStorage.setItem(`filter_id_${dev.ssid}`, false)
        }
        const name =
          dev.frequency > 2500 ? `${dev.ssid} (5GHZ)` : `${dev.ssid} (2.4GHZ)`
        new addToConfig({
          id: `filter_id_${dev.ssid}`,
          name: dev.ssid,
          isVisible: this.storage[`filter_id_${dev.ssid}`] === 'true'
        })
        const namedObject = {
          id: dev.ssid,
          name: name,
          isVisible: this.storage[`filter_id_${dev.ssid}`] === 'true',
          extraHeader: {
            // hard coded content. Neradau property, kuris pasakytu, ar ijungtas ar ne
            content: 'ON',
            icon: 'wifi'
          },
          data: [
            {
              label: { value: 'SSID' },
              output: { value: dev.ssid }
            },
            {
              label: { value: 'Mode' },
              output: { value: dev.mode }
            },
            {
              label: { value: 'Channel' },
              output: { value: dev.channel }
            },
            {
              label: { value: 'Clients' },
              output: { value: '0 (hard coded)' }
            }
          ]
        }
        this.cardInfo.push(namedObject)
      })
    },
    testRun () {
      const config = require('./summaryConfig.js')
      this.testing = config.default
    }
  },
  // =============================================================================
  // initiate data extraction from router when component is created
  async created() {
    this.loading = true
    this.$store.commit('setFiltersStorage', { ...sessionStorage })
    await this.getSystemInfo()
    await this.getCpuUsage()
    this.cardInfo.unshift(this.systemInfo)
    // // network related info
    await this.getNetworkInfo()
    this.testRun()
    // // syslog related info
    await this.getSystemLogs()
    await this.getNetworkLogs()
    await this.getWireless()
    this.interfaces.forEach((nIntrf) => {
      this.cardInfo.push(nIntrf)
    })
    this.$store.commit('setFiltersStorage', { ...sessionStorage })
    this.setFilterArray()
    this.loading = false
  },
  watch: {
    deep: true,
    systemInfo: {
      handler() {
        if (this.cardInfo.length > 0) {
          const indexOfSystem = this.cardInfo.findIndex((obj) => {
            return obj.name === 'System'
          })
          this.cardInfo.splice(indexOfSystem, 1, this.systemInfo)
        }
      }
    },
    storage: {
      handler() {
        const obj = this.storage
        let mutatedObject = {}
        for (const key in obj) {
          if (key.includes('filter_id_')) {
            const mutatedKey = key.substring(10)
            mutatedObject = { ...mutatedObject, [mutatedKey]: obj[key] }
          }
        }
        this.cardInfo.forEach((card) => {
          for (const key in mutatedObject) {
            if (card.id === key) {
              card.isVisible = mutatedObject[key] === 'true'
            }
          }
        })
      }
    },
    testing: {
      handler() {
        alert('worked')
        console.log(this.testing)
      }
    }
  }
}
</script>

<style scoped>
.parentDiv {
  position: relative;
}
</style>
