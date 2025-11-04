const DATA_KEY = "campusPlannerData";

let data = {};

function loadData() {
    const storedData = localStorage.getItem(DATA_KEY);
    if (storedData) {
        data = JSON.parse(storedData);
        // Ensure all keys exist for backward compatibility
        data.total_allowance = data.total_allowance || 0;
        data.expenses = data.expenses || {"feeding": 0, "transport": 0, "printing": 0, "internet": 0, "utilities": 0, "others": 0};
        // Ensure all expense categories exist
        const defaultCategories = ["feeding", "transport", "printing", "internet", "utilities", "others"];
        for (const category of defaultCategories) {
            if (!(category in data.expenses)) {
                data.expenses[category] = 0;
            }
        }
        data.study_schedule = data.study_schedule || [];
        // Ensure study schedule items have 'course' and 'weekday' for backward compatibility
        data.study_schedule = data.study_schedule.map(item => {
            if (!item.course) {
                item.course = item.subject || "Unknown Course"; // Migrate 'subject' to 'course'
                delete item.subject;
            }
            if (!item.weekday) {
                item.weekday = "Monday"; // Default weekday
            }
            return item;
        });
        data.last_allowance_update = data.last_allowance_update || null;
    } else {
        data = {
            total_allowance: 0,
            expenses: {"feeding": 0, "transport": 0, "printing": 0, "internet": 0, "utilities": 0, "others": 0},
            study_schedule: [],
            last_allowance_update: null
        };
    }
    checkWeeklyReset();
    saveData(); // Save to ensure default structure is persisted
}

function saveData() {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function checkWeeklyReset() {
    if (data.last_allowance_update) {
        const lastUpdateDate = new Date(data.last_allowance_update);
        const today = new Date();
        const oneWeek = 7 * 24 * 60 * 60 * 1000; // milliseconds in a week

        if (today.getTime() - lastUpdateDate.getTime() >= oneWeek) {
            displayOutput("A new week has started! Resetting expenses.");
            for (const category in data.expenses) {
                data.expenses[category] = 0;
            }
            data.last_allowance_update = today.toISOString().split('T')[0]; // Store as YYYY-MM-DD
        }
    }
}

function displayOutput(message) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = `<p>${message}</p>`;
}

function clearInputArea() {
    document.getElementById("inputArea").innerHTML = "";
    document.getElementById("inputArea").style.display = "none";
}

function setAllowance() {
    clearInputArea();
    const inputArea = document.getElementById("inputArea");
    inputArea.style.display = "block";
    inputArea.innerHTML = `
        <label for="allowanceAmount">Enter your weekly allowance (CFA):</label>
        <input type="number" id="allowanceAmount" placeholder="e.g., 5000" min="0">
        <button id="submitAllowance">Set Allowance</button>
        <p id="allowanceError" class="error"></p>
    `;

    document.getElementById("submitAllowance").onclick = () => {
        const amountInput = document.getElementById("allowanceAmount");
        const amount = parseFloat(amountInput.value);
        const errorDisplay = document.getElementById("allowanceError");

        if (isNaN(amount) || amount < 0) {
            errorDisplay.textContent = "Invalid input. Please enter a positive numerical value.";
            return;
        }

        data.total_allowance = amount;
        data.last_allowance_update = new Date().toISOString().split('T')[0]; // Store as YYYY-MM-DD
        saveData();
        displayOutput(`Weekly allowance set to: CFA${amount.toFixed(2)}`);
        clearInputArea();
    };
}

function logExpense() {
    clearInputArea();
    const inputArea = document.getElementById("inputArea");
    inputArea.style.display = "block";
    const categories = Object.keys(data.expenses).join(", ");
    inputArea.innerHTML = `
        <label for="expenseCategory">Enter expense category (${categories}):</label>
        <input type="text" id="expenseCategory" placeholder="e.g., feeding">
        <label for="expenseAmount">Enter amount (CFA):</label>
        <input type="number" id="expenseAmount" placeholder="e.g., 300" min="0">
        <button id="submitExpense">Log Expense</button>
        <p id="expenseError" class="error"></p>
    `;

    document.getElementById("submitExpense").onclick = () => {
        const categoryInput = document.getElementById("expenseCategory");
        const amountInput = document.getElementById("expenseAmount");
        const category = categoryInput.value.toLowerCase();
        const amount = parseFloat(amountInput.value);
        const errorDisplay = document.getElementById("expenseError");

        if (!Object.keys(data.expenses).includes(category)) {
            errorDisplay.textContent = `Invalid category. Please choose from ${categories}.`;
            return;
        }
        if (isNaN(amount) || amount < 0) {
            errorDisplay.textContent = "Invalid input. Please enter a positive numerical value for amount.";
            return;
        }

        data.expenses[category] += amount;
        saveData();
        displayOutput(`Logged CFA${amount.toFixed(2)} under ${category}.`);
        clearInputArea();
    };
}

function viewExpenseReport() {
    clearInputArea();
    let reportHtml = "<h3>--- Expense Report ---</h3>";
    reportHtml += "<table>";
    reportHtml += "<tr><th>Category</th><th>Amount (CFA)</th></tr>";
    let totalSpent = 0;

    for (const category in data.expenses) {
        reportHtml += `<tr><td>${category.charAt(0).toUpperCase() + category.slice(1)}</td><td>${data.expenses[category].toFixed(2)}</td></tr>`;
        totalSpent += data.expenses[category];
    }

    const remainingAllowance = data.total_allowance - totalSpent;

    reportHtml += `<tr><td><b>Total Spent</b></td><td><b>${totalSpent.toFixed(2)}</b></td></tr>`;
    reportHtml += `<tr><td><b>Remaining Allowance</b></td><td><b>${remainingAllowance.toFixed(2)}</b></td></tr>`;
    reportHtml += "</table>";
    displayOutput(reportHtml);
}

function addStudyReminder() {
    clearInputArea();
    const inputArea = document.getElementById("inputArea");
    inputArea.style.display = "block";
    inputArea.innerHTML = `
        <label for="studyCourse">Enter course for reminder:</label>
        <input type="text" id="studyCourse" placeholder="e.g., Computer Architecture">
        <label for="studyWeekday">Select weekday:</label>
        <select id="studyWeekday">
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
        </select>
        <label for="studyTime">Enter time for reminder (e.g., 7PM):</label>
        <input type="text" id="studyTime" placeholder="e.g., 5PM">
        <button id="submitReminder">Add Reminder</button>
        <p id="reminderError" class="error"></p>
    `;

    document.getElementById("submitReminder").onclick = () => {
        const courseInput = document.getElementById("studyCourse");
        const weekdayInput = document.getElementById("studyWeekday");
        const timeInput = document.getElementById("studyTime");
        const course = courseInput.value.trim();
        const weekday = weekdayInput.value;
        const time = timeInput.value.trim();
        const errorDisplay = document.getElementById("reminderError");

        if (!course || !weekday || !time) {
            errorDisplay.textContent = "Course, weekday, and time cannot be empty.";
            return;
        }

        data.study_schedule.push({course: course, weekday: weekday, time: time});
        saveData();
        displayOutput(`Study reminder added for ${course} on ${weekday} at ${time}.`);
        clearInputArea();
    };
}

function viewStudySchedule() {
    clearInputArea();
    let scheduleHtml = "<h3>--- Study Schedule ---</h3>";
    if (data.study_schedule.length === 0) {
        scheduleHtml += "<p>Your schedule is empty.</p>";
    } else {
        scheduleHtml += "<table>";
        scheduleHtml += "<tr><th>Course</th><th>Weekday</th><th>Time</th></tr>";
        for (const item of data.study_schedule) {
            scheduleHtml += `<tr><td>${item.course}</td><td>${item.weekday}</td><td>${item.time}</td></tr>`;
        }
        scheduleHtml += "</table>";
    }
    displayOutput(scheduleHtml);
}

// Event Listeners
document.getElementById("setAllowanceBtn").onclick = setAllowance;
document.getElementById("logExpenseBtn").onclick = logExpense;
document.getElementById("viewExpenseReportBtn").onclick = viewExpenseReport;
document.getElementById("addStudyReminderBtn").onclick = addStudyReminder;
document.getElementById("viewStudyScheduleBtn").onclick = viewStudySchedule;

// Initialize on page load
loadData();