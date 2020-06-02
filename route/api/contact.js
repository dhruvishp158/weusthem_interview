const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator"); //check express validation docs
const Contact = require("../../model/Contact");
const uuid = require("uuid");
const multer = require("multer");
const path = require("path");
//@route  POST api/contact
//@desc  create or update Contact information
//@access private
router.post(
  "/",

  [
    check("firstName", "First name is required").notEmpty(),
    check("lastName", "Last name is required").notEmpty(),
    check("email", "Email ID is required").notEmpty(),
    check("phoneNumber", "Please enter a phone number of 10 digits").isLength({
      min: 10,
    }),
    check("email", "Please enter valid Email").isEmail(),
    check("phoneNumber", "Phone number is required").notEmpty(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let uId = uuid.v4();
    const {
      profilePicture,
      firstName,
      lastName,
      email,
      phoneNumber,
    } = req.body;
    //build profile object
    const contactFeilds = {};
    if (firstName) contactFeilds.firstName = firstName;
    if (lastName) contactFeilds.lastName = lastName;
    if (email) contactFeilds.email = email;
    if (phoneNumber) contactFeilds.phoneNumber = phoneNumber;
    if (profilePicture) contactFeilds.profilePicture = profilePicture;
    contactFeilds.id = uId;
    try {
      let contact = await Contact.findOne({ email });
      console.log(contact);
      //update contact
      if (contact) {
        contact = await Contact.findOneAndUpdate(
          { email: req.body.email },
          { $set: contactFeilds },
          { new: true }
        );
        return res.json(contact);
      }
      //   create;
      contact = new Contact(contactFeilds);
      await contact.save();
      res.send(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route  GET api/contact
//@desc  get all contacts
//@access public
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("servre error");
  }
});

//@route  GET api/contacts/user/:user_id
//@desc  get  profile  by user id
//@access public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Contact.findOne({
      id: req.params.user_id,
    });

    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.status(500).send("servre error");
  }
});

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" || ext !== ".jpeg" || ext !== "png") {
      return cb(res.status(400).end("only image please!"), end);
    }
    cb(null, true);
  },
});
var upload = multer({ storage: storage }).single("file");

//@route  POST api/profile/image
//@desc   upload profile Picture
//@access private
router.post("/image", (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.json({ success: false, err });
    console.log(res.req.file.filename);
    return res.json({
      success: true,
      image: res.req.file.path,
      filename: res.req.file.filename,
    });
  });
});
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
router.post("/searchByName", async (req, res) => {
  try {
    if (req.body.search) {
      const regex = new RegExp(escapeRegex(req.body.search), "gi");
      contacts = await Contact.find({ firstName: regex }, function (
        err,
        found
      ) {
        if (err) {
          console.log(err);
        } else {
          return res.json(found);
        }
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
});

//@route  Delete api/contacts
//@desc  Delete conatc
//@access private
router.delete("/:id", async (req, res) => {
  try {
    //delete profile
    await Contact.findOneAndRemove({
      id: req.params.id,
    });

    res.json({ msg: "contact has been removed successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("servre error");
  }
});
module.exports = router;
