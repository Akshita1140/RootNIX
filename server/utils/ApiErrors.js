class ApiErrors extends Error{
    constructor(
        statusCode,
        message="Something went wong",
        error=[],
        stack=""
    )
        {
super(message)
this.statusCode = statusCode
this.data = null
this.message =message
this.success = false
this.error = error
this.stack = stack

if (stack) {
    this.stack = stack 
} else {
    Error.captureStackTrace(this,this.constructor)
}

    }
}
 

export { ApiErrors }