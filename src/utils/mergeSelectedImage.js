/**
 * Merge selected image IDs into formState, avoiding duplicates.
 * @param {Array<number>} selectedIds - IDs selected in SystemImagePicker
 * @param {Array<object>} imageList - Current page's system image list
 * @param {Ref<Array>} targetRef - The formState field (e.g. actor_images)
 * @param {Function} fetchByIdsFn - API function that returns image objects by ID
 */

export const mergeSelectedImages = async (selectedIds, imageList, targetRef, fetchByIdsFn) => {
  const existingIds = targetRef
    .filter((img) => img.id) // system images only
    .map((img) => img.id)

  const newIds = selectedIds.filter((id) => !existingIds.includes(id))

  // 1. Found in current imageList
  const foundFromList = imageList.filter((img) => newIds.includes(img.id))
  foundFromList.forEach((img) => {
    targetRef.push(img)
  })

  // 2. Fetch remaining
  const foundIds = foundFromList.map((img) => img.id)
  const remainingIds = newIds.filter((id) => !foundIds.includes(id))

  if (remainingIds.length > 0) {
    const fetched = await fetchByIdsFn(remainingIds)
    fetched.forEach((img) => {
      targetRef.push(img)
    })
  }
}
