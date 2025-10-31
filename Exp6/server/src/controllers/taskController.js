import Task from '../models/Task.js';

export async function createTask(req, res) {
  try {
    const { title, description = '' } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    const task = await Task.create({ user: req.userId, title, description });
    return res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getTasks(req, res) {
  try {
    const { status = 'all', q = '' } = req.query;
    const filter = { user: req.userId };

    if (status === 'active') filter.completed = false;
    else if (status === 'completed') filter.completed = true;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const task = await Task.findOne({ _id: id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    await task.save();
    return res.json(task);
  } catch (err) {
    console.error('Update task error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
}
