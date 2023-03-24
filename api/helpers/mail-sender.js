const nodemailer = require("nodemailer");

module.exports = {
	friendlyName: "Mail sender",

	description: "This function send welcome mail using nodemailer",

	inputs: {
		email: {
			type: "string",
		},
		name: {
			type: "string",
		},
	},

	exits: {
		success: {
			description: "All works well.",
		},
	},

	fn: async function (inputs, exits) {
		let transporter = nodemailer.createTransport({
			host: "sandbox.smtp.mailtrap.io",
			port: 2525,
			auth: { user: "e4aa48651e7e0c", pass: "f88416270a4682" },
		});

		let mailHeader = {
			from: "ztlab@mail.com",
			to: inputs.email,
			subject: "Welcome to Zignuts",
			text:
				` \t\t UserName: ${inputs.name}, Email: ${inputs.email}` +
				" \n\t      Happy to serve the service for manage the expense.",
		};

		let info = await transporter.sendMail(mailHeader);

		return exits.success(info);
	},
};
