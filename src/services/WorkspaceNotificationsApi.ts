import { NotificationResponse } from '@/models/api/NotificationResponse'
import { NotificationsFilter } from '@/models/Filters'
import { Notification } from '@/models/Notification'
import { NotificationCreate } from '@/models/NotificationCreate'
import { NotificationUpdate } from '@/models/NotificationUpdate'
import { mapper } from '@/services/Mapper'
import { WorkspaceApi } from '@/services/WorkspaceApi'
import { isReadOnly } from '@/utilities/featureFlag'
const READ_ONLY = isReadOnly()
export interface IWorkspaceNotificationsApi {
  getNotification: (notificationId: string) => Promise<Notification>,
  createNotification: (notification: NotificationCreate) => Promise<Notification|void>,
  getNotifications: () => Promise<Notification[]>,
  updateNotification: (notificationId: string, notification: NotificationUpdate) => Promise<void>,
  deleteNotification: (notificationId: string) => Promise<void>,
}

export class WorkspaceNotificationsApi extends WorkspaceApi implements IWorkspaceNotificationsApi {

  protected override routePrefix = '/flow_run_notification_policies'

  public async getNotification(notificationId: string): Promise<Notification> {
    const { data } = await this.get<NotificationResponse>(`/${notificationId}`)

    return mapper.map('NotificationResponse', data, 'Notification')
  }

  public async createNotification(notification: NotificationCreate): Promise<Notification|void> {
    if (READ_ONLY) {
      return Promise.resolve()
    }
    const { data } = await this.post<NotificationResponse>('/', mapper.map('NotificationCreate', notification, 'NotificationCreateRequest'))

    return mapper.map('NotificationResponse', data, 'Notification')
  }

  public async getNotifications(filter: NotificationsFilter = {}): Promise<Notification[]> {
    const request = mapper.map('NotificationsFilter', filter, 'NotificationsFilterRequest')
    const { data } = await this.post<NotificationResponse[]>('/filter', request)

    return mapper.map('NotificationResponse', data, 'Notification')
  }

  public updateNotification(notificationId: string, notification: NotificationUpdate): Promise<void> {
    if (READ_ONLY) {
      return Promise.resolve()
    }
    return this.patch(`/${notificationId}`, mapper.map('NotificationUpdate', notification, 'NotificationUpdateRequest'))
  }

  public deleteNotification(notificationId: string): Promise<void> {
    if (READ_ONLY) {
      return Promise.resolve()
    }
    return this.delete(`/${notificationId}`)
  }
}