class ToastrService {
    info(message) {
        toastr.info(message);
    }
    success(message) {
        toastr.success(message);
    }
    warning(message) {
        toastr.warning(message)
    }
    error(message) {
        toastr.error(message);
    }
    clear() {
        toastr.clear()
    }
}

export default ToastrService;
