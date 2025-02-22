<template>
  <div class="max-w-full min-h-full app">
    <template v-if="!media.lg">
      <PGlobalSidebar class="app__mobile-menu">
        <template #upper-links>
          <p-icon icon="PrefectLight" class="app__prefect-icon" />
          <span class="text-slate-200">Prefect</span>
        </template>
        <template #bottom-links>
          <PIcon icon="Bars3Icon" class="app__menu-icon" @click="toggle" />
        </template>
      </PGlobalSidebar>
    </template>
    <ContextSidebar v-if="showMenu" class="app__sidebar" />
    <router-view class="w-full mx-auto py-10 px-6 lg:px-8" />
  </div>
</template>

<script lang="ts" setup>
  import { media, PGlobalSidebar, PIcon, useColorTheme } from '@prefecthq/prefect-design'
  import { computed, provide, watchEffect } from 'vue'
  import { RouterView } from 'vue-router'
  import { useWorkspaceApiMock } from './utilities/api'
  import ContextSidebar from '@/demo/components/ContextSidebar.vue'
  import { mobileMenuOpen, toggle } from '@/demo/router/menu'
  import { createWorkspaceRoutes, workspaceRoutesKey } from '@/router'
  import { canKey, createCan, workspacePermissions, workspaceFeatureFlags } from '@/services/can'

  const showMenu = computed(() => media.lg || mobileMenuOpen.value)

  watchEffect(() => document.body.classList.toggle('body-scrolling-disabled', showMenu.value && !media.lg))

  useWorkspaceApiMock()

  const can = createCan([
    ...workspaceFeatureFlags,
    ...workspacePermissions,
  ])
  provide(canKey, can)

  const routes = createWorkspaceRoutes()

  provide(workspaceRoutesKey, routes)

  useColorTheme()
</script>

<style>
.body-scrolling-disabled { @apply
  overflow-hidden
}

.app { @apply
  text-foreground
  bg-background-600
  dark:bg-background-400
}

.app__prefect-icon { @apply
  w-6
  h-6
}

.app__menu-icon { @apply
  text-foreground
  w-6
  h-6
  cursor-pointer
}

.app__router-view { @apply
  relative
  z-0
}

.app__router-view-fade-enter-active,
.app__router-view-fade-leave-active {
  transition: opacity 0.25s ease;
}

.app__router-view-fade-enter-from,
.app__router-view-fade-leave-to {
  opacity: 0;
}

@screen lg {
  .app {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
  }
}
</style>