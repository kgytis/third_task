<template>
  <div>
    <div v-if="content">
      <p>
        {{ content }}
        <span v-if="icon"
          ><b-icon :icon="icon" aria-hidden="true"></b-icon
        ></span>
      </p>
    </div>
    <div v-if="percentageBar || percentageBar === 0">
      <div class="lineContainer">
        <div class="lineIndicator" :style="barWidth(percentageBar)"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    percentageBar: {
      type: Number
    },
    content: {
      type: String
    },
    icon: {
      type: String
    }
  },
  methods: {
    barWidth (percentage) {
      return `width: ${percentage}%`
    }
  },
  created () {
    console.log(this.percentageBar)
  }
}
</script>

<style scoped>
p {
  margin: 0;
}
.lineContainer {
  height: 7px;
  width: 100%;
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
