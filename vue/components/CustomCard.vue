<template>
  <a-col :span="6" :id="data.name">
    <!-- <li
      draggable="true"
      @drag="setDragging"
      @drop="dragDrop"
      @dragstart="dragStart"
      @dragover.prevent="setDraggedOver"
      class="draggable"
      :id="index"
    > -->
      <a-card
        :title="data.name"
        :bordered="true"
        :loading="loading"
        style="min-height: 420px; margin-bottom: 20px"
        :bodyStyle="bodyStyle"
        :id="data.id"
        :class="{ over: dragProps.over }"
      >
        <template v-if="data.extraHeader" #extra>
          <slot>
            <custom-badge
              :percentageBar="data.extraHeader.percentage"
              :content="data.extraHeader.content"
              :icon="data.extraHeader.icon"
            ></custom-badge>
          </slot>
        </template>
        <div v-for="(content, i) in data.data" :key="i + 1000">
          <card-entry :content="content"></card-entry>
        </div>
      </a-card>
    <!-- </li> -->
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
    // dragStart (e) {
    //   console.log(e.target)
    //   console.log(this.index)
    //   // e.dataTransfer.clearData()
    //   // e.dataTransfer.effectAllowed = 'move'
    //   // e.dataTransfer.setData('text/html', e.target.innerHTML)
    // },
    // dragDrop (e) {
    //   e.stopPropagation()
    //   // console.log(e)
    //   // e.target.innerHTML = e.dataTransfer.getData('text/html')
    //   return false
    // },
    // setDragging (e) {
    //   this.dragging = e.target.innerHTML
    //   console.log(this.dragging)
    // },
    // setDraggedOver (e) {
    //   this.draggedOver = e.target.innerHTML
    //   console.log(this.draggedOver)
    // }
  }
}
</script>

<style scoped>
.draggable {
  cursor: move;
}
/*
.over {
  background-color: rgba(128, 128, 128, 0.5);
} */
li {
  list-style: none;
}
</style>
