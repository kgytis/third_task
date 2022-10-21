<template>
  <a-col :span="6">
    <a-card
      :title="data.name"
      :bordered="true"
      :loading="loading"
      style="min-height: 420px; margin-bottom: 20px"
      :bodyStyle="bodyStyle"
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
    }
  },
  data () {
    return {
      bodyStyle: {
        padding: '10px 24px 0px 24px'
      }
    }
  }
}
</script>
