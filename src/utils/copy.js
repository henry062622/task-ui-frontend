export function mapExistingTaskFiles(files = []) {
  return (files || []).map((f) => ({
    uid: f.id,
    name: f.file_name,
    status: 'done',
    url: f.storage_url,
    thumbUrl: f.storage_url,
    id: f.id,
    __existing: true,
  }))
}

export function taskDetailToDraft(task) {
  return {
    __mode: 'copy',
    __source_task_id: task.id,
    // website_id: null,

    job_title: task.job_title || '',
    task_type: task.task_type_id ?? null,
    task_type_name: task.type.name,
    custom_task_type: '',

    sizes: (task.sizes || []).map((s) => s.id),
    size_names: (task.sizes || []).map((s) => s.name),
    custom_sizes: [],

    file_types: JSON.parse(task.file_types || '[]'),
    colors: JSON.parse(task.colors || '[]'),

    image_text: task.image_text || '',
    task_description: task.task_description || '',
    requester_name: task.requester_name || '',
    deadline: task.deadline || null,

    // ✅ put existing files here (same as edit)
    task_file: mapExistingTaskFiles(task.files),

    // keep system images
    sample_images: task.sample_images || [],
    actor_images: task.actor_images || [],
    decorative_images: task.decorative_images || [],
  }
}
