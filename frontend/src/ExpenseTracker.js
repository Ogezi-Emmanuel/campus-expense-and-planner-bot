import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function ExpenseTracker() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
  });
  const [totalAllowance, setTotalAllowance] = useState(0);
  const [lastAllowanceUpdate, setLastAllowanceUpdate] = useState(null);
  const [allowanceInput, setAllowanceInput] = useState(''); // New state for allowance input

  const expenseCategories = [
    'Food',
    'Transport',
    'Books',
    'Entertainment',
    'Utilities',
    'Rent',
    'Other',
  ];

  useEffect(() => {
    fetchExpenses();
    checkWeeklyReset();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('id, description, amount, category, created_at');

    const { data: allowanceData, error: allowanceError } = await supabase
      .from('allowance')
      .select('amount, updated_at')
      .single();

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError.message);
    } else {
      setExpenses(expensesData);
    }

    if (allowanceError && allowanceError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching allowance:', allowanceError.message);
    } else if (allowanceData) {
      setTotalAllowance(allowanceData.amount);
      setLastAllowanceUpdate(allowanceData.updated_at);
    }
    setLoading(false);
  }

  async function checkWeeklyReset() {
    if (lastAllowanceUpdate) {
      const lastUpdateDate = new Date(lastAllowanceUpdate);
      const today = new Date();
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // milliseconds in a week

      if (today.getTime() - lastUpdateDate.getTime() >= oneWeek) {
        // Reset expenses
        const { error } = await supabase
          .from('expenses')
          .delete()
          .neq('id', 0); // Delete all expenses

        if (error) {
          console.error('Error resetting expenses:', error.message);
        } else {
          console.log('Weekly expenses reset.');
          setExpenses([]);
          // Update last allowance update date
          const { data: { user } } = await supabase.auth.getUser(); // Re-fetch user for this scope
          if (!user) {
            console.error("User not authenticated for weekly reset.");
            return;
          }
          console.log("User object before update in checkWeeklyReset:", user);
          console.log("User ID before update in checkWeeklyReset:", user.id);
          const { error: updateError } = await supabase
            .from('allowance')
            .update({ updated_at: today.toISOString().split('T')[0] })
              .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating allowance date:', updateError.message);
          } else {
            setLastAllowanceUpdate(today.toISOString().split('T')[0]);
          }
        }
      }
    }
  }

  async function setAllowance() {
    const amount = parseFloat(allowanceInput); // Use allowanceInput state
    if (isNaN(amount) || amount < 0) {
      alert("Invalid input. Please enter a positive numerical value.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated.");
      return;
    }
    console.log("User object before upsert:", user);
    console.log("User ID before upsert:", user.id);

    const { data, error } = await supabase
      .from('allowance')
      .upsert({ user_id: user.id, amount: amount, updated_at: new Date().toISOString().split('T')[0] });

    if (error) {
      console.error('Error setting allowance:', error.message);
    } else {
      setTotalAllowance(amount);
      setLastAllowanceUpdate(new Date().toISOString().split('T')[0]);
      alert(`Weekly allowance set to: CFA${amount.toFixed(2)}`);
      setAllowanceInput(''); // Clear input after setting
    }
  }

  async function addExpense() {
    const { description, amount, category } = newExpense;
    if (!description || !amount || !category) {
      alert('Please fill in all fields.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Amount must be a positive number.');
      return;
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ description, amount: parsedAmount, category, created_at: new Date().toISOString() }])
      .select();

    if (error) {
      console.error('Error adding expense:', error.message);
    } else {
      setExpenses([...expenses, ...data]);
      setNewExpense({ description: '', amount: '', category: '' });
    }
  }

  async function deleteExpense(id) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error.message);
    } else {
      setExpenses(expenses.filter((expense) => expense.id !== id));
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const remainingAllowance = totalAllowance - totalSpent;

  return (
    <div className="expense-tracker-container">
      <h2>Campus Expense Tracker</h2>

      <div className="allowance-section">
        <h3>Weekly Allowance: CFA{totalAllowance.toFixed(2)}</h3>
        <h3>Remaining Balance: CFA{remainingAllowance.toFixed(2)}</h3>
        <input
          type="number"
          placeholder="Enter weekly allowance"
          value={allowanceInput}
          onChange={(e) => setAllowanceInput(e.target.value)}
        />
        <button onClick={setAllowance}>Set/Update Weekly Allowance</button>
      </div>

      <div className="add-expense-form">
        <h3>Add New Expense</h3>
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newExpense.description}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={newExpense.amount}
          onChange={handleInputChange}
        />
        <select
          name="category"
          value={newExpense.category}
          onChange={handleInputChange}
          className="select-field"
        >
          <option value="">Select Category</option>
          {expenseCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button onClick={addExpense}>Add Expense</button>
      </div>

      <div className="expense-summary">
        <h3>Total Expenses: CFA{totalSpent.toFixed(2)}</h3>
      </div>

      <div className="expense-list">
        <h3>My Expenses</h3>
        {loading ? (
          <p>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses yet. Add one above!</p>
        ) : (
          <ul>
            {expenses.map((expense) => (
              <li key={expense.id}>
                <p><strong>{expense.description}</strong> - CFA{parseFloat(expense.amount).toFixed(2)} ({expense.category})</p>
                <button onClick={() => deleteExpense(expense.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;