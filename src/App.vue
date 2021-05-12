<template>
  <div id="app">
      <div>
        <header class="m-4">
          <nav>
            <button v-if="this.height === 0 || this.backgroundUrl" class="btn btn-primary" @click="createMaze">Play Now</button>
          </nav>
        </header>
        <div v-bind:style="{ backgroundImage: `url(${backgroundUrl})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: 'center', height: '600px'}">
          <section class="container" v-if="backgroundUrl === ''">
            <template v-for="(row, index) in rows">
              <Wall :key="index" :walls="row" />
            </template>
          </section>
        </div>
      </div>
  </div>
</template>

<script>
import Wall from './components/Wall.vue';

const KEYMPAP = {
  "ArrowUp": "north",
  "ArrowDown": "south",
  "ArrowLeft": "west",
  "ArrowRight": "east",
}

const DIRECTIONS = ["north", "south", "west", "east"];

const API = {
  "root": "https://ponychallenge.trustpilot.com",
  "create": "https://ponychallenge.trustpilot.com/pony-challenge/maze",
  "maze": "https://ponychallenge.trustpilot.com/pony-challenge/maze/"
}

const OPPOSITE = {
  "south": "north",
  "north": "south",
  "east": "west",
  "west": "east",
}

export default {
  name: 'App',
  components: {
    Wall
  },
  data() {
    return {
      mazeId: '',
      width: 0,
      height: 0,
      walls: [],
      pony: 0,
      domokun: 0,
      exit: 0,
      exitPath: [],
      directions: [],
      backgroundUrl: '',
      active: true,
      newWidth: 15,
      newHeight: 15,
      auto: false,
      difficulty: 5
    }
  },

  computed: {
    rows() {
      const rows = [];
      let i;
      let j = 0;
      let id = 0;
    
      for (i = 0; i < this.height; i++) {
        const row = []
        for (j = 0; j < this.width; j++) {
          const element = {};
          
          element["key"] = id;
          element["walls"] = this.walls[id];
          element["isPony"] = id === this.pony ? true : false;
          element["isDomokun"] = id === this.domokun ? true : false;
          element["isExit"] = id === this.exit ? true : false;
          element["isExitPath"] = this.exitPath.includes(id) ? true : false;
          element["height"] = this.height;
          
          if (i === this.height - 1) {
            element["walls"].push("south");
          }
          if (j === this.width - 1) {
            element["walls"].push("east");
          }
  
          row.push(element);
          id++;
        }
        rows.push(row);
      }
      console.log('KKK' + rows);
      return rows;
    }
  },

  beforeMount() {
    document.addEventListener("keyup", this.moveKey);
  },

  methods: {
    createMaze() {
      fetch(API.create, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "maze-width": Number(this.newWidth),
          "maze-height": Number(this.newHeight),
          "maze-player-name": "Fluttershy",
          "difficulty": this.difficulty
        })
      }).then(response => response.json())
        .then(response => {
          this.mazeId = response.maze_id;
          this.backgroundUrl = '';
          this.active = true;
          this.auto = false;
          this.refreshMaze();
        }).catch(err => console.log(err));
    },
  
    refreshMaze() {
      if (this.mazeId === '') {
        return;
      }
  
      fetch(API.maze + this.mazeId)
        .then(response => response.json())
        .then(response => {
          this.walls = response.data;
          this.width = response.size[0];
          this.height = response.size[1];
          this.pony = response.pony[0];
          this.domokun = response.domokun[0];
          this.exit = response["end-point"][0];
          this.calculatePath();
        });
    },
  
    calculatePath() {
      this.exploreMaze(this.pony, undefined, [this.pony], this.exit, []);
    },
  
    exploreMaze(start, move, path, exit, directions) {
      const availableDirections = this.getAvailableDirections(start);
  
      if (start === exit) {
        if (this.auto && this.active) {
          this.exitPath = path; 
          this.directions = directions; 
        }
        else {
          this.exitPath = path; 
          this.directions = directions;
        }
      }
  
      for (let i in availableDirections) {
        if (move === undefined || availableDirections[i] !== OPPOSITE[move]) {
          const newPosition = this.getNextPosition(start, availableDirections[i]);
          
          if (!path.includes(newPosition)) {
            const newPath = [...path]
            const newDirections = [...directions]
            
            newPath.push(newPosition);
            newDirections.push(availableDirections[i]);
            this.exploreMaze(newPosition, availableDirections[i], newPath, exit, newDirections);
          }
        }
      }
    },
  
    movePony(direction = '') {
      if (!this.active) {
        return;
      }
  
      if (direction === '') {
        direction = this.directions[0];
  
        if (this.isDomokunAhead()) {
          const available = this.getAvailableDirections(this.pony);
          
          direction = DIRECTIONS.filter(d => !available.includes(d))[0];
        }
      }
      
      fetch(API.maze + this.mazeId, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "direction": direction
        })
      }).then(response => response.json())
        .then(response => {
          if (response.state !== "active") {
            this.backgroundUrl = API.root + response["hidden-url"];
            this.active = false;
            this.auto = false;
            this.refreshMaze();
          }
          
          else {
            this.refreshMaze();
          }
        })
    },
  
    moveKey(event) {
      if (event.key in KEYMPAP) {
        this.auto = false; 
        this.movePony(KEYMPAP[event.key]);
      }
    },
  
    getAvailableDirections(pony) {
      let directions = new Set(DIRECTIONS);
      const coords = this.indexToCoordinates(pony);
  
      if (coords[0] === 0) {
        directions.delete("north");
      }
  
      if (coords[1] === 0) {
        directions.delete("west");
      }
  
      for (let i in this.walls[pony]) {
        directions.delete(this.walls[pony][i])
      }
      
      if (this.isSouthWall(coords)) {
        directions.delete("south");
      }
  
      if (this.isEastWall(coords)) {
        directions.delete("east");
      }
  
      return Array.from(directions);
    },
  
    isSouthWall(coords) {    
      if (coords[0] === this.height - 1) {
        return true;
      }
      const index = this.coordinatesToIndex([coords[0] + 1, coords[1]]);
      
      if (this.walls[index].includes("north")) {
        return true;
      }
      
      return false;
    },
  
    isEastWall(coords) {    
      if (coords[1] === this.width - 1) {
        return true;
      }
      const index = this.coordinatesToIndex([coords[0], coords[1] + 1]);
      if (this.walls[index].includes("west")) {
        return true;
      }
      return false;
    },
  
    indexToCoordinates(index) {
      const width = this.width;
      
      return ([Math.floor(index / width), index % width]);
    },
  
    coordinatesToIndex(coord) {    
      return coord[0] * this.width + coord[1];
    },
  
    isDomokunAhead() {
      const distance = this.exitPath.indexOf(this.domokun);
      
      if (distance > -1 && distance < 3) {
        return true;
      }
  
      const coord = this.indexToCoordinates(this.exitPath[1]);
      const indexes = [];
      
      indexes.push(this.coordinatesToIndex([coord[0] - 1, coord[1]]))
      indexes.push(this.coordinatesToIndex([coord[0] + 1, coord[1]]))
      indexes.push(this.coordinatesToIndex([coord[0], coord[1] - 1]))
      indexes.push(this.coordinatesToIndex([coord[0], coord[1] + 1]))
      
      return indexes.includes(this.domokun);
    },
  
    getNextPosition(index, move) {
      const coord = this.indexToCoordinates(index);
  
      switch (move) {
        case "north":
          return this.coordinatesToIndex([coord[0] - 1, coord[1]])
        case "south":
          return this.coordinatesToIndex([coord[0] + 1, coord[1]])
        case "east":
          return this.coordinatesToIndex([coord[0], coord[1] + 1])
        case "west":
          return this.coordinatesToIndex([coord[0], coord[1] - 1])
  
        default:
          return coord;
      }
    }
  }
  
}
</script>

<style>
  header {
    text-align: center;
  }

  @media (min-width:320px)  { 
    /* smartphones, portrait iPhone, portrait 480x320 phones (Android) */ 
    .container {
      width: 373px !important;
      padding: 25px !important;
    } 
  }
  @media (min-width:480px)  { 
    .container {
      width: 373px !important;
      padding: 25px !important;
    } 
  }
  @media (min-width:600px)  { 
    .container {
      width: 373px !important;
      padding: 25px !important;
    }  
  }
  @media (min-width:801px)  { 
    .container {
      width: 373px !important;
      padding: 25px !important;
    } 
  }
  @media (min-width:1025px) { 
    .container {
      width: 373px !important;
      padding: 25px !important;
    }  
  }
  @media (min-width:1281px) { 
    .container {
      width: 750px !important;
      padding: 25px !important;
    } 
  }


  .container {
    width: 100% !important;
    padding: 25px !important;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .element {
    text-align: center;
    font-size: 1rem;
    font-weight: bold;
    color: grey;
  }

  .north {
    border-top: 2px solid  #1f1881;
  }
  .east {
    border-right:2px solid  #1f1881;
  }
  .south {
    border-bottom:2px solid #1f1881;
  }
  .west {
    border-left: 2px solid #1f1881;
  }

  key-img {
    justify-content: bottom;
    align-items: baseline;
  }

  .images {
    max-width: 100%;
    max-height: 100%;
    -webkit-backface-visibility: visible;
    backface-visibility: visible;
  }
  .pony-image {
    animation : run 0.5s ease-in-out infinite;
  }
  .domokun-image {
    animation : run 1s ease-in infinite;
  }
  .door-image {
    animation: grow 1s ease-in-out infinite;
  }
  .row {
    flex-wrap: nowrap !important;
  }

  @keyframes run {
    0%   { transform: translate(0,0); }
    50% { transform: translate(0, -3px); 
          }
    100% {transform: translate(0.0);}
  }

  @keyframes grow {
    0%   { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

</style>
