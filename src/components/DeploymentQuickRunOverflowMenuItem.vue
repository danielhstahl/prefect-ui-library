<template>
  <p-overflow-menu-item @click="run">
    <slot>
      Quick run
    </slot>
  </p-overflow-menu-item>
</template>

<script lang="ts" setup>
  import { showToast } from '@prefecthq/prefect-design'
  import { h } from 'vue'
  import { useRouter } from 'vue-router'
  import ToastFlowRunCreate from '@/components/ToastFlowRunCreate.vue'
  import { useWorkspaceApi, useWorkspaceRoutes } from '@/compositions'
  import { localization } from '@/localization'
  import { Deployment } from '@/models'
  import { FlowRun } from '@/models/FlowRun'
  const props = defineProps<{
    deployment: Deployment,
    openModal: () => void,
  }>()

  const api = useWorkspaceApi()
  const router = useRouter()
  const routes = useWorkspaceRoutes()

  const run = async (): Promise<void> => {
    if (props.deployment.parameterOpenApiSchema.required && props.deployment.parameterOpenApiSchema.required.length > 0) {
      props.openModal()
    } else {
      try {


        const flowRun: FlowRun|void = await api.deployments.createDeploymentFlowRun(props.deployment.id, {
          state: {
            type: 'scheduled',
            message: 'Run from the Prefect UI with defaults',
          },
        })
        if (flowRun) {
          const toastMessage = h(ToastFlowRunCreate, {
            flowRun,
            flowRunRoute: routes.flowRun,
            router,
            immediate: true,
          })
          showToast(toastMessage, 'success')
        } else {
          console.error('Read only!')
          showToast(localization.error.scheduleFlowRun, 'error')
        }


      } catch (error) {
        showToast(localization.error.scheduleFlowRun, 'error')
        console.error(error)
      }
    }
  }
</script>