const express = require('express');
const router = express.Router();
const urlController = require('../controller/urlController')


//createUrl Api
router.post('/url/shorten' ,urlController.shortenUrl)

//getUrlApi
router.get('/:urlCode', urlController.redirectUrl)

module.exports = router;