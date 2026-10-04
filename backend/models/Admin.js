import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const BCRYPT_ROUNDS = 12;

// Admins live in their own collection and are created by the seed script,
// never through public registration.
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, default: "Administrator" },
    password: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  // Tokens issued before this moment are rejected by the auth middleware.
  // Backdated 1s because JWT "iat" has whole-second precision.
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

adminSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

adminSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.passwordChangedAt;
    return ret;
  },
});

export default mongoose.model("Admin", adminSchema);
