<template>
  <a-form v-model="formState">
    <a-form-item label="Activity type">
      <!-- Reikia paduoti is kiekvieno card'o tam tikra identifier, kad butu galima filtruoti -->
      <a-checkbox-group v-model="formState.type" :options="checkBoxProps">
        <!-- <a-checkbox v-for="(filter, key) in filters" :key="key" :value="filter.name">{{filter.name}}</a-checkbox> -->
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
          value: this.redesignedID(filter.id),
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
        this.formState.type.push(this.redesignedID(filter.id))
      }
    })
  }
}
</script>
