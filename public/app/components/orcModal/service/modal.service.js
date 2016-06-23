import ModalError from '../modal.error';

// TODO: Documentation for this service
class ModalService {
    constructor() {
        this._modals = [];
    }

    // Modal state controls
    openModal(name) {
        if(this.isValidModule(name)) {
            this.closeAll();
            this._modals[name].state = 'opened';
        }
    }
    closeModal(name) {
        if(this.isValidModule(name)) {
            this._modals[name].state = 'closed';
        }
    }
    getState(name) {
        if(this.isValidModule(name)) {
            return this._modals[name].state;
        }
    }
    closeAll() {
        for(var key in this._modals) {
            this._modals[key].state = 'closed';
        }
    };

    isValidModule(name) {
        if(!name) {
            throw new ModalError('The name of the Modal was not specified');
        } else if(!this._modals[name]) {
            throw new ModalError(`The modal '${name}' does not exist`);
        } else {
            return true;
        }
    }

    // Modal register controls
    registerModal(name) {
        if(!name) {
            throw new ModalError('The name of the Modal was not specified');
        } else if(this._modals[name]) {
            throw new ModalError(`The modal '${name}' is already registered`);
        } else {
            this._modals[name] = {
                name,
                state: 'closed'
            };
        }
    }
}

export default ModalService;