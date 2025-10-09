const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema(
	{
		routeType: {
			type: String,
			enum: ["oneway", "roundtrip"],
			required: true,
		},

		// 🟢 Common fields for both One Way and Round Trip
		seater: {
			type: String,
			enum: ["4", "7", "tempo_traveller"],
			required: true,
		},

		carName: {
			type: String,
			required: true,
			trim: true,
		},

		image: {
			type: String, // Single image (Cloudinary URL)
			required: true,
		},

		// 🟢 Fields specific to One Way route type
		pickup: {
			type: String,
			trim: true,
		},
		drop: {
			type: String,
			trim: true,
		},
		date: {
			type: Date,
		},
		time: {
			type: String, // Example: "10:30 AM"
			trim: true,
		},
	},
	{ timestamps: true }
);

// ✅ Conditional validation: if routeType is "oneway", pickup/drop/date/time must exist
cabSchema.pre("validate", function (next) {
	if (this.routeType === "oneway") {
		if (!this.pickup || !this.drop || !this.date || !this.time) {
			return next(
				new Error(
					"Pickup, drop, date, and time are required for One Way routes."
				)
			);
		}
	}
	next();
});

const Cab = mongoose.model("Cab", cabSchema);
module.exports = Cab;
