// Variables to store clubs data
let allClubs = [];
let selectedClubId = null;

// DOM Ready for clubs section initialization
document.addEventListener('DOMContentLoaded', function() {
    // Create Club button event
    document.getElementById('create-club-btn').addEventListener('click', function() {
        openCreateClubModal();
    });
    
    // Club form submission
    document.getElementById('create-club-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createClub();
    });
    
    // Cancel club creation
    document.getElementById('cancel-club-btn').addEventListener('click', function() {
        document.getElementById('create-club-modal').classList.add('hidden');
    });
    
    // Back to clubs list
    document.getElementById('back-to-clubs').addEventListener('click', function() {
        document.getElementById('club-details').classList.add('hidden');
        document.getElementById('clubs-list').closest('div').classList.remove('hidden');
    });
    
    // View club members button
    document.getElementById('view-members-btn').addEventListener('click', function() {
        // You can implement this if you have club membership data
        alert('Club membership view not implemented yet');
    });
});

// Load clubs data
function loadClubs() {
    document.getElementById('clubs-list').innerHTML = '<tr><td colspan="6" class="py-2 px-4 text-center">Loading clubs...</td></tr>';
    
    fetch(`${API_URL}/clubs`)
        .then(response => response.json())
        .then(data => {
            allClubs = data;
            displayClubs(data);
            loadFacultyForClubCreation();
        })
        .catch(error => {
            console.error('Error fetching clubs:', error);
            document.getElementById('clubs-list').innerHTML = '<tr><td colspan="6" class="py-2 px-4 text-center">Error loading clubs</td></tr>';
        });
}

// Display clubs in the table
function displayClubs(clubs) {
    const clubsListContainer = document.getElementById('clubs-list');
    
    if (clubs.length === 0) {
        clubsListContainer.innerHTML = '<tr><td colspan="6" class="py-2 px-4 text-center">No clubs found</td></tr>';
        return;
    }
    
    let html = '';
    clubs.forEach(club => {
        html += `
            <tr>
                <td class="py-2 px-4 border-b">${club.club_name}</td>
                <td class="py-2 px-4 border-b">${club.description || 'N/A'}</td>
                <td class="py-2 px-4 border-b">${club.faculty_in_charge ? 'ID: ' + club.faculty_in_charge : 'Not assigned'}</td>
                <td class="py-2 px-4 border-b">${club.user_id ? 'ID: ' + club.user_id : 'Unknown'}</td>
                <td class="py-2 px-4 border-b">${formatDate(club.created_at)}</td>
                <td class="py-2 px-4 border-b">
                    <button class="text-indigo-600 hover:text-indigo-800 view-club-btn" data-club-id="${club._id}">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    });
    
    clubsListContainer.innerHTML = html;
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-club-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const clubId = this.getAttribute('data-club-id');
            viewClubDetails(clubId);
        });
    });
}

// Open create club modal
function openCreateClubModal() {
    document.getElementById('create-club-modal').classList.remove('hidden');
    document.getElementById('create-club-form').reset();
}

// Load faculty members for club creation form
function loadFacultyForClubCreation() {
    fetch(`${API_URL}/users`)
        .then(response => response.json())
        .then(data => {
            const facultyMembers = data.filter(user => user.role === 'faculty');
            const facultySelect = document.getElementById('faculty-select');
            
            facultySelect.innerHTML = '<option value="">Select a Faculty</option>';
            facultyMembers.forEach(faculty => {
                facultySelect.innerHTML += `<option value="${faculty._id}">${faculty.name || faculty.email || faculty._id}</option>`;
            });
        })
        .catch(error => {
            console.error('Error loading faculty members:', error);
        });
}

// Create new club
function createClub() {
    const clubName = document.getElementById('club-name').value;
    const description = document.getElementById('club-description').value;
    const facultyId = document.getElementById('faculty-select').value;
    
    if (!clubName || !facultyId) {
        alert('Please fill in all required fields');
        return;
    }
    
    const clubData = {
        club_name: clubName,
        description: description,
        faculty_in_charge: facultyId,
        user_id: "admin_user_id" // In a real app, this would be the logged-in user's ID
    };
    
    fetch(`${API_URL}/clubs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(clubData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create club');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('create-club-modal').classList.add('hidden');
        loadClubs(); // Refresh clubs list
    })
    .catch(error => {
        console.error('Error creating club:', error);
        alert('Failed to create club. Please try again.');
    });
}

// View club details
function viewClubDetails(clubId) {
    selectedClubId = clubId;
    
    // Hide clubs list and show details view
    document.getElementById('clubs-list').closest('div').classList.add('hidden');
    document.getElementById('club-details').classList.remove('hidden');
    
    // Find the club from the loaded data
    const club = allClubs.find(c => c._id === clubId);
    
    if (!club) {
        alert('Club not found');
        return;
    }
    
    // Fill club details
    document.getElementById('club-details-name').textContent = club.club_name;
    document.getElementById('club-details-description').textContent = club.description || 'No description available';
    document.getElementById('club-details-faculty').textContent = club.faculty_in_charge || 'Not assigned';
    document.getElementById('club-details-created').textContent = formatDate(club.created_at);
    
    // Load club members count
    fetch(`${API_URL}/clubmemberships`)
        .then(response => response.json())
        .then(data => {
            const clubMembers = data.filter(membership => membership.club_id === clubId);
            document.getElementById('club-details-members').textContent = clubMembers.length;
        })
        .catch(error => {
            console.error('Error loading club members:', error);
            document.getElementById('club-details-members').textContent = 'Error';
        });
    
    // Load club finances
    fetch(`${API_URL}/funds`)
        .then(response => response.json())
        .then(data => {
            const clubFunds = data.filter(fund => fund.club_id === clubId);
            const approvedFunds = clubFunds.filter(fund => fund.status === 'Approved');
            const pendingFunds = clubFunds.filter(fund => fund.status === 'Pending');
            
            const totalApproved = approvedFunds.reduce((total, fund) => total + (fund.approved_amount || 0), 0);
            
            document.getElementById('club-details-funds').textContent = `$${totalApproved.toFixed(2)}`;
            document.getElementById('club-details-pending').textContent = pendingFunds.length;
        })
        .catch(error => {
            console.error('Error loading club finances:', error);
            document.getElementById('club-details-funds').textContent = 'Error';
            document.getElementById('club-details-pending').textContent = 'Error';
        });
    
    // Load club events
    loadClubEvents(clubId);
}

// Load events for a specific club
function loadClubEvents(clubId) {
    const clubEventsContainer = document.getElementById('club-events');
    clubEventsContainer.innerHTML = '<tr><td colspan="5" class="py-2 px-4 text-center">Loading events...</td></tr>';
    
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(data => {
            const clubEvents = data.filter(event => event.club_id === clubId);
            
            if (clubEvents.length === 0) {
                clubEventsContainer.innerHTML = '<tr><td colspan="5" class="py-2 px-4 text-center">No events found for this club</td></tr>';
                return;
            }
            
            let html = '';
            clubEvents.forEach(event => {
                const eventDate = new Date(event.date).toLocaleDateString();
                
                html += `
                    <tr>
                        <td class="py-2 px-4 border-b">${event.event_name}</td>
                        <td class="py-2 px-4 border-b">${eventDate}</td>
                        <td class="py-2 px-4 border-b">${event.venue}</td>
                        <td class="py-2 px-4 border-b" id="event-participants-${event._id}">Loading...</td>
                        <td class="py-2 px-4 border-b">
                            <button class="text-indigo-600 hover:text-indigo-800 view-event-btn" data-event-id="${event._id}">
                                View Details
                            </button>
                        </td>
                    </tr>
                `;
                
                // Load participant count for each event
                loadEventParticipantCount(event._id);
            });
            
            clubEventsContainer.innerHTML = html;
            
            // Add event listeners to view event buttons
            document.querySelectorAll('.view-event-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const eventId = this.getAttribute('data-event-id');
                    // Switch to events section and view event details
                    showSection('events');
                    viewEventDetails(eventId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading club events:', error);
            clubEventsContainer.innerHTML = '<tr><td colspan="5" class="py-2 px-4 text-center">Error loading events</td></tr>';
        });
}

// Load participant count for an event
function loadEventParticipantCount(eventId) {
    fetch(`${API_URL}/eventregistrations`)
        .then(response => response.json())
        .then(data => {
            const participants = data.filter(reg => reg.event_id === eventId);
            document.getElementById(`event-participants-${eventId}`).textContent = participants.length;
        })
        .catch(error => {
            console.error(`Error loading participants for event ${eventId}:`, error);
            document.getElementById(`event-participants-${eventId}`).textContent = 'Error';
        });
}