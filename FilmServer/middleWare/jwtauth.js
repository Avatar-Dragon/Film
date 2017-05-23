var jwt = require('jwt-simple');

module.exports = function(req, res, next) {
  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
  
//  console.log(req.body);
//  console.log(req.query);
  
  if (token) {
    
    console.log(token);
    
    try {
      var decoded = jwt.decode(token, 'FILM_SECRET_STRING');
    } catch (err) {
      // 解析token失败，执行next()
      console.log('try err');
      return next();
    }
    
    if (decoded.exp <= Date.now()) {
      // 时间超时，返回400
      res.end('Access token has expired', 400);
    } else {
      // 如果时间合理，在req中加入token中的iss
      console.log('has token');
      req.name = decoded.iss;
      return next();
    }
    
  } else {
    // 没有token，执行next()
    console.log('no token');
    return next();
  }
  
  console.log('end token check');
};
