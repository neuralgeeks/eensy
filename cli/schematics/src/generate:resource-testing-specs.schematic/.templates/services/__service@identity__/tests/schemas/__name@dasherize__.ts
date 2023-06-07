import { z } from 'zod'

export const entity = z.object({
  /**
   * Describe your entity here
   */
})

/**
 * Relationships are defined as a separate object
 * to avoid circular dependencies.
 *
 * Make sure to import other schemas after exporting
 * the entity schema. Otherwise, you might get circular
 * dependencies.
 */

export const relationships = z.object({
  /**
   * Describe your relationships here
   */
})

const schema = entity.merge(relationships)

export default schema
