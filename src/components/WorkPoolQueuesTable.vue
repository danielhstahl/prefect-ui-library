<template>
  <div class="work-pool-queues-table">
    <p-layout-table>
      <template #header-start>
        <template v-if="selected">
          <div class="work-pool-queues-table__controls--right">
            <ResultsCount v-if="selected.length == 0" label="Work Queue" :count="filteredWorkPoolQueues.length" />
            <SelectedCount v-else :count="selected.length" />

            <p-button v-if="can.create.work_queue && !selected.length" inset size="sm" icon="PlusIcon" :to="routes.workPoolQueueCreate(workPoolName)" />
          </div>

          <WorkPoolQueuesDeleteButton :work-pool-name="workPoolName" :work-pool-queues="selected" @delete="handleDelete" />
        </template>
      </template>

      <template #header-end>
        <SearchInput v-model="search" label="Search" placeholder="Search" />
      </template>

      <p-table v-model:selected="selected" :data="filteredWorkPoolQueues" :columns="columns">
        <template #priority-heading>
          <WorkPoolQueuePriorityLabel />
        </template>

        <template #actions-heading>
          <span />
        </template>

        <template #name="{ row }">
          <p-link :to="routes.workPoolQueue(workPoolName, row.name)">
            <span>{{ row.name }}</span>
          </p-link>
        </template>

        <template #status="{ row }">
          <WorkPoolQueueStatusBadge v-if="workPool" :work-queue="row" :work-pool="workPool" />
        </template>

        <template #actions="{ row }">
          <div class="worker-pool-queues-table__actions">
            <WorkersLateIndicator :work-pool-name="workPoolName" :work-pool-queue-names="[row.name]" />
            <WorkPoolQueueToggle :work-pool-queue="row" :work-pool-name="workPoolName" @update="refresh" />
            <WorkPoolQueueMenu :work-pool-name="workPoolName" :work-pool-queue="row" size="xs" @delete="handleDelete" />
          </div>
        </template>
      </p-table>
    </p-layout-table>
  </div>
</template>

<script lang="ts" setup>
  import { TableColumn } from '@prefecthq/prefect-design'
  import { useSubscription } from '@prefecthq/vue-compositions'
  import { ref, computed } from 'vue'
  import { SearchInput, ResultsCount, SelectedCount, WorkPoolQueuesDeleteButton, WorkPoolQueuePriorityLabel, WorkersLateIndicator, WorkPoolQueueToggle, WorkPoolQueueStatusBadge } from '@/components'
  import { useCan, useWorkspaceRoutes, useWorkspaceApi, useComponent } from '@/compositions'
  import { WorkPoolQueue, WorkPoolQueueTableData } from '@/models'
  import { hasString, isRecord } from '@/utilities'

  const props = defineProps<{
    workPoolName: string,
  }>()

  const api = useWorkspaceApi()
  const can = useCan()
  const routes = useWorkspaceRoutes()
  const { WorkPoolQueueMenu } = useComponent()

  const search = ref('')

  const workPoolSubscription = useSubscription(api.workPools.getWorkPoolByName, [props.workPoolName])
  const workPool = computed(() => {
    return workPoolSubscription.response
  })
  const workPoolQueuesSubscription = useSubscription(api.workPoolQueues.getWorkPoolQueues, [props.workPoolName])
  const workPoolQueues = computed(() => workPoolQueuesSubscription.response ?? [])


  const workPoolQueuesData = computed(() => workPoolQueues.value.map(queue => new WorkPoolQueueTableData({
    ...queue,
    disabled: !workPool.value || workPool.value.defaultQueueId == queue.id,
  })))

  const filteredWorkPoolQueues = computed(() => {
    if (search.value.length == 0) {
      return workPoolQueuesData.value
    }

    return workPoolQueuesData.value.filter(queue => isRecord(queue) && hasString(queue, search.value))
  })

  const selected = ref<WorkPoolQueue[] | undefined>(can.delete.work_queue ? [] : undefined)
  const columns: TableColumn<WorkPoolQueue>[] = [
    {
      property: 'name',
      label: 'Name',
    },
    {
      property: 'concurrencyLimit',
      label: 'Concurrency Limit',
    },
    {
      property: 'priority',
      label: 'Priority',
    },
    {
      label: 'Status',
    },
    {
      label: 'Actions',
      width: '42px',
    },
  ]

  const handleDelete = async (): Promise<void> => {
    await workPoolQueuesSubscription.refresh()
    selected.value = selected.value?.filter(queue => workPoolQueues.value.find(({ id }) => id === queue.id))
  }

  function refresh(): void {
    workPoolSubscription.refresh()
    workPoolQueuesSubscription.refresh()
  }
</script>

<style>
.work-pool-queues-table__controls--right { @apply
  mr-auto
  flex
  gap-4
  items-center
}

.worker-pool-queues-table__actions { @apply
  justify-end
  items-center
  flex
  gap-2
}
</style>