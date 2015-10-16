Items = new Mongo.Collection("items");
Emp = new Mongo.Collection("emp");
Users  =new Mongo.Collection("user");
Router.route('/register',function(){
    this.render("register");
});
Router.route("/empLogin");
Router.route("/",{
    template : "home",
    name : "home"
});
Router.configure({
    layoutTemplate:"main"
});
Router.route("/empPage");
Router.route("/ownerHome");
if (Meteor.isClient) {
    Template.regist.events({
    'submit form': function(event){
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Accounts.createUser({
           email: email,
           password: password
       });
       Router.go("/ownerHome");
    }
});
    Template.log.events({
        'submit form': function(event){
            event.preventDefault();
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Meteor.loginWithPassword(email, password);
            Router.go("/ownerHome");
        }
    });

    Template.empLogin.events({

        "submit form" : function(event){
            event.preventDefault();
            var username = event.target.empusername.value;
            var password = event.target.emppassword.value;
            var db = Emp.findOne({name:username});
            console.log(db.name);
            if(db.name == username && db.password ==password){
                console.log("Valid User");
                Router.go("/empPage");
            }
            else {
                console.log("Invalid User");
            }
        }


    });

    Template.createUser.events({

        "submit form" : function(event){
            event.preventDefault();
             Session.set("username",event.target.UserName.value);
             var name = Session.get("username");
             event.target.UserName.value="";
             console.log("added username " + name);
        }

    });
    Template.empPage.events({
        "submit .addItem":function(event){
            event.preventDefault();
            var user = Session.get("username");
            var item = event.target.itemName.value;
            var quan = event.target.quantity.value;
            var r = "\"" + item +"\"";
            var dbQuery = Items.findOne({name:item});
            console.log(dbQuery.price);
            var price = dbQuery.price;
            // console.log(price);
            var netprice = price * quan;
            console.log(netprice);
            Users.insert({
                name : user,
                itemName : item,
                quantity : quan,
                 price : price,
                netprice :netprice
            });
            event.target.itemName.value = "";
            event.target.quantity.value = "";
        },
        "click .removeBill":function(event){
            console.log("pressed remove");
            var id = this._id;
            Users.remove({
                _id:id
            });
            console.log("removed");
        },
        "click [name=billGenerate]":function(event){
            Session.set("finalamount",0);
            console.log("Generate Button Clicked");
            var user = Session.get("username");
            var finalamount = 0;
            Users.find({name:user}).forEach(function(myDoc){
                var item = myDoc.itemName;
                var quan = myDoc.quantity;
                finalamount = finalamount + myDoc.netprice;
                quan = quan * -1;
                var dbQuery = Items.findOne({name : item});
                Items.update({_id:dbQuery._id},{$inc :{quantity : quan}});
            });
            Session.set("finalamount",finalamount);
            //Meteor.call("removeusers");
            //Session.set("finalamount",0);
            // Users.remove({});
            // console.log(finalamount);
        },
        "click [name=Reset]":function(){
            Meteor.call("removeusers");
            Session.set("finalamount",0);

        }

    });
    Template.empPage.helpers({
        "useritem":function(){
            var user = Session.get("username");
            return Users.find({name:user});
        },
        "showAmount":function(){
            var ses = Session.get("finalamount");
            if(ses != 0)
                return "Final Amount " + ses;
            else {
                return "";
            }
        }

    });

    Template.authenticateemp.helpers({

        "employee":function(){
            return Emp.find();
        }
    });

    Template.authenticateemp.events({
        "submit form":function(event){
            event.preventDefault();
            var name = event.target.username.value;
            var password = event.target.password.value;
            Emp.insert({
                name : name,
                password : password
            });
            console.log("added "+name+"  "+password);

        },
        "click .delete":function(){
            var id = this._id;
            Emp.remove({_id:id});
            console.log("Removed "+name);
        }


    });
    Template.addingItems.events({
        "submit form":function(event){
            event.preventDefault();
            var name = event.target.name.value;
            var quan = event.target.quantity.value;
            // var id = event.target.Id.value;
            var price = event.target.price.value;
            Items.insert({
                name : name,
                // itemId : id,
                quantity : parseInt(quan),
                price : price,
                AddedAt : new Date()
            });
            event.target.name.value="";
            event.target.quantity.value="";
            event.target.price.value="";
            console.log("Item added to database "  + name);
        }

    });
    Template.displayItems.helpers({
        "retItems":function(){
            return Items.find();
        }

    });
    Template.displayItems.events({
        "click [name=removeItem]":function(){
            var id = this._id;
            Items.remove({_id : id});
            console.log("Removed an item");
        }
    });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.methods({
        "removeusers":function(){
            Users.remove({});
        }

    });
  });
}
