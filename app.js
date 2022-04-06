const express = require("express")
const mailchimp = require("@mailchimp/mailchimp_marketing");
const dotenv = require("dotenv");
//load the dotenv library. config loads the variables into the process.env.
dotenv.config();
//
const app = express();
//
app.use(express.urlencoded()); // Parse URL-encoded bodies using query-string library

//This is used so that express can do server side rendering and pre-build html, css and js pages and then deliver to browser
app.use(express.static("public"));

//Sending the signup.html file to the browser as soon as a request is made on localhost:3000
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html")
})

//Setting up MailChimp

mailchimp.setConfig({
    //*****************************API KEY******************************
    apiKey: process.env.API_KEY,
    //*****************************API KEY PREFIX i.e.THE SERVER******************************
    server: process.env.API_PREFIX
});


//As soon as the sign up button is pressed execute this
app.post("/", function (req, res) {
    //****INPUTS IN HTML****
    const firstName = req.body.firstName;
    const secondName = req.body.secondName;
    const email = req.body.email;
    //***LIST ID***
    const listId = process.env.LIST_ID;
    //Creating an object with the users data
    const subscribingUser = {
        firstName: firstName,
        lastName: secondName,
        email: email
    };
    //Uploading the data to the server
    async function run() {
        const response = await mailchimp.lists.addListMember(listId, {
            email_address: subscribingUser.email,
            status: "subscribed",
            merge_fields: {
                FNAME: subscribingUser.firstName,
                LNAME: subscribingUser.lastName
            }
        });
        //logging the contact's id
        res.sendFile(__dirname + "/success.html")
        console.log(
            `Successfully added contact as an audience member. The contact's id is ${
     response.id
     }.`
        );
    }
    // In the catch block we're sending back the failure page. 
    run().catch(e => res.sendFile(__dirname + "/failure.html"));
});

//failure route
app.post("/failure", (req, res) => {
    res.redirect("/");
})


//Listening on port 3000 then logging a message saying that the server is running
app.listen(process.env.PORT || 3000, () => {
    console.log("Server Running On Port 3000");
});