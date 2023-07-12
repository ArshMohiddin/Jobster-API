const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
	const user = await User.create({ ...req.body });
	const token = user.createJWT();
	res.status(StatusCodes.CREATED).json({
		user: {
			email: user.email,
			lastName: user.lastName,
			location: user.location,
			name: user.name,
			token,
		},
	});
};

const login = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		throw new BadRequestError("Please provide email and password");
	}
	const user = await User.findOne({ email });
	if (!user) {
		throw new UnauthenticatedError("Invalid Credentials");
	}
	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new UnauthenticatedError("Invalid Credentials");
	}
	// compare password
	const token = user.createJWT();
	res.status(StatusCodes.OK).json({
		user: {
			email: user.email,
			lastName: user.lastName,
			location: user.location,
			name: user.name,
			token,
		},
	});
};

const updateUser = async (req, res) => {
	const { email, name, lastName, location } = req.body;

	if (!email || !name || !lastName || !location)
		throw new BadRequestError("Please provide all values");

	const user = await User.findOneAndUpdate({ _id: req.user.userId }, req.body, {
		new: true,
		runValidators: true,
		// select: "-_id email name lastName location",
	});

	// .lean() if used, we don't have to use ...user._doc (...user is enough) but we cannot create token on plain javascript document

	const token = user.createJWT();

	res.status(StatusCodes.OK).json({
		user: {
			// ...user._doc,
			email: user.email,
			lastName: user.lastName,
			location: user.location,
			name: user.name,
			token,
		},
	});
};

module.exports = {
	register,
	login,
	updateUser,
};
