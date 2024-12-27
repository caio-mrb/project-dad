<script setup>
import { ref, onMounted, computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router';
import { filename } from 'pathe/utils';

const glob = import.meta.glob('@/assets/cards-front/fruits/*.jpg', { eager: true });
const fruitImages = Object.fromEntries(
  Object.entries(glob).map(([key, value]) => [filename(key), value.default || value])
)


const route = useRoute();
const boardSize = ref(route.params.size);

const dimensions = computed(() => {
  const [rows, cols] = boardSize.value.split('x').map(Number);
  if (isNaN(rows) || isNaN(cols)) {
    throw new Error('Invalid Format');
  }
  return { rows, cols };
});

const gameBoard = ref([]);
const gridWidth = ref(0);
const navbarHeight = inject('navbarHeight', 0);

const { rows, cols } = dimensions.value;

const flippedCards = ref([]);
const turnCount = ref(0);
const isGameOver = ref(false);
const startTime = ref(null);
const elapsedTime = ref(0);
const timerInterval = ref(null);
let flipBackTimeout = null;


const initializeGameBoard = () => {
  const totalCards = rows * cols;
  const totalPairs = totalCards / 2;
  
  const shuffledKeys = shuffleKeys(Object.keys(fruitImages).slice(0, totalPairs));

  gameBoard.value = Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => ({
      content: null,
      flipped: true,
      matched: false
    }))
  );

  let imageIndex = 0;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const currentImage = fruitImages[shuffledKeys[imageIndex]];
      gameBoard.value[col][row].content = currentImage;
      imageIndex++;
    }
  }
};

const shuffleKeys = (keys) => {
    const pairs = [...keys, ...keys];
  
    return pairs.sort(() => Math.random() - 0.5);
};

const updateGridWidth = () => { 
  const height = window.innerHeight - navbarHeight.value - 200;
  const cardWidth = Math.floor(((height / rows) - 16) / 1.39);
  gridWidth.value = (cardWidth + 16) * cols;
};

const flipCard = (rowIndex, colIndex) => {
  if (isGameOver.value) return;

  const card = gameBoard.value[colIndex][rowIndex];
  if (!card.flipped) return;

  if (flippedCards.value.length === 2) {
    const [card1, card2] = flippedCards.value;
    const card1Data = gameBoard.value[card1.colIndex][card1.rowIndex];
    const card2Data = gameBoard.value[card2.colIndex][card2.rowIndex];

    if (flipBackTimeout) {
      clearTimeout(flipBackTimeout);
      flipBackTimeout = null;

      card1Data.flipped = true;
      card2Data.flipped = true;
      flippedCards.value = [];
    }
  }

  card.flipped = false;
  flippedCards.value.push({ rowIndex, colIndex, content: card.content });

  if (flippedCards.value.length === 2) {
    turnCount.value++;
    checkMatch();
  }
};


const checkMatch = () => {
  const [card1, card2] = flippedCards.value;
  const card1Data = gameBoard.value[card1.colIndex][card1.rowIndex];
  const card2Data = gameBoard.value[card2.colIndex][card2.rowIndex];

  if (card1Data.content === card2Data.content) {
    card1Data.matched = true;
    card2Data.matched = true;
    flippedCards.value = [];
  } else {
    flipBackTimeout = setTimeout(() => {
      card1Data.flipped = true;
      card2Data.flipped = true;
      flippedCards.value = [];
      flipBackTimeout = null;
    }, 1000);
  }

  if (gameBoard.value.every(row => row.every(card => card.matched))) {
    isGameOver.value = true;
    clearInterval(timerInterval.value);
  }
};


const startTimer = () => {
  startTime.value = Date.now();
  timerInterval.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);
};

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60);
  const seconds = elapsedTime.value % 60;

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
});


const resetGame = () => {
  flippedCards.value = [];
  turnCount.value = 0;
  isGameOver.value = false;
  elapsedTime.value = 0;
  initializeGameBoard();
  startTimer();
};

onMounted(() => {
  updateGridWidth();
  window.addEventListener('resize', updateGridWidth);
  resetGame();
});

watch(isGameOver, (newVal) => {
  if (newVal) {
    clearInterval(timerInterval.value);
  }
});

</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="mb-4 flex justify-between">
      <div v-if="!isGameOver" class="flex justify-between w-full">
        <div>
          <strong>Turns: </strong>{{ turnCount }}
        </div>
        <div>
          <strong>Time: </strong>{{ formattedTime }}
        </div>
      </div>
      <div v-if="isGameOver">
        <strong>Game Over! </strong> You've completed the game in {{ formattedTime }} and {{ turnCount }} turns.
      </div>
    </div>

    <div class="grid gap-4" :style="{
      gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
      maxWidth: `${gridWidth}px`
    }">
      <div v-for="(col, colIndex) in gameBoard" :key="colIndex">
        <div v-for="(card, rowIndex) in col" :key="rowIndex" class="perspective-distant"
          @click="flipCard(rowIndex, colIndex)">
          <div class="card rounded-lg mb-4 select-none pointer-events-none" :class="{ flipped: card.flipped }">
            <div>
              <img src="@/assets/cards-back/back1.jpg" :alt="`Card ${rowIndex + 1}x${colIndex + 1}`" class="rounded-md border-2 border-black"/>
            </div>
            <div class="card-front">
              <img :src="`${ card.content }`" :alt="`Card ${rowIndex + 1}x${colIndex + 1}`"  class="rounded-md border-2 border-black"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-front {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}
</style>
