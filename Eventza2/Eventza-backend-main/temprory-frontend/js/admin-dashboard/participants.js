// Variables to store participants data
let allParticipants = [];
let allEventsForParticipants = [];

// DOM Ready for participants section
document.addEventListener('DOMContentLoaded', function() {
    // Initialize event filter change handler
    document.getElementById('event-filter').addEventListener('change', function() {
        filterParticipants(this.value);
    });
    
    // Export all participants button
    document.getElementById('export-all-participants').addEventListener('click', function() {
        exportAllParticipants();
    });
});

// Load participants data
function loadParticipantsData() {
    document.getElementById('all-participants').innerHTML = '<tr><td colspan="4" class="py-2 px-4 text-center">Loading participants...</td></tr>';
    
    // Load all events for the filter dropdown
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(events => {
            allEventsForParticipants = events;
            populateEventFilter(events);
            
            // Load all participants
            return fetch(`${API_URL}/eventregistrations`);
        })
        .then(response => response.json())
        .then(data => {
            allParticipants = data;
            displayParticipants(data);
        })
        .catch(error => {
            console.error('Error fetching participants:', error);
            document.getElementById('all-participants').innerHTML = '<tr><td colspan="4" class="py-2 px-4 text-center">Error loading participants</td></tr>';
        });
}

// Populate event filter dropdown
function populateEventFilter(events) {
    const eventFilter = document.getElementById('event-filter');
    
    eventFilter.innerHTML = '<option value="">All Events</option>';
    events.forEach(event => {
        eventFilter.innerHTML += `<option value="${event._id}">${event.event_name}</option>`;
    });
}

// Display participants in the table
function displayParticipants(participants) {
    const participantsContainer = document.getElementById('all-participants');
    
    if (participants.length === 0) {
        participantsContainer.innerHTML = '<tr><td colspan="4" class="py-2 px-4 text-center">No participants found</td></tr>';
        return;
    }
    
    // Get users and events data for display
    Promise.all([
        fetch(`${API_URL}/users`).then(response => response.json()),
        fetch(`${API_URL}/events`).then(response => response.json())
    ])
    .then(([users, events]) => {
        let html = '';
        participants.forEach(participant => {
            const user = users.find(u => u._id === participant.user_id);
            const event = events.find(e => e._id === participant.event_id);
            
            const userName = user ? user.name : 'Unknown User';
            const userEmail = user ? user.email : 'No email';
            const eventName = event ? event.event_name : 'Unknown Event';
            
            html += `
                <tr>
                    <td class="py-2 px-4 border-b">${userName}</td>
                    <td class="py-2 px-4 border-b">${userEmail}</td>
                    <td class="py-2 px-4 border-b">${eventName}</td>
                    <td class="py-2 px-4 border-b">${formatDate(participant.created_at)}</td>
                </tr>
            `;
        });
        
        participantsContainer.innerHTML = html;
    })
    .catch(error => {
        console.error('Error loading related data for participants:', error);
        participantsContainer.innerHTML = '<tr><td colspan="4" class="py-2 px-4 text-center">Error loading participant details</td></tr>';
    });
}

// Filter participants by event
function filterParticipants(eventId) {
    if (!eventId) {
        // Show all participants
        displayParticipants(allParticipants);
    } else {
        // Filter by event ID
        const filteredParticipants = allParticipants.filter(p => p.event_id === eventId);
        displayParticipants(filteredParticipants);
    }
}

// Export all participants to Excel
function exportAllParticipants() {
    if (allParticipants.length === 0) {
        alert('No participants to export');
        return;
    }
    
    // Get the selected event ID from the filter
    const selectedEventId = document.getElementById('event-filter').value;
    
    // Determine which participants to export
    let participantsToExport = allParticipants;
    let filename = 'All-Participants';
    
    if (selectedEventId) {
        participantsToExport = allParticipants.filter(p => p.event_id === selectedEventId);
        const selectedEvent = allEventsForParticipants.find(e => e._id === selectedEventId);
        filename = selectedEvent ? `${selectedEvent.event_name}-Participants` : 'Filtered-Participants';
    }
    
    // Get users and events data for export
    Promise.all([
        fetch(`${API_URL}/users`).then(response => response.json()),
        fetch(`${API_URL}/events`).then(response => response.json())
    ])
    .then(([users, events]) => {
        // Format data for export
        const exportData = participantsToExport.map(participant => {
            const user = users.find(u => u._id === participant.user_id);
            const event = events.find(e => e._id === participant.event_id);
            
            return {
                'Name': user ? user.name : 'Unknown User',
                'Email': user ? user.email : 'No email',
                'Event': event ? event.event_name : 'Unknown Event',
                'Registration Date': formatDate(participant.created_at)
            };
        });
        
        exportToExcel(exportData, filename);
    })
    .catch(error => {
        console.error('Error preparing export data:', error);
        alert('Failed to export participants. Please try again.');
    });
}

// Search participants function
function searchParticipants(searchTerm) {
    if (!searchTerm) {
        displayParticipants(allParticipants);
        return;
    }
    
    // Search in all participants
    searchTerm = searchTerm.toLowerCase();
    
    // First fetch user data to search by name and email
    fetch(`${API_URL}/users`)
        .then(response => response.json())
        .then(users => {
            // Filter users by search term
            const matchingUserIds = users
                .filter(user => 
                    (user.name && user.name.toLowerCase().includes(searchTerm)) || 
                    (user.email && user.email.toLowerCase().includes(searchTerm))
                )
                .map(user => user._id);
            
            // Filter participants by matching user IDs
            const filteredParticipants = allParticipants.filter(participant => 
                matchingUserIds.includes(participant.user_id)
            );
            
            displayParticipants(filteredParticipants);
        })
        .catch(error => {
            console.error('Error searching participants:', error);
            alert('Error searching participants. Please try again.');
        });
}

// Add search functionality to the DOM ready event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search input if it exists
    const searchInput = document.getElementById('participant-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchParticipants(this.value);
        });
    }
});