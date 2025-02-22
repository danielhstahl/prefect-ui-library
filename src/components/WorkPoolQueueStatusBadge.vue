<template>
  <template v-if="workQueue && workQueueStatus">
    <p-tag class="work-pool-queue-status-badge" :class="classes">
      <WorkPoolQueueStatusIcon :work-queue-name="workQueueName" :work-pool-name="workPoolName" class="work-pool-queue-status-badge__icon" />
      {{ label }}
    </p-tag>
  </template>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { WorkPoolQueueStatusIcon } from '@/components'
  import { useWorkQueueStatus } from '@/compositions'
  import { WorkPool, WorkPoolQueue } from '@/models'

  const props = defineProps<{
    workQueue: WorkPoolQueue,
    workPool: WorkPool,
  }>()

  const workQueueName = computed(() => props.workQueue.name)
  const workPoolName = computed(() => props.workPool.name)
  const workQueueId = computed(() => props.workQueue.id)
  const { workQueueStatus } = useWorkQueueStatus(workQueueId)
  const healthy = computed(() => workQueueStatus.value?.healthy)

  const label = computed(() => {
    if (props.workQueue.isPaused) {
      return 'Paused'
    }
    return healthy.value ? 'Healthy' : 'Unhealthy'
  })

  const classes = computed(() => `work-queue-status-badge--${label.value.toLowerCase()}`)
</script>

<style>
.work-pool-queue-status-badge { @apply
  text-xs
  pl-2
}

.p-tag.work-pool-queue-status-badge--healthy { @apply
  bg-success-200
  text-success-900
  dark:bg-success-100
  dark:text-white
}

.p-tag.work-pool-queue-status-badge--unhealthy { @apply
  bg-danger-200
  text-danger-900
  dark:bg-danger-100
  dark:text-white
}


.p-tag.work-queue-status-badge--paused { @apply
  bg-state-pending-300
  text-state-pending-900
  dark:bg-state-pending-800
  dark:text-white
}
</style>