<script setup>
import { ref, onMounted, inject } from 'vue';
import Card from './Card.vue';

const props = defineProps({
  gameBoard: {
    type: Array,
    required: true
  },
  dimensions: {
    type: Object,
    required: true
  },
  onFlipCard: {
    type: Function,
    required: true
  }
});

const gridWidth = ref(0);
const navbarHeight = inject('navbarHeight', 0);

const updateGridWidth = () => { 
  const height = window.innerHeight - navbarHeight.value - 200;
  const cardWidth = Math.floor(((height / props.dimensions.rows) - 16) / 1.39);
  gridWidth.value = (cardWidth + 16) * props.dimensions.cols;
};

onMounted(() => {
  updateGridWidth();
  window.addEventListener('resize', updateGridWidth);
});
</script>

<template>
  <div class="grid gap-4" :style="{
    gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
    maxWidth: `${gridWidth}px`
  }">
    <div v-for="(col, colIndex) in gameBoard" :key="colIndex">
      <Card
        v-for="(card, rowIndex) in col"
        :key="rowIndex"
        :card="card"
        :row-index="rowIndex"
        :col-index="colIndex"
        :on-flip="onFlipCard"
      />
    </div>
  </div>
</template>