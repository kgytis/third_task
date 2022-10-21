<template>
  <div class="buttonContainer" :style="buttonPosition">
    <b-button size="md" class="mb-2" variant="primary" @click="toggleDrawer">
      <b-icon :icon="arrow" aria-hidden="true"></b-icon>
    </b-button>
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
  computed: {
    arrow () {
      return this.drawerVisible ? 'chevron-right' : 'chevron-left'
    },
    buttonPosition () {
      return this.drawerVisible
        ? 'right: 257.777px; z-index: 999999'
        : 'right: 31.777px'
    }
  },
  methods: {
    toggleDrawer () {
      this.$emit('drawerOpen')
    }
  }
}
</script>
<style scoped>
.buttonContainer {
  position: fixed;
  bottom: 75%;
  display: flex;
  flex-direction: column;
}
</style>
