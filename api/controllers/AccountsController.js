/**
 * AccountsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 * */
var validate = require("sails-hook-validation-ev/lib/validate");
module.exports = {
	list: async function (req, res) {
		userId = req.userData.userId;
		const ownAcc = await Accounts.find({
			where: {
				userId: userId,
				isDeleted: false,
			},
			omit: ["isDeleted", "deletedAt"],
		});
		const memAcc = await Users.findOne({ id: userId }).populate("member", {
			where: { isDeleted: false },
		});
		console.log("All accounts are list for this user");
		if (memAcc.member.length > 0) {
			return res.status(200).json({
				Message: "user own and member accounts",
				UserId: userId,
				Count: ownAcc.length + memAcc.member.length,
				Owner: ownAcc,
				Member: memAcc.member,
			});
		}
		return res.status(200).json({
			Message: "user own accounts",
			UserId: userId,
			Count: ownAcc.length,
			Owner: ownAcc,
		});
	},
	add: async function (req, res) {
		validate(req);
		const errors = await req.getValidationResult();
		if (!errors.isEmpty()) {
			return res.status(400).json({ Failed: errors.array()[0].msg });
		}
		let { name } = req.body;
		let userId = req.userData.userId;
		let account = {
			accName: name,
			userId: userId,
			createdAt: new Date().toLocaleString(),
		};
		console.log(account.createdAt);
		const acc = await Accounts.findOne({
			where: {
				accName: name,
				userId: userId,
				isDeleted: false,
			},
			omit: ["isDeleted"],
		});
		if (acc) {
			return res.status(200).json({
				Message: "Account is already Exist",
				Acc_Detail: acc,
			});
		}
		const newAcc = await Accounts.create(account).fetch();
		console.log("Account is Created");
		return res.status(200).json({
			Message: "Account is Created",
			Created_Acc: newAcc,
		});
	},
	update: async function (req, res) {
		const { oldName, newName } = req.body;
		const userId = req.userData.userId;
		const isAcc = await Accounts.findOne({
			accName: oldName,
			userId: userId,
			isDeleted: false,
		});
		if (!isAcc) {
			return res.status(400).json({ Message: "Account not Found" });
		}
		const oldAcc = await Accounts.findOne({
			accName: newName,
			userId: userId,
			isDeleted: false,
		});
		if (oldAcc) {
			return res
				.status(400)
				.json({ Message: "Account name is already Exist" });
		}
		const acc = await Accounts.updateOne({
			accName: oldName,
			userId: userId,
			isDeleted: false,
		}).set({ accName: newName, updatedAt: new Date().toLocaleString() });
		delete acc.isDeleted;
		delete acc.deletedAt;
		console.log("Account is Updated");
		return res
			.status(400)
			.json({ Message: "Account is updated", updatedData: acc });
	},
	delete: async function (req, res) {
		validate(req);
		const errors = await req.getValidationResult();
		if (!errors.isEmpty()) {
			return res.status(400).json({ Failed: errors.array()[0].msg });
		}
		let { name } = req.body;
		let userId = req.userData.userId;
		let data = {
			isDeleted: true,
			deletedAt: new Date().toLocaleString(),
		};
		const isAcc = await Accounts.findOne({
			accName: name,
			userId: userId,
			isDeleted: false,
		});
		if (!isAcc) {
			return res.status(404).json({ Message: "Account not Found" });
		}
		const acc = await Accounts.updateOne(
			{ accName: name, userId: userId, isDeleted: false },
			data
		);
		const delMem = await AccMembers.update(
			{ accId: acc.id, isDeleted: false },
			{ isDeleted: true }
		);
		data.deletedBy = userId;
		const delTrn = await Transactions.update(
			{ accId: acc.id, isDeleted: false },
			data
		);
		console.log("Account is Deleted");
		return res.status(200).json({
			Message: "Account is Deleted",
			deletedAcc: acc,
			Members: delMem,
			Transactions: delTrn,
		});
	},
	addMember: async function (req, res) {
		const { email, accId } = req.body;
		const userId = req.userData.userId;
		const member = await Users.findOne({ email: email });
		if (!member) {
			return res.status(404).json({
				Message: "The member email is incorrect..",
			});
		}
		if (userId == member.id) {
			return res.status(301).json({
				Message: "Entered user email is owner of this account..",
			});
		}
		let isAcc = await Accounts.findOne({
			id: accId,
			userId: userId,
			isDeleted: false,
		});
		if (isAcc == null) {
			return res.status(200).json({
				Message: "Account does not Exist",
			});
		}
		let acc2 = await AccMembers.findOne({
			accId: accId,
			memberId: member.id,
			isDeleted: false,
		});
		if (acc2) {
			return res.status(409).json({
				Message: "Account member is already added",
				userId: userId,
				AccId: acc2.id,
			});
		}
		await Users.addToCollection(member.id, "member", accId);
		return res.status(200).json({
			Message: "Member is added successfully",
			AccountId: accId,
			MemberId: member.id,
		});
	},
};
