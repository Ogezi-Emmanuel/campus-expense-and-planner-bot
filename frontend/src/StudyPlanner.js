import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function StudyPlanner() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
  });

  const [studyReminders, setStudyReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    course: '',
    weekday: 'Monday',
    time: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchStudyReminders();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('study_tasks')
      .select('id, title, description, due_date, status');

    if (error) {
      console.error('Error fetching tasks:', error.message);
    } else {
      setTasks(data);
    }
    setLoading(false);
  }

  async function addTask() {
    const { data, error } = await supabase
      .from('study_tasks')
      .insert([newTask])
      .select();

    if (error) {
      console.error('Error adding task:', error.message);
    } else {
      setTasks([...tasks, data[0]]);
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        status: 'pending',
      });
    }
  }

  async function updateTaskStatus(id, newStatus) {
    const { error } = await supabase
      .from('study_tasks')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating task status:', error.message);
    } else {
      setTasks(tasks.map((task) => (task.id === id ? { ...task, status: newStatus } : task)));
    }
  }

  async function deleteTask(id) {
    const { error } = await supabase
      .from('study_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error.message);
    } else {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  async function fetchStudyReminders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('study_reminders')
      .select('id, course, weekday, time');

    if (error) {
      console.error('Error fetching study reminders:', error.message);
    } else {
      setStudyReminders(data);
    }
    setLoading(false);
  }

  async function addStudyReminder() {
    if (!newReminder.course || !newReminder.weekday || !newReminder.time) {
      alert('Please fill in all fields for the study reminder.');
      return;
    }
    const { data, error } = await supabase
      .from('study_reminders')
      .insert([newReminder])
      .select();

    if (error) {
      console.error('Error adding study reminder:', error.message);
    } else {
      setStudyReminders([...studyReminders, ...data]);
      setNewReminder({
        course: '',
        weekday: 'Monday',
        time: '',
      });
    }
  }

  async function deleteStudyReminder(id) {
    const { error } = await supabase
      .from('study_reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting study reminder:', error.message);
    } else {
      setStudyReminders(studyReminders.filter((reminder) => reminder.id !== id));
    }
  }

  const handleReminderInputChange = (e) => {
    const { name, value } = e.target;
    setNewReminder({ ...newReminder, [name]: value });
  };

  return (
    <div className="study-planner-container">
      <h2>Study Planner</h2>

      <div className="add-task-form">
        <h3>Add New Task</h3>
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={newTask.title}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Task Description"
          value={newTask.description}
          onChange={handleInputChange}
        ></textarea>
        <input
          type="date"
          name="due_date"
          value={newTask.due_date}
          onChange={handleInputChange}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="add-reminder-form">
        <h3>Add New Study Reminder</h3>
        <input
          type="text"
          name="course"
          placeholder="Course"
          value={newReminder.course}
          onChange={handleReminderInputChange}
        />
        <select
          name="weekday"
          value={newReminder.weekday}
          onChange={handleReminderInputChange}
        >
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
        <input
          type="text"
          name="time"
          placeholder="Time (e.g., 7PM)"
          value={newReminder.time}
          onChange={handleReminderInputChange}
        />
        <button onClick={addStudyReminder}>Add Reminder</button>
      </div>

      <div className="task-list">
        <h3>My Study Tasks</h3>
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet. Add one above!</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p>Due: {task.due_date}</p>
                <p>Status: {task.status}</p>
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="study-reminders-list">
        <h3>My Study Reminders</h3>
        {loading ? (
          <p>Loading reminders...</p>
        ) : studyReminders.length === 0 ? (
          <p>No reminders yet. Add one above!</p>
        ) : (
          <ul>
            {studyReminders.map((reminder) => (
              <li key={reminder.id}>
                <h4>{reminder.course}</h4>
                <p>{reminder.weekday} at {reminder.time}</p>
                <button onClick={() => deleteStudyReminder(reminder.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default StudyPlanner;