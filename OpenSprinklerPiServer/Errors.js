// Errors.js
var util = require('util')

var AbstractError = function (msg, constr) 
{
  Error.captureStackTrace(this, constr || this)
  this.message = msg || 'Error'
}
util.inherits(AbstractError, Error)
AbstractError.prototype.name = 'Abstract Error'


var BadRequestError = function (msg) 
{
  this.StatusCode = 400;
  BadRequestError.super_.call(this, msg, this.constructor)
}
util.inherits(BadRequestError, AbstractError)
BadRequestError.prototype.name = 'Bad Request Error'


var UnauthorizedError = function (msg) 
{
  this.StatusCode = 401;
  UnauthorizedError.super_.call(this, msg, this.constructor)
}
util.inherits(UnauthorizedError, AbstractError)
UnauthorizedError.prototype.name = 'Unauthorized Error'


var ForbiddenError = function (msg) 
{
  this.StatusCode = 403;
  ForbiddenError.super_.call(this, msg, this.constructor)
}
util.inherits(ForbiddenError, AbstractError)
ForbiddenError.prototype.name = 'Forbidden Error'


var NotFoundError = function (msg) 
{
  this.StatusCode = 404;
  NotFoundError.super_.call(this, msg, this.constructor)
}
util.inherits(NotFoundError, AbstractError)
NotFoundError.prototype.name = 'Not Found Error'


var ConflictError = function (msg) 
{
  this.StatusCode = 409;
  ConflictError.super_.call(this, msg, this.constructor)
}
util.inherits(ConflictError, AbstractError)
ConflictError.prototype.name = 'Conflict Error'


var InternalServerError = function (msg) 
{
  this.StatusCode = 500;
  InternalServerError.super_.call(this, msg, this.constructor)
}
util.inherits(InternalServerError, AbstractError)
InternalServerError.prototype.name = 'Internal Server Error'


module.exports = 
{
  BadRequest: BadRequestError,
  Unauthorized: UnauthorizedError,
  Forbidden: ForbiddenError,
  NotFound: NotFoundError,
  Conflict: ConflictError,
  InternalServer: InternalServerError
}