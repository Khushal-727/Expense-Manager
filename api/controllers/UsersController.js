/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var validate = require("sails-hook-validation-ev/lib/validate");

module.exports = {
	signup: async function (req, res) {
		validate(req);
		const errors = await req.getValidationResult();
		if (!errors.isEmpty()) {
			return res.status(400).json({ Failed: errors.array()[0].msg });
		}

		let { name, email, password } = req.body;
		const user1 = await Users.find({ email: email });
		if (user1.length >= 1) {
			console.log("Email Already Exists");
			return res.status(409).json({ Message: "Email Already Exists" });
		}
		let newUser;
		if (password.length >= 8) {
			const hashPwd = await bcrypt.hash(password, 10);
			let user = { name: name, email: email, password: hashPwd };
			newUser = await Users.create(user).fetch();
			console.log("User is Created");
		} else {
			return res.status(300).send("Enter password minimum 8 characters");
		}

		let account = { accName: name, userId: newUser.id };
		// Create defaultAcc for User using User model
		const newAcc = await Users.createAcc(account);

		//  Send mail througth helper using nodemailer
		info = await sails.helpers.mailSender(email, name);

		console.log("Mail is sent and Message id: " + info.messageId);
		return res.status(201).json({
			Message1: "User is Created",
			Created_User: newUser,
			Message2: "Account is Created",
			Created_Acc: newAcc,
			Meassage3: "Mail is sent and Message id: " + info.messageId,
		});
	},

	login: async function (req, res) {
		let { email, password } = req.body;
		const oldUser = await Users.findOne({ email: email });
		if (!oldUser) {
			console.log("Email is not Found");
			return res.status(401).json({ Message: "Email is not Found" });
		}
		const cmpPwd = await bcrypt.compare(password, oldUser.password);
		if (cmpPwd) {
			const token = jwt.sign(
				{ userId: oldUser.id },
				process.env.JWT_KEY,
				{ expiresIn: "5h" }
			);
			const updatedUser = await Users.updateOne(
				{ email: email },
				{ token: token }
			);
			if (updatedUser) {
				console.log("User Login successful");
				return res.status(200).json({
					Message: "User Login successful",
					User_id: oldUser.id,
					Token: token,
				});
			}
		}
		console.log("Admin Password is Invalid");
		return res.status(401).json({ Message: "Admin Password is Invalid" });
	},

	logout: async function (req, res) {
		let user = req.userData.userId;
		const updatedUser = await Users.updateOne({ id: user }, { token: "" });
		console.log("Admin Logout successful");
		return res.status(200).json({
			User_id: updatedUser.id,
			Message: "Admin Logout successful",
		});
	},
};
