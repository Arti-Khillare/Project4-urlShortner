const urlModel = require('../models/urlModel');
const validUrl = require('valid-url');
const shortid = require('shortid');
const validator = require('../valid/validator')
const redis = require("redis");
const { promisify } = require("util");

//redis connection
const redisClient = redis.createClient(
    13613,
    "redis-13613.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("37FYe020Abr5GS4eFxhP0SjHNs4KvNpX", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
  const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//shorten API
let shortenUrl = async function (req, res) {
    try{
        let requestBody = req.body ;

        if (Object.keys(requestBody).length === 0) {
            return res.status(400).send({ status: false, msg: `Invalid Request. Please provide url details ` })
        }
        const baseUrl = "http://localhost:3000" ;

        let {longUrl} = requestBody ;

        if(!validUrl.isUri(baseUrl)) {
          return res.status(401).send({ status: false, msg: `Please provide valid baseurl`});
        }

        if(!requestBody.longUrl) {
            return res.status(400).send({ status: false, msg: `longUrl is required`}) ;
        }

        if (!validator.isValidString(longUrl)) {
            return res.status(400).send({ status: false, msg: `longUrl  must be filled with string` });
        }

        if(!validUrl.isUri(longUrl)) {
            return res.status(401).send({ status: false, msg: `Please provide valid url`});
        }

        const cahcedUrl= await GET_ASYNC(`${longUrl}`)
        const newCahcedUrl=JSON.parse(cahcedUrl)
        if(newCahcedUrl){
        return res.status(200).send({ status: "true", data: newCahcedUrl })
       }
        //checkurl alredy exist
        const ExistUrl = await  urlModel.findOne({longUrl:longUrl})
        if(ExistUrl) { 
          await SET_ASYNC(`${longUrl}`,JSON.stringify(ExistUrl))
          return res.status(200).send({status: true, data: ExistUrl})
        } 

        // final create a post request;
        let urlCode = shortid.generate().toLocaleLowerCase() ;
        const ExistUrlcode = await urlModel.findOne({urlCode:urlCode})
        if(ExistUrlcode) { return res.status(400).send({status: false, msg: `Urlcode already exist`})}
        let shortUrl = baseUrl + "/" + urlCode ;
        let finalbody = {
            "urlCode" : urlCode,
            "longUrl" : longUrl,
            "shortUrl" : shortUrl
        };
        let createUrl = await urlModel.create(finalbody);
        return res.status(201).send({ status: true, msg: `Succesfully url is created`, data: createUrl});
    }
    catch(error) {
        return res.status(500).send({ status: false, error: error.message }) ;
    }
}

//redirect API
const redirectUrl = async function (req, res) {
  try{
      let urlCode = req.params.urlCode
     
      let cahcedUrlData = await GET_ASYNC(`${urlCode}`)
      if(cahcedUrlData) {
      return res.status(302).redirect(JSON.parse(cahcedUrlData))
     }
     let url = await urlModel.findOne({urlCode:urlCode}); 
     if(url)
     {
      
      await SET_ASYNC(`${urlCode}`, JSON.stringify(url.longUrl))
      return res.status(302).redirect(url.longUrl)
     }
     return res.status(400).send({status: false, msg: `No URL found`})
 }
  catch(error) {
      return res.status(500).send({status: false, error: error.message})
  }
}

module.exports = {shortenUrl, redirectUrl}