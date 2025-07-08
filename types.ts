/**
 * @file types.ts
 * This file contains TypeScript type definitions that are shared across the application.
 * Using centralized types helps ensure consistency and provides static type checking.
 */

/**
 * Defines the set of possible assistance tasks the user can request.
 * Using an enum helps prevent typos and ensures that we are always referring
 * to a valid, known task throughout the application.
 */
export enum AssistanceTask {
  FIND_BUS = 'FIND_BUS',
  CROSS_ROAD = 'CROSS_ROAD',
  EXPLORE = 'EXPLORE',
  FIND_SHOP = 'FIND_SHOP',
}
