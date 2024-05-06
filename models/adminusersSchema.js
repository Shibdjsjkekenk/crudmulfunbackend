const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keysecret = "shubhanshutiwariindreshguptamumb"

const adminusersSchema = new mongoose.Schema({
    aname: {
        type: String,
        required: true,
        trim: true
    },
    aemail: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("not valid email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
    verifytoken:{
        type: String,
    }
});




adminusersSchema.pre("save", async function (next) {

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }

    next()
});


// token generate
adminusersSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, keysecret);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (err) {
        console.log(err);
    }
}

const admins = new mongoose.model("admins", adminusersSchema);
module.exports = admins;