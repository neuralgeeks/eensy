import { Prisma } from '@prisma-generated/client'

export default function softDeleteMiddleware(
  model: Prisma.ModelName
): Prisma.Middleware {
  return async (params, next) => {
    if (params.model === model) {
      if (!params.args) params.args = {}

      //-------- Delete queries
      if (params.action == 'delete') {
        // Change action to an update
        params.action = 'update'
        params.args.data = { deletedAt: new Date() }
      }

      //--------  Delete many queries
      if (params.action == 'deleteMany') {
        params.action = 'updateMany'
        if (params.args.data != undefined)
          params.args.data.deletedAt = new Date()
        else params.args.data = { deletedAt: new Date() }
      }

      //-------- Find one queries
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Change action to a find first since findUnique does not filter
        params.action = 'findFirst'

        // Add deletedAt filter
        if (params.args.where) {
          if (params.args.where.deletedAt === undefined)
            // Exclude deleted records if they have not been explicitly requested
            params.args.where.deletedAt = null
        } else params.args.where = { deletedAt: null }
      }

      //-------- Find many queries
      if (params.action === 'findMany') {
        if (params.args.where) {
          if (params.args.where.deletedAt === undefined)
            // Exclude deleted records if they have not been explicitly requested
            params.args.where.deletedAt = null
        } else params.args.where = { deletedAt: null }
      }
    }

    return next(params)
  }
}
