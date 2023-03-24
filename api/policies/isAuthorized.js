const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
	let token = req.headers.authorization;
	if (!token) {
		console.log(" \t Token Stream is Empty! \n \t Enter Token Stream");
		return res.status(400).json({
			Message: " Token Stream is Empty! Enter Token Stream",
		});
	}
	try {
		token = token.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		let user = await Users.findOne({ id: decoded.userId });

		if (token == user.token) {
			req.userData = decoded;
			return next();
		} else {
			return res.status(401).json({
				Message: "Token is not Match",
			});
		}
	} catch (err) {
		if (err.expiredAt) {
			return res.status(401).json({
				Message: "Token is Expired",
				ExpiredAt: " " + err.expiredAt,
			});
		}
		return res.status(401).json({
			Message: "Token is Invalid",
		});
	}
};
