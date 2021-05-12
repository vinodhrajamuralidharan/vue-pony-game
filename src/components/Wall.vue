<template>
  <div class="row wall">
    <div v-for="wall in walls" :key="wall.key">
      <Players :key="wall.key" :walls="wall.walls" :height="wall.height" :isPony="wall.isPony" :isDomokun="wall.isDomokun" :isExit="wall.isExit" :isExitPath="wall.isExitPath" />
    </div>
  </div>
</template>

<script>
  import Players from './Players';

  export default {
    name: 'Wall',
    components: {
      Players
    },
    props: {
      walls: {
        type: Array,
        required: true
      }
    }
  }
</script>
