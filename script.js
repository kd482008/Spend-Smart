// State
let expenses = JSON.parse(localStorage.getItem('spendsmart_expenses')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('spendsmart_budget')) || 0;
let reminders = JSON.parse(localStorage.getItem('spendsmart_reminders')) || [];

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links li');
const pageSections = document.querySelectorAll('.page-section');
const pageTitle = document.getElementById('page-title');
const currentDateDisplay = document.getElementById('current-date-display');
const viewAllLink = document.getElementById('view-all-link');

// Budget Elements
const budgetInput = document.getElementById('monthly-budget-input');
const saveBudgetBtn = document.getElementById('save-budget-btn');

// Form Elements
const expenseForm = document.getElementById('expense-form');
const expDate = document.getElementById('exp-date');
const expCategory = document.getElementById('exp-category');
const expType = document.getElementById('exp-type');
const expAmount = document.getElementById('exp-amount');
const expDesc = document.getElementById('exp-desc');

// Dashboard Elements
const dashTotalSpent = document.getElementById('dash-total-spent');
const dashRemaining = document.getElementById('dash-remaining');
const dashHighestCat = document.getElementById('dash-highest-cat');
const budgetCard = document.getElementById('budget-card');
const suggestionsContainer = document.getElementById('suggestions-container');
const recentExpensesList = document.getElementById('recent-expenses-list');

// History Elements
const historyTableBody = document.getElementById('history-table-body');
const emptyState = document.getElementById('empty-state');
const clearAllBtn = document.getElementById('clear-all-btn');

// Analysis Elements
const categoryBarsContainer = document.getElementById('category-bars-container');
const summaryBudget = document.getElementById('summary-budget');
const summarySpent = document.getElementById('summary-spent');
const summaryRemaining = document.getElementById('summary-remaining');
const budgetPercentText = document.getElementById('budget-percent-text');
const budgetFillBar = document.getElementById('budget-fill-bar');

// Analysis Need/Want Elements
const analysisNeedTotal = document.getElementById('analysis-need-total');
const analysisWantTotal = document.getElementById('analysis-want-total');
const analysisSavingsOpportunity = document.getElementById('analysis-savings-opportunity');

// Reminders Elements
const remindersList = document.getElementById('reminders-list');
const toggleReminderFormBtn = document.getElementById('toggle-reminder-form');
const reminderForm = document.getElementById('reminder-form');
const remTitle = document.getElementById('rem-title');
const remDate = document.getElementById('rem-date');

// Student Mode Elements
const studentAllowance = document.getElementById('student-allowance');
const studentHostelSpent = document.getElementById('student-hostel-spent');
const studentAcademicSpent = document.getElementById('student-academic-spent');
const studentSavings = document.getElementById('student-savings');
const savingsPercentText = document.getElementById('savings-percent-text');
const savingsFillBar = document.getElementById('savings-fill-bar');

// Init
function init() {
    // Set current date in header
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

    // Set default date in form to today
    expDate.valueAsDate = new Date();

    // Set budget input
    if (budgetInput) budgetInput.value = monthlyBudget > 0 ? monthlyBudget : '';

    // Update UI
    updateUI();

    // Initial Reminder Checks
    setTimeout(checkReminderAlerts, 1000);
}

// Navigation Logic
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active class from all
        navLinks.forEach(l => l.classList.remove('active'));
        pageSections.forEach(s => s.classList.remove('active-section'));

        // Add active class to clicked
        link.classList.add('active');
        const targetId = link.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active-section');

        // Update Title
        pageTitle.textContent = link.textContent.trim();
    });
});

viewAllLink.addEventListener('click', () => {
    navLinks[2].click(); // Click History link
});

// Save Budget
saveBudgetBtn.addEventListener('click', () => {
    const newBudget = parseFloat(budgetInput.value);
    if (newBudget > 0) {
        monthlyBudget = newBudget;
        localStorage.setItem('spendsmart_budget', monthlyBudget);
        updateUI();
        showToast('Budget updated successfully!');
    }
});

// Form Submit
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const expense = {
        id: Date.now().toString(),
        date: expDate.value,
        category: expCategory.value,
        type: expType.value || 'Need', // Fallback for old data
        amount: parseFloat(expAmount.value),
        description: expDesc.value
    };

    expenses.push(expense);
    saveExpenses();

    // Reset form except date
    expCategory.value = '';
    if (expType) expType.value = '';
    expAmount.value = '';
    expDesc.value = '';

    updateUI();
    showToast('Expense logged successfully!');

    // Navigate back to dashboard automatically
    if (navLinks.length > 0) navLinks[0].click();
});

// Reminder Form Submit
if (toggleReminderFormBtn) {
    toggleReminderFormBtn.addEventListener('click', () => {
        reminderForm.classList.toggle('hidden');
    });
}

if (reminderForm) {
    reminderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newRem = {
            id: Date.now().toString(),
            title: remTitle.value,
            date: remDate.value
        };
        reminders.push(newRem);
        localStorage.setItem('spendsmart_reminders', JSON.stringify(reminders));

        remTitle.value = '';
        remDate.value = '';
        reminderForm.classList.add('hidden');

        updateUI();
        showToast('Reminder added successfully!');
    });
}

// Delete Expense
function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    updateUI();
    showToast('Expense removed!');
}

// Delete Reminder
function deleteReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    localStorage.setItem('spendsmart_reminders', JSON.stringify(reminders));
    updateUI();
    showToast('Reminder completed/removed!');
}

// Clear All
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all expenses? This cannot be undone.')) {
        expenses = [];
        saveExpenses();
        updateUI();
        showToast('All expenses cleared!');
    }
});

// Core Logic & UI Update
function updateUI() {
    renderHistoryTable();
    updateDashboard();
    renderAnalysis();
    renderReminders();
    renderStudentMode();
}

function saveExpenses() {
    localStorage.setItem('spendsmart_expenses', JSON.stringify(expenses));
}

// Format Currency
const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

// Get Category Icon
const getCatIcon = (category) => {
    const icons = {
        'Food': '🍔',
        'Travel': '🚗',
        'Shopping': '🛍️',
        'Bills': '🧾',
        'Recharge': '📱',
        'Personal': '💅',
        'Hostel': '🛏️',
        'Exam Fees': '📝',
        'Study Material': '📚',
        'Other': '📦'
    };
    return icons[category] || '📦';
};

// Render History
function renderHistoryTable() {
    historyTableBody.innerHTML = '';

    if (expenses.length === 0) {
        emptyState.classList.remove('hidden');
        document.querySelector('.data-table').classList.add('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    document.querySelector('.data-table').classList.remove('hidden');

    // Sort descending by date
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(exp => {
        const tr = document.createElement('tr');

        let typeBadge = '';
        if (exp.type) {
            const badgeColor = exp.type === 'Need' ? 'var(--success)' : 'var(--warning)';
            const badgeBg = exp.type === 'Need' ? '#dcfce7' : '#fef3c7'; // success-bg and warning-bg
            typeBadge = `<span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; background: ${badgeBg}; color: ${badgeColor}; margin-left: 5px; font-weight: 600;">${exp.type}</span>`;
        }

        tr.innerHTML = `
            <td>${new Date(exp.date).toLocaleDateString()}</td>
            <td><span class="cat-badge cat-${exp.category.replace(/\s+/g, '-')}">${getCatIcon(exp.category)} ${exp.category}</span>${typeBadge}</td>
            <td>${exp.description}</td>
            <td class="amt-text">${formatCurrency(exp.amount)}</td>
            <td>
                <button class="action-btn" onclick="deleteExpense('${exp.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        historyTableBody.appendChild(tr);
    });
}

// Update Dashboard Stats & Suggestions
function updateDashboard() {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = monthlyBudget - totalSpent;

    dashTotalSpent.textContent = formatCurrency(totalSpent);
    dashRemaining.textContent = formatCurrency(remaining);

    // Handle Budget Warning Colors
    if (monthlyBudget === 0) {
        budgetCard.className = 'card stat-card primary-gradient';
        dashRemaining.textContent = formatCurrency(0);
    } else if (remaining < 0) {
        budgetCard.className = 'card stat-card danger-gradient';
        dashRemaining.textContent = `- ${formatCurrency(Math.abs(remaining))} (Over)`;
    } else if (remaining < (monthlyBudget * 0.2)) {
        budgetCard.className = 'card stat-card warning-gradient';
    } else {
        budgetCard.className = 'card stat-card success-gradient';
    }

    // Calculate category totals
    const catTotals = {};
    expenses.forEach(exp => {
        catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount;
    });

    // Highest Category
    let highestCat = 'None';
    let highestAmt = 0;
    for (const [cat, amt] of Object.entries(catTotals)) {
        if (amt > highestAmt) {
            highestAmt = amt;
            highestCat = cat;
        }
    }

    dashHighestCat.textContent = highestCat !== 'None' ? `${highestCat}` : 'None';

    // Recent Expenses Snippet
    recentExpensesList.innerHTML = '';
    const recent = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

    if (recent.length === 0) {
        recentExpensesList.innerHTML = '<p class="text-muted text-center" style="margin-top: 2rem;">No recent expenses.</p>';
    } else {
        recent.forEach(exp => {
            recentExpensesList.innerHTML += `
                <li class="recent-item">
                    <div class="recent-icon-wrap">
                        <div class="recent-icon cat-${exp.category.replace(/\s+/g, '-')}">${getCatIcon(exp.category)}</div>
                        <div class="recent-details">
                            <h4>${exp.description}</h4>
                            <p>${new Date(exp.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="amt-text">${formatCurrency(exp.amount)}</div>
                </li>
            `;
        });
    }

    // Smart Suggestions Engine
    suggestionsContainer.innerHTML = '';
    let suggestions = [];

    if (totalSpent > 0) {
        if (monthlyBudget === 0) {
            suggestions.push({
                icon: 'fa-info-circle',
                text: 'Please set your Monthly Budget in the sidebar to get personalized overspending alerts.'
            });
        } else if (remaining < 0) {
            suggestions.push({
                icon: 'fa-triangle-exclamation',
                text: 'You have exceeded your monthly budget! Stop all non-essential spending immediately.'
            });
        } else if (totalSpent >= monthlyBudget * 0.8) {
            suggestions.push({
                icon: 'fa-circle-exclamation',
                text: '⚠️ You already used 80% of your monthly budget. Your monthly budget limit is about to cross.'
            });
        }

        // Analyze percentage
        for (const [cat, amt] of Object.entries(catTotals)) {
            const percentage = (amt / totalSpent) * 100;
            const savingsAmount = formatCurrency(amt * 0.20);

            if (cat === 'Food' && percentage > 30) {
                suggestions.push({ icon: 'fa-utensils', text: `If you reduce food delivery by 20%, you can save ${savingsAmount}/month. Try cooking meals at home.` });
            }
            if (cat === 'Shopping' && percentage > 25) {
                suggestions.push({ icon: 'fa-bag-shopping', text: `Try reducing shopping expenses this month. Cutting back 20% saves you ${savingsAmount}.` });
            }
            if (cat === 'Travel' && percentage > 20) {
                suggestions.push({ icon: 'fa-car', text: `High travel costs detected. Consider public transport or carpooling. You could save ${savingsAmount} by cutting back.` });
            }
            if (cat === 'Recharge' && percentage > 15) {
                suggestions.push({ icon: 'fa-mobile', text: 'Subscription/Recharge costs are high. Review your plans for cheaper alternatives.' });
            }
        }
    }

    if (suggestions.length === 0 && totalSpent > 0 && remaining > 0) {
        suggestionsContainer.innerHTML = `
            <div class="suggestion-item" style="border-left-color: var(--success); background: #f0fdf4;">
                <i class="fa-solid fa-thumbs-up" style="color: var(--success)"></i>
                <span>Your spending looks highly optimized! Keep up the good work.</span>
            </div>
        `;
    } else if (suggestions.length === 0) {
        suggestionsContainer.innerHTML = '<p class="text-muted">Add more expenses to get personalized AI insights.</p>';
    } else {
        suggestions.forEach(s => {
            suggestionsContainer.innerHTML += `
                <div class="suggestion-item">
                    <i class="fa-solid ${s.icon}"></i>
                    <span>${s.text}</span>
                </div>
            `;
        });
    }
}

// Render Analysis
function renderAnalysis() {
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = monthlyBudget - totalSpent;

    summaryBudget.textContent = formatCurrency(monthlyBudget);
    summarySpent.textContent = formatCurrency(totalSpent);
    summaryRemaining.textContent = formatCurrency(remaining);

    if (remaining < 0) {
        summaryRemaining.classList.add('danger-text');
        summaryRemaining.textContent = `- ${formatCurrency(Math.abs(remaining))}`;
    } else {
        summaryRemaining.classList.remove('danger-text');
    }

    // Budget Bar
    let percentUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
    if (percentUsed > 100) percentUsed = 100;

    budgetPercentText.textContent = `${Math.round(percentUsed)}%`;
    budgetFillBar.style.width = `${percentUsed}%`;

    if (percentUsed > 90) {
        budgetFillBar.style.background = 'var(--danger)';
    } else if (percentUsed > 75) {
        budgetFillBar.style.background = 'var(--warning)';
    } else {
        budgetFillBar.style.background = 'var(--success)';
    }

    // Category Bars
    const catTotals = {};
    expenses.forEach(exp => {
        catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount;
    });

    categoryBarsContainer.innerHTML = '';

    // Sort categories by amount
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    if (sortedCats.length === 0) {
        categoryBarsContainer.innerHTML = '<p class="text-muted text-center py-4">No data to analyze.</p>';
        return;
    }

    // Max amount for bar scale
    const maxAmt = sortedCats[0][1];

    sortedCats.forEach(([cat, amt]) => {
        const barWidth = (amt / maxAmt) * 100;

        categoryBarsContainer.innerHTML += `
            <div class="bar-row">
                <div class="bar-label">${cat}</div>
                <div class="bar-track">
                    <div class="bar-fill cat-${cat.replace(/\s+/g, '-')}" style="width: ${barWidth}%; background-color: inherit; filter: brightness(0.8);"></div>
                </div>
                <div class="bar-amt">${formatCurrency(amt)}</div>
            </div>
        `;
    });

    // Spend vs Need Calculations
    if (analysisNeedTotal && analysisWantTotal && analysisSavingsOpportunity) {
        const needSum = expenses.filter(e => e.type === 'Need').reduce((s, e) => s + e.amount, 0);
        const wantSum = expenses.filter(e => e.type === 'Want').reduce((s, e) => s + e.amount, 0);

        analysisNeedTotal.textContent = formatCurrency(needSum);
        analysisWantTotal.textContent = formatCurrency(wantSum);
        analysisSavingsOpportunity.textContent = formatCurrency(wantSum * 0.20);
    }
}

// Render Reminders
function renderReminders() {
    if (!remindersList) return;
    remindersList.innerHTML = '';

    if (reminders.length === 0) {
        remindersList.innerHTML = '<p class="text-muted text-center" style="margin-top:1rem;">No upcoming reminders.</p>';
        return;
    }

    // Sort by date ascending
    const sorted = [...reminders].sort((a, b) => new Date(a.date) - new Date(b.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    sorted.forEach(rem => {
        const d = new Date(rem.date);
        d.setHours(0, 0, 0, 0);

        let colorClass = "text-primary";
        let timeText = d.toLocaleDateString();

        const diffTime = d.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            colorClass = "text-danger";
            timeText = "Overdue";
        } else if (diffDays === 0) {
            colorClass = "text-danger";
            timeText = "Due Today";
        } else if (diffDays === 1) {
            colorClass = "text-warning";
            timeText = "Due Tomorrow";
        } else if (diffDays <= 7) {
            colorClass = "text-warning";
            timeText = `In ${diffDays} days`;
        }

        remindersList.innerHTML += `
            <li class="recent-item">
                <div class="recent-icon-wrap">
                    <div class="recent-icon" style="background: var(--bg-color);"><i class="fa-solid fa-bell ${colorClass}"></i></div>
                    <div class="recent-details">
                        <h4>${rem.title}</h4>
                        <p class="${colorClass === 'text-danger' ? 'danger-text' : 'text-muted'}" style="font-size: 0.8rem;">${timeText}</p>
                    </div>
                </div>
                <button class="action-btn" onclick="deleteReminder('${rem.id}')" title="Mark as done"><i class="fa-solid fa-check"></i></button>
            </li>
        `;
    });
}

function checkReminderAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    reminders.forEach(rem => {
        const d = new Date(rem.date);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === today.getTime()) {
            showToast(`Your reminder: ${rem.title} is due TODAY!`);
        } else if (d.getTime() === tomorrow.getTime()) {
            showToast(`Your reminder: ${rem.title} is due tomorrow!`);
        }
    });
}

// Render Student Mode
function renderStudentMode() {
    if (!studentAllowance) return;
    const hostelTotal = expenses.filter(e => e.category === 'Hostel' || e.category === 'Food').reduce((s, e) => s + e.amount, 0);
    const academicTotal = expenses.filter(e => e.category === 'Exam Fees' || e.category === 'Study Material').reduce((s, e) => s + e.amount, 0);
    const otherTotal = expenses.reduce((s, e) => s + e.amount, 0) - hostelTotal - academicTotal;

    studentAllowance.textContent = formatCurrency(monthlyBudget);
    studentHostelSpent.textContent = formatCurrency(hostelTotal);
    studentAcademicSpent.textContent = formatCurrency(academicTotal);

    const savings = monthlyBudget - (hostelTotal + academicTotal + otherTotal);
    studentSavings.textContent = formatCurrency(savings);

    if (savings < 0) {
        studentSavings.style.color = 'var(--danger)';
    } else {
        studentSavings.style.color = 'var(--success)';
    }

    let savingsPercent = monthlyBudget > 0 ? (savings / monthlyBudget) * 100 : 0;
    if (savingsPercent < 0) savingsPercent = 0;
    if (savingsPercent > 100) savingsPercent = 100;

    if (savingsPercentText) savingsPercentText.textContent = `${savingsPercent.toFixed(1)}%`;
    if (savingsFillBar) savingsFillBar.style.width = `${savingsPercent}%`;
}

// Toast Notification System
function showToast(message) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');

    msgEl.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Start App
init();
