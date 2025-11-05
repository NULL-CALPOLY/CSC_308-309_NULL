import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
    {
        organizationName : {
            type: String,
            required: true,
            trim: true
        },
        email : {
              type: String,
              required: true,
              trim: true
        },
        phoneNumber : {
               type: String,
               required: true,
               trim: true
        },
        inviteOnly : {
               type: Boolean,
               required: true,
        },
        members : {
               type: [UserSchema],
               required: true,
        },
    },
    { collection : "organization_list" }
);

const Organization = mongoose.model("Organization", OrganizationSchema);

export default Organization;
