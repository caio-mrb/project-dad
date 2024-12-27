<script setup>
const { card, rowIndex, colIndex, onFlip } = defineProps({
  card: {
    type: Object,
    required: true
  },
  rowIndex: {
    type: Number,
    required: true
  },
  colIndex: {
    type: Number,
    required: true
  },
  onFlip: {
    type: Function,
    required: true
  }
});

const handleClick = () => {
  if (!card.matched && card.flipped) {
    onFlip(rowIndex, colIndex);
  }
};

</script>

<template>
  <div class="cardcontainer perspective-distant" :class="{ matched: card.matched }" @click="handleClick">
    <div class="card rounded-lg mb-4 select-none pointer-events-none" :class="{ flipped: card.flipped }">
      <div>
        <img src="@/assets/cards-back/back1.jpg" :alt="`Card ${rowIndex + 1}x${colIndex + 1}`" 
          class="rounded-md border-2 border-black"/>
      </div>
      <div class="card-front">
        <img :src="card.content" :alt="`Card ${rowIndex + 1}x${colIndex + 1}`"  
          class="rounded-md border-2 border-black"/>
      </div>
    </div>
  </div>
</template>

<style scoped>

.cardcontainer{
  transition: all 0.3s ease;
  transition-delay: 1s;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.cardcontainer.matched {
  transform: scale(0.5);
  opacity: 0;
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