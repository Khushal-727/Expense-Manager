/**
 * Accounts.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	attributes: {
		accName: {
			type: "string",
		},

		userId: {
			model: "Users",
		},

		balance: {
			type: "float",
			defaultsTo: 0,
		},

		isDeleted: {
			type: "boolean",
			defaultsTo: false,
		},
		createdAt: {
			type: "ref",
		},

		updatedAt: {
			type: "ref",
		},
		deletedAt: {
			type: "ref",
		},

		owner: {
			collection: "users",
			via: "accId",
			through: "accmembers",
		},
	},

	validate: function (req) {
		req.check("name").exists().withMessage("Account Name is require");
	},

	/*  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
		 ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
		 ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

		 ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
		 ║╣ ║║║╠╩╗║╣  ║║╚═╗
		 ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

		 ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
		 ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
        ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝ */
};
