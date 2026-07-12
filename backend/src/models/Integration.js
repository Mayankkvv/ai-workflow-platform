import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
      select: false,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
    scope: {
      type: String,
      default: "",
    },
    providerAccountLabel: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

integrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

const Integration = mongoose.model("Integration", integrationSchema);

export default Integration;