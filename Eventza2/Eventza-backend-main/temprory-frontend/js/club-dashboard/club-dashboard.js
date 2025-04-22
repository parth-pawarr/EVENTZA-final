document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const currentClubId = localStorage.getItem('clubId') || '6803a59ae84b6a1c017dfe96'; // Default club ID, you would get this from login
    const currentUserId = localStorage.getItem('userId') || '6803a4f5e84b6a1c017dfe91'; // Default user ID, you would get this from login
    let currentUserRole = '';
    
    // Initialize the dashboard
    initializeDashboard();
    
    // Add event listeners for navigation
    document.querySelectorAll('.dashboard-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Functions
    async function initializeDashboard() {
        // Fetch club info
        try {
            const clubResponse = await fetch(`/api/clubs/${currentClubId}`);
            const clubData = await clubResponse.json();
            
            // Set club name in header
            document.getElementById('club-name-header').textContent = clubData.club_name;
            
            // Fetch current user info
            const userResponse = await fetch(`/api/users/${currentUserId}`);
            const userData = await userResponse.json();
            
            // Set user name in header
            document.getElementById('member-name').textContent = userData.name;
            
            // Get user role in club
            const membershipResponse = await fetch(`/api/club-memberships?club_id=${currentClubId}&user_id=${currentUserId}`);
            const membershipData = await membershipResponse.json();
            
            if (membershipData.length > 0 && membershipData[0].role) {
                currentUserRole = membershipData[0].role;
            }
            
            // Load dashboard data
            loadDashboardData();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
        }
    }
    
    async function loadDashboardData() {
        try {
            // Fetch members count
            const membersResponse = await fetch(`/api/club-memberships?club_id=${currentClubId}`);
            const membersData = await membersResponse.json();
            document.getElementById('total-members').textContent = membersData.length;
            
            // Fetch upcoming events
            const today = new Date().toISOString();
            const eventsResponse = await fetch(`/api/events?club_id=${currentClubId}&date[gte]=${today}`);
            const eventsData = await eventsResponse.json();
            document.getElementById('upcoming-events').textContent = eventsData.length;
            
            // Load upcoming events list
            if (eventsData.length > 0) {
                const upcomingEventsHtml = eventsData
                    .slice(0, 5) // Show only 5 upcoming events
                    .map(event => {
                        const eventDate = new Date(event.date).toLocaleDateString();
                        return `
                            <tr>
                                <td class="py-2 px-4">${event.event_name}</td>
                                <td class="py-2 px-4">${eventDate}</td>
                                <td class="py-2 px-4">${event.venue}</td>
                            </tr>
                        `;
                    })
                    .join('');
                
                document.getElementById('upcoming-events-list').innerHTML = upcomingEventsHtml;
            } else {
                document.getElementById('upcoming-events-list').innerHTML = `
                    <tr>
                        <td colspan="3" class="py-2 px-4 text-center">No upcoming events</td>
                    </tr>
                `;
            }
            
            // Fetch financial data
            const fundResponse = await fetch(`/api/funds?club_id=${currentClubId}&status=Approved`);
            const fundData = await fundResponse.json();
            
            const expenseResponse = await fetch(`/api/expenses?event_id.club_id=${currentClubId}`);
            const expenseData = await expenseResponse.json();
            
            // Calculate total income (approved funds)
            const totalIncome = fundData.reduce((sum, fund) => sum + (fund.approved_amount || 0), 0);
            document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
            document.getElementById('finance-total-income').textContent = `$${totalIncome.toFixed(2)}`;
            
            // Calculate total expenses
            const totalExpenses = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
            document.getElementById('total-expenses-dash').textContent = `$${totalExpenses.toFixed(2)}`;
            document.getElementById('finance-total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
            
            // Calculate balance
            const balance = totalIncome - totalExpenses;
            document.getElementById('finance-balance').textContent = `$${balance.toFixed(2)}`;
            
            // Create finance chart
            createFinanceChart(totalIncome, totalExpenses);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
    
    function createFinanceChart(income, expenses) {
        const ctx = document.getElementById('finance-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.financeChart) {
            window.financeChart.destroy();
        }
        
        window.financeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses', 'Balance'],
                datasets: [{
                    label: 'Financial Summary (USD)',
                    data: [income, expenses, income - expenses],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-content').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show the selected section
        document.getElementById(`${sectionId}-section`).classList.remove('hidden');
        
        // Update active state in sidebar
        document.querySelectorAll('.dashboard-link').forEach(link => {
            link.classList.remove('bg-indigo-700');
        });
        
        document.querySelector(`.dashboard-link[data-section="${sectionId}"]`).classList.add('bg-indigo-700');
    }
});