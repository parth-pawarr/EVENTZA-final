// Base API URL
const API_URL = 'http://localhost:5000/api';

// Current active section
let activeSection = 'dashboard';

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    showSection('dashboard');
    loadDashboardData();
    
    // Handle navigation
    document.querySelectorAll('.dashboard-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
});

// Show the selected section and hide others
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.dashboard-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`${sectionName}-section`);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
        activeSection = sectionName;
        
        // Load section data if needed
        if (sectionName === 'dashboard') {
            loadDashboardData();
        } else if (sectionName === 'clubs') {
            loadClubs();
        } else if (sectionName === 'events') {
            loadEvents();
        } else if (sectionName === 'finances') {
            loadFinancesData();
        } else if (sectionName === 'participants') {
            loadParticipantsData();
        }
    }
}

// Load dashboard overview data
function loadDashboardData() {
    // Load total clubs
    fetch(`${API_URL}/clubs`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-clubs').textContent = data.length;
        })
        .catch(error => {
            console.error('Error fetching clubs:', error);
            document.getElementById('total-clubs').textContent = 'Error';
        });
    
    // Load total events
    fetch(`${API_URL}/events`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-events').textContent = data.length;
            loadRecentEvents(data);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            document.getElementById('total-events').textContent = 'Error';
        });
    
    // Load total participants
    fetch(`${API_URL}/eventregistrations`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-participants').textContent = data.length;
        })
        .catch(error => {
            console.error('Error fetching registrations:', error);
            document.getElementById('total-participants').textContent = 'Error';
        });
    
    // Load funds info
    fetch(`${API_URL}/funds`)
        .then(response => response.json())
        .then(data => {
            const approvedFunds = data.filter(fund => fund.status === 'Approved');
            const totalApproved = approvedFunds.reduce((total, fund) => total + (fund.approved_amount || 0), 0);
            document.getElementById('total-funds').textContent = `$${totalApproved.toFixed(2)}`;
            
            loadPendingFunds(data.filter(fund => fund.status === 'Pending'));
        })
        .catch(error => {
            console.error('Error fetching funds:', error);
            document.getElementById('total-funds').textContent = 'Error';
        });
}

// Load recent events for dashboard
function loadRecentEvents(events) {
    const recentEventsContainer = document.getElementById('recent-events');
    
    if (events.length === 0) {
        recentEventsContainer.innerHTML = '<tr><td colspan="3" class="py-2 px-4 text-center">No events found</td></tr>';
        return;
    }
    
    // Sort events by date (newest first) and take top 5
    const recentEvents = [...events]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    let html = '';
    recentEvents.forEach(event => {
        const eventDate = new Date(event.date).toLocaleDateString();
        html += `
            <tr>
                <td class="py-2 px-4 border-b">${event.event_name}</td>
                <td class="py-2 px-4 border-b">${eventDate}</td>
                <td class="py-2 px-4 border-b">${event.club_id?.club_name || 'Unknown'}</td>
            </tr>
        `;
    });
    
    recentEventsContainer.innerHTML = html;
}

// Load pending fund requests for dashboard
function loadPendingFunds(pendingFunds) {
    const pendingFundsContainer = document.getElementById('pending-funds');
    
    if (pendingFunds.length === 0) {
        pendingFundsContainer.innerHTML = '<tr><td colspan="4" class="py-2 px-4 text-center">No pending fund requests</td></tr>';
        return;
    }
    
    let html = '';
    pendingFunds.forEach(fund => {
        html += `
            <tr>
                <td class="py-2 px-4 border-b">${fund.club_id?.club_name || 'Unknown'}</td>
                <td class="py-2 px-4 border-b">$${fund.requested_amount.toFixed(2)}</td>
                <td class="py-2 px-4 border-b">${fund.purpose}</td>
                <td class="py-2 px-4 border-b">
                    <button class="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 rounded text-sm approve-fund-btn" data-fund-id="${fund._id}">
                        Review
                    </button>
                </td>
            </tr>
        `;
    });
    
    pendingFundsContainer.innerHTML = html;
    
    // Add event listeners to approve buttons
    document.querySelectorAll('.approve-fund-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const fundId = this.getAttribute('data-fund-id');
            openFundApprovalModal(fundId);
        });
    });
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Export data to Excel
function exportToExcel(data, filename) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Show error message
function showError(message) {
    alert(message);
}