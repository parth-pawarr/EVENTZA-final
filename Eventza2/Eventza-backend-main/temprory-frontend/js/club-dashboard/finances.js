document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const currentClubId = localStorage.getItem('clubId') || '1';
    const currentUserId = localStorage.getItem('userId') || '1';
    
    // Financial data containers
    let incomeData = [];
    let expenseData = [];
    let events = [];
    
    // Charts
    let incomeChart = null;
    let expenseChart = null;
    let dashboardFinanceChart = null;
    
    // Initialize finances
    loadFinancialData();
    
    // Event listeners
    document.getElementById('add-income-btn').addEventListener('click', () => showAddIncomeModal());
    document.getElementById('cancel-income-btn').addEventListener('click', hideAddIncomeModal);
    document.getElementById('add-income-form').addEventListener('submit', addIncome);
    
    document.getElementById('add-expense-btn').addEventListener('click', () => showAddExpenseModal());
    document.getElementById('cancel-expense-btn').addEventListener('click', hideAddExpenseModal);
    document.getElementById('add-expense-form').addEventListener('submit', addExpense);
    
    // Functions
    async function loadFinancialData() {
        try {
            // Fetch all events for the club
            const eventsResponse = await fetch(`/api/events?club_id=${currentClubId}`);
            events = await eventsResponse.json();
            
            // Get all event IDs for this club
            const eventIds = events.map(event => event._id);
            
            // Fetch all expenses for events in this club
            const expensesResponse = await fetch(`/api/expenses`);
            const allExpenses = await expensesResponse.json();
            
            // Filter expenses for this club's events
            expenseData = allExpenses.filter(expense => {
                const eventId = typeof expense.event_id === 'object' ? 
                    expense.event_id._id : expense.event_id;
                return eventIds.includes(eventId);
            });
            
            // For now, we'll assume income data is stored in the same way
            // In a real app, you might have a separate income model
            // For demo, we'll generate some sample income data based on events
            incomeData = events.map(event => {
                return {
                    _id: `income-${event._id}`,
                    event_id: event,
                    amount: Math.floor(Math.random() * 5000) + 1000, // Random amount between 1000-6000
                    description: `Registration fees for ${event.event_name}`,
                    created_at: event.date
                };
            });
            
            // Update financial summary
            updateFinancialSummary();
            
            // Render income and expense lists
            renderIncomeList();
            renderExpenseList();
            
            // Generate charts
            generateFinancialCharts();
            
        } catch (error) {
            console.error('Error loading financial data:', error);
            alert('Error loading financial data. Please try again.');
        }
    }
    
    function updateFinancialSummary() {
        const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
        const balance = totalIncome - totalExpenses;
        
        // Update dashboard counters
        document.getElementById('total-income').textContent = `$${totalIncome.toLocaleString()}`;
        document.getElementById('total-expenses-dash').textContent = `$${totalExpenses.toLocaleString()}`;
        
        // Update finances section counters
        document.getElementById('finance-total-income').textContent = `$${totalIncome.toLocaleString()}`;
        document.getElementById('finance-total-expenses').textContent = `$${totalExpenses.toLocaleString()}`;
        document.getElementById('finance-balance').textContent = `$${balance.toLocaleString()}`;
    }
    
    function renderIncomeList() {
        const incomeListElement = document.getElementById('income-list');
        
        if (incomeData.length === 0) {
            incomeListElement.innerHTML = '<tr><td colspan="4" class="py-2 px-4 text-center">No income records found</td></tr>';
            return;
        }
        
        const incomeHtml = incomeData.map(income => {
            const eventName = typeof income.event_id === 'object' ? 
                income.event_id.event_name : 'Unknown Event';
            
            const incomeDate = new Date(income.created_at).toLocaleDateString();
            
            return `
                <tr>
                    <td class="py-2 px-4">${eventName}</td>
                    <td class="py-2 px-4">${income.description}</td>
                    <td class="py-2 px-4">$${income.amount.toLocaleString()}</td>
                    <td class="py-2 px-4">${incomeDate}</td>
                </tr>
            `;
        });
        
        incomeListElement.innerHTML = incomeHtml.join('');
    }
    
    function renderExpenseList() {
        const expenseListElement = document.getElementById('expense-list');
        
        if (expenseData.length === 0) {
            expenseListElement.innerHTML = '<tr><td colspan="4" class="py-2 px-4 text-center">No expense records found</td></tr>';
            return;
        }
        
        const expenseHtml = expenseData.map(expense => {
            const eventName = typeof expense.event_id === 'object' ? 
                expense.event_id.event_name : 'Unknown Event';
            
            const expenseDate = new Date(expense.spent_at).toLocaleDateString();
            
            return `
                <tr>
                    <td class="py-2 px-4">${eventName}</td>
                    <td class="py-2 px-4">${expense.description}</td>
                    <td class="py-2 px-4">$${expense.amount.toLocaleString()}</td>
                    <td class="py-2 px-4">${expenseDate}</td>
                </tr>
            `;
        });
        
        expenseListElement.innerHTML = expenseHtml.join('');
    }
    
    function generateFinancialCharts() {
        // Prepare data for charts
        const eventNames = events.map(event => event.event_name);
        
        // Prepare income data by event
        const incomeByEvent = events.map(event => {
            const eventIncome = incomeData.filter(income => {
                const incomeEventId = typeof income.event_id === 'object' ? 
                    income.event_id._id : income.event_id;
                return incomeEventId === event._id;
            });
            return eventIncome.reduce((sum, income) => sum + income.amount, 0);
        });
        
        // Prepare expense data by event
        const expenseByEvent = events.map(event => {
            const eventExpenses = expenseData.filter(expense => {
                const expenseEventId = typeof expense.event_id === 'object' ? 
                    expense.event_id._id : expense.event_id;
                return expenseEventId === event._id;
            });
            return eventExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        });
        
        // Income chart
        const incomeChartCanvas = document.getElementById('income-chart');
        if (incomeChart) {
            incomeChart.destroy();
        }
        
        incomeChart = new Chart(incomeChartCanvas, {
            type: 'bar',
            data: {
                labels: eventNames,
                datasets: [{
                    label: 'Income',
                    data: incomeByEvent,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
        
        // Expense chart
        const expenseChartCanvas = document.getElementById('expense-chart');
        if (expenseChart) {
            expenseChart.destroy();
        }
        
        expenseChart = new Chart(expenseChartCanvas, {
            type: 'bar',
            data: {
                labels: eventNames,
                datasets: [{
                    label: 'Expenses',
                    data: expenseByEvent,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
        
        // Dashboard finance chart (combined income and expenses)
        const dashboardFinanceChartCanvas = document.getElementById('finance-chart');
        if (dashboardFinanceChart) {
            dashboardFinanceChart.destroy();
        }
        
        dashboardFinanceChart = new Chart(dashboardFinanceChartCanvas, {
            type: 'bar',
            data: {
                labels: eventNames,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeByEvent,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: expenseByEvent,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Show add income modal for a specific event
    function showAddIncomeModal(eventId = null) {
        if (eventId) {
            document.getElementById('income-event-id').value = eventId;
        }
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('income-date').value = today;
        
        document.getElementById('add-income-modal').classList.remove('hidden');
    }
    
    // Hide add income modal
    function hideAddIncomeModal() {
        document.getElementById('add-income-modal').classList.add('hidden');
        document.getElementById('add-income-form').reset();
    }
    
    // Add new income
    async function addIncome(event) {
        event.preventDefault();
        
        const eventId = document.getElementById('income-event-id').value;
        const amount = parseFloat(document.getElementById('income-amount').value);
        const description = document.getElementById('income-description').value;
        const date = document.getElementById('income-date').value;
        
        if (!amount || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (!description) {
            alert('Please enter a description');
            return;
        }
        
        // For this demo, we'll just add it to our in-memory data
        // In a real app, you would save it to the database
        
        // Find the event object
        const eventObj = events.find(e => e._id === eventId);
        
        // Create new income record
        const newIncome = {
            _id: `income-${Date.now()}`, // Generate a unique ID
            event_id: eventObj || eventId,
            amount: amount,
            description: description,
            created_at: new Date(date)
        };
        
        // Add to income data
        incomeData.push(newIncome);
        
        // Update UI
        hideAddIncomeModal();
        loadFinancialData();
        alert('Income added successfully');
    }
    
    // Show add expense modal for a specific event
    function showAddExpenseModal(eventId = null) {
        if (eventId) {
            document.getElementById('expense-event-id').value = eventId;
        }
        
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expense-date').value = today;
        
        document.getElementById('add-expense-modal').classList.remove('hidden');
    }
    
    // Hide add expense modal
    function hideAddExpenseModal() {
        document.getElementById('add-expense-modal').classList.add('hidden');
        document.getElementById('add-expense-form').reset();
    }
    
    // Add new expense
    async function addExpense(event) {
        event.preventDefault();
        
        const eventId = document.getElementById('expense-event-id').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const description = document.getElementById('expense-description').value;
        const date = document.getElementById('expense-date').value;
        
        if (!amount || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (!description) {
            alert('Please enter a description');
            return;
        }
        
        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_id: eventId,
                    amount: amount,
                    description: description,
                    spent_at: new Date(date)
                }),
            });
            
            if (response.ok) {
                hideAddExpenseModal();
                loadFinancialData();
                alert('Expense added successfully');
            } else {
                const error = await response.json();
                alert(`Error adding expense: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Error adding expense. Please try again.');
        }
    }
    
    // Event-specific functions for expense tracking
    window.showEventExpenses = function(eventId) {
        // Filter expenses for this event
        const eventExpenses = expenseData.filter(expense => {
            const expenseEventId = typeof expense.event_id === 'object' ? 
                expense.event_id._id : expense.event_id;
            return expenseEventId === eventId;
        });
        
        const expensesList = document.getElementById('expenses-list');
        
        if (eventExpenses.length === 0) {
            expensesList.innerHTML = '<tr><td colspan="3" class="py-2 px-4 text-center">No expenses recorded yet</td></tr>';
        } else {
            const expensesHtml = eventExpenses.map(expense => {
                const expenseDate = new Date(expense.spent_at).toLocaleDateString();
                
                return `
                    <tr>
                        <td class="py-2 px-4">${expense.description}</td>
                        <td class="py-2 px-4">$${expense.amount.toLocaleString()}</td>
                        <td class="py-2 px-4">${expenseDate}</td>
                    </tr>
                `;
            });
            
            expensesList.innerHTML = expensesHtml.join('');
        }
        
        document.getElementById('expenses-list-container').classList.remove('hidden');
    };
    
    // Calculate and update event financial details
    window.updateEventFinancials = function(eventId) {
        // Find income for this event
        const eventIncome = incomeData.filter(income => {
            const incomeEventId = typeof income.event_id === 'object' ? 
                income.event_id._id : income.event_id;
            return incomeEventId === eventId;
        });
        
        // Find expenses for this event
        const eventExpenses = expenseData.filter(expense => {
            const expenseEventId = typeof expense.event_id === 'object' ? 
                expense.event_id._id : expense.event_id;
            return expenseEventId === eventId;
        });
        
        // Calculate totals
        const totalIncome = eventIncome.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = eventExpenses.reduce((sum, item) => sum + item.amount, 0);
        const balance = totalIncome - totalExpenses;
        
        // Update UI
        document.getElementById('event-details-income').textContent = `$${totalIncome.toLocaleString()}`;
        document.getElementById('event-details-expenses').textContent = `$${totalExpenses.toLocaleString()}`;
        document.getElementById('event-details-balance').textContent = `$${balance.toLocaleString()}`;
    };
    
    // Make functions available to the events.js file
    window.addExpenseForEvent = function(eventId) {
        showAddExpenseModal(eventId);
    };
    
    window.addIncomeForEvent = function(eventId) {
        showAddIncomeModal(eventId);
    };
});