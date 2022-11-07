<template>
  <div
    class="buttonContainer"
    :class="{ buttonContainerAnimationOpen: buttonPosition, buttonContainerAnimationClose: !buttonPosition }"
  >
    <a-button type="primary" @click="toggleDrawer">
      <img src="/icons/back-arrow.webp" :style="arrow" />
    </a-button>
  </div>
</template>

<script>
export default {
  props: {
    drawerVisible: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      counter: 0
    }
  },
  computed: {
    arrow () {
      return this.drawerVisible
        ? 'transform: rotate(180deg)'
        : 'transform: rotate(360deg)'
    },
    buttonPosition () {
      return this.drawerVisible
    }
  },
  methods: {
    toggleDrawer () {
      this.$emit('drawerOpen')
    }
  }
  // updated () {
  //   this.drawerVisible ? this.counter-- : this.counter++
  // }
}
</script>
<style scoped>
.buttonContainer {
  position: fixed;
  bottom: 75%;
  display: flex;
  flex-direction: column;
  right: 31.777px;
}

.buttonContainerAnimationOpen {
  animation-name: openDrawer;
  animation-duration: 0.3s;
  animation-fill-mode: forwards;
  transition-timing-function: cubic-bezier(0.7, 0.3, 0.1, 1), ease, ease;
}

.buttonContainerAnimationClose {
  animation-name: closeDrawer;
  animation-duration: 0.3s;
  animation-fill-mode: forwards;
  transition-timing-function: cubic-bezier(0.7, 0.3, 0.1, 1), ease, ease;
}

img {
  width: 1.4rem;
}

@keyframes openDrawer {
  0% {
    right: 31.777px;
  }
  100% {
    right: 257.777px;
    z-index: 999999;
  }
}

@keyframes closeDrawer {
  0% {
    right: 257.777px;
    z-index: 999999;
  }
  100% {
    right: 31.777px;
  }
}
</style>
