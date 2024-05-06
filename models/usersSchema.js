const mongoose = require("mongoose");
const validator = require("validator");



const usersSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw Error("not valid email")
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 10
    },
    gender: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    profile: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    datecreated:Date,
    dateUpdated:Date
});

// const adminusersSchema = new mongoose.Schema({
//     aname: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     aemail: {
//         type: String,
//         required: true,
//         unique: true,
//         validate(value) {
//             if (!validator.isEmail(value)) {
//                 throw new Error("not valid email")
//             }
//         }
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 6
//     },
//     cpassword: {
//         type: String,
//         required: true,
//         minlength: 6
//     },
//     tokens: [
//         {
//             token: {
//                 type: String,
//                 required: true,
//             }
//         }
//     ]
// });

// model
// const admins = new mongoose.model("admins", adminusersSchema);
const users = new mongoose.model("users",usersSchema);

// adminusersSchema.pre("save", async function (next) {

//     if (this.isModified("password")) {
//         this.password = await bcrypt.hash(this.password, 12);
//         this.cpassword = await bcrypt.hash(this.cpassword, 12);
//     }
//     next()
// });
// module.exports = admins ;
module.exports = users ;

// module.exports = { admins, users };

