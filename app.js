var express=require('express')
var bodyParser=require('body-parser')
var bcrypt =require('bcryptjs')
const saltRounds=10//no. of rounds it will go to hash a password i.e.2^10.saltrounds generate a random string.it adds on to the end of our password
var expressValidator=require('express-validator')
var app=express()
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(expressValidator())
var mongoose=require('mongoose')

mongoose.connect("mongodb://localhost:27017/user", { useNewUrlParser: true })


var todoSchema=new mongoose.Schema({
	name:String,
	user:{type:mongoose.Schema.Types.ObjectId, ref:myUser}
})

var todo=mongoose.model('Todo',todoSchema)

var userSchema=new mongoose.Schema({
	_id:mongoose.Schema.Types.ObjectId,
	firstname:String,
	lastname:String,
	username:{type:String,unique:true},
	password:String,
	todo:[{type:mongoose.Schema.Types.ObjectId, ref:todo}]
})


var myUser=mongoose.model('myuser',userSchema)



app.post('/registration',(req,res)=>{
	console.log("input submitted")
	var firstname=req.body.firstname;
	var lastname=req.body.lastname;
	var username=req.body.username;
	var password=req.body.password;
		/*req.checkBody('firstname','firstname is required').notEmpty();
		req.checkBody('lastname','lastname is required').notEmpty();
		req.checkBody('username','username is required').notEmpty();
		req.checkBody('passowrd','password is required').notEmpty();
		var errors=req.validationErrors();
		//const errors=validationResult(req)
		if(errors)
		{
			console.log("no")
			res.render('register.ejs',{errors:errors})
		}
		else
		console.log("yes")*/

		var newUser=new myUser()

		bcrypt.hash(password,saltRounds,(err,hash)=>{//hash is the hashed password generated
		if(err)
			console.log(err)
		else
			console.log(hash)
		newUser.password=hash;
		newUser.firstname=firstname;
		newUser.lastname=lastname;
		newUser.username=username;
		newUser._id= new mongoose.Types.ObjectId()
		myUser.create(newUser,(err,myUser)=>{
		if(err)
			console.log(err)
		else
			console.log("inserted"+newUser)
		})
	
	})
		res.redirect('/login.ejs')
})
	
	/*{
		firstname:req.body.firstname,
		lastname:req.body.lastname,
		username:req.body.username,
		password:req.body.password
	})//document created*/
	

	
	
	


app.post('/login-page',(req,res)=>{
	var username=req.body.username
	var password=req.body.password

	getUserByUsername=function(username,callback)
	{
		var query={username:username}
		myUser.findOne(query,callback)
	}
	comparePassword=function(password,hash,callback)
	{
		bcrypt.compare(password,hash,function(err,isMatch){
			if(err)
				console.log(err)
			else
				callback(null,isMatch)
		})
	}
	getUserByUsername(username,function(err,user){
		if(err)
			console.log(err)
		if(!user)
		{
			console.log("username does not exist")
			res.redirect('/login.ejs')
		}
	comparePassword(password,user.password,function(err,isMatch){
		if(err)
			console.log(err)
		if(isMatch){
			res.redirect('/todo')
		}
		else{
			console.log("invalid password")
			res.redirect('login.ejs')
		}
	})
	})

	
	})
		/*var myuser=myUser.findOne({username:username},(err,userdoc)=>{
			if(err)
				console.log(err)
			if(!userdoc)
				return res.send("invalid username and password")
			return res.send("successfully logged in")*/
		
app.post('/newtodo',(req,res)=>
{
	console.log("input submitted")
	var newTodo=new todo({//creating object of todo model..or creating the document of collection
		name:req.body.item,//storing the item received in name
		user:user._id
	})
	todo.create(newTodo,function(err,todo){//inserting into database 
		if(err)
			console.log(err)
		else
			console.log("inserted"+newTodo)
	})
	res.redirect('/todo')
})

app.get('/',(req,res)=>{
	res.render('register.ejs')
})
app.get('/login.ejs',(req,res)=>{
	res.render('login.ejs')
})

app.get('/Sign-in',(req,res)=>{
	res.render('login.ejs')
})

app.get('/todo',(req,res)=>{
	todo.find({},function(err,todoList){//find finds documents present is the collection,which is stored in todoList
		//{}inside this we write which document we want to search for.in this case all
			if(err)
				console.log(err)
			else
				res.render('index.ejs',{todolist:todoList})
	})
})

app.listen(3000,function()
{
	console.log("server starts at port 3000")
})