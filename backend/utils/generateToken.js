const jwt = require('jsonwebtoken');

const generateToken = (id, name, email, avatar, role) => { 
  return jwt.sign(
    { id, name, email, avatar, role }, 
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

module.exports = generateToken;