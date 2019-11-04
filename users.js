'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const mustache = require('mustache');
const querystring = require('querystring');
const axios = require('axios');
const multer = require('multer');
const upload = multer({storage:multer.memoryStorage()});

const STATIC_DIR = 'statics';
const TEMPLATES_DIR = 'templates';



function serve(port, base, model) {
  const app = express();
  app.locals.port = port;
  app.locals.base = base;
  app.locals.model = model;
  process.chdir(__dirname);
  app.use(base, express.static(STATIC_DIR));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  setupTemplates(app);
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}


module.exports = serve;

/******************************** Routes *******************************/

function setupRoutes(app) {
  const base = app.locals.base;
  app.get(`/index.html`, function(request,response){
						response.sendFile(__dirname+'/index.html');});
  app.get(`/unhide`, doUnhide(app));
  app.get(`/hide`,doHide(app));
  app.post(`/hSuccess`,upload.single('msg'),resHide(app));
  app.post(`/uSuccess`,resUnHide(app));
}

/************************** Field Definitions **************************/

const FIELDS_INFO = {
  id: {
    friendlyName: 'User Id',
    isSearch: 'true',
    isId: 'true',
    isRequired: 'true',
    regex: /^\w+$/,
    error: 'User Id field can only contain alphanumerics or _',
  },
  firstName: {
    friendlyName: 'First Name',
    isSearch: 'true',
    regex: /^[a-zA-Z\-\' ]+$/,
    error: "First Name field can only contain alphabetics, -, ' or space",
  },
  lastName: {
    friendlyName: 'Last Name',
    isSearch: 'true',
    regex: /^[a-zA-Z\-\' ]+$/,
    error: "Last Name field can only contain alphabetics, -, ' or space",
  },
  email: {
    friendlyName: 'Email Address',
    isSearch: 'true',
    type: 'email',
    regex: /^[^@]+\@[^\.]+(\.[^\.]+)+$/,
    error: 'Email Address field must be of the form "user@domain.tld"',
  },
  birthDate: {
    friendlyName: 'Date of Birth',
    isSearch: 'false',
    type: 'date',
    regex: /^\d{4}\-\d\d?\-\d\d?$/,
    error: 'Date of Birth field must be of the form "YYYY-MM-DD"',
  },
};

const FIELDS =
  Object.keys(FIELDS_INFO).map((n) => Object.assign({name: n}, FIELDS_INFO[n]));

/*************************** Action Routines ***************************/
function URL(baseUrl) {
  this.WSUrl = baseUrl;
}

function doHide(app){
	
	return async function(req, res){
	let listUrl = app.locals.model.usersUrl+"/api/images/inputs";
	let view = {};
	let key = 'imgList';
	view[key] = [];
try{
	let listData = await axios.get(listUrl);
  
	//console.log(listData.data);
	var listImg = listData.data;
	//let byteArray = [];
	}catch(err)
	{	
		let key = 'error';
		view[key].push({error : err});
		let html = mustache.render(app.templates['hide'], view);
		res.send(html);
	}
	 	
	
	for(let i=0;i<listImg.length;i++)
	{
		view[key].push({imgUrl : listUrl+"/"+listImg[i]+".png", imgName : listImg[i]+".png"});
	}
	
	//console.log(view);
	const html = mustache.render(app.templates['hide'], view);
	res.send(html);
};
};

function resHide(app){
	return async function(req,res){
		try{
		if(!req.body.msg && !req.file && !req.body.img){
			let view = {};
			let key = 'error';
			view[key] = [];
			view[key].push({error : 'Image Not Selected & Message not Entered or Message File not Selected'});
			let html = mustache.render(app.templates['hide'], view);
			res.send(html);
			return;
		}


		if(!req.body.msg && req.file && !req.body.img){
			let view = {};
			let key = 'error';
			view[key] = [];
			view[key].push({error : 'Image File not selected'});
			let html = mustache.render(app.templates['hide'], view);
			res.send(html);
			return;
		}

		if(req.body.msg && !req.file && !req.body.img){
			let view = {};
			let key = 'error';
			view[key] = [];
			view[key].push({error : 'Image File not selected'});
			let html = mustache.render(app.templates['hide'], view);
			res.send(html);
			return;
		}

		if(req.body.msg && req.file && !req.body.img){
			let view = {};
			let key = 'error';
			view[key] = [];
			view[key].push({error : 'Image File not selected'});
			let html = mustache.render(app.templates['hide'], view);
			res.send(html);
			return;
		}																																																																																																																																																																																																																																																			

		if(!req.body.msg && !req.file && req.body.img){
			let view = {};
			let key = 'error';
			view[key] = [];
			view[key].push({error : 'Please select a message file or Enter a message to hide'});
			let html = mustache.render(app.templates['hide'], view);
			res.send(html);
			return;
		}
		let ReqData = {};
		let obj = req.body;
		if(!req.body.msg && req.file && req.body.img){
			let FData = req.file.buffer.toString();
			ReqData = {outGroup:"steg", msg:FData};
		}
		else{
			//let FData = req.file.buffer.toString();
			ReqData = {outGroup:"steg", msg:obj.msg};
		}
		
			
		let stegStr = obj.img.replace("images","steg").replace(".png","");
		let HideRes = await axios.post(stegStr,ReqData);
		let nStegStr = stegStr.substring(stegStr.lastIndexOf("/")+1,stegStr.length);
		let view = {msg:ReqData.msg,img:nStegStr,imgLoc:HideRes.headers.location};
		const html = mustache.render(app.templates['hSuccess'], view);
		res.send(html);
}catch(err){
		let view = {};
		let key = 'error';
		view[key] = [];
		view[key].push({error : err});
		let html = mustache.render(app.templates['uhide'], view);
		res.send(html);
}
};
};

function doUnhide(app){
	return async function(req,res){
		try{
			let listOUrl = app.locals.model.usersUrl+"/api/images/steg";
			let view = {};
			let key = 'imgOList';
			view[key] = [];
			let listOData = await axios.get(listOUrl);
			let listOImg = listOData.data;			
			for(let i=0;i<listOImg.length;i++)
			{
		view[key].push({imgOUrl : listOUrl+"/"+listOImg[i]+".png", imgOName : listOImg[i]+".png"});
			}
			const html = mustache.render(app.templates['unhide'], view);
			res.send(html);
}catch(err){
		let view = {};
		let key = 'error';
		view[key] = [];
		view[key].push({error : err});
		let html = mustache.render(app.templates['unhide'], view);
		res.send(html);
}
};
};

function resUnHide(app){
	return async function(req,res){
		try{
			let obj = req.body;
			//console.log(obj);
			if(obj.img){
			let stegStr = obj.img.replace("images","steg").replace(".png","");
			let UHideRes = await axios.get(stegStr);
			let nStegStr = stegStr.substring(stegStr.lastIndexOf("/")+1,stegStr.length);
			let view = {msg:UHideRes.data.msg,img:nStegStr,imgLoc:stegStr};
			const html = mustache.render(app.templates['uSuccess'], view);
			res.send(html);
		}
		else{
			let view = {};
			let key = 'error';
			view[key] = [];
			view[key].push({error : 'Image Not Selected'});
			let html = mustache.render(app.templates['unhide'], view);
			res.send(html); 	
	}
}catch(err){
		let view = {};
		let key = 'error';
		view[key] = [];
		view[key].push({error : err});
		let html = mustache.render(app.templates['unhide'], view);
		res.send(html);
}
}
};

/************************** Field Utilities ****************************/

/** Return copy of FIELDS with values and errors injected into it. */
function fieldsWithValues(values, errors={}) {
  return FIELDS.map(function (info) {
    const name = info.name;
    const extraInfo = { value: values[name] };
    if (errors[name]) extraInfo.errorMessage = errors[name];
    return Object.assign(extraInfo, info);
  });
}

/** Given map of field values and requires containing list of required
 *  fields, validate values.  Return errors hash or falsy if no errors.
 */
function validate(values, requires=[]) {
  const errors = {};
  requires.forEach(function (name) {
    if (typeof values[name] === 'undefined') {
      errors[name] =
	`A value for '${FIELDS_INFO[name].friendlyName}' must be provided`;
    }
  });
  for (const name of Object.keys(values)) {
    const fieldInfo = FIELDS_INFO[name];
    const value = values[name];
    if (fieldInfo.regex && !value.match(fieldInfo.regex)) {
      errors[name] = fieldInfo.error;
    }
  }
  return Object.keys(errors).length > 0 && errors;
}

function getNonEmptyValues(values) {
  const out = {};
  Object.keys(values).forEach(function(k) {
    if (typeof FIELDS_INFO[k] !== 'undefined') {
      const v = values[k];
      if (v && v.trim().length > 0) out[k] = v.trim();
    }
  });
  return out;
}

/** Return a model suitable for mixing into a template */
function errorModel(app, values={}, errors={}) {
  return {
    base: app.locals.base,
    errors: errors._,
    fields: fieldsWithValues(values, errors)
  };
}

/************************ General Utilities ****************************/

/** Decode an error thrown by web services into an errors hash
 *  with a _ key.
 */
function wsErrors(err) {
  const msg = (err.message) ? err.message : 'web service error';
  console.error(msg);
  return { _: [ msg ] };
}

function doMustache(app, templateId, view) {
  const templates = { footer: app.templates.footer };
  return mustache.render(app.templates[templateId], view, templates);
}

function errorPage(app, errors, res) {
  if (!Array.isArray(errors)) errors = [ errors ];
  const html = doMustache(app, 'errors', { errors: errors });
  res.send(html);
}

function isNonEmpty(v) {
  return (typeof v !== 'undefined') && v.trim().length > 0;
}

function setupTemplates(app) {
  app.templates = {};
  for (let fname of fs.readdirSync(TEMPLATES_DIR)) {
    const m = fname.match(/^([\w\-]+)\.ms$/);
    if (!m) continue;
    try {
      app.templates[m[1]] =
	String(fs.readFileSync(`${TEMPLATES_DIR}/${fname}`));
    }
    catch (e) {
      console.error(`cannot read ${fname}: ${e}`);
      process.exit(1);
    }
  }
}


