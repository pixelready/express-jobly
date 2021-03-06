"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be admin.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    // CODE REVIEW: if user doesnt exist, short circuit return undefined
    // if (res.locals.user?.isAdmin !== true)
    if (res.locals.user.isAdmin !== true) {
      throw new UnauthorizedError("Admin required to perform this action");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be admin or current user.
 *
 * If not, raises Unauthorized.
 */

function ensureAdminOrCurrentUser(req, res, next) {
  // CODE REVIEW: 
  console.log("req.params:", req.params);
  console.log("res.locals.user:", res.locals.user);
  try {
    if (res.locals.user.isAdmin !== true 
        && req.params.username !== res.locals.user.username) {
      throw new UnauthorizedError("Must be admin or modifying own data to perform this action");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureAdminOrCurrentUser
};
