document.addEventListener("DOMContentLoaded", () => {
  fetchEvents();
});

async function fetchEvents() {
  const container = document.getElementById("eventsContainer");
  const noEventsMsg = document.getElementById("noEventsMsg");

  try {
    const res = await fetch("http://localhost:5000/api/events");
    const events = await res.json();

    if (!Array.isArray(events) || events.length === 0) {
      noEventsMsg.classList.remove("hidden");
      return;
    }

    events.forEach((event) => {
      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-lg shadow";

      card.innerHTML = `
      <h3 class="text-lg text-black font-semibold mb-2">${event.club_name}</h3>
      <p class="text-sm text-gray-600">${
        event.description || "No description provided."
      }</p>
      <p class="text-sm mt-2 text-blue-500">Date: ${new Date(
        event.date
      ).toLocaleDateString()}</p>
      <button onclick="registerForEvent('${
        event._id
      }')" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
        Register
      </button>
  `;
  

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to fetch events:", err);
    noEventsMsg.textContent = "Something went wrong fetching events.";
    noEventsMsg.classList.remove("hidden");
  }
}

async function registerForEvent(eventId) {
    const user = JSON.parse(localStorage.getItem('user'));
  
    if (!user || !user._id) {
      alert('You must be logged in to register for events.');
      window.location.href = 'login.html';
      return;
    }
  
    try {
      const res = await fetch('http://localhost:5000/api/eventregistrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: user._id,
          event: eventId
        })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('Successfully registered for event!');
      } else {
        alert(`Error: ${data.message || 'Registration failed'}`);
      }
  
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong during registration.');
    }
  }
  

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
