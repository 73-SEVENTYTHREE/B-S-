const express = require ('express');
const router = express.Router();
const device = require ('../../../modules/handleDevice');
const bodyParser=require("body-parser");
const jsonParser = bodyParser.json ();
router.post('/', jsonParser, function(req, res, next) {
    device.alterDeviceName(req.body, res);
});

module.exports = router