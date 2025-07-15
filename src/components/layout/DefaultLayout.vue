<template>
    <a-layout has-sider>
        <a-layout-sider :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }">
            <div class="!m-4 h-8 flex justify-center items-center rounded-2xl bg-[rgba(255,255,255,0.2)]">
                <!-- <h3 class="text-white">Task Management</h3> -->
            </div>
            <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
                <a-menu-item key="1">
                    <desktop-outlined />
                    <span class="nav-text">Dashboard</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout :style="{ marginLeft: '200px' }">
            <a-layout-header :style="{ background: '#fff', padding: 0 }" />
            <a-layout-content :style="{ margin: '24px 16px 0', overflow: 'initial' }">
                <slot />
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>
<script setup>
import { DesktopOutlined } from '@ant-design/icons-vue'
import LogoIcon from '../icons/LogoIcon.vue';
import LogoIconWithBgRemover from '../icons/LogoIconWithBgRemover.vue';
</script>