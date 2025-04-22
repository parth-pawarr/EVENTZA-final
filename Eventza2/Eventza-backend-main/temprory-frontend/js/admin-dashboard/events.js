// Variables to store events data
let allEvents = [];
let selectedEventId = null;

// DOM Ready for events section initialization
document.addEventListener('DOMContentLoaded', function() {
    // Create Event button event
    document.getElementById('create-event-btn').addEventListener('click', function() {
        openCreateEventModal();
    });
    
    // Event form submission
    document.getElementById('create-event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createEvent();
    });
    
    // Cancel event creation
    document.getElementById('cancel-event-btn').addEventListener('click', function() {
        document.getElementById('create-event-modal').classList.add('hidden');
    });
    
    // Back to events list
    document.getElementById('back-to-events').addEventListener('click', function() {
        document.getElementById('event-details').classList.add('hidden');
        document.getElementById('events-list').closest('div').classList.remove('hidden');
    });
    
    // View participants button
    document.getElementById('view-participants-btn').addEventListener('click', function() {
        const container = document.getElementById('participants-list-container');
        container.classList.toggle('hidden');
        
        if (!container.classList.contains('hidden')) {
            // Load participants if container is visible
            loadEventParticipants(selectedEventId);
        }
    });
    
    // Export participants button
    document.getElementById('export-participants-btn').addEventListener('click', function() {
        exportEventParticipants(selectedEventId);
    });
    
    // Manage expenses button
    document.getElementById('manage-expenses-btn').addEventListener('click', function() {
        openAddExpenseModal(selectedEventId);
    });
});

// Load events data
function loadEvents() {
    document.getElementById('events-list').innerHTML = '<tr><td colspan="6" class="py-2 px-4 text-center">Loading events...</td></tr>';
    
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(data => {
            allEvents = data;
            displayEvents(data);
            loadClubsForEventCreation();
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            document.getElementById('events-list').innerHTML = '<tr><td colspan="6" class="py-2 px-4 text-center">Error loading events</td></tr>';
        });
}

// Display events in the table
function displayEvents(events) {
    const eventsListContainer = document.getElementById('events-list');
    
    if (events.length === 0) {
        eventsListContainer.innerHTML = '<tr><td colspan="6" class="py-2 px-4 text-center">No events found</td></tr>';
        return;
    }
    
    let html = '';
    events.forEach(event => {
        const eventDate = new Date(event.date).toLocaleDateString();
        
        html += `
            <tr>
                <td class="py-2 px-4 border-b">${event.event_name}</td>
                <td class="py-2 px-4 border-b">${eventDate}</td>
                <td class="py-2 px-4 border-b">${event.venue}</td>
                <td class="py-2 px-4 border-b">${event.club_id?.club_name || 'Unknown Club'}</td>
                <td class="py-2 px-4 border-b" id="event-list-participants-${event._id}">Loading...</td>
                <td class="py-2 px-4 border-b">
                    <button class="text-indigo-600 hover:text-indigo-800 view-event-details-btn" data-event-id="${event._id}">
                        View Details
                    </button>
                </td>
            </tr>
        `;
        
        // Load participant count for each event
        setTimeout(() => {
            loadEventParticipantCount(event._id, `event-list-participants-${event._id}`);
        }, 100);
    });
    
    eventsListContainer.innerHTML = html;
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-event-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            viewEventDetails(eventId);
        });
    });
}

// Open create event modal
function openCreateEventModal() {
    document.getElementById('create-event-modal').classList.remove('hidden');
    document.getElementById('create-event-form').reset();
}

// Load clubs for event creation form
function loadClubsForEventCreation() {
    fetch(`${API_URL}/clubs`)
        .then(response => response.json())
        .then(data => {
            const clubSelect = document.getElementById('club-select');
            
            clubSelect.innerHTML = '<option value="">Select a Club</option>';
            data.forEach(club => {
                clubSelect.innerHTML += `<option value="${club._id}">${club.club_name}</option>`;
            });
        })
        .catch(error => {
            console.error('Error loading clubs:', error);
        });
}

// Create new event
function createEvent() {
    const eventName = document.getElementById('event-name').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value;
    const venue = document.getElementById('event-venue').value;
    const clubId = document.getElementById('club-select').value;
    
    if (!eventName || !date || !venue || !clubId) {
        alert('Please fill in all required fields');
        return;
    }
    
    const eventData = {
        event_name: eventName,
        description: description,
        date: date,
        venue: venue,
        club_id: clubId
    };
    
    fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create event');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('create-event-modal').classList.add('hidden');
        loadEvents(); // Refresh events list
    })
    .catch(error => {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
    });
}

// View event details
function viewEventDetails(eventId) {
    selectedEventId = eventId;
    
    // Hide events list and show details view
    document.getElementById('events-list').closest('div').classList.add('hidden');
    document.getElementById('event-details').classList.remove('hidden');
    
    // Hide participants list by default
    document.getElementById('participants-list-container').classList.add('hidden');
    
    // Find the event from the loaded data
    const event = allEvents.find(e => e._id === eventId);
    
    if (!event) {
        alert('Event not found');
        return;
    }
    
    // Fill event details
    document.getElementById('event-details-name').textContent = event.event_name;
    document.getElementById('event-details-description').textContent = event.description || 'No description available';
    document.getElementById('event-details-date').textContent = formatDate(event.date);
    document.getElementById('event-details-venue').textContent = event.venue;
    document.getElementById('event-details-club').textContent = event.club_id?.club_name || 'Unknown Club';
    
    // Load event participants count
    loadEventParticipantCount(eventId, 'event-details-participants');
    
    // Load event finances
    loadEventFinances(eventId);
}

// Load participant count for an event
function loadEventParticipantCount(eventId, elementId) {
    fetch(`${API_URL}/eventregistrations`)
        .then(response => response.json())
        .then(data => {
            const participants = data.filter(reg => reg.event_id === eventId);
            document.getElementById(elementId || `event-participants-${eventId}`).textContent = participants.length;
        })
        .catch(error => {
            console.error(`Error loading participants for event ${eventId}:`, error);
            document.getElementById(elementId || `event-participants-${eventId}`).textContent = 'Error';
        });
}

// Load event finances
function loadEventFinances(eventId) {
    // Load funds related to the event's club
    const event = allEvents.find(e => e._id === eventId);
    
    if (!event || !event.club_id) {
        document.getElementById('event-details-budget').textContent = '$0.00';
        document.getElementById('event-details-expenses').textContent = '$0.00';
        document.getElementById('event-details-balance').textContent = '$0.00';
        return;
    }
    
    // Load approved funds for the club
    fetch(`${API_URL}/funds`)
        .then(response => response.json())
        .then(data => {
            const clubFunds = data.filter(fund => fund.club_id === event.club_id && fund.status === 'Approved');
            const totalBudget = clubFunds.reduce((total, fund) => total + (fund.approved_amount || 0), 0);
            
            document.getElementById('event-details-budget').textContent = `$${totalBudget.toFixed(2)}`;
            
            // Load expenses for this event
            fetch(`${API_URL}/expenses`)
                .then(response => response.json())
                .then(expenses => {
                    const eventExpenses = expenses.filter(expense => expense.event_id === eventId);
                    const totalExpenses = eventExpenses.reduce((total, expense) => total + expense.amount, 0);
                    
                    document.getElementById('event-details-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
                    document.getElementById('event-details-balance').textContent = `$${(totalBudget - totalExpenses).toFixed(2)}`;
                })
                .catch(error => {
                    console.error('Error loading event expenses:', error);
                    document.getElementById('event-details-expenses').textContent = 'Error';
                    document.getElementById('event-details-balance').textContent = 'Error';
                });
        })
        .catch(error => {
            console.error('Error loading club funds:', error);
            document.getElementById('event-details-budget').textContent = 'Error';
        });
}

// Load participants for an event
function loadEventParticipants(eventId) {
    const participantsListContainer = document.getElementById('participants-list');
    participantsListContainer.innerHTML = '<tr><td colspan="3" class="py-2 px-4 text-center">Loading participants...</td></tr>';
    
    fetch(`${API_URL}/eventregistrations`)
        .then(response => response.json())
        .then(data => {
            const participants = data.filter(reg => reg.event_id === eventId);
            
            if (participants.length === 0) {
                participantsListContainer.innerHTML = '<tr><td colspan="3" class="py-2 px-4 text-center">No participants found</td></tr>';
                return;
            }
            
            let html = '';
            participants.forEach(participant => {
                html += `
                    <tr>
                        <td class="py-2 px-4 border-b">${participant.user_id?.name || 'Unknown'}</td>
                        <td class="py-2 px-4 border-b">${participant.user_id?.email || 'No email'}</td>
                        <td class="py-2 px-4 border-b">${formatDate(participant.created_at)}</td>
                    </tr>
                `;
            });
            
            participantsListContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading participants:', error);
            participantsListContainer.innerHTML = '<tr><td colspan="3" class="py-2 px-4 text-center">Error loading participants</td></tr>';
        });
}

// Export participants to Excel
function exportEventParticipants(eventId) {
    fetch(`${API_URL}/eventregistrations`)
        .then(response => response.json())
        .then(data => {
            const participants = data.filter(reg => reg.event_id === eventId);
            
            if (participants.length === 0) {
                alert('No participants to export');
                return;
            }
            
            // Find event name
            const event = allEvents.find(e => e._id === eventId);
            const eventName = event ? event.event_name : 'Event';
            
            // Format data for export
            const exportData = participants.map(participant => {
                return {
                    'Name': participant.user_id?.name || 'Unknown',
                    'Email': participant.user_id?.email || 'No email',
                    'Registration Date': formatDate(participant.created_at)
                };
            });
            
            exportToExcel(exportData, `${eventName}-Participants`);
        })
        .catch(error => {
            console.error('Error exporting participants:', error);
            alert('Failed to export participants');
        });
}

// Open add expense modal
function openAddExpenseModal(eventId) {
    document.getElementById('add-expense-modal').classList.remove('hidden');
    document.getElementById('add-expense-form').reset();
    document.getElementById('expense-event-id').value = eventId;
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
    
    // Load funds for the event's club
    const event = allEvents.find(e => e._id === eventId);
    
    if (event && event.club_id) {
        fetch(`${API_URL}/funds`)
            .then(response => response.json())
            .then(data => {
                const clubFunds = data.filter(fund => fund.club_id === event.club_id && fund.status === 'Approved');
                const fundSelect = document.getElementById('fund-select');
                
                fundSelect.innerHTML = '<option value="">Select a Fund</option>';
                clubFunds.forEach(fund => {
                    fundSelect.innerHTML += `<option value="${fund._id}">${fund.purpose} - $${fund.approved_amount}</option>`;
                });
            })
            .catch(error => {
                console.error('Error loading funds:', error);
            });
    }
}