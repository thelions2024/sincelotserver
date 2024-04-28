export const errorMiddleware = (err,req,res,next) => {

    // Setting Default Error Message
    err.message = err.message || "Internal server error";
    err.statusCode = err.statusCode || 500;

    // only when any user enter the same email address
    if(err.code === 11000){
        err.message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err.code = 400;
    }

    // only when the user search from a result with wrong result id
    if(err.name === "CastError"){
        err.message = `Invalid ${err.path}`;
        err.code = 400;
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
} 

export const asyncError = (passedFunc) => {
    return (req,res,next) => {
        Promise.resolve(passedFunc(req,res,next)).catch(next)
    }
}