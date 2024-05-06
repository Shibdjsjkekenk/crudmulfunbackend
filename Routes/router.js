const express = require("express");
const router = new express.Router();
const controllers = require("../Controllers/usersControllers");
const upload = require("../multerconfig/storageConfig");
const authenticate = require("../middleware/authenticate");

router.post("/user/register", upload.single("user_profile"), controllers.userpost);
router.get("/user/details", controllers.userget);
router.get("/user/:id",controllers.singleuserget);
router.put("/user/edit/:id",upload.single("user_profile"),controllers.useredit);
router.delete("/user/delete/:id",controllers.userdelete);
router.put("/user/status/:id",controllers.userstatus);
router.get("/userexport",controllers.userExport);

router.post("/signup" , controllers.adminpost);
router.post("/login" , controllers.loginpost);
// router.get("/validuser" middleware.authenticate, controllers.validuserget);
router.get("/home", authenticate, controllers.validuserget);
router.get("/logout", controllers.logoutuser);
router.post("/sendpasswordlink", controllers.passwordlink);
router.get("/forgotpassword/:id/:token", controllers.forgetpassword);
router.post("/:id/:token", controllers.changepassword);
// router.post("/admin/register" ,async(res,req)=>{
// console.log(req.body)
// });







module.exports = router