<template>
  <p-tags-input
    v-model="internalValue"
    :placeholder="localization.info.addTagPlaceholder"
    :options="tags"
    :empty-message="localization.info.all"
  />
</template>

<script lang="ts" setup>
  import { computed, toRefs } from 'vue'
  import { useVariables } from '@/compositions'
  import { localization } from '@/localization'
  import { VariablesFilter } from '@/models/Filters'
  import { unique } from '@/utilities'

  const props = defineProps<{
    selected: string[] | null | undefined,
    filter?: VariablesFilter,
  }>()

  const emits = defineEmits<{
    (event: 'update:selected', value: string[] | null): void,
  }>()

  const { filter = {} } = toRefs(props)

  const internalValue = computed({
    get() {
      return props.selected ?? null
    },
    set(value) {
      emits('update:selected', value)
    },
  })

  const { variables } = useVariables(filter)
  const tags = computed(() => unique(variables.value?.flatMap(variable => variable.tags) ?? []))
</script>