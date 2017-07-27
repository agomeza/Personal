var express = require('express');
var router = express.Router();

var crypto = require('crypto'),
algorithm = 'aes-256-ctr',
password = 'VGTU';

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



module.exports = router;
