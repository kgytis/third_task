<template>
  <a-form v-model="formState">
    <a-form-item label="Activity type">
        <!-- Reikia paduoti is kiekvieno card'o tam tikra identifier, kad butu galima filtruoti -->
      <a-checkbox-group v-model="formState.type">
        <!-- <a-checkbox v-for="(filter, key) in filters" :key="key">{{filter}}</a-checkbox> -->
        <a-checkbox value="1" name="type">Online</a-checkbox>
        <a-checkbox value="2" name="type">Promotion</a-checkbox>
        <a-checkbox value="3" name="type">Offline</a-checkbox>
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
  watch: {
    formState () {
      console.log(this.formState)
    }
  },
  updated () {
    console.log(this.formState.type)
  }
}
</script>
