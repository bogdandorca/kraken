'use strict';

class Configuration {
    constructor() {
        this.port = process.env.PORT || 4565;
        this.db = process.env.MONGOLAB_URI || '127.0.0.1:27017/kraken';
    }

    getPort() {
        return this.port;
    }
    getDatabaseString() {
        return this.db;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Configuration();
        }
        return this.instance;
    }
}

module.exports = Configuration.getInstance();