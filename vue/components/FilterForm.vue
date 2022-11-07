<template>
  <a-form v-model="formState">
    <a-form-item label="Activity type">
      <a-checkbox-group v-model="formState.type" :options="checkBoxProps" class="checkboxGroup">
      </a-checkbox-group>
    </a-form-item>
  </a-form>
</template>

<script>
export default {
  props: {
    filters: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      formState: {
        type: []
      }
    }
  },
  computed: {
    checkBoxProps () {
      return this.filters.map((filter) => {
        return {
          value: filter.id,
          label: filter.name,
          checked: true
        }
      })
    }
  },
  methods: {
    redesignedID (id) {
      return `filter_id_${id}`
    }
  },
  updated () {
    this.$emit('filterChanged', this.formState.type)
  },
  created () {
    this.filters.forEach((filter) => {
      if (filter.isVisible) {
        this.formState.type.push(filter.id)
      }
    })
  }
}
</script>

<style scoped>

.checkboxGroup {
  display: flex;
  flex-direction: column;
}

</style>
