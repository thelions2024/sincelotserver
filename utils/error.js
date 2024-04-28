// Creating a Error Handler class because default error have only one parameter but we have to pass 
// Two Parameter so we are creating this class

class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}
 
export default ErrorHandler;