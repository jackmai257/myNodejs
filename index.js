var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.set("views","./views");

app.listen(3000);

var pg = require('pg');
var bodyParser = require('body-parser');
var multer = require('multer');

var urlencodeParser = bodyParser.urlencoded({extended: false});
var storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './public/upload')
	},
	filename: function(req, file, cb){
		cb(null, file.originalname)
	}
});
var upload = multer({storage: storage}).single('uploadfile');

var config = {
	user: 'postgres',
	database: 'hello',
	password: '123456',
	host: 'localhost',
	port: 5432,
	max: 10,
	idleTimeoutMillis: 30000,
};
var pool = new pg.Pool(config);

app.get("/", function(req, res){
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('select * from videos', function(err, result){
			done();

			if(err){
				res.end();
				return console.error('error running query', err);
			}
			res.render("home", {data:result});
		});		
	});	
});

app.get("/video/list", function(req, res){
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('select * from videos order by id', function(err, result){
			done();

			if(err){
				res.end();
				return console.error('error running query', err);
			}
			res.render("list", {data:result});
		});
	});	
});

//delete data
app.get("/video/delete/:id", function(req, res){
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('delete from videos where id ='+req.params.id, function(err, result){
			done();

			if(err){
				res.end();
				return console.error('error running query', err);
			}
			res.redirect("../../video/list");
		});
	});	
});

app.get("/video/list", function(req, res){
	res.render("list");
	});

//add new data
app.get("/video/add", function(req, res){
	res.render("add");
	});

app.post("/video/add", urlencodeParser, function(req, res){
	upload(req, res, function(err){
		if(err){
			//An error occured when uploading
			res.send('error!!!');
		}
		else{
			if(req.file == undefined){
				res.send("the file invalid!");
			}
			else{
				pool.connect(function(err, client, done){
				if(err){
					return console.error('error fetching client from pool', err);
				}
				var sql = "insert into videos(title, descriptions, key, image) values('"+req.body.title+"','"+req.body.title+"','"+req.body.key+"','"+req.file.originalname+"')";
				client.query(sql, function(err, result){
					done();

					if(err){
						res.end();
						return console.error('error running query', err);
					}
					res.redirect("./list");
				});
			});
		}
	};
});
});