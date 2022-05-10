const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema(
  {
    description: { type: String,
            require:true },

    date: { type: Date, default: Date.now },
    

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
