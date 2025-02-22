<template>
  <div class="deployments-table">
    <p-layout-table sticky>
      <template #header-start>
        <div class="deployments-table__header-start">
          <ResultsCount v-if="selectedDeployments.length == 0" label="Deployment" :count="deploymentsCount" />
          <SelectedCount v-else :count="selectedDeployments.length" />

          <DeploymentsDeleteButton v-if="can.delete.deployment" :selected="selectedDeployments" @delete="deleteDeployments" />
        </div>
      </template>

      <template #header-end>
        <div class="deployments-table__header-end">
          <SearchInput v-model="deploymentName" placeholder="Search deployments" label="Search deployments" />

          <template v-if="hideFlowFilter">
            <FlowCombobox v-model:selected="filter.flows.id" empty-message="All flows" class="deployments-table__flows" />
          </template>

          <p-select v-model="filter.sort" :options="deploymentSortOptions" />

          <p-tags-input v-model="filter.deployments.tags.name" empty-message="All tags" :options="options" class="deployments-table__tags" multiple />
        </div>
      </template>

      <p-table :data="deployments" :columns="columns" class="deployments-table">
        <template #selection-heading>
          <p-checkbox v-model="model" @update:model-value="selectAllDeployments" />
        </template>

        <template #selection="{ row }">
          <p-checkbox v-model="selectedDeployments" :value="row.id" />
        </template>

        <template #name="{ row }">
          <FlowRouterLink :flow-id="row.flowId" after=" / " />
          <p-link :to="routes.deployment(row.id)">
            <span>{{ row.name }}</span>
          </p-link>
        </template>

        <template #schedule="{ row }">
          <span :title="row.schedule?.toString({ verbose: true })">{{ handleSchedule(row.schedule) }}</span>
        </template>

        <template #tags="{ row }">
          <template v-if="row.tags">
            <p-tag-wrapper :tags="row.tags" justify="left" />
          </template>
        </template>

        <template #applied-by="{ row }">
          {{ row.appliedBy }}
        </template>

        <template #action-heading>
          <span />
        </template>

        <template #action="{ row }">
          <div class="deployments-table__actions">
            <DeploymentToggle :deployment="row" @update="refresh" />
            <DeploymentMenu size="xs" :deployment="row" show-all @delete="refresh" />
          </div>
        </template>

        <template #empty-state>
          <PEmptyResults>
            <template #message>
              No deployments
            </template>
            <template v-if="isCustomFilter" #actions>
              <p-button size="sm" secondary @click="clear">
                Clear Filters
              </p-button>
            </template>
          </PEmptyResults>
        </template>
      </p-table>
    </p-layout-table>
  </div>
</template>

<script lang="ts" setup>
  import { PTable, PTagWrapper, PEmptyResults, PLink, TableColumn, CheckboxModel } from '@prefecthq/prefect-design'
  import { useDebouncedRef, useSubscription } from '@prefecthq/vue-compositions'
  import { computed, ref } from 'vue'
  import { SearchInput, ResultsCount, DeploymentToggle, DeploymentMenu, FlowRouterLink, FlowCombobox, DeploymentsDeleteButton, SelectedCount } from '@/components'
  import { useWorkspaceApi, useWorkspaceRoutes, useCan, useDeploymentsFilterFromRoute } from '@/compositions'
  import { Deployment, isRRuleSchedule, Schedule } from '@/models'
  import { DeploymentsFilter } from '@/models/Filters'
  import { deploymentSortOptions } from '@/types/SortOptionTypes'

  const props = defineProps<{
    filter?: DeploymentsFilter,
    hideFlowFilter?: boolean,
  }>()

  const emit = defineEmits<{
    (event: 'delete'): void,
  }>()

  const api = useWorkspaceApi()
  const can = useCan()
  const routes = useWorkspaceRoutes()
  const deploymentName = ref<string>()
  const deploymentNameDebounced = useDebouncedRef(deploymentName, 1200)
  const { filter, clear, isCustomFilter } = useDeploymentsFilterFromRoute({
    ...props.filter,
    deployments: {
      ...props.filter?.deployments,
      nameLike: deploymentNameDebounced,
    },
  })

  const columns = computed<TableColumn<Deployment>[]>(() => [
    {
      label: 'selection',
      width: '20px',
      visible: can.delete.deployment,
    },
    {
      property: 'name',
      label: 'Name',
      width: '150px',
    },
    {
      property: 'schedule',
      label: 'Schedule',
      width: '200px',
    },
    {
      property: 'tags',
      label: 'Tags',
      width: '300px',
    },
    {
      property: 'appliedBy',
      label: 'Applied By',
      visible: deployments.value.some(deployment => deployment.appliedBy),
    },
    {
      label: 'Action',
      width: '42px',
    },
  ])

  const selectedDeployments = ref<string[]>([])
  const selectAllDeployments = (allDeploymentsSelected: CheckboxModel): string[] => {
    if (allDeploymentsSelected) {
      return selectedDeployments.value = [...deployments.value.map(deployment => deployment.id)]
    }
    return selectedDeployments.value = []
  }
  const model = computed({
    get() {
      return selectedDeployments.value.length === deployments.value.length
    },
    set(value: boolean) {
      selectAllDeployments(value)
    },
  })

  const deploymentsSubscription = useSubscription(api.deployments.getDeployments, [filter])
  const deployments = computed(() => deploymentsSubscription.response ?? [])

  const deploymentsCountSubscription = useSubscription(api.deployments.getDeploymentsCount, [filter])
  const deploymentsCount = computed(() => deploymentsCountSubscription.response)

  const tagList = computed(() => deployments.value.flatMap(deployment => deployment.tags ?? []))
  const options = computed(() => [...new Set(tagList.value)])

  const handleSchedule = (schedule: Schedule| null): string => {
    if (isRRuleSchedule(schedule)) {
      return 'RRule'
    }
    return schedule?.toString() ?? ''
  }

  function refresh(): void {
    deploymentsSubscription.refresh()
    deploymentsCountSubscription.refresh()
  }

  const deleteDeployments = (): void => {
    selectedDeployments.value = []
    refresh()
    emit('delete')
  }
</script>

<style>
.deployments-table__header-start { @apply
  grow
  whitespace-nowrap
}

.deployments-table__header-end { @apply
  flex
  flex-wrap
  pl-2
  ml-auto
  shrink
  gap-2
}

.deployments-table__flows,
.deployments-table__tags {
  min-width: 128px;
}

.deployments-table__actions { @apply
  flex
  gap-2
  items-center
}
</style>