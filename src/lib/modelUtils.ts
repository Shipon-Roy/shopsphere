/**
 * Standard toJSON transform for all Mongoose models.
 * Converts _id to string and removes __v.
 * Extra fields (password, binary data) are handled per-model.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function baseTransform(_doc: unknown, ret: any) {
  ret._id = String(ret._id);
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete ret.__v;
  return ret;
}
