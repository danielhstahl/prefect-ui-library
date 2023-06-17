import { TaskRunHistoryResponse } from '@/models/api/TaskRunHistoryResponse'
import { TaskRunResponse } from '@/models/api/TaskRunResponse'
import { TaskRunsFilter, TaskRunsHistoryFilter } from '@/models/Filters'
import { StateUpdate } from '@/models/StateUpdate'
import { TaskRun } from '@/models/TaskRun'
import { TaskRunHistory } from '@/models/TaskRunHistory'
import { BatchProcessor } from '@/services/BatchProcessor'
import { mapper } from '@/services/Mapper'
import { WorkspaceApi } from '@/services/WorkspaceApi'
import { toMap } from '@/utilities'
import { isReadOnly } from '@/utilities/featureFlag'
const READ_ONLY = isReadOnly()

export interface IWorkspaceTaskRunsApi {
  getTaskRun: (taskRunId: string) => Promise<TaskRun>,
  getTaskRuns: (filter: TaskRunsFilter) => Promise<TaskRun[]>,
  getTaskRunsCount: (filter: TaskRunsFilter) => Promise<number>,
  setTaskRunState: (taskRunId: string, body: StateUpdate) => Promise<void>,
  deleteTaskRun: (taskRunId: string) => Promise<void>,
}

export class WorkspaceTaskRunsApi extends WorkspaceApi implements IWorkspaceTaskRunsApi {

  protected override routePrefix = '/task_runs'

  private readonly batcher = new BatchProcessor<string, TaskRun>(async ids => {
    const taskRuns = await this.getTaskRuns({
      taskRuns: {
        id: ids,
      },
    })

    return toMap(taskRuns, 'id')
  }, { maxBatchSize: 200 })

  public getTaskRun(taskRunId: string): Promise<TaskRun> {
    return this.batcher.batch(taskRunId)
  }

  public async getTaskRuns(filter: TaskRunsFilter = {}): Promise<TaskRun[]> {
    const request = mapper.map('TaskRunsFilter', filter, 'TaskRunsFilterRequest')
    const { data } = await this.post<TaskRunResponse[]>('/filter', request)

    return mapper.map('TaskRunResponse', data, 'TaskRun')
  }

  public async getTaskRunsCount(filter: TaskRunsFilter = {}): Promise<number> {
    const request = mapper.map('TaskRunsFilter', filter, 'TaskRunsFilterRequest')
    const { data } = await this.post<number>('/count', request)

    return data
  }

  public setTaskRunState(id: string, body: StateUpdate): Promise<void> {
    if (READ_ONLY) {
      return Promise.resolve()
    }
    const requestBody = mapper.map('StateUpdate', body, 'StateUpdateRequest')

    return this.post(`/${id}/set_state`, { state: requestBody.state, force: true })
  }

  public deleteTaskRun(taskRunId: string): Promise<void> {
    if (READ_ONLY) {
      return Promise.resolve()
    }
    return this.delete(`/${taskRunId}`)
  }

  public async getTaskRunsHistory(filter: TaskRunsHistoryFilter): Promise<TaskRunHistory[]> {
    const request = mapper.map('TaskRunsHistoryFilter', filter, 'TaskRunsHistoryFilterRequest')
    const { data } = await this.post<TaskRunHistoryResponse[]>('/history', request)

    return mapper.map('TaskRunHistoryResponse', data, 'TaskRunHistory')
  }
}