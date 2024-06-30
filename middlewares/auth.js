const jwt = require("jsonwebtoken")


exports.auth = async (req, res, next) => {
  try {

    //Retrieve Token
    const { authorization } = req.headers;

    
    const token = req.header('x-auth-token') || authorization?.split(' ')[1];
  
    //Token Validation
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token, authorization denied',
      });
    }

    //JWT Verification
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
      if (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(403).json({ error: 'Token is not valid' });
      }

      //Attach user info with req Obj
      req.user = decoded.user;
      
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({
      success: false,
      error: 'Token is not valid',
    });
  }
};
