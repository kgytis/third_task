<template>
  <div class="parentDiv">
    <div v-if="loading" class="loadingDiv">
      <a-spin size="large" />
    </div>
    <div v-else style="background-color: #ffffff; padding: 10px">
      <h1 v-if="filteredInfo.length === 0">
        No data to display. Select filters.
      </h1>
      <a-row :gutter="16" :loading="loading">
        <draggable
          v-model="cardInfo"
          group="settings"
          @start="drag = true"
          @end="drag = false"
        >
          <custom-card
            v-for="(data, i) in filteredInfo"
            :key="i"
            :index="i"
            :data="data"
            :loading="loading"
            class="myContainer"
          ></custom-card>
        </draggable>
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

import draggable from 'vuedraggable'

export default {
  components: {
    ButtonGroup,
    FilterForm,
    CustomCard,
    draggable
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
      configSummary: [],
      updFilters: [],
      filteredArray: []
    }
  },
  computed: {
    // this computed prop holds what fetched data should be displayed -> only with isVisiblie prop = true
    filteredInfo: {
      get() { 
        return this.cardInfo.filter((card) => {
          return card.isVisible === true
        })
      }
    },
    // this comp. prop. holds data from store (it contains newest sessionStorage values)
    configStorage() {
      const sections = this.$uci.sections('summary')
      const visibilityStatus = sections.map((section) => {
        return { name: section.name, isVisible: section.isVisible }
      })
      return visibilityStatus
    }
  },
  methods: {
    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible
    },
    sortingFromConfig() { 
      const sortedConfig = this.configSummary

      function compare(a, b) {
        if (Number(a.place) < Number(b.place)) {
          return -1
        }
        if (Number(a.place) > Number(b.place)) {
          return 1
        }
        return 0
      }
      sortedConfig.sort(compare)
      const interArray = []
      sortedConfig.forEach((item) => {
        // when creating summary config, one wireless somehow duplicates no other values attached to it, thus position returned undefined
        if (item.place === undefined) {
          return
        } else {
          this.cardInfo.find((card) => {
            if (card.id === item.name) {
              interArray.push(card)
            }
          })
        }
      })
      this.cardInfo = interArray
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
    async setFilterStorage(filters) {
      await this.$uci.load('summary')
      const configStorage = this.configStorage
      // looks through configStorage and checks whether any matches to filter
      // if matched = visibility true and vice versa
      configStorage.forEach((v) => {
        if (filters.length !== 0) {
          filters.find((filter) => {
            if (v.name === filter) {
              return (v.isVisible = true)
            } else {
              return (v.isVisible = false)
            }
          })
        } else {
          return (v.isVisible = false)
        }
      })
      this.updFilters = []
      this.updFilters = configStorage
    },
    async setConfig(id, visibility) {
      await this.$uci.load('summary')
      const sectionCheck = await this.$uci.sections('summary', id)
      if (sectionCheck[0] !== undefined) {
      } else {
        this.$uci.add('summary', id)
        const sections = this.$uci.sections('summary', id)
        const sid = sections[0]['.name']
        this.$uci.set('summary', sid, 'name', `${id}`)
        this.$uci.set('summary', sid, 'isVisible', `${visibility}`)
        await this.$uci.save().then(() => {
          this.$uci.apply()
        })
      }
    },
    getVisibility(id, extra) {
      let visibility
      const section = this.$uci.sections('summary', id)
      if (section[0] === undefined) {
        extra ? (visibility = 'true') : (visibility = 'false')
        return visibility
      } else {
        const ssid = section[0]['.name']
        return (visibility = this.$uci.get('summary', ssid, 'isVisible'))
      }
    },
    // =============================================================================
    // SYSTEM INFO LOGIC ============================================================
    async getSystemInfo() {
      await this.$system
        .getInfo()
        .then(async ({ release, localtime, uptime, memory }) => {
          const id = 'system'
          const visibility = this.getVisibility(id)
          this.setConfig(id, visibility)
          this.systemInfo = {
            id: id,
            name: 'System',
            isVisible: visibility === 'true',
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
        interfaces.forEach((intrf) => {
          const newIntrfObj = this.setIntrfObj(intrf)
          if (newIntrfObj.default) {
            this.cardInfo.push(newIntrfObj)
            this.setConfig(newIntrfObj.id, newIntrfObj.isVisible)
            // this.setPlaceInArray(newIntrfObj.id)
          } else {
            // for new interface also by default - true
            this.setConfig(newIntrfObj.id, newIntrfObj.isVisible)
            this.interfaces.push(newIntrfObj)
            // this.setPlaceInArray(newIntrfObj.id)
          }
        })
      })
    },
    setIntrfObj(intrf) {
      const visibility = this.getVisibility(intrf.name, 'extra')
      return {
        id: `${intrf.name}`,
        name: intrf.name,
        default:
          intrf.name === 'lan' || intrf.name === 'wan' || intrf.name === 'wan6',
        isVisible: visibility === 'true',
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
      const visibility = this.getVisibility(id) // cia turetu atsirasti reiksme is config'o
      this.setConfig(id, visibility)
      // need to push only last 5
      await this.$rpc.call('system', 'syslog').then(({ log }) => {
        const allLogs = log.map((v, i) => {
          v.key = i
          return v
        })
        this.cardInfo.push({
          id: id,
          name: 'Recent system events',
          isVisible: visibility === 'true',
          data: this.setLogData(allLogs, 'system')
        })
        // this.setPlaceInArray(id)
      })
    },
    // Method responsible for network log info extraction + handle to display 5 latest
    async getNetworkLogs() {
      const id = 'netlogs'
      const visibility = this.getVisibility(id) // cia turetu atsirasti reiksme is config'o
      this.setConfig(id, visibility)
      const allLogs = await this.$rpc
        .ubus('log', 'read_db', { table: 'NETWORK' })
        .then((response) => {
          return response.log
        })
      this.cardInfo.push({
        id: id,
        name: 'Recent network events',
        isVisible: visibility === 'true',
        data: this.setLogData(allLogs, 'network')
      })
      // this.setPlaceInArray(id)
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
        const name =
          dev.frequency > 2500 ? `${dev.ssid} (5GHZ)` : `${dev.ssid} (2.4GHZ)`
        // Adding 2 times one wireless???
        const visibility = this.getVisibility(dev.ssid) // cia turetu atsirasti reiksme is config'o, jei nera, tuomet false
        this.setConfig(dev.ssid, visibility)
        const namedObject = {
          id: dev.ssid,
          name: name,
          isVisible: visibility === 'true',
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
        // this.setPlaceInArray(namedObject.id)
      })
    }
  },
  // =============================================================================
  // initiate data extraction from router when component is created
  async created() {
    this.loading = true
    await this.$uci.load('summary')
    this.configSummary = this.$uci.sections('summary')
    await this.getSystemInfo()
    await this.getCpuUsage()
    this.cardInfo.unshift(this.systemInfo)
    // this.setPlaceInArray('system')
    // // network related info
    await this.getNetworkInfo()
    // // syslog related info
    await this.getSystemLogs()
    await this.getNetworkLogs()
    await this.getWireless()
    this.interfaces.forEach((nIntrf) => {
      this.cardInfo.push(nIntrf)
    })
    this.setFilterArray()
    // splice'inam
    // console.log(this.configSummary)
    this.sortingFromConfig()
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
    updFilters: {
      async handler() {
        // setting new visablity in UI
        this.cardInfo.forEach((card) => {
          this.updFilters.forEach((filter) => {
            if (card.id === filter.name) {
              card.isVisible = filter.isVisible
            }
          })
        })
        // setting new visability in config
        await this.$uci.load('summary')
        const sections = this.$uci.sections('summary')
        this.updFilters.forEach((filter) => {
          sections.find((section) => {
            if (section.name === filter.name) {
              this.$uci.set(
                'summary',
                section['.name'],
                'isVisible',
                `${filter.isVisible}`
              )
            }
          })
        })
        await this.$uci.save().then(() => {
          this.$uci.apply()
        })
      }
    },
    cardInfo: {
      async handler(newValue, oldValue) {
        const newOrder = newValue.map((val, i) => {
          return `${val.id}-${i}`
        })
        const oldOrder = oldValue.map((val, i) => {
          return `${val.id}-${i}`
        })
        const compared = JSON.stringify(newOrder) === JSON.stringify(oldOrder)

        if (compared) {
          return
        } else {
          console.log('differs')
          newValue.forEach(async (card, i) => {
            // jei cia idedu load, tuomet nebeveikia filtravimas
            // jei nededu, tuomet veikia filtravimas, bet sorte'inimas ne itin
            await this.$uci.load('summary') 
            const section = this.$uci.sections('summary', card.id)
            const sid = section[0]['.name']
            await this.$uci.set('summary', sid, 'place', `${i}`)
            await this.$uci.save().then(() => {
              this.$uci.apply()
            })
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.parentDiv {
  position: relative;
}
.loadingDiv {
  text-align: center;
  height: 90vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

}
.over {
  background: rgba(136, 136, 136, 0.5);
}

</style>
