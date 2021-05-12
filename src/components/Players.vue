<template class="players">
  <div :class="getElementClass" :style="getElementStyle">
    <img v-if="isPony" class="images pony-image" src="../assets/pony.png" alt="pony" />
    <img v-if="isDomokun" class="images domokun-image" src="../assets/domokun.png" alt="domokun" />
    <img v-if="isExit" class="images door-image" src="../assets/door.png" alt="door" />
  </div>
</template>

<script>
  import VueScreenSize from 'vue-screen-size'

  export default {
    name: 'Players',
    props: {
      walls: {
        type: Array,
        required: true
      },
      height: {
        type: Number,
        required: true
      },
      isPony: {
        type: Boolean,
        required: true
      },
      isDomokun: {
        type: Boolean,
        required: true
      },
      isExit: {
        type: Boolean,
        required: true
      },
      isExitPath: {
        type: Boolean,
        required: true
      }
    },
    mixins: [VueScreenSize.VueScreenSizeMixin],
    computed: {
      getElementClass() {
        const elementClass = ["element"];

        for (let wall in this.walls){
          elementClass.push(this.walls[wall]);
        }
        
        if (this.isPony) {
          elementClass.push("pony");
        }

        if(this.isDomokun){
          elementClass.push("domokun");
        }

        if(this.isExitPath){
          elementClass.push("exitPath");
        }

        if(this.isExit){
          elementClass.push("exit");
        }
        return elementClass.join(" ");
      },

      windowHeight() {
        return this.$vssHeight;
      },

      windowWidth() {
        return this.$vssWidth;
      },

      getElementStyle() {
        const h =  70 / this.height;
        const elementStyle = {};
        let increaseBy;

        if (this.windowWidth > 1200) {
          increaseBy = 70;
        }
        
        if (this.windowWidth >= 1024 && this.windowHeight >= 1366) {
          increaseBy = 30;
        }

        if (this.windowWidth >= 768 && this.windowHeight >= 1024) {
          increaseBy = 30;
        } 
        
        if (this.windowWidth <= 768 && this.windowHeight <= 1024) {
          increaseBy = 18;
        }

        elementStyle["height"] = h + increaseBy + "px";
        elementStyle["width"] = h + increaseBy + "px";
        
        return elementStyle;
      }
    }
  }
</script>
