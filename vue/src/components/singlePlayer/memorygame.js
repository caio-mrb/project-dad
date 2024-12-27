import { ref, computed } from 'vue';
import { filename } from 'pathe/utils';

export function useMemoryGame(rows, cols) {
  const glob = import.meta.glob('@/assets/cards-front/fruits/*.jpg', { eager: true });
  const fruitImages = Object.fromEntries(
    Object.entries(glob).map(([key, value]) => [filename(key), value.default || value])
  );

  const gameBoard = ref([]);
  const flippedCards = ref([]);
  const turnCount = ref(0);
  const isGameOver = ref(false);
  const startTime = ref(null);
  const elapsedTime = ref(0);
  const timerInterval = ref(null);
  let flipBackTimeout = null;

  const formattedTime = computed(() => {
    const minutes = Math.floor(elapsedTime.value / 60);
    const seconds = elapsedTime.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const shuffleKeys = (keys) => {
    const pairs = [...keys, ...keys];
    return shuffleArray(pairs);
  };

  const initializeGameBoard = () => {
    // Log dimensions for debugging
    console.log('Initializing board with dimensions:', { rows, cols });
    
    const totalCards = rows * cols;
    const totalPairs = totalCards / 2;
    
    // Get available images and ensure we have enough
    const availableImages = Object.keys(fruitImages);
    console.log('Available images:', availableImages.length);
    
    if (availableImages.length < totalPairs) {
      console.error('Not enough unique images for the game board');
      return;
    }

    const shuffledKeys = shuffleKeys(shuffleArray(availableImages).slice(0, totalPairs));
    console.log('Shuffled keys:', shuffledKeys);

    // Create the game board array
    gameBoard.value = Array.from({ length: cols }, () =>
      Array.from({ length: rows }, () => ({
        content: null,
        flipped: true,
        matched: false
      }))
    );

    // Distribute the images
    let imageIndex = 0;
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        if (imageIndex >= shuffledKeys.length) {
          console.error('Not enough shuffled keys for all positions');
          return;
        }
        const currentImage = fruitImages[shuffledKeys[imageIndex]];
        if (!currentImage) {
          console.error('Image not found for key:', shuffledKeys[imageIndex]);
          return;
        }
        gameBoard.value[col][row].content = currentImage;
        imageIndex++;
      }
    }

    console.log('Game board initialized:', gameBoard.value);
  };

  const startTimer = () => {
    startTime.value = Date.now();
    timerInterval.value = setInterval(() => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
    }, 1000);
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

  const flipCard = (rowIndex, colIndex) => {
    if (isGameOver.value) return;

    const card = gameBoard.value[colIndex][rowIndex];
    if (!card || !card.flipped) return;

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

  const resetGame = () => {
    flippedCards.value = [];
    turnCount.value = 0;
    isGameOver.value = false;
    elapsedTime.value = 0;
    
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
    }
    
    initializeGameBoard();
    startTimer();
  };

  return {
    gameBoard,
    turnCount,
    isGameOver,
    elapsedTime,
    formattedTime,
    flipCard,
    resetGame,
    timerInterval
  };
}