import HomeComponent from '@/components/HomeComponent.vue'
import LaravelTester from '@/components/LaravelTester.vue'
import WebSocketTester from '@/components/WebSocketTester.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/auth/Login.vue'
import Signup from '@/components/auth/Signup.vue'
import Profile from '@/components/user/Profile.vue'
import EditProfile from '@/components/user/EditProfile.vue'
import ResetPassword from '@/components/user/ResetPassword.vue'
import Shop from '@/components/shop/Shop.vue'
import shopPayment from '@/components/shop/ShopPayment.vue';
import statistics from '@/components/Statistics.vue';
import MatchHistorySingle from '@/components/MatchHistorySingle.vue'
import MatchHistoryMulti from '@/components/MatchHistoryMulti.vue'
import PersonalScoreboard from '@/components/PersonalScoreboard.vue'
import GlobalScoreboard from '@/components/GlobalScoreboard.vue'
import TransactionHistory from '@/components/TransactionHistory.vue'
import ListOfPlayers from '@/components/admin/ListOfPlayers.vue'
import EditPlayer from '@/components/admin/EditPlayer.vue'
import SinglePlayerGame from '@/components/singlePlayer/SinglePlayerGame.vue'
import SinglePlayerBoardSize from '@/components/singlePlayer/SinglePlayerBoardSize.vue'

import { useAuthStore } from '@/stores/auth'
import MultiPlayerGame from '@/components/multiPlayer/MultiPlayerGame.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeComponent
    },
    {
      path: '/singleplayer',
      name: 'SinglePlayerBoardSize',
      component: SinglePlayerBoardSize
    },
    {
      path: '/singleplayer/:id',
      name: 'SinglePlayerGame',
      component: SinglePlayerGame
    },
    {
      path: '/multiplayer',
      name: 'MultiPlayerGame',
      component: MultiPlayerGame
    },
    {
      path: '/testers',
      children: [
        {
          path: 'laravel',
          component: LaravelTester
        },
        {
          path: 'websocket',
          component: WebSocketTester
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/editProfile',
      name: 'editProfile',
      component: EditProfile,
      meta: { requiresAuth: true }
    },
    {
      path: '/resetPassword',
      name: 'resetPassword',
      component: ResetPassword,
      meta: { requiresAuth: true }
    },
    {
      path: '/shop',
      name: 'shop',
      component: Shop,
      meta: { requiresAuth: true }
    },
    {
      path: '/shop/offer/:id',
      name: 'shopPayment',
      component: shopPayment,
      meta: { requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: statistics,
    },
    {
      path: '/MatchHistorySingle',
      name: 'MatchHistorySingle',
      component: MatchHistorySingle,
      meta: { requiresAuth: true }
    },
    {
      path: '/MatchHistoryMulti',
      name: 'MatchHistoryMulti',
      component: MatchHistoryMulti,
      meta: { requiresAuth: true }
    },
    {
      path: '/PersonalScoreboard',
      name: 'PersonalScoreboard',
      component: PersonalScoreboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/GlobalScoreboard',
      name: 'GlobalScoreboard',
      component: GlobalScoreboard,
    },
    {
      path: '/TransactionHistory',
      name: 'TransactionHistory',
      component: TransactionHistory,
    },
    {
      path: '/ListOfPlayers',
      name : 'ListOfPlayers',
      component: ListOfPlayers,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/EditPlayer/:nickname',
      name : 'EditPlayer',
      component: EditPlayer,
      props: true,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    

  ]
})

let handlingFirstRoute = true

router.beforeEach(async (to, from, next) => {
  const storeAuth = useAuthStore();

  if (handlingFirstRoute) {
    handlingFirstRoute = false;
    await storeAuth.restoreToken();
  }

  const isLoggedIn = !!localStorage.getItem('token');
  var userRole = null

  if(isLoggedIn)
  {
    userRole = storeAuth.userType;
  }

  if (isLoggedIn && to.name === 'login') {
    return next({ name: 'Home' });
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next({ name: 'login' });
  }

  if (to.meta.requiresAdmin && userRole !== 'A') {
    return next({ name: 'Home' });
  }

  next();
});



export default router
