document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const currentClubId = localStorage.getItem('clubId') || '1';
    const currentUserId = localStorage.getItem('userId') || '1';
    
    // Initialize members
    loadMembers();
    
    // Event listeners
    document.getElementById('add-member-btn').addEventListener('click', showAddMemberModal);
    document.getElementById('cancel-member-btn').addEventListener('click', hideAddMemberModal);
    document.getElementById('add-member-form').addEventListener('submit', addMember);
    
    // Functions
    async function loadMembers() {
        try {
            const response = await fetch(`/api/club-memberships?club_id=${currentClubId}`);
            const memberships = await response.json();
            
            if (memberships.length > 0) {
                const membersHtml = [];
                
                for (const membership of memberships) {
                    // Fetch user details if not populated
                    let userData = membership.user_id;
                    if (typeof userData !== 'object') {
                        const userResponse = await fetch(`/api/users/${membership.user_id}`);
                        userData = await userResponse.json();
                    }
                    
                    const joinedDate = new Date(membership.joined_at).toLocaleDateString();
                    
                    membersHtml.push(`
                        <tr>
                            <td class="py-2 px-4">${userData.name}</td>
                            <td class="py-2 px-4">${userData.email || 'N/A'}</td>
                            <td class="py-2 px-4">${membership.role || 'Member'}</td>
                            <td class="py-2 px-4">${joinedDate}</td>
                            <td class="py-2 px-4">
                                <button class="text-indigo-600 hover:text-indigo-800 mr-2" onclick="editMemberRole('${membership._id}', '${membership.role || 'Member'}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="text-red-600 hover:text-red-800" onclick="removeMember('${membership._id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `);
                }
                
                document.getElementById('members-list').innerHTML = membersHtml.join('');
                
                // Also update the total members count on dashboard
                document.getElementById('total-members').textContent = memberships.length;
            } else {
                document.getElementById('members-list').innerHTML = '<tr><td colspan="5" class="py-2 px-4 text-center">No members found</td></tr>';
                document.getElementById('total-members').textContent = '0';
            }
        } catch (error) {
            console.error('Error loading members:', error);
            document.getElementById('members-list').innerHTML = '<tr><td colspan="5" class="py-2 px-4 text-center">Error loading members</td></tr>';
        }
    }
    
    // Load all users for the add member form
    async function loadUsersForSelect() {
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            
            const selectElement = document.getElementById('user-select');
            selectElement.innerHTML = '<option value="">Select a User</option>';
            
            for (const user of users) {
                const option = document.createElement('option');
                option.value = user._id;
                option.textContent = user.name;
                selectElement.appendChild(option);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            document.getElementById('user-select').innerHTML = '<option value="">Error loading users</option>';
        }
    }
    
    // Show the add member modal
    function showAddMemberModal() {
        loadUsersForSelect();
        document.getElementById('add-member-modal').classList.remove('hidden');
    }
    
    // Hide the add member modal
    function hideAddMemberModal() {
        document.getElementById('add-member-modal').classList.add('hidden');
        document.getElementById('add-member-form').reset();
    }
    
    // Add a new member to the club
    async function addMember(event) {
        event.preventDefault();
        
        const userId = document.getElementById('user-select').value;
        const role = document.getElementById('role-select').value;
        
        if (!userId) {
            alert('Please select a user');
            return;
        }
        
        try {
            const response = await fetch('/api/club-memberships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    club_id: currentClubId,
                    role: role
                }),
            });
            
            if (response.ok) {
                hideAddMemberModal();
                loadMembers();
                alert('Member added successfully');
            } else {
                const error = await response.json();
                alert(`Error adding member: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding member:', error);
            alert('Error adding member. Please try again.');
        }
    }
    
    // Define the global functions referenced in the HTML
    window.editMemberRole = async function(membershipId, currentRole) {
        const newRole = prompt('Enter new role:', currentRole);
        
        if (newRole && newRole !== currentRole) {
            try {
                const response = await fetch(`/api/club-memberships/${membershipId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        role: newRole
                    }),
                });
                
                if (response.ok) {
                    loadMembers();
                    alert('Member role updated successfully');
                } else {
                    const error = await response.json();
                    alert(`Error updating role: ${error.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error updating member role:', error);
                alert('Error updating member role. Please try again.');
            }
        }
    };
    
    window.removeMember = async function(membershipId) {
        if (confirm('Are you sure you want to remove this member from the club?')) {
            try {
                const response = await fetch(`/api/club-memberships/${membershipId}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    loadMembers();
                    alert('Member removed successfully');
                } else {
                    const error = await response.json();
                    alert(`Error removing member: ${error.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error removing member:', error);
                alert('Error removing member. Please try again.');
            }
        }
    };
    
    // Load members for the add participants modal
    window.loadMembersForParticipants = async function(eventId) {
        try {
            const membersResponse = await fetch(`/api/club-memberships?club_id=${currentClubId}`);
            const members = await membersResponse.json();
            
            // Get current participants for this event
            const registrationsResponse = await fetch(`/api/event-registrations?event_id=${eventId}`);
            const registrations = await registrationsResponse.json();
            
            const participantIds = registrations.map(reg => 
                typeof reg.user_id === 'object' ? reg.user_id._id : reg.user_id
            );
            
            const container = document.getElementById('members-checkbox-container');
            container.innerHTML = '';
            
            if (members.length === 0) {
                container.innerHTML = '<p>No members found in this club</p>';
                return;
            }
            
            for (const member of members) {
                let userData = member.user_id;
                if (typeof userData !== 'object') {
                    const userResponse = await fetch(`/api/users/${member.user_id}`);
                    userData = await userResponse.json();
                }
                
                const isParticipant = participantIds.includes(userData._id);
                
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'flex items-center mb-2';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `member-${userData._id}`;
                checkbox.value = userData._id;
                checkbox.className = 'mr-2';
                checkbox.checked = isParticipant;
                checkbox.disabled = isParticipant;
                
                const label = document.createElement('label');
                label.htmlFor = `member-${userData._id}`;
                label.textContent = userData.name;
                
                checkboxDiv.appendChild(checkbox);
                checkboxDiv.appendChild(label);
                container.appendChild(checkboxDiv);
            }
        } catch (error) {
            console.error('Error loading members for participants:', error);
            document.getElementById('members-checkbox-container').innerHTML = 
                '<p>Error loading members. Please try again.</p>';
        }
    };
});