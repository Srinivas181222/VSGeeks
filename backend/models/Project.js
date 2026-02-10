const mongoose = require("mongoose");

const FileNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["file", "folder"], required: true },
    content: { type: String, default: "" },
  },
  { _id: false }
);

// Recursive children schema must be added after initial definition.
FileNodeSchema.add({
  children: { type: [FileNodeSchema], default: [] },
});

const ProjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    projectName: { type: String, required: true },
    files: { type: [FileNodeSchema], default: [] },
    lastOpened: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
