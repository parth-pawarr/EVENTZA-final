// const isFacultyOrAdmin = (req, res, next) => {
//     const { role } = req.user;
  
//     if (role === "admin" || role === "faculty") {
//       next(); // access granted
//     } else {
//       return res.status(403).json({ message: "Access denied. Faculty or Admin only." });
//     }
//   };
  
//   module.exports = isFacultyOrAdmin;
  