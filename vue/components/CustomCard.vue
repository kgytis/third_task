<template>
  <a-col
    :span="6"
    :id="data.name"
    @drop="handleDrop"
    @dragover.prevent="testing"
    v-if="data.isVisible"
  >
    <a-card
      :title="data.name"
      :bordered="true"
      :loading="loading"
      style="min-height: 420px; margin-bottom: 20px"
      :bodyStyle="bodyStyle"
      :id="data.id"
      :class="{ over: dragProps.over }"
      class="card draggable"
      draggable="true"
      @dragstart="handleDragStart"
    >
      <template v-if="data.extraHeader" #extra>
        <slot>
          <custom-badge
            :extraHeader="data.extraHeader"
          ></custom-badge>
        </slot>
      </template>
      <div v-for="(content, i) in data.data" :key="i + 1000">
        <card-entry :content="content"></card-entry>
      </div>
    </a-card>
  </a-col>
</template>

<script>
import CardEntry from './CardEntry.vue'
import CustomBadge from './CustomBadge.vue'
export default {
  components: {
    CardEntry,
    CustomBadge
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean
    },
    index: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      bodyStyle: {
        padding: '10px 24px 0px 24px'
      },
      dragProps: {
        over: false
      },
      counter: 0,
      dragging: '',
      draggedOver: ''
    }
  },
  methods: {
    handleDragStart (e) {
      this.$emit('draggedItem', { node: e.explicitOriginalTarget, event: e })
    },
    handleDrop (e) {
      this.$emit('droppedItem', { node: e.explicitOriginalTarget, event: e })
    },
    testing (e) {
      this.$emit('draggingOver', { node: e.explicitOriginalTarget, event: e })
    }
  }
}
</script>

<style scoped>
.draggable {
  cursor: move;
}
.isVissible {
  background: red;
}
/*
.over {
  background-color: rgba(128, 128, 128, 0.5);
} */
li {
  list-style: none;
}
</style>
