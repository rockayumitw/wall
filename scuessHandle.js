const headers = require('./headers');

function handleSuccess (res, data, message) {
  res.writeHead(200, headers);
  res.write(JSON.stringify({
    "status": "success",
    "message": message,
    "data": data
  }))
  res.end();
}
module.exports = handleSuccess;