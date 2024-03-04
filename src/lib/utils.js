/**
 * Copyright (c) 2023 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
export function arrify(v) {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}
