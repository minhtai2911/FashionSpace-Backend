import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import User_Role from "../models/userRole.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/api/v1/auth/google/callback",
      passReqToCallback   : true
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          const role = await User_Role.findOne({ role_name: "User" });
          if (!role) {
            throw new Error("User role not found");
          }
          user = new User({
            email: profile.emails[0].value,
            full_name: profile.displayName,
            role_id: role.id,
            password: profile.id,
            imgURL: profile.photos[0].value
          });
          await user.save();
        }
        const accessToken = jwt.sign(
          { id: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "30s",
          }
        );
        const refreshToken = jwt.sign(
          { id: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "365d" }
        );
        await User.findByIdAndUpdate(user._id, {
          $set: { refreshToken: refreshToken },
        });
        done(null, {...user, accessToken});
      } catch {
        done(null, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
