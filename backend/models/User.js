import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: String, trim: true, maxlength: 120, default: "" },
    // Fixed for every public sign-up; there is no way to register as an admin.
    role: { type: String, enum: ["citizen"], default: "citizen", immutable: true },
    // Only ever stored as a bcrypt hash and never returned by default.
    password: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  // Tokens issued before this moment are rejected by the auth middleware.
  // Backdated 1s because JWT "iat" has whole-second precision.
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.passwordChangedAt;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
