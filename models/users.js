const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImgUrl: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=random&color=fff'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  subscribedto: [{
  type: Schema.Types.ObjectId,
  ref: 'User'
}]
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});



module.exports = model('User', userSchema);