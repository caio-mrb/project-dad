<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Board from './Board.vue';
import { useGamesStore } from '@/stores/games';
import axios from 'axios';
import { useDateUtils } from '@/stores/date';
import { useLobbyStore } from '@/stores/lobby';

const props = defineProps({
    game: {
        type: Object,
        required: true
    }
});

const storeGames = useGamesStore();
const storeAuth = useAuthStore();
const storeLobby = useLobbyStore();
const router = useRouter();
const { formatDateToISO } = useDateUtils();

const handleQuit = () => {
    storeGames.quit(props.game)
    storeLobby.leaveLobby(props.game.lobbyId)
}

const currentPlayer = computed(() => storeGames.getCurrentPlayer(props.game));

const hasTransaction = computed(() => {
    const transactionKey = `game_transaction_${props.game.id}`;
    return localStorage.getItem(transactionKey) === 'true';
});

onMounted(async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push({ name: 'login' });
            return;
        }

        // Check if transaction already exists for this game
        const transactionKey = `game_transaction_${props.game.id}`;
        if (hasTransaction.value) {
            return;
        }

        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        await axios.post('transactions', {
            transaction_datetime: formatDateToISO(new Date()),
            user_id: storeAuth.userId,
            game_id: props.game.id,
            type: 'I',
            brain_coins: -5
        });

        // Mark transaction as completed for this game
        localStorage.setItem(transactionKey, 'true');
        storeAuth.removeBrainCoins(5);
    } catch (err) {
        console.error('Transaction failed:', err);
        router.push({ name: 'Home' });
    }
});
</script>

<template>
    <div class="relative w-full max-w-7xl mx-auto px-4">
        <div class="flex flex-col items-center">
            <!-- Stats bar -->
            <div class="w-full max-w-2xl mb-8">
                <div class="flex justify-between items-center text-md">
                    <div class="p-4 bg-white rounded-lg shadow-md">
                        <strong class="mr-2">Turns:</strong>
                        <span class="font-bold">{{ game.turnCount }}</span>
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow-md">
                        It's
                        <span v-if="currentPlayer.id != storeAuth.user.id">{{
                            storeAuth.getFirstLastName(currentPlayer.name) }}</span>
                        <span v-else>your</span>
                        turn!
                    </div>
                    <div class="p-4 bg-white rounded-lg shadow-md">
                        <strong class="mr-2">Pairs found:</strong>
                        <span class="font-bold">{{ game.scores[game.players.findIndex(player => player.user.id ===
                            storeAuth.user.id) + 1] }}</span>
                    </div>
                </div>
            </div>
            <Board v-if="game.boardMatrix" :game="game" />
            <div>
                <button class="bg-purple-700 text-white px-6 py-2 rounded-full hover:bg-purple-800"
                    @click="handleQuit()">
                    Quit
                </button>
            </div>
        </div>
    </div>
</template>