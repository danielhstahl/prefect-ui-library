<template>
  <p-card class="collection-card">
    <p-content v-if="collectionItem">
      <LogoImage :url="collectionItem.logoUrl" class="collection-card__logo" />

      <p-key-value label="Name" :value="collectionItem.name" />

      <p-key-value label="Slug" :value="collectionItem.slug" />

      <template v-if="collectionItem.description">
        <p-key-value label="Description" :value="collectionItem.description" />
      </template>

      <template v-for="(example, index) in collectionItem.examples" :key="index">
        <p-key-value label="Example" class="collection-card__example">
          <template #value>
            <p-markdown-renderer :text="example" />
          </template>
        </p-key-value>
      </template>

      <div class="collection-card__actions">
        <template v-if="collectionItem.documentationUrl">
          <a :href="collectionItem.documentationUrl" target="_blank">
            <p-button inset>
              <slot>
                View Docs
              </slot>
              <p-icon icon="ArrowTopRightOnSquareIcon" class="collection-card__documentation-icon" />
            </p-button>
          </a>
        </template>
      </div>
    </p-content>
  </p-card>
</template>

<script lang="ts" setup>
  import LogoImage from '@/components/LogoImage.vue'
  import { CollectionItem } from '@/models'

  defineProps<{
    collectionItem: CollectionItem,
  }>()
</script>

<style>
.collection-card__actions { @apply
  flex
  gap-2
  items-center
  justify-end
}

.collection-card__documentation-icon { @apply
  ml-2
  w-5
  h-5
}

.collection-card__example .p-code-highlight { @apply
  dark:bg-slate-900
  bg-slate-300
}
</style>