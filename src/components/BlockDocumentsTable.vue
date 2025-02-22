<template>
  <div class="block-documents-table">
    <div class="block-documents-table__filters">
      <ResultsCount label="Block" :count="filtered.length" class="block-documents-table__results" />
      <SearchInput v-model="searchTerm" placeholder="Search blocks" label="Search blocks" class="block-documents-table__search" />
      <BlockSchemaCapabilitySelect v-model:selected="selectedCapability" class="block-documents-table__capability" />
      <BlockTypeSelect v-model:selected="selectedType" class="block-documents-table__type" />
    </div>
    <p-table :data="sortedBlocks" :columns="columns">
      <template #name="{ row }: { row: BlockDocument }">
        <div class="block-documents-table__name-column">
          <LogoImage :url="row.blockType.logoUrl" class="block-documents-table__name-img" />
          <div class="block-documents-table__name-content">
            <span class="block-documents-table__crumbs">
              {{ row.blockType.name }} /
              <p-link :to="routes.block(row.id)">
                {{ row.name }}
              </p-link>
            </span>
            <template v-if="!media.md">
              <BlockSchemaCapabilities :capabilities="row.blockSchema.capabilities" />
            </template>
          </div>
        </div>
      </template>

      <template #capabilities="{ row }">
        <BlockSchemaCapabilities :capabilities="row.blockSchema.capabilities" wrapper />
      </template>

      <template #action-heading>
        <span />
      </template>
      <template #action="{ row }">
        <BlockDocumentMenu :block-document="row" size="xs" @delete="emit('delete')" />
      </template>

      <template #empty-state>
        <PEmptyResults>
          <template #message>
            No blocks
          </template>
          <template #actions>
            <p-button size="sm" secondary @click="clear">
              Clear Filters
            </p-button>
          </template>
        </PEmptyResults>
      </template>
    </p-table>
  </div>
</template>

<script lang="ts" setup>
  import { media, TableColumn, PEmptyResults } from '@prefecthq/prefect-design'
  import { computed, ref } from 'vue'
  import BlockDocumentMenu from '@/components/BlockDocumentMenu.vue'
  import BlockSchemaCapabilities from '@/components/BlockSchemaCapabilities.vue'
  import BlockSchemaCapabilitySelect from '@/components/BlockSchemaCapabilitySelect.vue'
  import BlockTypeSelect from '@/components/BlockTypeSelect.vue'
  import LogoImage from '@/components/LogoImage.vue'
  import ResultsCount from '@/components/ResultsCount.vue'
  import SearchInput from '@/components/SearchInput.vue'
  import { useWorkspaceRoutes } from '@/compositions'
  import { BlockDocument } from '@/models/BlockDocument'

  const props = defineProps<{
    blockDocuments: BlockDocument[],
  }>()

  const emit = defineEmits<{
    (event: 'delete'): void,
  }>()

  const routes = useWorkspaceRoutes()
  const searchTerm = ref('')
  const selectedCapability = ref<string | null>(null)
  const selectedType = ref<string | null>(null)

  const columns = computed<TableColumn<BlockDocument>[]>(() => [
    {
      label: 'Name',
      property: 'name',
      width: '300px',
    },
    {
      label: 'Capabilities',
      visible: media.md,
    },
    {
      label: 'Action',
      width: '0px',
    },
  ])

  const filtered = computed(() => props.blockDocuments.filter(filterBlockDocument))

  function filterBlockDocument({ name, blockType, blockSchema }: BlockDocument): boolean {
    const { capabilities: blockSchemaCapabilities } = blockSchema
    const { name: blockTypeName } = blockType

    if (selectedCapability.value && !blockSchemaCapabilities.includes(selectedCapability.value)) {
      return false
    }

    if (selectedType.value && blockTypeName != selectedType.value) {
      return false
    }

    return `${name} ${blockType.name} ${blockSchemaCapabilities.join(' ')}`.toLowerCase().includes(searchTerm.value.toLowerCase())
  }

  const sortedBlocks = computed(() => {
    return [...filtered.value].sort((blockA, blockB) => blockA.blockType.name.localeCompare(blockB.blockType.name))
  })

  function clear(): void {
    searchTerm.value = ''
    selectedCapability.value = null
    selectedType.value = null
  }
</script>

<style>
.block-documents-table { @apply
  grid
  gap-4
}

.block-documents-table__filters { @apply
  grid
  md:flex
  gap-2
  justify-between
  items-center
}

.block-documents-table__filters {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "search"
                       "capability"
                       "type"
                       "results";

}

@screen sm {
  .block-documents-table__filters {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas: "search     search"
                        "capability type"
                        "results    results";
  }
}

.block-documents-table__results { @apply
  mt-2
  md:mt-0
  md:mr-auto
}

.block-documents-table__search {
  grid-area: search;
}

.block-documents-table__capability {
  grid-area: capability;
}

.block-documents-table__type {
  grid-area: type;
}

.block-documents-table__results {
  grid-area: results;
}

.block-documents-table__name-column { @apply
  flex
  md:items-center
  gap-1
  min-w-max
}

.block-documents-table__name-content { @apply
  grid
  gap-2
  flex-grow
}

.block-documents-table__name-img { @apply
  mr-1
}
</style>