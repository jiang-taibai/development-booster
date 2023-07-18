import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

import MainView from "@/views/MainView.vue";
// const MainView = () => import('@/views/MainView.vue');

const routes = [
    {
        path: '/',
        name: 'main',
        component: MainView
    },
]

const router = createRouter({
    history: process.env.IS_ELECTRON ? createWebHashHistory(process.env.BASE_URL) : createWebHistory(process.env.BASE_URL),
    routes
})

export default router
