/**
 * Users.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	attributes: {
		name: {
			type: "string",
			required: true,
		},
		email: {
			type: "string",
			required: true,
			isEmail: true,
		},
		password: {
			type: "string",
			required: true,
		},
		token: {
			type: "string",
		},

		member: {
			collection: "accounts",
			via: "memberId",
			through: "accmembers",
		},
	},

	createAcc: async function (inputs) {
		inputs.createdAt = new Date().toLocaleString();
		const accInfo = await Accounts.create(inputs).fetch();
		console.log("Account is Created ");
		return accInfo;
	},

	validate: function (req) {
		req.check("name").exists().withMessage("User Name is require");
		req.check("email").exists().withMessage("Email is require");
		req.check("email").exists().isEmail().withMessage("Enter valid Email");
		req.check("password").exists().withMessage("Password is require");
		req.check("password")
			.exists()
			.isLength({ min: 8 })
			.withMessage("Password length is weak, Enter minimum 8 characters");
	},
};
