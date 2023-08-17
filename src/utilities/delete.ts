import { showToast } from '@prefecthq/prefect-design'
import { Action } from '@prefecthq/vue-compositions'
import { localization } from '@/localization'
import { asArray } from '@/utilities/arrays'
import { isReadOnly } from '@/utilities/featureFlag'
const READ_ONLY = isReadOnly()

export type ItemType = 'Flow' | 'Deployment' | 'Flow run' | 'Work queue' | 'Block' | 'Notification' | 'Task run' | 'Concurrency Limit' | 'Work pool'
type MaybeSingleParam<T extends Action, Params = Parameters<T>> = Params extends [unknown] ? Params[0] | Params : Params

export async function deleteItem<T extends Action>(args: MaybeSingleParam<T>, endpoint: T, type: ItemType): Promise<ReturnType<T> | void> {
  let result: Promise<ReturnType<T>>
  if (READ_ONLY) {
    console.error('In READ ONLY mode')
    showToast(localization.error.delete(type.toLowerCase()), 'error')
    return
  }
  try {
    const endpointArgs = asArray(args)
    result = await endpoint(...endpointArgs)
    showToast(localization.success.delete(type), 'success')
    return result
  } catch (error) {
    showToast(localization.error.delete(type.toLowerCase()), 'error')

    console.error(error)
  }
}