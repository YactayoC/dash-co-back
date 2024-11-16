const { poolPromise, sql } = require("../config/db");

const authController = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan credenciales!" });
  }

  try {
    const pool = await poolPromise;

    const query = "SELECT * FROM users WHERE username = @username";
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(query);

    if (result.recordset.length === 0) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos!" });
    }

    const user = result.recordset[0];

    if (password !== user.password) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos!" });
    }

    return res.status(200).json({
      message: "Login exitoso!",
      user: { username: user.username, fullName: user.fullName },
    });
  } catch (err) {
    console.error("Error en el servidor:", err);
    return res
      .status(500)
      .json({ message: "Error en el servidor!", error: err });
  }
};

const registerController = async (req, res) => {
  const { username, password, fullName } = req.body;

  if (!username || !password || !fullName) {
    return res
      .status(400)
      .json({ message: "Username, password, and fullName are required." });
  }

  try {
    const pool = await poolPromise;

    const checkUserQuery = "SELECT * FROM users WHERE username = @username";
    const checkResult = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(checkUserQuery);

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: "Username is already taken." });
    }

    const insertUserQuery =
      "INSERT INTO users (username, password, fullName) VALUES (@username, @password, @fullName)";
    await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .input("fullName", sql.VarChar, fullName)
      .query(insertUserQuery);

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Database Error: ", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err });
  }
};

module.exports = { authController, registerController };
