<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';
import Card from './Card.vue';
import { useGamesStore } from '@/stores/games';

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
});

const gridWidth = ref(0);
const navbarHeight = inject('navbarHeight', 0);
const storeGames = useGamesStore();

const updateGridWidth = () => {
  const height = window.innerHeight - navbarHeight.value - 200;
  const cardWidth = Math.floor(((height / props.game.board.rows) - 16) / 1.39);
  gridWidth.value = (cardWidth + 16) * props.game.board.cols;
};

const handleFlip = (rowIndex, colIndex) => {
  storeGames.play(props.game, rowIndex, colIndex);
};

onMounted(() => {
  updateGridWidth();
  window.addEventListener('resize', updateGridWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateGridWidth);
});
</script>

<template>
  <div class="grid gap-4" :style="{
    gridTemplateColumns: `repeat(${game.board.cols}, 1fr)`,
    maxWidth: `${gridWidth}px`
  }">
    <div v-for="(col, colIndex) in game.boardMatrix" :key="colIndex">
      <Card
        v-for="(card, rowIndex) in col"
        :key="rowIndex"
        :card="card"
        :row-index="rowIndex"
        :col-index="colIndex"
        :on-flip="handleFlip"
      />
    </div>
  </div>
</template>