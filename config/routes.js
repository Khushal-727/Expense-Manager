/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
	// User's Routes
	"POST /user/signup": "usersController.signup",
	"POST /user/login": "usersController.login",
	"POST /user/logout": "usersController.logout",

	// Account's Routes
	"GET /account/": "AccountsController.list",
	"POST /account/": "AccountsController.add",
	"PATCH /account/": "AccountsController.update",
	"DELETE /account/": "AccountsController.delete",

	"POST /user/addMember": "AccountsController.addMember",

	// Transaction's Routes
	"POST /transaction/list": "TransactionsController.LIST",
	"POST /transaction/": "TransactionsController.add",
	"PATCH /transaction/": "TransactionsController.update",
	"DELETE /transaction/": "TransactionsController.delete",
};
