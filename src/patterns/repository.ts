import { data } from '../utils/types'

export default abstract class Repository<ID, T extends { id: ID }> {
  abstract all(): Promise<T[]>

  abstract show(id: ID): Promise<T | null>

  abstract update(id: ID, data: Partial<T>): Promise<data>

  abstract create(data: T): Promise<T>

  abstract delete(id: ID): Promise<T>
}
