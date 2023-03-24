/**
 * TransactionsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var validate = require("sails-hook-validation-ev/lib/validate");
module.exports = {
	add: async function (req, res, next) {
		validate(req);
		const errors = await req.getValidationResult();
		if (!errors.isEmpty()) {
			return res.status(400).json({ Failed: errors.array()[0].msg });
		}
		let { accId, type, amount, desc, date } = req.body;
		let userId = req.userData.userId;
		let oldAcc = await sails.helpers.isAccFunc(accId, userId);
		if (oldAcc == null) {
			return res.status(200).json({
				Message: "Account does not Exist",
			});
		}
		if (amount <= 0) {
			return res.status(200).json({
				Message: "Amount must be greater than ZERO.",
			});
		}
		if (date) {
			let result = await Transactions.validDate(date);
			date = result.date;
			if (result.msg != "ok") {
				return res.status(200).json({
					Message: result.msg,
				});
			}
		}
		date = Date.now();
		let data = {
			accId: accId,
			type: type,
			amount: amount,
			desc: desc,
			createdBy: userId,
			createdAt: date,
		};
		let newBal;
		if (type == "I") {
			newBal = (parseFloat(oldAcc.balance) + parseFloat(amount)).toFixed(
				3
			);
		} else {
			newBal = parseFloat(oldAcc.balance - amount).toFixed(3);
		}
		if (newBal <= 0) {
			return res.status(200).json({
				Message: "Account has insufficient balance",
				accBalance: oldAcc.balance,
			});
		}
		const transaction = await Transactions.create(data).fetch();
		const updateAcc = await Accounts.updateOne({ id: accId }).set({
			balance: newBal,
		});
		return res.status(200).json({
			Message: "Transaction Added Successfull",
			userId: userId,
			Create_Data: transaction,
			Updated_Acc: updateAcc,
		});
	},
	list: async function (req, res) {
		const { accId } = req.body;
		const userId = req.userData.userId;
		let isAcc = await sails.helpers.isAccFunc(accId, userId);
		if (isAcc == null) {
			return res.status(200).json({
				Message: "Account does not Exist",
			});
		}
		const allTrs = await Transactions.find({
			accId: accId,
			isDeleted: false,
		}).sort("createdAt DESC");
		console.log("All Transaction Listed");
		if (allTrs.length > 0) {
			return res.status(200).json({
				Message: "Transaction History",
				accId: accId,
				Total_Transaction: allTrs.length,
				Transaction: allTrs,
			});
		} else {
			return res.status(200).json({
				Message: "No Transaction Found",
			});
		}
	},
	update: async function (req, res) {
		let { id, amount, desc } = req.body;
		let userId = req.userData.userId;
		const oldTrn = await Transactions.findOne({
			id: id,
		});
		if (!oldTrn) {
			return res.status(200).json({
				Message: "Transaction ID is incorrect",
			});
		}
		if (oldTrn.isDeleted == true) {
			return res.status(200).json({
				Message: "Transaction is already deleted",
				userId: userId,
				Transaction_data: oldTrn,
			});
		}
		let oldAcc = await sails.helpers.isAccFunc(oldTrn.accId, userId);
		if (oldAcc == null) {
			return res.status(200).json({
				Message: "Account does not Exist",
			});
		}
		let newBal, updateAcc;
		if (amount) {
			if (amount <= 0) {
				return res.status(200).json({
					Message: "Amount must be greater than ZERO.",
				});
			}
			if (oldTrn.type == "I") {
				newBal = amount - oldTrn.amount;
			} else {
				newBal = oldTrn.amount - amount;
			}
			let newAmt = parseFloat(oldAcc.balance + newBal).toFixed(3);
			if (newAmt <= 0) {
				return res.status(200).json({
					Message1: "Account has insufficient balance",
					Message2: "Transaction could not Completed",
					accBalance: amount,
				});
			}
			updateAcc = await Accounts.updateOne(
				{ id: oldTrn.accId },
				{ balance: newAmt }
			);
		}
		let data = {
			amount: amount,
			desc: desc,
			updatedBy: userId,
			updatedAt: new Date().toLocaleString(),
		};
		newTrn = await Transactions.updateOne(
			{ id: id, isDeleted: false },
			data
		);
		return res.status(200).json({
			Message: "Transaction is Updated",
			UpdatedAccount: updateAcc,
			Transaction: newTrn,
		});
	},
	delete: async function (req, res) {
		const { id } = req.body;
		const userId = req.userData.userId;
		const oldTrn = await Transactions.findOne({
			id: id,
		});
		if (!oldTrn) {
			return res.status(200).json({
				Message: "Transaction ID is incorrect",
			});
		}
		if (oldTrn.isDeleted == true) {
			return res.status(200).json({
				Message: "Transaction is already deleted",
				userId: userId,
				Transaction_data: oldTrn,
			});
		}
		const oldAcc = await Accounts.findOne({ id: oldTrn.accId });
		let data = {
			isDeleted: true,
			deletedBy: userId,
			deletedAt: new Date().toLocaleString(),
		};
		let newBal;
		if (oldTrn.type == "I") {
			newBal = (
				parseFloat(oldAcc.balance) - parseFloat(oldTrn.amount)
			).toFixed(3);
		} else {
			newBal = (
				parseFloat(oldAcc.balance) + parseFloat(oldTrn.amount)
			).toFixed(3);
		}
		console.log(newBal);
		if (newBal < 0) {
			return res.status(200).json({
				Message: "Account has insufficient balance",
				accBalance: oldAcc.balance,
			});
		}
		let transaction = await Transactions.updateOne(
			{ id: id, isDeleted: false },
			data
		);
		const updateAcc = await Accounts.updateOne(
			{ id: oldTrn.accId },
			{ balance: newBal }
		);
		return res.status(200).json({
			Message: "Transaction Deleted Successfully",
			Transaction_Data: transaction,
			Updated_Acc: updateAcc,
		});
	},
};
