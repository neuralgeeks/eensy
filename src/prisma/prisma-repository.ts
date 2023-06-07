import Repository from '../patterns/repository'

export interface PrismaDelegateLike<ID, T extends { id: ID }> {
  create(args: { data: T }): Promise<T>
  findMany(): Promise<T[]>
  findUnique(args: { where: { id: ID } }): Promise<T | null>
  update(args: { data: Partial<T>; where: { id: ID } }): Promise<T>
  delete(args: { where: { id: ID } }): Promise<T>
}

export default class PrismaRepository<
  ID,
  T extends { id: ID }
> extends Repository<ID, T> {
  prismaDelegate: PrismaDelegateLike<ID, T>

  constructor(prismaDelegate: PrismaDelegateLike<ID, T>) {
    super()
    this.prismaDelegate = prismaDelegate
  }

  all(): Promise<T[]> {
    return this.prismaDelegate.findMany()
  }

  show(id: ID): Promise<T | null> {
    return this.prismaDelegate.findUnique({ where: { id } })
  }

  update(id: ID, data: Partial<T>): Promise<T> {
    return this.prismaDelegate.update({ data, where: { id } })
  }

  create(data: T): Promise<T> {
    return this.prismaDelegate.create({ data })
  }

  delete(id: ID): Promise<T> {
    return this.prismaDelegate.delete({ where: { id } })
  }
}
