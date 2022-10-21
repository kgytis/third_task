<template>
  <div class="parentDiv">
    <div style="background-color: #ffffff; padding: 10px">
      <a-row :gutter="16" :loading="loading">
        <custom-card
          v-for="(data, i) in cardInfo"
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
      <filter-form :filters="['placeholder']"></filter-form>
    </a-drawer>
  </div>
</template>

<script>
import ButtonGroup from './components/ButtonGroup.vue'
import FilterForm from './components/FilterForm.vue'
import CustomCard from './components/CustomCard.vue'
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
  data () {
    return {
      type: {
        time: 'time',
        date: 'date',
        number: 'number',
        percentage: 'percentage'
      },
      systemInfo: {},
      cardInfo: [],
      lastCPUTime: null,
      cpuPercentage: 100,
      memPercentage: 100,
      loading: true,
      drawerVisible: false
    }
  },
  methods: {
    toggleDrawer () {
      this.drawerVisible = !this.drawerVisible
    },
    // Method responsible for system card info extraction
    async getSystemInfo () {
      await this.$system
        .getInfo()
        .then(({ release, localtime, uptime, memory }) => {
          this.systemInfo = {
            name: 'System',
            isVisible: true,
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
    async getCpuUsage () {
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
    updateCpuUsage () {
      this.getCpuUsage()
    },
    // Method responsible for system info update (mainly for time)
    update () {
      this.getSystemInfo()
    },
    // Method responsible for network interface card info extraction
    async getNetworkInfo () {
      await this.$network.load().then(() => {
        const interfaces = this.$network.getInterfaces()
        interfaces.forEach((intrf) => {
          const newIntrfObj = {
            name: intrf.name,
            isVisible: true,
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
          this.cardInfo.push(newIntrfObj)
        })
      })
    },
    setLogData (allLogs, logCardType) {
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
    async getSystemLogs () {
      // need to push only last 5
      await this.$rpc.call('system', 'syslog').then(({ log }) => {
        const allLogs = log.map((v, i) => {
          v.key = i
          return v
        })
        // new data structure
        this.cardInfo.push({
          name: 'Recent system events',
          isVisible: true,
          data: this.setLogData(allLogs, 'system')
        })
      })
    },
    // Method responsible for network log info extraction + handle to display 5 latest
    async getNetworkLogs () {
      const allLogs = await this.$rpc
        .ubus('log', 'read_db', { table: 'NETWORK' })
        .then((response) => {
          return response.log
        })
      this.cardInfo.push({
        name: 'Recent network events',
        isVisible: true,
        data: this.setLogData(allLogs, 'network')
      })
    },
    // Method responsible for wireless cards info extraction
    async getWireless () {
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
        const namedObject = {
          name:
            dev.frequency > 2500
              ? `${dev.ssid} (5GHZ)`
              : `${dev.ssid} (2.4GHZ)`,
          isVisible: true,
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
    }
  },
  // initiate data extraction from router when component is created
  async created () {
    this.loading = true
    await this.getSystemInfo()
    await this.getCpuUsage()
    this.cardInfo.unshift(this.systemInfo)
    // // network related info
    await this.getNetworkInfo()
    // // syslog related info
    await this.getSystemLogs()
    await this.getNetworkLogs()
    await this.getWireless()
    console.log(this.cardInfo)
    this.loading = false
  },
  watch: {
    deep: true,
    systemInfo: {
      handler () {
        if (this.cardInfo.length > 0) {
          const indexOfSystem = this.cardInfo.findIndex((obj) => {
            return obj.name === 'System'
          })
          this.cardInfo.splice(indexOfSystem, 1, this.systemInfo)
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
</style>
