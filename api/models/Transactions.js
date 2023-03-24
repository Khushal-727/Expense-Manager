/**
 * Transactions.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 **/

module.exports = {
	attributes: {
		accId: { model: "Accounts", required: true },

		type: {
			type: "string",
			enum: ["I", "E"],
			required: true,
		},

		amount: { type: "float", required: true },
		desc: { type: "string" },
		isDeleted: {
			type: "boolean",
			defaultsTo: false,
		},
		createdAt: {
			type: "ref",
		},
		createdBy: {
			model: "Users",
		},

		updatedAt: {
			type: "ref",
		},
		updatedBy: {
			model: "Users",
		},
		deletedAt: {
			type: "ref",
		},
		deletedBy: {
			model: "Users",
		},

		// { ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
		//  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
		//  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

		//  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
		//  ║╣ ║║║╠╩╗║╣  ║║╚═╗
		//  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

		//  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
		//  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
		//   ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝}
	},

	validate: function (req) {
		req.check("accId").exists().withMessage("Account-ID is require");
		req.check("type").exists().withMessage("Transaction Type is require");
		req.check("amount")
			.exists()
			.withMessage("Transaction Amount is require");
		req.check("amount")
			.exists()
			.isFloat()
			.withMessage("Transaction Amount is numbers only");

		req.check("type")
			.exists()
			.isIn(["I", "E"])
			.withMessage("Transaction Type is invalid");
	},

	validDate: function (date) {
		date = Date.parse(date);
		let dateToday = Date.now();

		let msg;

		if (isNaN(date)) {
			msg = "DateFormat is invalid (Ex: mm/dd/yyyy hh:mm:ss )";
		} else if (date > dateToday) {
			msg = "Date is not accepted";
		} else {
			msg = "ok";
		}

		let data = {
			date: date,
			msg: msg,
		};

		return data;
	},
};
