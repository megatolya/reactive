function FixmeError(message) {
    this.message = message;
}

FixmeError.prototype = new Error();
FixmeError.constructor = FixmeError;
FixmeError.name = 'FIXME';

module.exports = {
    FixmeError: FixmeError
};
