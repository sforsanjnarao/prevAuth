exports.SignUp = tryCatch(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.find({ email: email });
    
    if (!user) {
      throw new AppError(
        409,
        "Email address already exits in the database!",
        409
      );
    }
  
    try {
      const response = await authServices.signUp(email, password);
      const accessToken = response.token.accesstoken;
      const refreshToken = response.token.refreshtoken;
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ accessToken: accessToken }).end();
    } catch (err) {
      console.log(err);
      res.status(err.statusCode).json(err.message).end();
    }
  });