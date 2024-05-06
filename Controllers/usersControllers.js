const users = require("../models/usersSchema")
const admins = require("../models/adminusersSchema")
const moment = require("moment")
const csv = require("fast-csv");
const fs = require("fs");
const BASE_URL = process.env.BASE_URL
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt  = require("jsonwebtoken");
const keysecret = "shubhanshutiwariindreshguptamumb"


// email config

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user: "tiwarishubhanshu22499@gmail.com",
        pass:"ednz toga bild ullw"
    }
}) 


exports.userpost = async (req, res) => {
    const file = req.file.filename;
    const { fname, lname, email, mobile, gender, location, status } = req.body;

    if (!fname || !lname || !email || !mobile || !gender || !location || !status || !file) {
        res.status(500).json("All Inputs is required")
    }

    try {
        const preuser = await users.findOne({ email: email });

        if (preuser) {
            res.status(401).json("This user already exist in our databse")
        } else {

            const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

            const userData = new users({
                fname, lname, email, mobile, gender, location, status, profile: file, datecreated
            });
            await userData.save();
            res.status(200).json(userData);
            console.log(userData)
        }
    } catch (error) {
        console.error("Error in userpost:", error);
        res.status(500).json("Internal Server Error");
    }
};


// usersget
exports.userget = async (req, res) => {

    const search = req.query.search || ""
    const gender = req.query.gender || ""
    const status = req.query.status || ""
    const sort = req.query.sort || ""
    const page = req.query.page || 1
    const ITEM_PER_PAGE = 4;


    const query = {
        fname: { $regex: search, $options: "i" }
    }

    if (gender !== "All") {
        query.gender = gender
    }

    if (status !== "All") {
        query.status = status
    }


    try {

        const skip = (page - 1) * ITEM_PER_PAGE  // 1 * 4 = 4

        const count = await users.countDocuments(query);

        const usersdata = await users.find(query)
            .sort({ datecreated: sort == "new" ? -1 : 1 })
            .limit(ITEM_PER_PAGE)
            .skip(skip);

        const pageCount = Math.ceil(count / ITEM_PER_PAGE);  // 8 /4 = 2

        res.status(200).json({
            Pagination: {
                count, pageCount
            },
            usersdata
        })
    } catch (error) {
        res.status(401).json(error)
    }

}

// single user get
exports.singleuserget = async (req, res) => {

    const { id } = req.params;

    try {
        const userdata = await users.findOne({ _id: id });
        res.status(200).json(userdata)
    } catch (error) {
        res.status(401).json(error)
    }
}

// user edit
exports.useredit = async (req, res) => {
    const { id } = req.params;
    const { fname, lname, email, mobile, gender, location, status, user_profile } = req.body;
    const file = req.file ? req.file.filename : user_profile

    const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

    try {
        const updateuser = await users.findByIdAndUpdate({ _id: id }, {
            fname, lname, email, mobile, gender, location, status, profile: file, dateUpdated
        }, {
            new: true
        });

        await updateuser.save();
        res.status(200).json(updateuser);
    } catch (error) {
        res.status(401).json(error)
    }
}


// delete user
exports.userdelete = async (req, res) => {
    const { id } = req.params;
    try {
        const deletuser = await users.findByIdAndDelete({ _id: id });
        res.status(200).json(deletuser);
    } catch (error) {
        res.status(401).json(error)
    }
}

// chnage status
exports.userstatus = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        const userstatusupdate = await users.findByIdAndUpdate({ _id: id }, { status: data }, { new: true });
        res.status(200).json(userstatusupdate)
    } catch (error) {
        res.status(401).json(error)
    }
}

// export user
exports.userExport = async (req, res) => {
    try {
        const usersdata = await users.find();

        const csvStream = csv.format({ headers: true });

        if (!fs.existsSync("public/files/export/")) {
            if (!fs.existsSync("public/files")) {
                fs.mkdirSync("public/files/");
            }
            if (!fs.existsSync("public/files/export")) {
                fs.mkdirSync("./public/files/export/");
            }
        }

        const writablestream = fs.createWriteStream(
            "public/files/export/users.csv"
        );

        csvStream.pipe(writablestream);

        writablestream.on("finish", function () {
            res.json({
                downloadUrl: `${BASE_URL}/files/export/users.csv`,
            });
        });
        if (usersdata.length > 0) {
            usersdata.map((user) => {
                csvStream.write({
                    FirstName: user.fname ? user.fname : "-",
                    LastName: user.lname ? user.lname : "-",
                    Email: user.email ? user.email : "-",
                    Phone: user.mobile ? user.mobile : "-",
                    Gender: user.gender ? user.gender : "-",
                    Status: user.status ? user.status : "-",
                    Profile: user.profile ? user.profile : "-",
                    Location: user.location ? user.location : "-",
                    DateCreated: user.datecreated ? user.datecreated : "-",
                    DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
                })
            })
        }
        csvStream.end();
        writablestream.end();


    } catch (error) {
        res.status(401).json(error)
    }
}



exports.adminpost = async (req, res) => {

    const { aname, aemail, password, cpassword } = req.body;

    if (!aname || !aemail || !password || !cpassword) {
        return res.status(422).json({ error: "Plz filled the field properly" });
    }

    try {

        const userExist = await admins.findOne({ aemail: aemail });

        if (userExist) {
            return res.status(422).json({ error: "Email already Exist" });
        } else if (password != cpassword) {
            return res.status(422).json({ error: "password are not matching" });
        } else {
            const finaluser = new admins({ aname, aemail, password, cpassword });
            // yeha pe 
            await finaluser.save();
            res.status(201).json({ message: "user registered successfuly" });
        }


    } catch (err) {
        console.log(err);
    }

};



// user Login

exports.loginpost = async (req, res) => {
    // console.log(req.body);

    //     const { aemail, password } = req.body;

    //     if (!aemail || !password) {
    //         res.status(422).json({ error: "Please fill in all the details" });
    //     }

    //     try {
    //         const userValid = await admins.findOne({ aemail: aemail })

    //         if (userValid) {
    //             const isMatch = await bcrypt.compare(password, userValid.password)

    //             if (!isMatch) {
    //                 res.status(422).json({ error: "invalid details" })
    //             } else {


    //                 const token = await userValid.generateAuthToken();
    //                 console.log(token)

    //                 // cookiegenerate
    //                 // res.cookie("usercookie", token, {
    //                 //     expires: new Date(Date.now() + 9000000),
    //                 //     httpOnly: true
    //                 // });

    //                 // const result = {
    //                 //     userValid,
    //                 //     token
    //                 // }
    //                 // res.status(201).json({ status: 201, result })
    //             }
    //         }

    //     } catch (error) {
    //         res.status(401).json(error);
    //         console.log("catch block");
    //     }
    // };

    try {
        const { aemail, password } = req.body;

        if (!aemail || !password) {
            return res.status(400).json({ error: "Plz Filled the data" })
        }

        const userLogin = await admins.findOne({ aemail: aemail });

        console.log(userLogin);

        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);



            if (!isMatch) {
                res.status(400).json({ error: "Invalid Credientials " });
            } else {
                // need to genereate the token and stored cookie after the password match 
                const token = await userLogin.generateAuthToken();
                console.log(token);

                res.cookie("jwtoken", token, {
                    expires: new Date(Date.now() + 9000000),
                    httpOnly: true
                });
                const result = {
                    userLogin,
                    token
                }
                res.json({ message: "user Signin Successfully",result });
            }
        } else {
            res.status(400).json({ error: "Invalid Credientials " });
        }

    } catch (err) {
        console.log(err);
    }
};


// user valid
// exports.validuserget = async (req, res) => {
//     // console.log(done)
//     try {
//         const ValidUserOne = await admins.findOne({_id:req.userId});
//         res.status(201).json({status:201,ValidUserOne});
//     } catch (error) {
//         res.status(401).json({status:401,error});
//     }
// };


exports.validuserget = async (req, res) => {
    console.log('Hello my home');
    res.send(req.rootUser);
};


// Logout  ka  page  yaha hai
exports.logoutuser = async (req, res) => {
    console.log(`Hello my Logout Page`);
    res.clearCookie('jwtoken', { path: '/' });
    res.status(200).send('User logout');
};


// send email Link For reset Password
exports.passwordlink = async (req, res) => {
    console.log(req.body)
    const {aemail} = req.body;

    if(!aemail){
        res.status(401).json({status:401,message:"Enter Your Email"})
    }

    try {
        const userfind = await admins.findOne({aemail:aemail});
        // console.log(userfind)

        // token generate for reset password
        const token = jwt.sign({_id:userfind._id},keysecret,{
            expiresIn:"120s"
        });
    //    console.log("token",token)

         const setusertoken = await admins.findByIdAndUpdate({_id:userfind._id},{verifytoken:token},{new:true});
        //  console.log("setusertoken",setusertoken)

        if(setusertoken){
            const mailOptions = {
                from:"tiwarishubhanshu22499@gmail.com",
                to:aemail,
                subject:"Sending Email For password Reset",
                text:`This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`
            }

            transporter.sendMail(mailOptions,(error,info)=>{
                if(error){
                    console.log("error",error);
                    res.status(401).json({status:401,message:"email not send"})
                }else{
                    console.log("Email sent",info.response);
                    res.status(201).json({status:201,message:"Email sent Succsfully"})
                }
            })

        }

    } catch (error) {
        res.status(401).json({status:401,message:"invalid user"})
    }

};


// verify user for forgot password time
exports.forgetpassword = async (req, res) => {
    const {id,token} = req.params;

    try {
        const validuser = await admins.findOne({_id:id,verifytoken:token});
        // console.log(validuser)
        const verifyToken = jwt.verify(token,keysecret);

        console.log(verifyToken)

        if(validuser && verifyToken._id){
            res.status(201).json({status:201,validuser})
        }else{
            res.status(401).json({status:401,message:"user not exist"})
        }

    } catch (error) {
        res.status(401).json({status:401,error})
    }
};



// change password

exports.changepassword = async (req, res) => {
    const {id,token} = req.params;

    const {password} = req.body;

    try {
        const validuser = await admins.findOne({_id:id,verifytoken:token});
        
        const verifyToken = jwt.verify(token,keysecret);

        if(validuser && verifyToken._id){
            const newpassword = await bcrypt.hash(password,12);

            const setnewuserpass = await admins.findByIdAndUpdate({_id:id},{password:newpassword});

            setnewuserpass.save();
            res.status(201).json({status:201,setnewuserpass})

        }else{
            res.status(401).json({status:401,message:"user not exist"})
        }
    } catch (error) {
        res.status(401).json({status:401,error})
    }
}
