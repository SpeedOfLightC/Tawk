import mongoose, { Schema } from 'mongoose';

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Message'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

groupSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
})

groupSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
})


export const Group = mongoose.model('Group', groupSchema);