'use strict';

class Configuration {
    constructor() {
        this._port = process.env.PORT || 4565;
        this._db = process.env.MONGOLAB_URI || '127.0.0.1:27017/kraken';
        this._secret = 'U3HSIcqptk4RbYEG7PfV';
    }

    getPort() {
        return this._port;
    }
    getDatabaseString() {
        return this._db;
    }
    getSecret() {
        return this._secret;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Configuration();
        }
        return this.instance;
    }
}

module.exports = Configuration.getInstance();