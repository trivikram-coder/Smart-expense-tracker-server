const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Account = require("../Models/Account");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        const existingUser = await Account.findOne({ email });

        // 🔥 POLICY: block Google if password account exists
        if (existingUser && !existingUser.googleId) {
          return done(null, false, {
            message: "Account exists. Use password login."
          });
        }

        let user = existingUser;

        // ✅ Create Google user if not exists
        if (!user) {
          user = await Account.create({
            email,
            name: profile.displayName,
            googleId: profile.id,
            provider: "google"
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Account.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
