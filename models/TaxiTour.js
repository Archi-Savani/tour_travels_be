const mongoose = require("mongoose");

const taxiTourSchema = new mongoose.Schema(
	{
		serviceType: {
			type: String,
			enum: ["fix_route", "per_km"],
			required: true,
			trim: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		image: {
			type: String, // single image URL or path
			required: true,
		},

		// Fields for serviceType === "fix_route"
		from: {
			type: String,
			required: function () {
				return this.serviceType === "fix_route";
			},
			trim: true,
		},
		to: {
			type: String,
			required: function () {
				return this.serviceType === "fix_route";
			},
			trim: true,
		},
		price: {
			type: Number,
			required: function () {
				return this.serviceType === "fix_route";
			},
			min: 0,
		},

		// For fix route: whether the trip is one-way or two-way
		wayType: {
			type: String,
			enum: ["oneway", "roundtrip"],
			required: function () {
				return this.serviceType === "fix_route";
			},
			trim: true,
		},

		// Fields for serviceType === "per_km"
		perKmPrice: {
			type: Number,
			required: function () {
				return this.serviceType === "per_km";
			},
			min: 0,
		},
		feactures: [
			{
				type: String,
				trim: true,
			},
		],
	},
	{ timestamps: true }
);

// Additional validation to ensure arrays present when needed
taxiTourSchema.pre("validate", function (next) {
	if (this.serviceType === "per_km") {
		if (!Array.isArray(this.feactures)) {
			this.feactures = [];
		}
	}
	next();
});

const TaxiTour = mongoose.model("TaxiTour", taxiTourSchema);

module.exports = TaxiTour;


