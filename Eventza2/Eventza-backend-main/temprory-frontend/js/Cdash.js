//drop down of select club
document.addEventListener("DOMContentLoaded", () => {
    loadClubsIntoSelector();
  });
  
  async function loadClubsIntoSelector() {
    const selector = document.getElementById("club-selector");
  
    try {
      const res = await fetch("http://localhost:5000/api/clubs");
      const clubs = await res.json();
  
      // Clear existing options except the first one
      selector.innerHTML = '<option value="">Select Club</option>';
  
      if (Array.isArray(clubs) && clubs.length > 0) {
        clubs.forEach(club => {
          const option = document.createElement("option");
          option.value = club._id || club.id; // Use appropriate ID field
          option.textContent = club.club_name;
          selector.appendChild(option);
        });
      } else {
        const option = document.createElement("option");
        option.textContent = "No clubs found";
        option.disabled = true;
        selector.appendChild(option);
      }
    } catch (error) {
      console.error("Error loading clubs:", error);
      const option = document.createElement("option");
      option.textContent = "Failed to load clubs";
      option.disabled = true;
      selector.appendChild(option);
    }
  }

// add new club
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("add-btn");
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const modalFormContainer = document.getElementById("modal-form-container");
    const saveBtn = document.getElementById("save-modal");
  
    addBtn.addEventListener("click", () => {
      // Set modal title
      modalTitle.textContent = "Add New Club";
  
      // Load club form into modal
      modalFormContainer.innerHTML = `
        <form id="club-form">
          <label class="block mb-2 text-sm font-medium text-gray-700">Club Name</label>
          <input type="text" id="club-name" class="w-full px-4 py-2 border rounded-md mb-4" required placeholder="Enter club name" />
          
          <label class="block mb-2 text-sm font-medium text-gray-700">Description</label>
          <textarea id="club-description" class="w-full px-4 py-2 border rounded-md mb-4" placeholder="Enter description"></textarea>
        </form>
      `;
  
      // Show modal
      modal.classList.remove("hidden");
  
      // Attach form submission handler
      saveBtn.onclick = async () => {
        const name = document.getElementById("club-name").value.trim();
        const description = document.getElementById("club-description").value.trim();
      
        if (!name) {
          alert("Club name is required");
          return;
        }
      
        try {
          const res = await fetch("http://localhost:5000/api/clubs/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
          });
      
          if (!res.ok) throw new Error("Failed to add club");
      
          const newClub = await res.json();
      
          // 1. Refresh club selector dropdown
          await loadClubsIntoSelector();
      
          // 2. Append new club to clubs grid
          const clubCard = document.createElement("div");
          clubCard.className = "bg-white p-4 rounded-lg shadow";
          clubCard.innerHTML = `
            <h4 class="text-lg font-semibold text-gray-800 mb-1">${newClub.club_name}</h4>
            <p class="text-sm text-gray-600">${newClub.description || "No description provided."}</p>
          `;
          document.getElementById("clubs-list").appendChild(clubCard);
      
          // 3. Close modal and show toast
          closeModal();
          showToast("Club added successfully!");
        } catch (err) {
          console.error(err);
          showToast("Error adding club", true);
        }
      };      
    });
  
    // Close modal and toast logic
    document.getElementById("close-modal").onclick =
      document.getElementById("cancel-modal").onclick = closeModal;
  
    function closeModal() {
      modal.classList.add("hidden");
      document.getElementById("modal-form-container").innerHTML = "";
    }
  
    function showToast(message, isError = false) {
      const toast = document.getElementById("toast");
      const toastMsg = document.getElementById("toast-message");
      toastMsg.textContent = message;
      toast.classList.remove("opacity-0", "translate-y-24");
      toast.classList.add("opacity-100", "translate-y-0");
      toast.style.backgroundColor = isError ? "#dc2626" : "#10b981"; // red or green
  
      setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-24");
      }, 3000);
    }
  
    document.getElementById("close-toast").addEventListener("click", () => {
      document.getElementById("toast").classList.add("opacity-0", "translate-y-24");
    });
  });
  



document.addEventListener("DOMContentLoaded", () => {
    updateDashboardStats();
  });
  
  async function updateDashboardStats() {
    const totalClubsElement = document.getElementById("total-clubs");
    const upcomingEventsElement = document.getElementById("upcoming-events");
  
    try {
      // Fetch clubs data
      const clubsRes = await fetch("http://localhost:5000/api/clubs");
      const clubs = await clubsRes.json();
  
      // Fetch events data
      const eventsRes = await fetch("http://localhost:5000/api/events");
      const events = await eventsRes.json();
      
      // Filter for upcoming events (events with dates in the future)
      const currentDate = new Date();
      const upcomingEvents = events.filter(event => new Date(event.date) > currentDate);
  
      // Update the dashboard counters
      
      if (Array.isArray(clubs)) {
        totalClubsElement.textContent = clubs.length;
      }
      
      if (Array.isArray(events)) {
        upcomingEventsElement.textContent = upcomingEvents.length;
      }
  
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      totalClubsElement.textContent = "-";
      upcomingEventsElement.textContent = "-";
    }
  }

  //recent events
  document.addEventListener("DOMContentLoaded", () => {
    displayEvents();
  });
  
  async function displayEvents() {
    const eventsListElement = document.getElementById("recent-events-list");
  
    try {
      const res = await fetch("http://localhost:5000/api/events");
      const events = await res.json();
  
      // Clear any previous content
      eventsListElement.innerHTML = "";
  
      if (Array.isArray(events) && events.length > 0) {
        events.forEach(event => {
          const eventDate = new Date(event.date);
          const eventItem = document.createElement("div");
          eventItem.className = "event-item";
  
          eventItem.innerHTML = `
            <h3>${event.event_name}</h3>
            <p>Date: ${eventDate.toLocaleDateString()}</p>
            <p>Location: ${event.venue || "TBA"}</p>
          `;
  
          eventsListElement.appendChild(eventItem);
        });
      } else {
        eventsListElement.textContent = "No events to display.";
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      eventsListElement.textContent = "Failed to load events.";
    }
  }
  

  //Total Income
  document.addEventListener("DOMContentLoaded", () => {
    // Call the function to update funds/income
    updateFundsStats();
  });
  
  async function updateFundsStats() {
    const totalFundsElement = document.getElementById("total-funds");
    const totalIncomeElement = document.getElementById("total-income");
    const totalExpensesElement = document.getElementById("total-expenses");
    const expensesSummaryElement = document.getElementById("expenses-summary");
    const balanceSummaryElement = document.getElementById("balance-summary");
  
    try {
      // Fetch funds/income data
      const fundsRes = await fetch("http://localhost:5000/api/funds");
      const funds = await fundsRes.json();
      
      // Calculate total income
      let totalIncome = 0;
      if (Array.isArray(funds)) {
        totalIncome = funds.reduce((sum, fund) => sum + parseFloat(fund.amount || 0), 0);
      }
      
      // Format as currency
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      });
      
      // Update the dashboard elements - both total-funds and total-income should show the same value
      totalFundsElement.textContent = formatter.format(totalIncome);
      
      if (totalIncomeElement) {
        totalIncomeElement.textContent = formatter.format(totalIncome);
      }
      
      // Calculate and update balance if expenses element exists
      if (totalExpensesElement && balanceSummaryElement) {
        // Get expenses value - strip currency symbol and convert to number
        const expensesText = totalExpensesElement.textContent;
        const expensesValue = parseFloat(expensesText.replace(/[^0-9.-]+/g, "") || 0);
        
        // Calculate balance
        const balance = totalIncome - expensesValue;
        
        // Update balance element
        balanceSummaryElement.textContent = formatter.format(balance);
        
        // Update the color based on balance
        if (balance < 0) {
          balanceSummaryElement.classList.remove("text-green-600");
          balanceSummaryElement.classList.add("text-red-600");
        } else {
          balanceSummaryElement.classList.remove("text-red-600");
          balanceSummaryElement.classList.add("text-green-600");
        }
        
        // Update expenses summary if it exists
        if (expensesSummaryElement) {
          expensesSummaryElement.textContent = formatter.format(expensesValue);
        }
      }
  
    } catch (err) {
      console.error("Failed to fetch funds/income data:", err);
      totalFundsElement.textContent = "$0";
      if (totalIncomeElement) totalIncomeElement.textContent = "$0";
    }
  }



  //expenses
  // Add this to your existing DOMContentLoaded event or create a new one
document.addEventListener("DOMContentLoaded", () => {
  // Call the function to update expenses
  updateExpensesStats();
});

async function updateExpensesStats() {
  const totalExpensesElement = document.getElementById("total-expenses");
  const expensesSummaryElement = document.getElementById("expenses-summary");
  const totalIncomeElement = document.getElementById("total-income");
  const balanceSummaryElement = document.getElementById("balance-summary");

  try {
    // Fetch expenses data
    const expensesRes = await fetch("http://localhost:5000/api/expenses");
    const expenses = await expensesRes.json();
    
    // Fetch funds/income data
    const fundsRes = await fetch("http://localhost:5000/api/funds");
    const funds = await fundsRes.json();
    
    // Calculate total expenses
    let totalExpenses = 0;
    if (Array.isArray(expenses)) {
      totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    }
    
    // Calculate total income
    let totalIncome = 0;
    if (Array.isArray(funds)) {
      totalIncome = funds.reduce((sum, fund) => sum + parseFloat(fund.amount || 0), 0);
    }
    
    // Calculate balance
    const balance = totalIncome - totalExpenses;
    
    // Format numbers as currency
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
    
    // Update the dashboard elements
    totalExpensesElement.textContent = formatter.format(totalExpenses);
    
    // Update financial summary section if these elements exist
    if (expensesSummaryElement) {
      expensesSummaryElement.textContent = formatter.format(totalExpenses);
    }
    
    if (totalIncomeElement) {
      totalIncomeElement.textContent = formatter.format(totalIncome);
    }
    
    if (balanceSummaryElement) {
      balanceSummaryElement.textContent = formatter.format(balance);
      
      // Optionally change the color based on balance
      if (balance < 0) {
        balanceSummaryElement.classList.remove("text-green-600");
        balanceSummaryElement.classList.add("text-red-600");
      } else {
        balanceSummaryElement.classList.remove("text-red-600");
        balanceSummaryElement.classList.add("text-green-600");
      }
    }

  } catch (err) {
    console.error("Failed to fetch expenses data:", err);
    totalExpensesElement.textContent = "$0";
    if (expensesSummaryElement) expensesSummaryElement.textContent = "$0";
    if (totalIncomeElement) totalIncomeElement.textContent = "$0";
    if (balanceSummaryElement) balanceSummaryElement.textContent = "$0";
  }
}

// Function to display recent transactions in the dashboard
async function displayRecentTransactions() {
  const transactionsElement = document.getElementById("recent-transactions");
  
  if (!transactionsElement) return;
  
  try {
    // Fetch both expenses and funds
    const [expensesRes, fundsRes] = await Promise.all([
      fetch("http://localhost:5000/api/expenses"),
      fetch("http://localhost:5000/api/funds")
    ]);
    
    const expenses = await expensesRes.json();
    const funds = await fundsRes.json();
    
    // Combine and format all transactions
    let transactions = [];
    
    if (Array.isArray(expenses)) {
      transactions.push(...expenses.map(expense => ({
        type: 'expense',
        description: expense.description,
        amount: parseFloat(expense.amount || 0),
        date: new Date(expense.date)
      })));
    }
    
    if (Array.isArray(funds)) {
      transactions.push(...funds.map(fund => ({
        type: 'income',
        description: fund.source,
        amount: parseFloat(fund.amount || 0),
        date: new Date(fund.date)
      })));
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => b.date - a.date);
    
    // Take only the most recent 5 transactions
    transactions = transactions.slice(0, 5);
    
    // Format currency
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
    
    // Clear the list
    transactionsElement.innerHTML = "";
    
    if (transactions.length === 0) {
      transactionsElement.innerHTML = "<li class='py-3'>No recent transactions</li>";
      return;
    }
    
    // Add transactions to the list
    transactions.forEach(transaction => {
      const li = document.createElement("li");
      li.className = "py-3 flex justify-between";
      
      const isExpense = transaction.type === 'expense';
      const amountClass = isExpense ? "text-red-600" : "text-green-600";
      const amountPrefix = isExpense ? "-" : "+";
      
      li.innerHTML = `
        <div>
          <div class="font-medium">${transaction.description}</div>
          <div class="text-sm text-gray-500">${transaction.date.toLocaleDateString()}</div>
        </div>
        <div class="${amountClass} font-medium">
          ${amountPrefix}${formatter.format(transaction.amount)}
        </div>
      `;
      
      transactionsElement.appendChild(li);
    });
    
  } catch (err) {
    console.error("Failed to fetch transaction data:", err);
    transactionsElement.innerHTML = "<li class='py-3'>Failed to load transactions</li>";
  }
}

// Call this function when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateExpensesStats();
  displayRecentTransactions();
});