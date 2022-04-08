const mongoose = require('mongoose');

const isValidObjectId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId);
}

const isValidString = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}

const isValidBody = function(body) {
    return Object.keys(body).length > 0
}

module.exports = { 
    isValidObjectId,
    isValidString,
    isValidBody
 }