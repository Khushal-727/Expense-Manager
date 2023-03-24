module.exports = {
	friendlyName: "Is acc func",

	description: "",

	inputs: {
		accId: {
			type: "string",
		},
		userId: {
			type: "string",
		},
	},

	exits: { success: { description: "All done." } },

	fn: async function (inputs) {
		let accId = inputs.accId;
		let userId = inputs.userId;

		let isAcc = await Accounts.findOne({
			id: accId,
			userId: userId,
			isDeleted: false,
		});
		if (!isAcc) {
			const isMember = await AccMembers.findOne({
				accId: accId,
				memberId: userId,
			});

			if (isMember) {
				isAcc = await Accounts.findOne({ id: accId });
			} else {
				isAcc = null;
			}
		}
		return isAcc;
	},
};
