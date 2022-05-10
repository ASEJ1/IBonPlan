const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    date: { type: Date, default: Date.now },
    imageFilename: { type: String,default:null },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    
  },
  {
    timestamps: { currentTime: () => Date.now() },
  }
)

module.exports = mongoose.model("Post", PostSchema)
