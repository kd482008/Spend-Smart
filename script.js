const STORAGE_KEY = 'spendSmartDashboardData';
const THEME_KEY = 'spendSmartTheme';
const MONTHS_TO_SHOW = 12;
const DEFAULT_THEME = 'dark';

const categoryMeta = {
    Food: { icon: '🍔', color: '#fee2e2', textColor: '#b91c1c' },
    Travel: { icon: '🚗', color: '#e0e7ff', textColor: '#4338ca' },
    Shopping: { icon: '🛍️', color: '#fce7f3', textColor: '#be185d' },
    Bills: { icon: '🧾', color: '#fef3c7', textColor: '#b45309' },
    Recharge: { icon: '📱', color: '#dcfce7', textColor: '#15803d' },
    Personal: { icon: '💅', color: '#f3e8ff', textColor: '#7e22ce' },
    Hostel: { icon: '🛏️', color: '#fecdd3', textColor: '#be123c' },
    'Exam Fees': { icon: '📝', color: '#fca5a5', textColor: '#991b1b' },
    'Study Material': { icon: '📚', color: '#fbcfe8', textColor: '#be185d' },
    Other: { icon: '📦', color: '#f1f5f9', textColor: '#334155' }
};

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

let state = {
    months: [],
    activeMonthIndex: 0,
    dataByMonth: {},
    searchQuery: '',
    theme: DEFAULT_THEME
};

let pdfLibLoadPromise = null;

function loadPdfLibraries() {
    if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
        return Promise.resolve();
    }
    if (pdfLibLoadPromise) {
        return pdfLibLoadPromise;
    }
    pdfLibLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        script.onload = () => {
            const autoTable = document.createElement('script');
            autoTable.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
            autoTable.crossOrigin = 'anonymous';
            autoTable.referrerPolicy = 'no-referrer';
            autoTable.onload = () => {
                const h2c = document.createElement('script');
                h2c.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                h2c.crossOrigin = 'anonymous';
                h2c.referrerPolicy = 'no-referrer';
                h2c.onload = () => resolve();
                h2c.onerror = () => reject(new Error('Failed to load html2canvas'));
                document.body.appendChild(h2c);
            };
            autoTable.onerror = () => reject(new Error('Failed to load jsPDF AutoTable'));
            document.body.appendChild(autoTable);
        };
        script.onerror = () => reject(new Error('Failed to load jsPDF'));
        document.body.appendChild(script);
    });
    return pdfLibLoadPromise;
}

const dom = {
    sidebarItems: document.querySelectorAll('.nav-links li'),
    sections: document.querySelectorAll('.page-section'),
    prevMonthBtn: document.getElementById('prev-month-btn'),
    nextMonthBtn: document.getElementById('next-month-btn'),
    monthSelector: document.getElementById('month-selector'),
    monthStatusBadge: document.getElementById('month-status-badge'),
    currentDateDisplay: document.getElementById('current-date-display'),
    headerMonthLabel: document.getElementById('header-month-label'),
    pageTitle: document.getElementById('page-title'),
    budgetInput: document.getElementById('monthly-budget-input'),
    saveBudgetBtn: document.getElementById('save-budget-btn'),
    budgetHintText: document.getElementById('budget-hint-text'),
    totalSpent: document.getElementById('dash-total-spent'),
    remainingBudget: document.getElementById('dash-remaining'),
    highestCategory: document.getElementById('dash-highest-cat'),
    budgetPercentBadge: document.getElementById('budget-percent-badge'),
    budgetProgressFill: document.getElementById('budget-progress-fill'),
    budgetProgressLabel: document.getElementById('budget-progress-label'),
    suggestionsContainer: document.getElementById('suggestions-container'),
    recentExpensesList: document.getElementById('recent-expenses-list'),
    expenseForm: document.getElementById('expense-form'),
    expenseDate: document.getElementById('exp-date'),
    expenseType: document.getElementById('exp-type'),
    expenseCategory: document.getElementById('exp-category'),
    expenseAmount: document.getElementById('exp-amount'),
    expenseDesc: document.getElementById('exp-desc'),
    addExpenseMonthLabel: document.getElementById('add-expense-month-label'),
    viewAllLink: document.getElementById('view-all-link'),
    historySearch: document.getElementById('history-search'),
    clearAllBtn: document.getElementById('clear-all-btn'),
    historyTableBody: document.getElementById('history-table-body'),
    historyMonthLabel: document.getElementById('history-month-label'),
    emptyState: document.getElementById('empty-state'),
    analysisMonthLabel: document.getElementById('analysis-month-label'),
    summaryBudget: document.getElementById('summary-budget'),
    summarySpent: document.getElementById('summary-spent'),
    summaryRemaining: document.getElementById('summary-remaining'),
    budgetPercentText: document.getElementById('budget-percent-text'),
    budgetFillBar: document.getElementById('budget-fill-bar'),
    categoryBarsContainer: document.getElementById('category-bars-container'),
    needWantVisual: document.getElementById('need-want-visual'),
    analysisNeedTotal: document.getElementById('analysis-need-total'),
    analysisWantTotal: document.getElementById('analysis-want-total'),
    analysisSavingsOpportunity: document.getElementById('analysis-savings-opportunity'),
    monthNotes: document.getElementById('month-notes'),
    saveNotesBtn: document.getElementById('save-notes-btn'),
    monthlyBarChart: document.getElementById('monthly-bar-chart'),
    trendsTableBody: document.getElementById('trends-table-body'),
    trendsEmpty: document.getElementById('trends-empty'),
    alltimeCategories: document.getElementById('alltime-categories'),
    financialStory: document.getElementById('financial-story'),
    toggleReminderForm: document.getElementById('toggle-reminder-form'),
    reminderForm: document.getElementById('reminder-form'),
    reminderTitle: document.getElementById('rem-title'),
    reminderDate: document.getElementById('rem-date'),
    remindersList: document.getElementById('reminders-list'),
    openReportPanelBtn: document.getElementById('open-report-panel-btn'),
    reportPanel: document.getElementById('report-panel'),
    reportMonthSelector: document.getElementById('report-month-selector'),
    generateReportBtn: document.getElementById('generate-report-btn'),
    reportStatusText: document.getElementById('report-status-text'),
    activeMonthCalendarBtn: document.getElementById('active-month-calendar-btn'),
    monthCalendarPopup: document.getElementById('month-calendar-popup'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message'),
    themeToggleBtn: document.getElementById('theme-toggle-btn')
};


function buildMonthCalendar(index) {
    const popup = document.getElementById('month-calendar-popup');
    if (!popup) return;
    const monthObj = state.months[index] || state.months[state.activeMonthIndex];
    const [yearStr, monthStr] = monthObj.value.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr) - 1; // 0-based
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();
    const startWeekday = first.getDay(); // 0 Sun .. 6 Sat

    // Collect expense days for marker
    const data = getMonthData(index);
    const expenseDays = new Set(data.expenses.map((e) => {
        try { return new Date(e.date).getDate(); } catch { return null; }
    }));

    let html = `<div class="cal-header"><strong>${monthNames[month]} ${year}</strong><button id="cal-close" class="btn-text">Close</button></div>`;
    html += '<table><thead><tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr></thead><tbody>';
    let day = 1;
    for (let week = 0; week < 6; week++) {
        html += '<tr>';
        for (let wd = 0; wd < 7; wd++) {
            if (week === 0 && wd < startWeekday) {
                html += '<td></td>';
            } else if (day > daysInMonth) {
                html += '<td></td>';
            } else {
                const isToday = (() => {
                    const t = new Date();
                    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
                })();
                const hasExpense = expenseDays.has(day);
                const classes = ['day'];
                if (isToday) classes.push('today');
                if (hasExpense) classes.push('has-expense');
                html += `<td class="${classes.join(' ')}">${day}</td>`;
                day++;
            }
        }
        html += '</tr>';
        if (day > daysInMonth) break;
    }
    html += '</tbody></table>';
    popup.innerHTML = html;

    const closeBtn = popup.querySelector('#cal-close');
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); popup.classList.add('hidden'); popup.setAttribute('aria-hidden','true'); });
}

function toggleCalendarPopup(e) {
    e && e.stopPropagation();
    const popup = dom.monthCalendarPopup;
    if (!popup) return;
    const isHidden = popup.classList.toggle('hidden');
    popup.setAttribute('aria-hidden', String(isHidden));
    if (!isHidden) buildMonthCalendar(state.activeMonthIndex);
}

function generateMonthList(length) {
    const result = [];
    const now = new Date();
    for (let i = length - 1; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push({
            label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
            value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        });
    }
    return result;
}

function loadState() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return {
            activeMonthIndex: MONTHS_TO_SHOW - 1,
            dataByMonth: {},
            theme: DEFAULT_THEME
        };
    }
    try {
        const parsed = JSON.parse(stored);
        return {
            activeMonthIndex: typeof parsed.activeMonthIndex === 'number' ? parsed.activeMonthIndex : MONTHS_TO_SHOW - 1,
            dataByMonth: parsed.dataByMonth || {},
            theme: parsed.theme === 'light' ? 'light' : DEFAULT_THEME
        };
    } catch (error) {
        console.warn('Unable to load saved dashboard data.', error);
        return {
            activeMonthIndex: MONTHS_TO_SHOW - 1,
            dataByMonth: {},
            theme: DEFAULT_THEME
        };
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        activeMonthIndex: state.activeMonthIndex,
        dataByMonth: state.dataByMonth,
        theme: state.theme
    }));
}

function applyTheme(theme) {
    document.documentElement.classList.toggle('light-mode', theme === 'light');
    if (!dom.themeToggleBtn) return;
    const icon = dom.themeToggleBtn.querySelector('i');
    if (icon) {
        icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    dom.themeToggleBtn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    saveState();
    showToast(state.theme === 'light' ? 'Light mode enabled' : 'Dark mode enabled');
}

function getMonthKey(index) {
    return state.months[index].value;
}

function getMonthData(index) {
    const key = getMonthKey(index);
    if (!state.dataByMonth[key]) {
        state.dataByMonth[key] = { budget: 0, notes: '', expenses: [], reminders: [] };
    }
    return state.dataByMonth[key];
}

function formatCurrency(amount) {
    return `₹${amount.toFixed(2)}`;
}

function showToast(message) {
    if (!dom.toast || !dom.toastMessage) return;
    dom.toastMessage.textContent = message;
    dom.toast.classList.remove('hidden');
    dom.toast.style.opacity = '1';
    dom.toast.style.transform = 'translateY(0)';
    window.setTimeout(() => {
        dom.toast.classList.add('hidden');
        dom.toast.style.opacity = '';
        dom.toast.style.transform = '';
    }, 1900);
}

function updateDateDisplay() {
    if (!dom.currentDateDisplay) return;
    const now = new Date();
    const formatted = now.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    dom.currentDateDisplay.textContent = formatted;
}

function updateMonthControls() {
    if (!dom.monthSelector || !dom.prevMonthBtn || !dom.nextMonthBtn) return;
    dom.monthSelector.innerHTML = state.months.map((month, index) => `
        <option value="${index}">${month.label}</option>
    `).join('');
    dom.monthSelector.value = String(state.activeMonthIndex);
    dom.prevMonthBtn.disabled = state.activeMonthIndex === 0;
    dom.nextMonthBtn.disabled = state.activeMonthIndex === state.months.length - 1;
}

function updateReportMonthSelector() {
    if (!dom.reportMonthSelector) return;
    dom.reportMonthSelector.innerHTML = state.months.map((month, index) => `
        <option value="${index}">${month.label}</option>
    `).join('');
    dom.reportMonthSelector.value = String(state.activeMonthIndex);
}

async function generateMonthlyReportPDF() {
    try {
        await loadPdfLibraries();
    } catch (error) {
        showToast('PDF library failed to load. Please refresh and try again.');
        return;
    }
    // Determine which month to generate: prefer explicit report selector, otherwise use active month
    const selectedIndex = dom.reportMonthSelector ? Number(dom.reportMonthSelector.value) : state.activeMonthIndex;
    const month = state.months[Math.min(Math.max(selectedIndex || 0, 0), state.months.length - 1)];
    // ensure report view updated
    state.activeMonthIndex = selectedIndex;
    renderReportView();
    const reportEl = document.querySelector('.report-container');
    if (!reportEl || !window.html2canvas || !window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
        showToast('Unable to generate PDF (missing libraries).');
        return;
    }

    try {
        // temporarily ensure light background for capture
        const prevBg = reportEl.style.backgroundColor;
        reportEl.style.background = window.getComputedStyle(reportEl).backgroundColor || '#ffffff';
        const canvas = await window.html2canvas(reportEl, { scale: 2, useCORS: true, logging: false });
        reportEl.style.background = prevBg;

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        const margin = 20;

        // Calculate image dimensions to fit PDF width (keeping aspect)
        const imgW = pdfW - margin * 2;
        const imgH = (canvas.height * imgW) / canvas.width;

        // If image fits on one page
        if (imgH <= pdfH - margin * 2) {
            pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH);
        } else {
            // Multi-page: slice the canvas vertically
            const pageCanvas = document.createElement('canvas');
            const pageCtx = pageCanvas.getContext('2d');
            const sliceHeight = Math.round((canvas.width * (pdfH - margin * 2)) / imgW);
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;
            let yOffset = 0;
            while (yOffset < canvas.height) {
                pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
                pageCtx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
                const sliceData = pageCanvas.toDataURL('image/png');
                const sliceImgH = (sliceHeight * imgW) / canvas.width;
                pdf.addImage(sliceData, 'PNG', margin, margin, imgW, sliceImgH);
                yOffset += sliceHeight;
                if (yOffset < canvas.height) pdf.addPage();
            }
        }

        const fileName = `SpendSmart_Report_${month.label.replace(/\s+/g, '_')}.pdf`;
        pdf.save(fileName);
    } catch (err) {
        console.error('PDF capture error', err);
        showToast('Failed to generate PDF. Try again.');
    }
}

function updateMonthHeader() {
    const month = state.months[state.activeMonthIndex];
    const data = getMonthData(state.activeMonthIndex);
    if (dom.headerMonthLabel) dom.headerMonthLabel.textContent = month.label;
    if (dom.analysisMonthLabel) dom.analysisMonthLabel.textContent = month.label;
    if (dom.historyMonthLabel) dom.historyMonthLabel.textContent = month.label;
    if (dom.addExpenseMonthLabel) dom.addExpenseMonthLabel.textContent = month.label;
    if (dom.monthStatusBadge) {
        const isCurrent = state.activeMonthIndex === state.months.length - 1;
        const statusClass = isCurrent ? 'current-month' : 'past-month';
        dom.monthStatusBadge.className = `month-badge ${statusClass}`;
        dom.monthStatusBadge.textContent = isCurrent ? 'Current Month' : 'Selected Month';
    }
    if (dom.budgetInput) dom.budgetInput.value = data.budget || '';
    if (dom.monthNotes) dom.monthNotes.value = data.notes || '';
    // Update calendar content if open
    if (dom.monthCalendarPopup && !dom.monthCalendarPopup.classList.contains('hidden')) {
        buildMonthCalendar(state.activeMonthIndex);
    }
}

function getCategoryTotals(expenses) {
    return expenses.reduce((totals, expense) => {
        totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount);
        return totals;
    }, {});
}

function getNeedWantTotals(expenses) {
    return expenses.reduce((totals, expense) => {
        if (expense.type === 'Need') totals.need += Number(expense.amount);
        else totals.want += Number(expense.amount);
        return totals;
    }, { need: 0, want: 0 });
}

function getHighestCategory(expenses) {
    const totals = getCategoryTotals(expenses);
    const entries = Object.entries(totals);
    if (!entries.length) return 'None';
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
}

function renderBudgetSummary() {
    const data = getMonthData(state.activeMonthIndex);
    const totalSpent = data.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const remaining = Math.max(data.budget - totalSpent, 0);
    const percent = data.budget > 0 ? Math.min(Math.round((totalSpent / data.budget) * 100), 100) : 0;
    // Dashboard top cards
    if (dom.totalSpent) dom.totalSpent.textContent = formatCurrency(totalSpent);
    if (dom.remainingBudget) dom.remainingBudget.textContent = formatCurrency(remaining);
    if (dom.highestCategory) dom.highestCategory.textContent = getHighestCategory(data.expenses);
    if (dom.budgetPercentBadge) dom.budgetPercentBadge.textContent = `${percent}%`;
    if (dom.budgetProgressLabel) dom.budgetProgressLabel.textContent = `${formatCurrency(totalSpent)} of ${formatCurrency(data.budget || 0)} used`;
    if (dom.budgetProgressFill) dom.budgetProgressFill.style.width = `${percent}%`;

    // Analysis section summary (sync with dashboard values for selected month)
    if (dom.summaryBudget) dom.summaryBudget.textContent = formatCurrency(data.budget || 0);
    if (dom.summarySpent) dom.summarySpent.textContent = formatCurrency(totalSpent);
    if (dom.summaryRemaining) dom.summaryRemaining.textContent = formatCurrency(Math.max((data.budget || 0) - totalSpent, 0));
    if (dom.budgetFillBar) dom.budgetFillBar.style.width = `${percent}%`;
    if (dom.budgetPercentText) dom.budgetPercentText.textContent = `${percent}%`;
}

function renderRecentExpenses() {
    const data = getMonthData(state.activeMonthIndex);
    if (!dom.recentExpensesList) return;
    if (!data.expenses.length) {
        dom.recentExpensesList.innerHTML = '<p class="text-muted text-center" style="margin-top: 2rem;">No recent expenses.</p>';
        return;
    }
    const sorted = [...data.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    dom.recentExpensesList.innerHTML = sorted.slice(0, 5).map((expense) => {
        const meta = categoryMeta[expense.category] || categoryMeta.Other;
        return `
            <li class="recent-item">
                <div class="recent-icon-wrap">
                    <div class="recent-icon" style="background:${meta.color};color:${meta.textColor}">${meta.icon}</div>
                    <div class="recent-details">
                        <h4>${expense.description || expense.category}</h4>
                        <p>${expense.category} · ${expense.type} · ${expense.date}</p>
                    </div>
                </div>
                <div class="recent-amount">${formatCurrency(Number(expense.amount))}</div>
            </li>
        `;
    }).join('');
}

function renderHistory() {
    const data = getMonthData(state.activeMonthIndex);
    if (!dom.historyTableBody || !dom.emptyState) return;
    const query = state.searchQuery.trim().toLowerCase();
    const filtered = data.expenses.filter((expense) => {
        if (!query) return true;
        return [expense.date, expense.category, expense.description, expense.type].some((field) => String(field).toLowerCase().includes(query));
    });
    if (!filtered.length) {
        dom.historyTableBody.innerHTML = '';
        dom.emptyState.classList.remove('hidden');
        return;
    }
    dom.emptyState.classList.add('hidden');
    dom.historyTableBody.innerHTML = filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map((expense) => {
        const categoryClass = `cat-${expense.category.replace(/\s+/g, '-')}`;
        return `
            <tr>
                <td>${expense.date}</td>
                <td><span class="cat-badge ${categoryClass}">${expense.category}</span></td>
                <td>${expense.description}</td>
                <td>${expense.type}</td>
                <td>${formatCurrency(Number(expense.amount))}</td>
                <td><button class="action-btn delete-expense" data-id="${expense.id}" title="Delete Expense"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    }).join('');
}

function renderCategoryBreakdown() {
    const data = getMonthData(state.activeMonthIndex);
    if (!dom.categoryBarsContainer) return;
    const totals = getCategoryTotals(data.expenses);
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
        dom.categoryBarsContainer.innerHTML = '<p class="text-muted text-center py-4">No data to analyze.</p>';
        return;
    }
    const max = entries[0][1] || 1;
    dom.categoryBarsContainer.innerHTML = entries.map(([category, amount]) => {
        const percent = Math.round((amount / max) * 100);
        return `
            <div class="bar-row">
                <span class="bar-label">${category}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${percent}%;background:linear-gradient(90deg, var(--primary), var(--secondary));"></div></div>
                <span class="bar-amt">${formatCurrency(amount)}</span>
            </div>
        `;
    }).join('');
}

function renderNeedWant() {
    const data = getMonthData(state.activeMonthIndex);
    if (!dom.needWantVisual) return;
    const totals = getNeedWantTotals(data.expenses);
    const total = totals.need + totals.want;
    const needPercent = total > 0 ? Math.round((totals.need / total) * 100) : 0;
    const wantPercent = total > 0 ? Math.round((totals.want / total) * 100) : 0;
    const savings = Math.max(Math.round((totals.want * 0.2) * 100) / 100, 0);
    dom.needWantVisual.innerHTML = `
        <div class="simple-line"><span class="simple-label">Need — Essential</span><span class="simple-value">${formatCurrency(totals.need)} (${needPercent}%)</span></div>
        <div class="simple-line"><span class="simple-label">Want — Optional</span><span class="simple-value">${formatCurrency(totals.want)} (${wantPercent}%)</span></div>
    `;
    if (dom.analysisNeedTotal) dom.analysisNeedTotal.textContent = formatCurrency(totals.need);
    if (dom.analysisWantTotal) dom.analysisWantTotal.textContent = formatCurrency(totals.want);
    if (dom.analysisSavingsOpportunity) dom.analysisSavingsOpportunity.textContent = formatCurrency(savings);
}

function updateAnalysis() {
    if (dom.analysisMonthLabel) dom.analysisMonthLabel.textContent = state.months[state.activeMonthIndex].label;
    renderBudgetSummary();
    renderCategoryBreakdown();
    renderNeedWant();
}

function renderTrends() {
    const rows = state.months.map((month, index) => {
        const data = getMonthData(index);
        const totalSpent = data.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const remaining = data.budget - totalSpent;
        const status = data.budget <= 0 ? 'No Budget' : remaining >= 0 ? 'On Track' : 'Over Budget';
        return { month: month.label, budget: data.budget, spent: totalSpent, remaining, transactions: data.expenses.length, status };
    });
    if (!dom.trendsTableBody || !dom.trendsEmpty || !dom.monthlyBarChart) return;
    const hasMultiple = rows.some((row) => row.transactions > 0);
    if (!hasMultiple) {
        dom.monthlyBarChart.innerHTML = '<p class="text-muted text-center">No multi-month data yet.</p>';
        dom.trendsTableBody.innerHTML = '';
        dom.trendsEmpty.classList.remove('hidden');
        return;
    }
    dom.trendsEmpty.classList.add('hidden');
    dom.monthlyBarChart.innerHTML = rows.filter((row) => row.transactions > 0).map((row) => {
        const filled = Math.min(Math.round((row.spent / Math.max(row.budget, 1)) * 100), 100);
        return `
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
                <div style="min-width:100px;font-size:0.95rem;font-weight:700;color:var(--text-main);">${row.month}</div>
                <div style="flex:1;background:var(--border-color);border-radius:999px;height:14px;overflow:hidden;">
                    <div style="width:${filled}%;height:100%;background:linear-gradient(90deg, var(--primary), var(--secondary));"></div>
                </div>
                <div style="min-width:70px;text-align:right;font-size:0.9rem;color:var(--text-light);">${filled}%</div>
            </div>
        `;
    }).join('');
    dom.trendsTableBody.innerHTML = rows.map((row) => `
        <tr>
            <td>${row.month}</td>
            <td>${formatCurrency(row.budget)}</td>
            <td>${formatCurrency(row.spent)}</td>
            <td>${formatCurrency(Math.max(row.remaining, 0))}</td>
            <td>${row.transactions}</td>
            <td>${row.status}</td>
        </tr>
    `).join('');
}

function renderTopCategories() {
    if (!dom.alltimeCategories || !dom.financialStory) return;
    const allExpenses = Object.values(state.dataByMonth).flatMap((monthData) => monthData.expenses);
    if (!allExpenses.length) {
        dom.alltimeCategories.innerHTML = '<p class="text-muted">Your top categories will appear here once you start tracking expenses.</p>';
        dom.financialStory.innerHTML = '<p class="text-muted">Your financial story will appear here as you track more months.</p>';
        return;
    }
    const totals = getCategoryTotals(allExpenses);
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 3);
    dom.alltimeCategories.innerHTML = sorted.map(([category, amount]) => {
        const meta = categoryMeta[category] || categoryMeta.Other;
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.85rem 0;border-bottom:1px solid var(--border-color);">
            <div style="display:flex;align-items:center;gap:0.75rem;"><span style="font-size:1.2rem;">${meta.icon}</span><span>${category}</span></div>
            <strong>${formatCurrency(amount)}</strong>
        </div>`;
    }).join('');
    const totalSpent = allExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const currentMonth = getMonthData(state.activeMonthIndex);
    dom.financialStory.innerHTML = `
        <p style="margin-bottom:0.75rem;">So far you have spent <strong>${formatCurrency(totalSpent)}</strong> across all tracked months.</p>
        <p style="margin:0;">Your top spending categories are <strong>${sorted.map(([category]) => category).join(', ')}</strong>. Keep an eye on wants to improve savings.</p>
    `;
    const savingsOpportunity = Math.max(Math.round((getNeedWantTotals(currentMonth.expenses).want * 0.2) * 100) / 100, 0);
    const storyNote = savingsOpportunity > 0 ? `This month you could save an estimated ${formatCurrency(savingsOpportunity)} by reducing optional spend.` : 'Track more expenses to unlock budget improvement insights.';
    dom.financialStory.innerHTML += `<p class="text-muted" style="margin-top:1rem;">${storyNote}</p>`;
}

// Student Mode removed — replaced by Smart AI Advisor

function renderReminders() {
    const data = getMonthData(state.activeMonthIndex);
    if (!dom.remindersList) return;
    if (!data.reminders.length) {
        dom.remindersList.innerHTML = '<p class="text-muted text-center" style="margin-top: 2rem;">No upcoming reminders.</p>';
        return;
    }
    dom.remindersList.innerHTML = data.reminders.sort((a, b) => new Date(a.date) - new Date(b.date)).map((reminder) => `
        <li class="recent-item">
            <div class="recent-icon-wrap">
                <div class="recent-icon" style="background:#e0f2fe;color:#0369a1;">📌</div>
                <div class="recent-details">
                    <h4>${reminder.title}</h4>
                    <p>${reminder.date}</p>
                </div>
            </div>
            <button class="action-btn delete-reminder" data-id="${reminder.id}" title="Remove Reminder"><i class="fa-solid fa-trash"></i></button>
        </li>
    `).join('');
}

function renderSuggestions() {
    const data = getMonthData(state.activeMonthIndex);
    if (!dom.suggestionsContainer) return;
    if (!data.expenses.length) {
        dom.suggestionsContainer.innerHTML = '<p class="text-muted">Add expenses to get personalized insights.</p>';
        return;
    }
    const totals = getNeedWantTotals(data.expenses);
    const highestCategory = getHighestCategory(data.expenses);
    const savingsOpportunity = Math.max(Math.round((totals.want * 0.2) * 100) / 100, 0);
    dom.suggestionsContainer.innerHTML = `
        <div class="suggestion-item">
            <i class="fa-solid fa-lightbulb"></i>
            <p>Focus on reducing <strong>${highestCategory}</strong> spend this month to stay within budget.</p>
        </div>
        <div class="suggestion-item">
            <i class="fa-solid fa-chart-line"></i>
            <p>You can save up to <strong>${formatCurrency(savingsOpportunity)}</strong> by trimming optional expenses.</p>
        </div>
    `;
}

function getAISuggestions(data, totalSpent, percentUsed, needWant) {
    const suggestions = [];
    const totals = getCategoryTotals(data.expenses);
    const highest = getHighestCategory(data.expenses);
    const highestAmount = totals[highest] || 0;
    const highestShare = totalSpent > 0 ? Math.round((highestAmount / totalSpent) * 100) : 0;

    // Prioritize category attention if it dominates spend
    if (highestShare >= 35) {
        suggestions.push(`${highest} accounts for ${highestShare}% of your spending — consider reducing ${highest.toLowerCase()} purchases this month.`);
    }

    // Budget usage suggestions
    if (percentUsed >= 90) {
        suggestions.push(`Budget alert: you've used ${percentUsed}% of your monthly budget. Pause discretionary purchases and review recent transactions.`);
    } else if (percentUsed >= 75) {
        suggestions.push(`You're at ${percentUsed}% of your budget — trim optional spending and monitor daily expenses.`);
    }

    // Need vs Want advice
    if (needWant.want > needWant.need && needWant.want > 0) {
        const potential = Math.round((needWant.want * 0.15) * 100) / 100;
        suggestions.push(`Optional spend is higher than essentials. Cutting wants by 15% could save about ${formatCurrency(potential)} this month.`);
    }

    // Trend-based alert
    if (state.activeMonthIndex > 0) {
        const prev = getMonthData(state.activeMonthIndex - 1);
        const prevSpent = prev.expenses.reduce((s, e) => s + Number(e.amount), 0);
        if (prevSpent > 0 && totalSpent > prevSpent * 1.15) {
            const increase = Math.round(((totalSpent - prevSpent) / prevSpent) * 100);
            suggestions.unshift(`Spending increased ${increase}% vs last month — review any large or recurring charges.`);
        }
    }

    // Ensure suggestions are relevant and not generic; limit to 3
    const unique = Array.from(new Set(suggestions));
    return unique.slice(0, 3);
}

function renderSmartAIAdvisor() {
    const data = getMonthData(state.activeMonthIndex);
    const container = document.getElementById('smart-insights');
    const details = document.getElementById('smart-advisor-details');
    if (!container || !details) return;
    if (!data.expenses.length) {
        container.innerHTML = '<p class="text-muted">No expenses yet — add some to get AI-driven insights.</p>';
        details.innerHTML = '<p class="text-muted">No data available. Add expenses to receive personalized recommendations.</p>';
        return;
    }

    const totalSpent = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
    const highest = getHighestCategory(data.expenses);
    const percentUsed = data.budget > 0 ? Math.min(Math.round((totalSpent / data.budget) * 100), 100) : 0;

    const needWant = getNeedWantTotals(data.expenses);
    const suggestions = [];
    if (percentUsed >= 90) suggestions.push('Alert: You are very close to exceeding your budget this month. Review recent expenses.');
    else if (percentUsed >= 75) suggestions.push('Warning: You have used ' + percentUsed + '% of your budget. Consider trimming wants.');
    else suggestions.push('Good job — budget usage is within a safe range. Keep tracking.');

    if (needWant.want > needWant.need && needWant.want > 0) {
        suggestions.push('You spend more on optional items. Try reducing non-essential purchases to save more.');
    }

    // Detect recent increase vs previous month
    let trendNote = '';
    if (state.activeMonthIndex > 0) {
        const prev = getMonthData(state.activeMonthIndex - 1);
        const prevSpent = prev.expenses.reduce((s, e) => s + Number(e.amount), 0);
        if (prevSpent > 0 && totalSpent > prevSpent * 1.15) {
            trendNote = `Alert: Spending increased ${(Math.round(((totalSpent - prevSpent) / prevSpent) * 100))}% from last month.`;
            suggestions.unshift(trendNote);
        }
    }

    // Compose insights
    const insights = [
        `Your highest spending category is <strong>${highest}</strong>.`,
        `You have used <strong>${percentUsed}%</strong> of your monthly budget.`,
        `Total spent this month: <strong>${formatCurrency(totalSpent)}</strong>.`,
        ...suggestions.map((s) => s)
    ];

    container.innerHTML = `
        <ul class="advisor-list">
            ${insights.map((ins) => `<li class="advisor-insight">${ins}</li>`).join('')}
        </ul>
    `;

    details.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
            <div style="display:flex;justify-content:space-between;"><span class="text-muted">Budget</span><strong>${formatCurrency(data.budget || 0)}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span class="text-muted">Spent</span><strong>${formatCurrency(totalSpent)}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span class="text-muted">Remaining</span><strong>${formatCurrency(Math.max((data.budget || 0) - totalSpent, 0))}</strong></div>
            <div style="margin-top:0.5rem;display:flex;gap:0.5rem;align-items:center;">
                <button class="btn btn-primary" id="ai-action-suggest">Get suggestions</button>
                <span class="text-muted" style="font-size:0.9rem;">Click to see specific, data-driven recommendations</span>
            </div>
            <div id="ai-suggestions-list" style="margin-top:0.75rem;"></div>
        </div>
    `;

    const actionBtn = document.getElementById('ai-action-suggest');
    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            const suggs = getAISuggestions(data, totalSpent, percentUsed, needWant);
            const listEl = document.getElementById('ai-suggestions-list');
            if (listEl) {
                if (!suggs.length) {
                    listEl.innerHTML = '<p class="text-muted">No specific suggestions right now. Keep tracking expenses for tailored advice.</p>';
                } else {
                    listEl.innerHTML = `<ul class="advisor-list">${suggs.map((s) => `<li class="advisor-insight">${s}</li>`).join('')}</ul>`;
                }
            }
            if (suggs[0]) showToast(suggs[0]);
        });
    }
}

function renderAll() {
    updateMonthControls();
    updateReportMonthSelector();
    updateMonthHeader();
    updateDateDisplay();
    renderRecentExpenses();
    renderHistory();
    updateAnalysis();
    renderTrends();
    renderTopCategories();
    renderSmartAIAdvisor();
    renderReminders();
    renderSuggestions();
    renderReportView();
}

function renderReportView() {
    // Fill report table
    const tbody = document.getElementById('report-table-body');
    const legendEl = document.getElementById('category-legend');
    const canvas = document.getElementById('category-pie-chart');
    if (!tbody) return;
    const data = getMonthData(state.activeMonthIndex);
    // Update summary cards
    const totalBudgetEl = document.getElementById('report-total-budget');
    const totalSpentEl = document.getElementById('report-total-spent');
    const remainingEl = document.getElementById('report-remaining-budget');
    const totalExpensesEl = document.getElementById('report-total-expenses');
    const monthTitleEl = document.getElementById('report-month-title');
    const genDateEl = document.getElementById('report-generated-date');
    const genTimeEl = document.getElementById('report-generated-time');
    const now = new Date();
    if (monthTitleEl) monthTitleEl.textContent = state.months[state.activeMonthIndex].label;
    if (genDateEl) genDateEl.textContent = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (genTimeEl) genTimeEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const totalSpent = data.expenses.reduce((s, e) => s + Number(e.amount), 0);
    const remaining = Math.max((data.budget || 0) - totalSpent, 0);
    if (totalBudgetEl) totalBudgetEl.textContent = formatCurrency(data.budget || 0);
    if (totalSpentEl) totalSpentEl.textContent = formatCurrency(totalSpent);
    if (remainingEl) remainingEl.textContent = formatCurrency(remaining);
    if (totalExpensesEl) totalExpensesEl.innerHTML = `${data.expenses.length}<br><span class="sc-sub">Transactions</span>`;

    // Need vs Optional for report
    const needEl = document.getElementById('report-need-amount');
    const optEl = document.getElementById('report-optional-amount');
    const needPctEl = document.getElementById('report-need-percent');
    const optPctEl = document.getElementById('report-optional-percent');
    const needWantTotals = getNeedWantTotals(data.expenses);
    const needAmt = needWantTotals.need || 0;
    const optAmt = needWantTotals.want || 0;
    const totNW = needAmt + optAmt || 0;
    const needPct = totNW > 0 ? Math.round((needAmt / totNW) * 100) : 0;
    const optPct = totNW > 0 ? Math.round((optAmt / totNW) * 100) : 0;
    if (needEl) needEl.textContent = formatCurrency(needAmt);
    if (optEl) optEl.textContent = formatCurrency(optAmt);
    if (needPctEl) needPctEl.textContent = `${needPct}%`;
    if (optPctEl) optPctEl.textContent = `${optPct}%`;
    if (!data.expenses.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No expenses recorded for this month.</td></tr>';
    } else {
        tbody.innerHTML = data.expenses.map((expense) => {
            const typeClass = expense.type === 'Need' ? 'type-need' : 'type-opt';
            const meta = categoryMeta[expense.category] || categoryMeta.Other;
            return `
                <tr>
                    <td>${expense.date}</td>
                    <td class="cat-cell"><span class="cat-icon" style="background:${meta.color};color:${meta.textColor}">${meta.icon}</span>${expense.category}</td>
                    <td>${expense.description}</td>
                    <td style="text-align:right">${formatCurrency(Number(expense.amount))}</td>
                    <td><span class="type-badge ${typeClass}">${expense.type === 'Need' ? 'Need' : 'Optional'}</span></td>
                </tr>
            `;
        }).join('');
    }

    // Draw pie chart
    if (!canvas || !legendEl) return;
    const totals = getCategoryTotals(data.expenses);
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const ctx = canvas.getContext('2d');
    const cw = canvas.width; const ch = canvas.height; const cx = cw / 2; const cy = ch / 2; const radius = Math.min(cw, ch) / 2 - 10;
    ctx.clearRect(0, 0, cw, ch);
    if (!entries.length) {
        // placeholder donut
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
        legendEl.innerHTML = '';
        return;
    }
    const total = entries.reduce((s, e) => s + e[1], 0) || 1;
    const colors = ['#2563eb','#10b981','#f59e0b','#6b46c1','#ef4444','#06b6d4','#f97316','#7c3aed'];
    let start = -Math.PI / 2;
    legendEl.innerHTML = '';
    entries.forEach(([category, amount], i) => {
        const slice = (amount / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.fillStyle = colors[i % colors.length];
        ctx.arc(cx, cy, radius, start, start + slice);
        ctx.closePath();
        ctx.fill();
        start += slice;

        const percent = Math.round((amount / total) * 100);
        const colorBox = `<span class="legend-color" style="background:${colors[i % colors.length]}"></span>`;
        legendEl.innerHTML += `<li>${colorBox} <strong>${category}</strong> ${formatCurrency(amount)} (${percent}%)</li>`;
    });
    // draw inner circle for donut effect
    ctx.beginPath(); ctx.fillStyle = '#ffffff'; ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2); ctx.fill();
}

function switchSection(targetId) {
    dom.sections.forEach((section) => {
        section.classList.toggle('active-section', section.id === targetId);
    });
    dom.sidebarItems.forEach((item) => {
        const isActive = item.dataset.target === targetId;
        item.classList.toggle('active', isActive);
    });
    if (!dom.pageTitle) return;
    const titles = {
        'dashboard-section': 'Dashboard',
        'add-expense-section': 'Add Expense',
        'history-section': 'Expense History',
        'analysis-section': 'Analysis',
        'trends-section': 'Trends',
        'smart-ai-advisor-section': 'Smart AI Advisor'
    };
    dom.pageTitle.textContent = titles[targetId] || 'SpendSmart';
}

function setupNavigation() {
    dom.sidebarItems.forEach((item) => {
        item.addEventListener('click', () => {
            const target = item.dataset.target;
            if (!target) return;
            switchSection(target);
        });
    });
}

function initEventHandlers() {
    if (dom.prevMonthBtn) {
        dom.prevMonthBtn.addEventListener('click', () => {
            if (state.activeMonthIndex > 0) {
                state.activeMonthIndex -= 1;
                saveState();
                renderAll();
            }
        });
    }
    if (dom.themeToggleBtn) {
        dom.themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (dom.nextMonthBtn) {
        dom.nextMonthBtn.addEventListener('click', () => {
            if (state.activeMonthIndex < state.months.length - 1) {
                state.activeMonthIndex += 1;
                saveState();
                renderAll();
            }
        });
    }
    if (dom.monthSelector) {
        dom.monthSelector.addEventListener('change', (event) => {
            const index = Number(event.target.value);
            if (Number.isInteger(index) && index >= 0 && index < state.months.length) {
                state.activeMonthIndex = index;
                saveState();
                renderAll();
            }
        });
    }
    if (dom.saveBudgetBtn) {
        dom.saveBudgetBtn.addEventListener('click', () => {
            const data = getMonthData(state.activeMonthIndex);
            const budgetAmount = Number(dom.budgetInput.value) || 0;
            data.budget = budgetAmount;
            saveState();
            renderAll();
            showToast('Budget updated successfully');
        });
    }
    if (dom.budgetInput) {
        dom.budgetInput.addEventListener('change', () => {
            const data = getMonthData(state.activeMonthIndex);
            data.budget = Number(dom.budgetInput.value) || 0;
            saveState();
            renderAll();
        });
    }
    if (dom.openReportPanelBtn && dom.reportPanel) {
        dom.openReportPanelBtn.addEventListener('click', () => {
            const isHidden = dom.reportPanel.classList.toggle('hidden');
            dom.openReportPanelBtn.innerHTML = isHidden
                ? '<i class="fa-solid fa-file-export"></i> Open'
                : '<i class="fa-solid fa-times"></i> Close';
            if (!isHidden) {
                updateReportMonthSelector();
            }
        });
    }
    if (dom.generateReportBtn) {
        dom.generateReportBtn.addEventListener('click', () => {
            generateMonthlyReportPDF();
        });
    }
    if (dom.activeMonthCalendarBtn) {
        dom.activeMonthCalendarBtn.addEventListener('click', (e) => {
            toggleCalendarPopup(e);
        });
    }
    if (dom.monthCalendarPopup) {
        dom.monthCalendarPopup.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    document.addEventListener('click', () => {
        if (dom.monthCalendarPopup && !dom.monthCalendarPopup.classList.contains('hidden')) {
            dom.monthCalendarPopup.classList.add('hidden');
            dom.monthCalendarPopup.setAttribute('aria-hidden','true');
        }
    });
    if (dom.expenseForm) {
        dom.expenseForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const date = dom.expenseDate.value || new Date().toISOString().slice(0, 10);
            const type = dom.expenseType.value;
            const category = dom.expenseCategory.value;
            const amount = Number(dom.expenseAmount.value);
            const description = dom.expenseDesc.value.trim();
            if (!type || !category || !amount || !description) {
                showToast('Please complete all expense fields');
                return;
            }
            const data = getMonthData(state.activeMonthIndex);
            data.expenses.unshift({
                id: `exp-${Date.now()}`,
                date,
                type,
                category,
                amount,
                description
            });
            saveState();
            dom.expenseForm.reset();
            dom.expenseDate.value = new Date().toISOString().slice(0, 10);
            renderAll();
            showToast('Expense added successfully');
        });
    }
    if (dom.viewAllLink) {
        dom.viewAllLink.addEventListener('click', () => {
            switchSection('history-section');
        });
    }
    if (dom.historySearch) {
        dom.historySearch.addEventListener('input', (event) => {
            state.searchQuery = event.target.value;
            renderHistory();
        });
    }
    if (dom.clearAllBtn) {
        dom.clearAllBtn.addEventListener('click', () => {
            const data = getMonthData(state.activeMonthIndex);
            data.expenses = [];
            saveState();
            renderAll();
            showToast('Monthly expense history cleared');
        });
    }
    if (dom.saveNotesBtn) {
        dom.saveNotesBtn.addEventListener('click', () => {
            const data = getMonthData(state.activeMonthIndex);
            data.notes = dom.monthNotes.value.trim();
            saveState();
            showToast('Notes saved for this month');
        });
    }
    if (dom.toggleReminderForm) {
        dom.toggleReminderForm.addEventListener('click', () => {
            if (!dom.reminderForm) return;
            dom.reminderForm.classList.toggle('hidden');
            const label = dom.reminderForm.classList.contains('hidden') ? 'New' : 'Close';
            dom.toggleReminderForm.innerHTML = `<i class="fa-solid fa-plus"></i> ${label}`;
        });
    }
    if (dom.themeToggleBtn) {
        dom.themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (dom.reminderForm) {
        dom.reminderForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = dom.reminderTitle.value.trim();
            const date = dom.reminderDate.value;
            if (!title || !date) {
                showToast('Please enter reminder title and date');
                return;
            }
            const data = getMonthData(state.activeMonthIndex);
            data.reminders.push({ id: `rem-${Date.now()}`, title, date });
            saveState();
            dom.reminderForm.reset();
            dom.reminderForm.classList.add('hidden');
            dom.toggleReminderForm.innerHTML = '<i class="fa-solid fa-plus"></i> New';
            renderReminders();
            showToast('Reminder added');
        });
    }
    if (dom.historyTableBody) {
        dom.historyTableBody.addEventListener('click', (event) => {
            const button = event.target.closest('.delete-expense');
            if (!button) return;
            const expenseId = button.dataset.id;
            const data = getMonthData(state.activeMonthIndex);
            data.expenses = data.expenses.filter((expense) => expense.id !== expenseId);
            saveState();
            renderAll();
            showToast('Expense removed');
        });
    }
    if (dom.remindersList) {
        dom.remindersList.addEventListener('click', (event) => {
            const button = event.target.closest('.delete-reminder');
            if (!button) return;
            const reminderId = button.dataset.id;
            const data = getMonthData(state.activeMonthIndex);
            data.reminders = data.reminders.filter((reminder) => reminder.id !== reminderId);
            saveState();
            renderReminders();
            showToast('Reminder deleted');
        });
    }
}

function setupDefaults() {
    if (dom.expenseDate && !dom.expenseDate.value) {
        dom.expenseDate.value = new Date().toISOString().slice(0, 10);
    }
}

function init() {
    state.months = generateMonthList(MONTHS_TO_SHOW);
    const stored = loadState();
    state.activeMonthIndex = Math.min(Math.max(stored.activeMonthIndex, 0), state.months.length - 1);
    state.dataByMonth = stored.dataByMonth || {};
    state.theme = stored.theme || DEFAULT_THEME;
    applyTheme(state.theme);
    state.months.forEach((month) => {
        if (!state.dataByMonth[month.value]) {
            state.dataByMonth[month.value] = { budget: 0, notes: '', expenses: [], reminders: [] };
        }
    });
    setupDefaults();
    setupNavigation();
    initEventHandlers();
    renderAll();
    window.addEventListener('beforeunload', saveState);
}

document.addEventListener('DOMContentLoaded', init);