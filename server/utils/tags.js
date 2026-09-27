// SQLite stores tags as a JSON string — these helpers keep the rest of the code clean

const serializeTags = (tags) => {
  if (!Array.isArray(tags)) return '[]';
  return JSON.stringify(tags);
};

const deserializeTags = (tagsStr) => {
  try {
    return JSON.parse(tagsStr || '[]');
  } catch {
    return [];
  }
};

// Attach parsed tags array to a task object (or array of tasks)
const withTags = (task) => {
  if (!task) return task;
  return { ...task, tags: deserializeTags(task.tags) };
};

const withTagsMany = (tasks) => tasks.map(withTags);

module.exports = { serializeTags, deserializeTags, withTags, withTagsMany };
