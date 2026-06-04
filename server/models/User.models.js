import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, "City cannot exceed 50 characters"],
    },
    pincode: {
      type: String,
      match: [/^\d{5,6}$/, "Please provide a valid pincode"],
    },
    latitude: {
      type: Number,
      validate: {
        validator: function (val) {
          return val >= -90 && val <= 90;
        },
        message: "Latitude must be between -90 and 90",
      },
    },
    longitude: {
      type: Number,
      validate: {
        validator: function (val) {
          return val >= -180 && val <= 180;
        },
        message: "Longitude must be between -180 and 180",
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: {
    type: String,
    default: null,
},
otpExpiry: {
    type: Date,
    default: null,
},
refreshToken: {
    type: String,
    default: null,
    
}
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return 
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
