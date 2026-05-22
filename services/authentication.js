const JWT = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY;

function generateToken(user) {
    const payload = { id: user.id, username: user.username, email: user.email,
    profileImgUrl: user.profileImgUrl, role: user.role
   };
  const token= JWT.sign(payload, secretKey, { expiresIn: '1h' });
  return token;
}

function verifyToken(token) {
    const payload = JWT.verify(token, secretKey);
    return payload;
}

module.exports = {
    generateToken,
    verifyToken
}