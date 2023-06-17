import { SavedSearchResponse } from '@/models/api/SavedSearchResponse'
import { SavedSearchesFilter } from '@/models/Filters'
import { SavedSearch, SavedSearchCreate } from '@/models/SavedSearch'
import { mapper } from '@/services/Mapper'
import { WorkspaceApi } from '@/services/WorkspaceApi'
import { isReadOnly } from '@/utilities/featureFlag'
import { defaultSavesSearches } from '@/utilities/savedFilters'
const READ_ONLY = isReadOnly()
export interface IWorkspaceSavedSearchesApi {
  getSavedSearches: (filter: SavedSearchesFilter) => Promise<SavedSearch[]>,
  getSavedSearch: (searchId: string) => Promise<SavedSearch>,
  createSavedSearch: (search: SavedSearchCreate) => Promise<SavedSearch |void>,
  deleteSavedSearch: (searchId: string) => Promise<void>,
}

export class WorkspaceSavedSearchesApi extends WorkspaceApi implements IWorkspaceSavedSearchesApi {

  protected override routePrefix = '/saved_searches'

  public async getSavedSearches(filter: SavedSearchesFilter = {}): Promise<SavedSearch[]> {
    const request = mapper.map('SavedSearchesFilter', filter, 'SavedSearchesFilterRequest')
    const { data } = await this.post<SavedSearchResponse[]>('/filter', request)
    const mapped = mapper.map('SavedSearchResponse', data, 'SavedSearch')

    return [...defaultSavesSearches, ...mapped]
  }

  public async getSavedSearch(id: string): Promise<SavedSearch> {
    const { data } = await this.get<SavedSearchResponse>(`/${id}`)
    return mapper.map('SavedSearchResponse', data, 'SavedSearch')
  }

  public async createSavedSearch(search: SavedSearchCreate): Promise<SavedSearch | void> {
    if (READ_ONLY) {
      return Promise.resolve()
    }
    const request = mapper.map('SavedSearchCreate', search, 'SavedSearchCreateRequest')

    const { data } = await this.put<SavedSearchResponse>('/', request)
    return mapper.map('SavedSearchResponse', data, 'SavedSearch')
  }

  public deleteSavedSearch(id: string): Promise<void> {
    if (READ_ONLY) {
      return Promise.resolve()
    }
    return this.delete(`/${id}`)
  }

}

