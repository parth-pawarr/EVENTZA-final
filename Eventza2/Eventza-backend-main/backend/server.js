const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors({
  
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();


//routes
const userRoutes = require('./routes/userRoute'); 
app.use('/api/users', userRoutes);

const clubRoutes = require('./routes/clubRoute');
app.use('/api/clubs', clubRoutes);

const clubMembershipRoute = require('./routes/clubMembershipRoute');
app.use('/api/clubmemberships', clubMembershipRoute);

const eventRoutes = require('./routes/eventRoute');
app.use('/api/events', eventRoutes);

const eventRegistrationRoute = require('./routes/eventRegistrationRoute');
app.use('/api/eventregistrations', eventRegistrationRoute);

const fundRoute = require('./routes/fundRoute');
app.use('/api/funds', fundRoute);

const expenseRoute = require('./routes/expenseRoute');
app.use('/api/expenses', expenseRoute);

const penaltyRoute = require('./routes/penaltyRoute');
app.use('/api/penalties', penaltyRoute);

const authRoutes = require('./routes/authRoute');
app.use('/api/auth', authRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
