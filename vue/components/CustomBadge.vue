<template>
  <div>
    <div v-if="extraHeader.content">
      <p>
        {{ extraHeader.content }}
        <span v-if="extraHeader.icon">
          <img src="/icons/wifi-on.png"/>
        </span>
      </p>
    </div>
    <div v-if="extraHeader.percentage || extraHeader.percentage === 0">
      <div class="lineContainer">
        <div class="lineIndicator" :style="barWidth(extraHeader.percentage)"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    extraHeader: {
      type: Object
    }
  },
  methods: {
    barWidth (percentage) {
      return `width: ${percentage}%`
    }
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

img {
  width: 1.4rem;
}

</style>
