document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const currentClubId = localStorage.getItem('clubId') || '1';
    const currentUserId = localStorage.getItem('userId') || '1';
    let currentEventId = null;
    
    // Initialize events
    loadEvents();
    
    // Event listeners for event management
    document.getElementById('create-event-btn').addEventListener('click', showCreateEventModal);
    document.getElementById('cancel-event-btn').addEventListener('click', hideCreateEventModal);
    document.getElementById('create-event-form').addEventListener('submit', createEvent);
    document.getElementById('back-to-events').addEventListener('click', hideEventDetails);
    
    // Event listeners for expense management
    document.getElementById('add-expense-btn').addEventListener('click', showAddExpenseModal);
    document.getElementById('cancel-expense-btn').addEventListener('click', hideAddExpenseModal);
    document.getElementById('add-expense-form').addEventListener('submit', addExpense);
    
    // Event listeners for income management
    document.getElementById('add-income-btn').addEventListener('click', showAddIncomeModal);
    document.getElementById('cancel-income-btn').addEventListener('click', hideAddIncomeModal);
    document.getElementById('add-income-form').addEventListener('submit', addIncome);
    
    // Event listeners for participant management
    document.getElementById('view-participants-btn').addEventListener('click', toggleParticipantsList);
    document.getElementById('add-participants-btn').addEventListener('click', showAddParticipantsModal);
    document.getElementById('cancel-participants-btn').addEventListener('click', hideAddParticipantsModal);
    document.getElementById('add-participants-form').addEventListener('submit', addParticipants);
    document.getElementById('export-participants-btn').addEventListener('click', exportParticipantsToExcel);
    
    // Functions for event management
    async function loadEvents() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`http://localhost:5000/api/events?club_id=${currentClubId}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const events = await response.json();
            
            if (events.length > 0) {
                const eventsHtml = events.map(event => {
                    const eventDate = new Date(event.date).toLocaleDateString();
                    return `
                        <tr>
                            <td class="py-2 px-4">${event.event_name}</td>
                            <td class="py-2 px-4">${eventDate}</td>
                            <td class="py-2 px-4">${event.venue}</td>
                            <td class="py-2 px-4" id="participant-count-${event._id}">Loading...</td>
                            <td class="py-2 px-4">
                                <button class="text-indigo-600 hover:text-indigo-800 mr-2" onclick="viewEventDetails('${event._id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="text-red-600 hover:text-red-800" onclick="deleteEvent('${event._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
                
                document.getElementById('events-list').innerHTML = eventsHtml;
                
                // Add viewEventDetails function to window object
                window.viewEventDetails = viewEventDetails;
                window.deleteEvent = deleteEvent;
                
                // Load participant counts for each event
                events.forEach(event => {
                    loadParticipantCount(event._id);
                });
            } else {
                document.getElementById('events-list').innerHTML = `
                    <tr>
                        <td colspan="5" class="py-2 px-4 text-center">No events found</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading events:', error);
            document.getElementById('events-list').innerHTML = `
                <tr>
                    <td colspan="5" class="py-2 px-4 text-center text-red-600">Error: ${error.message}</td>
                </tr>
            `;
        }
    }
    
    async function loadParticipantCount(eventId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`http://localhost:5000/api/event-registrations?event_id=${eventId}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch participants');
            }

            const participants = await response.json();
            
            const countElement = document.getElementById(`participant-count-${eventId}`);
            if (countElement) {
                countElement.textContent = participants.length;
            }
        } catch (error) {
            console.error(`Error loading participant count for event ${eventId}:`, error);
            const countElement = document.getElementById(`participant-count-${eventId}`);
            if (countElement) {
                countElement.textContent = 'Error';
            }
        }
    }
    
    function showCreateEventModal() {
        document.getElementById('create-event-modal').classList.remove('hidden');
    }
    
    function hideCreateEventModal() {
        document.getElementById('create-event-modal').classList.add('hidden');
        document.getElementById('create-event-form').reset();
    }
    
    async function createEvent(e) {
        e.preventDefault();
        
        const eventName = document.getElementById('event-name').value;
        const description = document.getElementById('event-description').value;
        const date = document.getElementById('event-date').value;
        const venue = document.getElementById('event-venue').value;
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('You must be logged in to create an event');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({
                    event_name: eventName,
                    description: description,
                    date: date,
                    venue: venue,
                    club_id: currentClubId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create event');
            }
            
            const data = await response.json();
            hideCreateEventModal();
            loadEvents();
            alert('Event created successfully!');
        } catch (error) {
            console.error('Error creating event:', error);
            alert(`Error creating event: ${error.message}`);
        }
    }
    
    async function viewEventDetails(eventId) {
        try {
            currentEventId = eventId;
            
            // Fetch event details
            const response = await fetch(`/api/events/${eventId}`);
            const event = await response.json();
            
            // Set event details in the UI
            document.getElementById('event-details-name').textContent = event.event_name;
            document.getElementById('event-details-description').textContent = event.description || 'No description provided';
            document.getElementById('event-details-date').textContent = new Date(event.date).toLocaleString();
            document.getElementById('event-details-venue').textContent = event.venue;
            
            // Fetch participants
            const participantsResponse = await fetch(`/api/event-registrations?event_id=${eventId}`);
            const participants = await participantsResponse.json();
            document.getElementById('event-details-participants').textContent = participants.length;
            
            // Fetch expenses for this event
            const expensesResponse = await fetch(`/api/expenses?event_id=${eventId}`);
            const expenses = await expensesResponse.json();
            
            // Calculate total expenses
            const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            document.getElementById('event-details-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
            
            // For now, set income to $0 (will be implemented in finances.js)
            document.getElementById('event-details-income').textContent = '$0.00';
            document.getElementById('event-details-balance').textContent = `-$${totalExpenses.toFixed(2)}`;
            
            // Hide participants list and expenses list
            document.getElementById('participants-list-container').classList.add('hidden');
            document.getElementById('expenses-list-container').classList.add('hidden');
            
            // Show event details section and hide events list
            document.getElementById('events-list').parentElement.parentElement.classList.add('hidden');
            document.getElementById('event-details').classList.remove('hidden');
            
        } catch (error) {
            console.error('Error viewing event details:', error);
        }
    }
    
    function hideEventDetails() {
        document.getElementById('events-list').parentElement.parentElement.classList.remove('hidden');
        document.getElementById('event-details').classList.add('hidden');
        currentEventId = null;
    }
    
    async function deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await fetch(`/api/events/${eventId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    loadEvents();
                } else {
                    const error = await response.json();
                    alert(`Error deleting event: ${error.message}`);
                }
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Error deleting event. Please try again.');
            }
        }
    }
    
    // Functions for expense management
    function showAddExpenseModal() {
        document.getElementById('expense-event-id').value = currentEventId;
        document.getElementById('expense-date').valueAsDate = new Date();
        document.getElementById('add-expense-modal').classList.remove('hidden');
    }
    
    function hideAddExpenseModal() {
        document.getElementById('add-expense-modal').classList.add('hidden');
        document.getElementById('add-expense-form').reset();
    }
    
    async function addExpense(e) {
        e.preventDefault();
        
        const eventId = document.getElementById('expense-event-id').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const description = document.getElementById('expense-description').value;
        const date = document.getElementById('expense-date').value;
        
        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_id: eventId,
                    amount: amount,
                    description: description,
                    spent_at: date
                })
            });
            
            if (response.ok) {
                hideAddExpenseModal();
                viewEventDetails(eventId);
                
                // Also update expenses list if visible
                if (!document.getElementById('expenses-list-container').classList.contains('hidden')) {
                    loadEventExpenses(eventId);
                }
            } else {
                const error = await response.json();
                alert(`Error adding expense: ${error.message}`);
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Error adding expense. Please try again.');
        }
    }
    
    async function loadEventExpenses(eventId) {
        try {
            const response = await fetch(`/api/expenses?event_id=${eventId}`);
            const expenses = await response.json();
            
            if (expenses.length > 0) {
                const expensesHtml = expenses.map(expense => {
                    const expenseDate = new Date(expense.spent_at).toLocaleDateString();
                    return `
                        <tr>
                            <td class="py-2 px-4">${expense.description}</td>
                            <td class="py-2 px-4">$${expense.amount.toFixed(2)}</td>
                            <td class="py-2 px-4">${expenseDate}</td>
                        </tr>
                    `;
                }).join('');
                
                document.getElementById('expenses-list').innerHTML = expensesHtml;
            } else {
                document.getElementById('expenses-list').innerHTML = `
                    <tr>
                        <td colspan="3" class="py-2 px-4 text-center">No expenses found</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }
    
    // Functions for income management
    function showAddIncomeModal() {
        document.getElementById('income-event-id').value = currentEventId;
        document.getElementById('income-date').valueAsDate = new Date();
        document.getElementById('add-income-modal').classList.remove('hidden');
    }
    
    function hideAddIncomeModal() {
        document.getElementById('add-income-modal').classList.add('hidden');
        document.getElementById('add-income-form').reset();
    }
    
    async function addIncome(e) {
        e.preventDefault();
        
        const eventId = document.getElementById('income-event-id').value;
        const amount = parseFloat(document.getElementById('income-amount').value);
        const description = document.getElementById('income-description').value;
        const date = document.getElementById('income-date').value;
        
        try {
            // Create a fund request that is automatically approved for this event income
            const response = await fetch('/api/funds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    club_id: currentClubId,
                    requested_amount: amount,
                    approved_amount: amount,
                    purpose: `Event Income: ${description}`,
                    status: 'Approved',
                    approved_by: currentUserId,
                    approval_remarks: `Income from event ${eventId}`,
                    event_id: eventId,
                    created_at: date
                })
            });
            
            if (response.ok) {
                hideAddIncomeModal();
                viewEventDetails(eventId);
            } else {
                const error = await response.json();
                alert(`Error adding income: ${error.message}`);
            }
        } catch (error) {
            console.error('Error adding income:', error);
            alert('Error adding income. Please try again.');
        }
    }
    
    // Functions for participant management
    function toggleParticipantsList() {
        const participantsContainer = document.getElementById('participants-list-container');
        
        if (participantsContainer.classList.contains('hidden')) {
            participantsContainer.classList.remove('hidden');
            loadEventParticipants(currentEventId);
        } else {
            participantsContainer.classList.add('hidden');
        }
    }
    
    async function loadEventParticipants(eventId) {
        try {
            const response = await fetch(`/api/event-registrations?event_id=${eventId}`);
            const registrations = await response.json();
            
            if (registrations.length > 0) {
                // We need user details for each registration
                const participantsHtml = [];
                
                for (const registration of registrations) {
                    // Fetch user details if not populated
                    let userData = registration.user_id;
                    if (typeof userData !== 'object') {
                        const userResponse = await fetch(`/api/users/${registration.user_id}`);
                        userData = await userResponse.json();
                    }
                    
                    const registrationDate = new Date(registration.registered_at).toLocaleDateString();
                    participantsHtml.push(`
                        <tr>
                            <td class="py-2 px-4">${userData.name}</td>
                            <td class="py-2 px-4">${userData.email || 'N/A'}</td>
                            <td class="py-2 px-4">${registrationDate}</td>
                        </tr>
                    `);
                }
                
                document.getElementById('participants-list').innerHTML = participantsHtml.join('');
            } else {
                document.getElementById('participants-list').innerHTML = `
                    <tr>
                        <td colspan="3" class="py-2 px-4 text-center">No participants found</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading participants:', error);
        }
    }
    
    function showAddParticipantsModal() {
        document.getElementById('participant-event-id').value = currentEventId;
        document.getElementById('add-participants-modal').classList.remove('hidden');
        loadClubMembersForParticipantSelection();
    }
    
    function hideAddParticipantsModal() {
        document.getElementById('add-participants-modal').classList.add('hidden');
    }
    
    async function loadClubMembersForParticipantSelection() {
        try {
            // Get existing participants
            const eventRegistrationsResponse = await fetch(`/api/event-registrations?event_id=${currentEventId}`);
            const eventRegistrations = await eventRegistrationsResponse.json();
            const existingParticipantIds = eventRegistrations.map(reg => reg.user_id._id || reg.user_id);
            
            // Get all club members
            const clubMembershipsResponse = await fetch(`/api/club-memberships?club_id=${currentClubId}`);
            const clubMemberships = await clubMembershipsResponse.json();
            
            if (clubMemberships.length > 0) {
                const membersCheckboxesHtml = [];
                
                for (const membership of clubMemberships) {
                    // Fetch user details if not populated
                    let userData = membership.user_id;
                    if (typeof userData !== 'object') {
                        const userResponse = await fetch(`/api/users/${membership.user_id}`);
                        userData = await userResponse.json();
                    }
                    
                    const isParticipant = existingParticipantIds.includes(userData._id);
                    
                    membersCheckboxesHtml.push(`
                        <div class="flex items-center mb-2">
                            <input type="checkbox" id="member-${userData._id}" name="members[]" 
                                value="${userData._id}" class="mr-2" ${isParticipant ? 'checked disabled' : ''}>
                            <label for="member-${userData._id}">
                                ${userData.name} ${isParticipant ? '(Already registered)' : ''}
                            </label>
                        </div>
                    `);
                }
                
                document.getElementById('members-checkbox-container').innerHTML = membersCheckboxesHtml.join('');
            } else {
                document.getElementById('members-checkbox-container').innerHTML = `<p>No club members found</p>`;
            }
        } catch (error) {
            console.error('Error loading club members for participant selection:', error);
        }
    }
    
    async function addParticipants(e) {
        e.preventDefault();
        
        const eventId = document.getElementById('participant-event-id').value;
        const selectedMemberCheckboxes = document.querySelectorAll('input[name="members[]"]:checked:not([disabled])');
        const selectedMemberIds = Array.from(selectedMemberCheckboxes).map(cb => cb.value);
        
        if (selectedMemberIds.length === 0) {
            alert('Please select at least one member to add as participant');
            return;
        }
        
        try {
            // Register each selected member for the event
            for (const userId of selectedMemberIds) {
                await fetch('/api/event-registrations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        event_id: eventId,
                        user_id: userId
                    })
                });
            }
            
            hideAddParticipantsModal();
            
            // Update participant count in event details
            const participantsResponse = await fetch(`/api/event-registrations?event_id=${eventId}`);
            const participants = await participantsResponse.json();
            document.getElementById('event-details-participants').textContent = participants.length;
            
            // Refresh participants list if visible
            if (!document.getElementById('participants-list-container').classList.contains('hidden')) {
                loadEventParticipants(eventId);
            }
        } catch (error) {
            console.error('Error adding participants:', error);
            alert('Error adding participants. Please try again.');
        }
    }
    
    function exportParticipantsToExcel() {
        // First check if participants list is loaded
        if (document.getElementById('participants-list-container').classList.contains('hidden')) {
            loadEventParticipants(currentEventId);
            document.getElementById('participants-list-container').classList.remove('hidden');
        }
        
        setTimeout(() => {
            try {
                // Create worksheet from table
                const ws = XLSX.utils.table_to_sheet(document.querySelector('#participants-list').parentNode);
                
                // Create workbook and add the worksheet
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Participants');
                
                // Generate Excel file and trigger download
                const eventName = document.getElementById('event-details-name').textContent;
                const fileName = `${eventName.replace(/\s+/g, '_')}_Participants.xlsx`;
                XLSX.writeFile(wb, fileName);
            } catch (error) {
                console.error('Error exporting to Excel:', error);
                alert('Error exporting to Excel. Please try again.');
            }
        }, 500); // Give time for participants list to load if it wasn't already visible
    }
});