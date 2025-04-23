document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const currentClubId = localStorage.getItem('clubId');
    const currentUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const BASE_URL = 'http://localhost:5000/api';
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
        if (!token || !currentClubId || !currentUserId) {
            console.error('Missing required data');
            window.location.href = 'login.html';
            return;
        }

        const headers = {
            'Authorization': token,
            'Content-Type': 'application/json'
        };

        // Fetch club info
        try {
            const clubResponse = await fetch(`${BASE_URL}/clubs/${currentClubId}`, {
                headers: headers
            });
            
            if (!clubResponse.ok) {
                throw new Error('Failed to fetch club data');
            }
            
            const clubData = await clubResponse.json();
            
            // Set club name in header
            document.getElementById('club-name-header').textContent = clubData.club_name;
            
            // Set user name from localStorage
            document.getElementById('member-name').textContent = localStorage.getItem('userName') || 'Club Member';
            
            // Get user role in club
            const membershipResponse = await fetch(`${BASE_URL}/clubmemberships/user/${currentUserId}`, {
                headers: headers
            });
            
            if (!membershipResponse.ok) {
                throw new Error('Failed to fetch membership data');
            }
            
            const membershipData = await membershipResponse.json();
            
            if (membershipData.length > 0) {
                currentUserRole = membershipData[0].role;
            }
            
            // Load dashboard data
            loadDashboardData();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            alert(`Error initializing dashboard: ${error.message}`);
        }
    }
    
    async function loadDashboardData() {
        try {
            const headers = {
                'Authorization': token,
                'Content-Type': 'application/json'
            };

            // Fetch members count
            const membersResponse = await fetch(`${BASE_URL}/clubmemberships?club_id=${currentClubId}`, {
                headers: headers
            });
            const membersData = await membersResponse.json();
            document.getElementById('total-members').textContent = membersData.length;
            
            // Fetch upcoming events
            const today = new Date().toISOString();
            const eventsResponse = await fetch(`${BASE_URL}/events?club_id=${currentClubId}`, {
                headers: headers
            });
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
                                <td class="py-2 px-4">${event.venue || 'TBD'}</td>
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
            const financialResponse = await fetch(`${BASE_URL}/clubs/${currentClubId}/financial`, {
                headers: headers
            });

            if (!financialResponse.ok) {
                throw new Error('Failed to fetch financial data');
            }

            const financialData = await financialResponse.json();
            
            // Update financial summary
            const totalIncome = financialData.summary.totalFunds;
            const totalExpenses = financialData.summary.totalExpenses;
            const balance = financialData.summary.balance;
            
            document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
            document.getElementById('total-expenses-dash').textContent = `$${totalExpenses.toFixed(2)}`;
            document.getElementById('finance-total-income').textContent = `$${totalIncome.toFixed(2)}`;
            document.getElementById('finance-total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
            document.getElementById('finance-balance').textContent = `$${balance.toFixed(2)}`;
            
            // Create finance chart
            createFinanceChart(totalIncome, totalExpenses);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            alert(`Error loading dashboard data: ${error.message}`);
        }
    }
    
    function createFinanceChart(income, expenses) {
        try {
            console.log('Creating finance chart...');
            console.log('Chart object available:', typeof Chart !== 'undefined');
            
            const canvas = document.getElementById('finance-chart-canvas');
            console.log('Canvas element found:', canvas !== null);
            
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            const ctx = canvas.getContext('2d');
            console.log('Canvas context obtained:', ctx !== null);
            
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }
            
            // Destroy previous chart if it exists
            if (window.financeChart) {
                console.log('Destroying previous chart');
                window.financeChart.destroy();
            }
            
            console.log('Creating new chart with data:', { income, expenses, balance: income - expenses });
            
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
            
            console.log('Chart created successfully');
        } catch (error) {
            console.error('Error creating finance chart:', error);
            throw error;
        }
    }
    
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-content').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show the selected section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        
        // Update active state in sidebar
        document.querySelectorAll('.dashboard-link').forEach(link => {
            link.classList.remove('bg-indigo-700');
        });
        
        document.querySelector(`.dashboard-link[data-section="${sectionId}"]`)?.classList.add('bg-indigo-700');
    }
});