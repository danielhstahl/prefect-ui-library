<template>
  <div class="task-run-details">
    <p-key-value label="Flow Run" :alternate="alternate">
      <template #value>
        <FlowRunIconText :flow-run-id="taskRun.flowRunId" />
      </template>
    </p-key-value>

    <template v-if="taskRun.startTime">
      <p-key-value label="Start Time" :alternate="alternate" :value="formatDateTimeNumeric(taskRun.startTime)" />
    </template>

    <p-key-value label="Duration" :alternate="alternate">
      <template #value>
        <DurationIconText :duration="taskRun.duration" />
      </template>
    </p-key-value>

    <p-key-value label="Run Count" :value="taskRun.runCount ?? 0" :alternate="alternate" />

    <p-key-value label="Estimated Run Time" :value="secondsToApproximateString(taskRun.estimatedRunTime ?? 0)" :alternate="alternate" />

    <p-key-value label="Created" :value="formatDateTimeNumeric(taskRun.created)" :alternate="alternate" />

    <p-key-value label="Last Updated" :value="formatDateTimeNumeric(taskRun.updated)" :alternate="alternate" />

    <p-key-value label="Cache Key" :value="taskRun.cacheKey" :alternate="alternate" />

    <p-key-value label="Cache Expiration" :value="taskRun.cacheExpiration" :alternate="alternate" />

    <p-key-value label="Dynamic Key" :value="taskRun.dynamicKey" :alternate="alternate" />

    <p-key-value label="Task Run ID" :value="taskRun.id" :alternate="alternate" />

    <template v-if="result">
      <p-key-value :label="localization.info.result" :alternate="alternate">
        <template v-if="result.description" #value>
          <p-markdown-renderer v-if="result.description" :text="result.description" class="task-run-details__markdown-renderer" />
        </template>
      </p-key-value>
    </template>

    <p-divider />

    <p-heading :heading="heading">
      Task configuration
    </p-heading>

    <p-key-value label="Version" :value="taskRun.taskVersion" :alternate="alternate" />

    <div v-if="taskRun.empiricalPolicy?.maxRetries">
      <p-key-value label="Max Retries" :value="taskRun.empiricalPolicy?.maxRetries" :alternate="alternate" />

      <p-key-value label="Retry Delay" :value="secondsToApproximateString(taskRun.empiricalPolicy?.retryDelaySeconds ?? 0)" :alternate="alternate" />
    </div>
    <div v-else>
      <p-key-value label="Retries" :value="taskRun.empiricalPolicy?.retries" :alternate="alternate" />

      <p-key-value label="Retry Delay" :value="secondsToApproximateString(taskRun.empiricalPolicy?.retryDelay ?? 0)" :alternate="alternate" />
    </div>

    <p-key-value label="Tags" :alternate="alternate">
      <template v-if="taskRun.tags?.length" #value>
        <p-tags :tags="taskRun.tags!" />
      </template>
    </p-key-value>
  </div>
</template>

<script lang="ts" setup>
  import { PKeyValue, PTags } from '@prefecthq/prefect-design'
  import { computed } from 'vue'
  import DurationIconText from '@/components/DurationIconText.vue'
  import FlowRunIconText from '@/components/FlowRunIconText.vue'
  import { useTaskRunResult } from '@/compositions'
  import { localization } from '@/localization'
  import { TaskRun } from '@/models/TaskRun'
  import { formatDateTimeNumeric } from '@/utilities/dates'
  import { secondsToApproximateString } from '@/utilities/seconds'

  const props = defineProps<{
    taskRun: TaskRun,
    alternate?: boolean,
  }>()

  const { result } = useTaskRunResult(props.taskRun.id)

  const heading = computed(() => props.alternate ? 6 : 5)
</script>

<style>
.task-run-details { @apply
  flex
  flex-col
  gap-3
  items-start
}

.task-run-details__tags { @apply
  mb-1
  mr-1
}

.task-run-details__markdown-renderer {
  font-size: inherit;
}
</style>