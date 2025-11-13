import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [allowance, setAllowance] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [studyTasks, setStudyTasks] = useState([]);
  const [studyReminders, setStudyReminders] = useState([]);

  useEffect(() => {
    getProfile();
    fetchAllowanceAndExpenses();
    fetchStudyTasksAndReminders();
  }, []);

  async function getProfile() {
    setLoading(true);
    const { user } = (await supabase.auth.getSession()).data;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn(error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  }

  async function fetchAllowanceAndExpenses() {
    const { data: allowanceData, error: allowanceError } = await supabase
      .from('allowance')
      .select('amount')
      .single();

    if (allowanceError && allowanceError.code !== 'PGRST116') {
      console.error('Error fetching allowance:', allowanceError.message);
      setAllowance(0); // Set allowance to 0 on error
    } else if (allowanceData && typeof allowanceData.amount === 'number') {
      setAllowance(allowanceData.amount);
    } else {
      setAllowance(0); // Set allowance to 0 if no data or invalid amount
    }

    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('id, description, amount, category');

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError.message);
    } else {
      setExpenses(expensesData);
    }
  }

  async function fetchStudyTasksAndReminders() {
    const { data: tasksData, error: tasksError } = await supabase
      .from('study_tasks')
      .select('*');

    if (tasksError) {
      console.error('Error fetching study tasks:', tasksError.message);
    } else {
      setStudyTasks(tasksData);
    }

    const { data: remindersData, error: remindersError } = await supabase
      .from('study_reminders')
      .select('*');

    if (remindersError) {
      console.error('Error fetching study reminders:', remindersError.message);
    } else {
      setStudyReminders(remindersData);
    }
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const remainingAllowance = allowance - totalSpent;

  return (
    <div className="expense-tracker-container"> {/* Reusing expense-tracker-container for consistent styling */}
      <h2>Dashboard</h2>

      <div className="allowance-section"> {/* Reusing allowance-section */}
        <h3>{profile ? `Welcome, ${profile.username}!` : 'Welcome!'}</h3>
        <p>Your current allowance: CFA{allowance.toFixed(2)}</p>
        <p>Remaining allowance: CFA{remainingAllowance.toFixed(2)}</p>
      </div>

      <div className="dashboard-section"> {/* Using a generic dashboard-section for other info */}
        <h3>Expense Summary</h3>
        <p>Total expenses this week: CFA{totalSpent.toFixed(2)}</p>
        {expenses.length > 0 ? (
          <ul>
            {expenses.map((expense) => (
              <li key={expense.id}>
                {expense.description}: CFA{expense.amount.toFixed(2)} ({expense.category})
              </li>
            ))}
          </ul>
        ) : (
          <p>No expenses recorded yet.</p>
        )}
      </div>

      <div className="dashboard-section"> {/* Another dashboard-section for study tasks */}
        <h3>Upcoming Study Tasks</h3>
        {studyTasks.length > 0 ? (
          <ul>
            {studyTasks.map((task) => (
              <li key={task.id}>
                {task.title} - Due: {new Date(task.due_date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No study tasks planned.</p>
        )}
      </div>

      <div className="dashboard-section"> {/* Another dashboard-section for study reminders */}
        <h3>Study Reminders</h3>
        {studyReminders.length > 0 ? (
          <ul>
            {studyReminders.map((reminder) => (
              <li key={reminder.id}>
                {reminder.message} - Time: {reminder.time}
              </li>
            ))}
          </ul>
        ) : (
          <p>No study reminders set.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;