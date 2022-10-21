<template>
  <div>
    <h3 v-if="content.label.type === 'date'">
      {{ dateConversion(content.label.value) }}
    </h3>
    <h3 v-else-if="content.label.type === 'time'">
      {{ numberToTime(content.label.value) }}
    </h3>
    <h3 v-else>{{ content.label.value }}</h3>
    <div class="separator">
      <p v-if="content.output.type === 'date'">
        {{ dateConversion(content.output.value) }}
      </p>
      <p v-else-if="content.output.type === 'time'">
        {{ numberToTime(content.output.value) }}
      </p>
      <div
        v-else-if="content.output.type === 'percentage'"
        class="lineContainer"
      >
        <div
          class="lineIndicator"
          :style="barWidth(content.output.value)"
        ></div>
      </div>
      <p v-else>{{ content.output.value }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    content: {
      type: Object,
      required: true
    }
  },
  methods: {
    padTo2Digits (num) {
      return num.toString().padStart(2, '0')
    },
    dateConversion (dateNumber) {
      const date = new Date(dateNumber)
      return (
        [
          date.getFullYear(),
          this.padTo2Digits(date.getMonth() + 1),
          this.padTo2Digits(date.getDate())
        ].join('-') +
        ' ' +
        [
          this.padTo2Digits(date.getHours()),
          this.padTo2Digits(date.getMinutes()),
          this.padTo2Digits(date.getSeconds())
        ].join(':')
      )
    },
    numberToTime (time) {
      if (time) {
        const hours = Math.floor(time / 3600)
        const minutes = Math.floor((time - hours * 3600) / 60)
        const seconds = time - minutes * 60 - hours * 3600
        const convertedTime = `${hours}h ${minutes}m ${seconds}s`
        return convertedTime
      }
    },
    barWidth (percentage) {
      return `width: ${percentage}%`
    }
  }
}
</script>

<style scoped>
h3 {
  font-size: 0.9rem;
  margin: 0;
}
.separator {
  border-bottom: 1px solid rgba(128, 128, 128, 0.411);
  margin: 0;
  padding-bottom: 0.67rem;
}
p {
  font-size: 0.8rem;
  padding: 0;
  margin: 0;
}
.lineContainer {
  height: 7px;
  width: 25%;
  border-radius: 20px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  color: red;
}
.lineIndicator {
  background-color: rgb(87, 87, 238);
  border-radius: 20px;
  height: 100%;
}
</style>
