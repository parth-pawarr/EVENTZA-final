// DOM Ready for finances section
document.addEventListener('DOMContentLoaded', function() {
    // Modal event handlers
    document.getElementById('fund-status').addEventListener('change', function() {
        const approvedAmountContainer = document.getElementById('approved-amount-container');
        approvedAmountContainer.style.display = this.value === 'Approved' ? 'block' : 'none';
    });
    
    document.getElementById('cancel-approval-btn').addEventListener('click', function() {
        document.getElementById('fund-approval-modal').classList.add('hidden');
    });
    
    document.getElementById('fund-approval-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateFundStatus();
    });
    
    document.getElementById('cancel-expense-btn').addEventListener('click', function() {
        document.getElementById('add-expense-modal').classList.add('hidden');
    });
    
    document.getElementById('add-expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addExpense();
    });
});

// Load finances data
function loadFinancesData() {
    // Load total funds requested
    fetch(`${API_URL}/funds`)
        .then(response => response.json())
        .then(data => {
            const totalRequested = data.reduce((total, fund) => total + fund.requested_amount, 0);
            document.getElementById('total-funds-requested').textContent = `$${totalRequested.toFixed(2)}`;
            
            const approvedFunds = data.filter(fund => fund.status === 'Approved');
            const totalApproved = approvedFunds.reduce((total, fund) => total + (fund.approved_amount || 0), 0);
            document.getElementById('finance-funds-approved').textContent = `$${totalApproved.toFixed(2)}`;
            
            displayFunds(data);
        })
        .catch(error => {
            console.error('Error fetching funds:', error);
            document.getElementById('total-funds-requested').textContent = 'Error';
            document.getElementById('finance-funds-approved').textContent = 'Error';
        });
    
    // Load total expenses
    fetch(`${API_URL}/expenses`)
        .then(response => response.json())
        .then(data => {
            const totalExpenses = data.reduce((total, expense) => total + expense.amount, 0);
            document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
            
            displayExpenses(data);
        })
        .catch(error => {
            console.error('Error fetching expenses:', error);
            document.getElementById('total-expenses').textContent = 'Error';
        });
}

// Display all fund requests in the table
function displayFunds(funds) {
    const fundsListContainer = document.getElementById('funds-list');
    
    if (funds.length === 0) {
        fundsListContainer.innerHTML = '<tr><td colspan="6" class="py-2 px-4 text-center">No fund requests found</td></tr>';
        return;
    }
    
    // Get clubs data to display club names
    fetch(`${API_URL}/clubs`)
        .then(response => response.json())
        .then(clubs => {
            let html = '';
            funds.forEach(fund => {
                const club = clubs.find(c => c._id === fund.club_id);
                const clubName = club ? club.club_name : 'Unknown Club';
                
                // Status color
                let statusClass = '';
                if (fund.status === 'Approved') {
                    statusClass = 'text-green-600';
                } else if (fund.status === 'Rejected') {
                    statusClass = 'text-red-600';
                } else {
                    statusClass = 'text-yellow-600';
                }
                
                html += `
                    <tr>
                        <td class="py-2 px-4 border-b">${clubName}</td>
                        <td class="py-2 px-4 border-b">${fund.purpose}</td>
                        <td class="py-2 px-4 border-b">$${fund.requested_amount.toFixed(2)}</td>
                        <td class="py-2 px-4 border-b">
                            <span class="${statusClass} font-semibold">${fund.status}</span>
                        </td>
                        <td class="py-2 px-4 border-b">${fund.approved_amount ? '$' + fund.approved_amount.toFixed(2) : 'N/A'}</td>
                        <td class="py-2 px-4 border-b">
                            <button class="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 rounded text-sm review-fund-btn" data-fund-id="${fund._id}">
                                Review
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            fundsListContainer.innerHTML = html;
            
            // Add event listeners to review buttons
            document.querySelectorAll('.review-fund-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const fundId = this.getAttribute('data-fund-id');
                    openFundApprovalModal(fundId);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching clubs:', error);
            fundsListContainer.innerHTML = '<tr><td colspan="6" class="py-2 px-4 text-center">Error loading fund requests</td></tr>';
        });
}

// Display all expenses in the table
function displayExpenses(expenses) {
    const expensesListContainer = document.getElementById('expenses-list');
    
    if (expenses.length === 0) {
        expensesListContainer.innerHTML = '<tr><td colspan="5" class="py-2 px-4 text-center">No expenses found</td></tr>';
        return;
    }
    
    // Get events and funds data to display names
    Promise.all([
        fetch(`${API_URL}/events`).then(response => response.json()),
        fetch(`${API_URL}/funds`).then(response => response.json())
    ])
    .then(([events, funds]) => {
        let html = '';
        expenses.forEach(expense => {
            const event = events.find(e => e._id === expense.event_id);
            const fund = funds.find(f => f._id === expense.fund_id);
            
            const eventName = event ? event.event_name : 'Unknown Event';
            const fundName = fund ? fund.purpose : 'Unknown Fund';
            
            html += `
                <tr>
                    <td class="py-2 px-4 border-b">${eventName}</td>
                    <td class="py-2 px-4 border-b">${fundName}</td>
                    <td class="py-2 px-4 border-b">$${expense.amount.toFixed(2)}</td>
                    <td class="py-2 px-4 border-b">${expense.description}</td>
                    <td class="py-2 px-4 border-b">${formatDate(expense.date)}</td>
                </tr>
            `;
        });
        
        expensesListContainer.innerHTML = html;
    })
    .catch(error => {
        console.error('Error loading related data for expenses:', error);
        expensesListContainer.innerHTML = '<tr><td colspan="5" class="py-2 px-4 text-center">Error loading expenses</td></tr>';
    });
}

// Open fund approval modal
function openFundApprovalModal(fundId) {
    fetch(`${API_URL}/funds/${fundId}`)
        .then(response => response.json())
        .then(fund => {
            document.getElementById('fund-id').value = fund._id;
            
            // Get club name
            fetch(`${API_URL}/clubs/${fund.club_id}`)
                .then(response => response.json())
                .then(club => {
                    document.getElementById('fund-club').textContent = club.club_name;
                })
                .catch(error => {
                    document.getElementById('fund-club').textContent = 'Unknown Club';
                });
            
            document.getElementById('fund-purpose').textContent = fund.purpose;
            document.getElementById('fund-requested').textContent = `$${fund.requested_amount.toFixed(2)}`;
            document.getElementById('fund-status').value = fund.status;
            document.getElementById('approved-amount').value = fund.approved_amount || fund.requested_amount;
            document.getElementById('approval-remarks').value = fund.remarks || '';
            
            // Show/hide approved amount based on status
            const approvedAmountContainer = document.getElementById('approved-amount-container');
            approvedAmountContainer.style.display = fund.status === 'Approved' ? 'block' : 'none';
            
            document.getElementById('fund-approval-modal').classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error fetching fund details:', error);
            alert('Failed to load fund details');
        });
}

// Update fund status
function updateFundStatus() {
    const fundId = document.getElementById('fund-id').value;
    const status = document.getElementById('fund-status').value;
    const approvedAmount = parseFloat(document.getElementById('approved-amount').value) || 0;
    const remarks = document.getElementById('approval-remarks').value;
    
    const fundData = {
        status: status,
        remarks: remarks
    };
    
    if (status === 'Approved') {
        fundData.approved_amount = approvedAmount;
    }
    
    fetch(`${API_URL}/funds/${fundId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fundData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update fund status');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('fund-approval-modal').classList.add('hidden');
        loadFinancesData(); // Refresh finances data
    })
    .catch(error => {
        console.error('Error updating fund status:', error);
        alert('Failed to update fund status. Please try again.');
    });
}

// Add new expense
function addExpense() {
    const eventId = document.getElementById('expense-event-id').value;
    const fundId = document.getElementById('fund-select').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const description = document.getElementById('expense-description').value;
    const date = document.getElementById('expense-date').value;
    
    if (!fundId || isNaN(amount) || amount <= 0 || !description || !date) {
        alert('Please fill in all required fields correctly');
        return;
    }
    
    const expenseData = {
        event_id: eventId,
        fund_id: fundId,
        amount: amount,
        description: description,
        date: date
    };
    
    fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add expense');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('add-expense-modal').classList.add('hidden');
        
        // If we're on the event details page, refresh the finances
        if (selectedEventId) {
            loadEventFinances(selectedEventId);
        }
        
        // If we're on the finances page, refresh all data
        if (activeSection === 'finances') {
            loadFinancesData();
        }
    })
    .catch(error => {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
    });
}