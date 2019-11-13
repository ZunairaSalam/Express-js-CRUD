var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var alert = require('alert-node');
var app = express();
var mongoose = require("mongoose");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost/my_db',{ useNewUrlParser:true}).then(
    (res)=>{
        console.log("database connected");
    }
).catch(()=>{
    console.log("database connection failed!");
});


//create user schema
var UserSchema = mongoose.Schema({ 
    name: String, email:String, role:String, password: String});
//create user model
var User = mongoose.model("User", UserSchema);

//create product schema
var productSchema = mongoose.Schema({
    Name: String, Description: String, Price: Number, category: String, ID: String });
//create product model
var Product = mongoose.model("Product",productSchema);



app.use(express.static('public'));

//start page show signup page and login option
app.get('/', function(req, res){
res.render('signup.pug');
});

//handle signup request
app.post('/signup', function(req, res){
    //check for empty fields
    if(!req.body.fname || !req.body.email || !req.body.password || !req.body.password1 || !req.body.role){
        alert("No field should be empty");
    }
    //check if user name already in use
    else{
        
    User.findOne({ name: req.body.fname }, function (err, response) {
        if (response != null) {
            alert("user " + req.body.fname + " already exist! Try Another Name.");
        }
        //check pasword match
        else{
            if(req.body.password !== req.body.password1)
            alert("Password Does not match!");

            else
            {   //create user in db
                var userObj = new User({ name: req.body.fname, role: req.body.role,password:req.body.password, email:req.body.email});
                userObj.save(function(err, user)
                {
                if(err) res.send("Database error");
                });
                //show product list
                Product.find({},function(err,result){
                
                if(req.body.role=='buyer')//show buyer view
                {
                    res.render("product.pug",{
                    documents:result
                    });
                }
                else{
                    res.render("seller.pug",{//show seller view
                    documents:result
                    });
                }
            });
           
            //
            app.post('/new', function (req, res) {
                Product.find({},function(err,result){
                    console.log(result);
                    res.render("product.pug",{
                       documents:result
                    });
            
                });
            });
             }
        }
         
    });
}
});
//handle add new fom
app.post('/add', function (req, res){
    if (!req.body.pname || !req.body.Description || !req.body.price || !req.body.category || !req.body.pid) {
        alert("No field should be empty");
    }
    else {
        //create product
        var newproduct = new Product({ ID:req.body.pid,Name: req.body.pname, Description: req.body.Description, Price: req.body.price, category: req.body.category });
        newproduct.save(function (err, product) {
            if (err) {
                res.send("Database error");

                throw err;}
            else
            Product.find({},function(err,result){
                console.log(result);
                res.render("seller.pug",{
                   documents:result
                });
            });
        });
    }
   
});


app.get('/login',function(req,res){
    res.render('login.pug');
});

app.post('/login',function(req,res){
    const uname=req.body.user_name;
if(!req.body.user_name || !req.body.pass)
    alert("fill all fields!");
else{
     //*********************check Seller********************/
    
        User.findOne({name:req.body.user_name, password:req.body.pass, role:'seller'},function(err,result){
        if(result==null)
        {
            //*******************check Buyer**************/
            User.findOne({name:req.body.user_name, password:req.body.pass, role:'buyer'},function(err,result)
            {
                if(result==null){
                console.log(result);
                alert("user name or password incorrect! ");
                
            }

            else
            {
                Product.find({},function(err,result){
                console.log(result);
                res.render("product.pug",{
                   documents:result});
                });
        
            }     
            });
            
        }
    
        else{
            Product.find({},function(err,result){
            console.log(result);
            res.render("seller.pug",{documents:result});
                });
            
         }     
    });

}
});


app.post('/new', function (req, res){
    res.render("newproduct.pug");
    app.post('/add', function (req, res) {
        if (!req.body.pname || !req.body.Description || !req.body.price || !req.body.category || !req.body.pimage) {
            alert("No field should be empty");
        }
        else {
            var newproduct = new Product({ Name: req.body.pname, Description: req.body.Description, Price: req.body.price, category: req.body.category});
            newproduct.save(function (err, User) {
                if (err) res.send("Database error");
                else
                    res.send("Successful");
            });
        }
    });

});
//handle the request of update button on the seller.pug form and display the update.pug form
app.post('/updateform',(req,res,next) =>{
   res.render("update.pug");   
  });
  
//handle data sent from update.pug form
app.post('/update', function(req,res){
    const name=req.body.name;
    const price=req.body.price;
    const category=req.body.category;
   
    const pid=req.body.pid;
  //find product by name and update rest of the fields
     Product.findOneAndUpdate({Name: name}, {Price:price,category:category}, function(err, response) { console.log(response); });
// display the updated product table
     Product.find({},
      function(err, result) {
        if (!err){ 
            res.render("seller.pug",{
                documents:result});
            
        }
        else { throw err;}
      }
    );
});

app.post('/deleteform', function(req, res){
    
    res.render('delete.pug');
      
});
   
app.post('/delete', function(req,res){
    const name=req.body.name;
    const pid=req.body.productId;
    
    
    Product.findOneAndRemove({Name: name}, function(err, response) { console.log(response); });
     
    
     Product.find({},
      function(err, result) {
        if (!err){ 
            res.render('seller.pug',{documents:result});
        }
        else { throw err;}
      }
    );
});
  
app.post("/logout", function (req, res) {
    res.render('signup.pug');
});
app.listen(3000);
