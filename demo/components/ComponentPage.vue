<template>
  <div class="component-page">
    <!-- make sticky header -->
    <div class="component-page__heading">
      <HashLink>{{ title }}</HashLink>
      <p-link to="https://www.prefect.io/">
        Documentation
      </p-link>
    </div>

    <template v-if="description || slots.description">
      <div class="component-page__description">
        <slot name="description">
          {{ description }}
        </slot>
      </div>
    </template>

    <template v-if="validDemosArray.length">
      <div class="component-page__demos">
        <template v-for="demo in validDemosArray" :key="demo.title">
          <div class="component-page__demo">
            <template v-if="demo.title !== 'default'">
              <div class="component-page__hash-link">
                <HashLink :hash="demo.slotKey">
                  {{ demo.title }}
                </HashLink>
              </div>
            </template>

            <template v-if="demo.description">
              <div class="component-page__demo-description">
                {{ demo.description }}
              </div>
            </template>

            <ResizableSection>
              <slot :name="demo.slotKey" />
            </ResizableSection>
          </div>
        </template>
      </div>
    </template>

    <div class="component-page__navigation">
      <template v-if="previousComponent">
        <p-link :to="routeRecordsFlat[previousComponent]" class="component-page__navigation-link">
          <p-icon icon="ArrowLeftIcon" />
          {{ previousComponent }}
        </p-link>
      </template>
      <template v-else>
        <div />
      </template>

      <template v-if="nextComponent">
        <p-link :to="routeRecordsFlat[nextComponent]" class="component-page__navigation-link">
          {{ nextComponent }}
          <p-icon icon="ArrowRightIcon" />
        </p-link>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, useSlots } from 'vue'
  import { useRoute } from 'vue-router'
  import { DemoSection } from '../types/demoSection'
  import HashLink from '@/demo/components/HashLink.vue'
  import ResizableSection from '@/demo/components/ResizableSection.vue'
  import { getRouteRecordIndex, routeRecordsFlat } from '@/demo/router/routeRecordsFlat'
  import { asArray, kebabCase } from '@/utilities'

  const props = defineProps<{
    title: string,
    description?: string,
    demos?: DemoSection | DemoSection[],
  }>()

  const slots = useSlots()
  const route = useRoute()

  const validDemosArray = computed(() => {
    const demos = []

    if (slots.default) {
      demos.push({ title: 'default', slotKey: 'default' })
    }

    if (props.demos) {
      demos.push(...asArray(props.demos))
    }

    return asArray(demos)
      .map(demo => ({
        ...demo,
        slotKey: kebabCase(demo.title),
      }))
      .filter(({ slotKey }) => slotKey in slots)
  })

  const routeIndex = computed(() => getRouteRecordIndex(route))
  const previousComponent = computed(() => routeIndex.value === - 1 ? undefined : Object.keys(routeRecordsFlat)[routeIndex.value - 1])
  const nextComponent = computed(() => routeIndex.value === - 1 ? undefined : Object.keys(routeRecordsFlat)[routeIndex.value + 1])
</script>

<style>
.component-page { @apply
  max-w-full
  flex
  flex-col
  gap-2
}

.component-page__heading { @apply
  flex
  justify-between
  text-sm
}

.component-page__heading .hash-link { @apply
  text-2xl
}

.component-page__description .hash-link,
.component-page__demos .hash-link { @apply
  text-lg
}

.component-page__demo { @apply
  flex
  flex-col
  gap-2
}

.component-page__demo .hash-link { @apply
  text-base
}

.component-page__demos { @apply
  max-w-full
  py-4
  flex
  flex-col
  gap-6
}

.component-page__description,
.component-page__demo-description { @apply
  text-foreground-300
  text-sm
}

.component-page__navigation { @apply
  flex
  justify-between
}

.component-page__navigation-link { @apply
  flex
  gap-1
  items-center
}
</style>