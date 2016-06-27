class MenuController {
    constructor($location, $authService, $rootScope) {
        this._location = $location;
        this._authService = $authService;
        this._rootScope = $rootScope;

        this.pages = [
            {
                title: 'Home',
                url: '/',
                name: 'home'
            },
            {
                title: 'Categories',
                url: '/categories',
                name: 'categories'
            },
            {
                title: 'Search',
                url: '/search',
                name: 'search'
            },
            {
                title: 'Add Recipe',
                url: '/add',
                name: 'add'
            }
        ];

        this.underlineIndex = '';
        this.setPageIndex();

        this._rootScope.$on('$locationChangeStart', () => {
            this.setPageIndex();
        });
    }

    setPageIndex() {
        this.currentPage = this._location.path();
        var indexExists = false;
        for(var i=0; i<this.pages.length; i++) {
            if(this.currentPage === this.pages[i].url) {
                indexExists = true;
                this.underlineIndex = `p-${i+1}`;
            }
        }
        if(!indexExists) {
            this.underlineIndex = 'p-none'
        }
    }
    goTo(page, index) {
        this.underlineIndex = `p-${index}`;
        this._location.path(`/${page}`);
    }
    isLoggedIn() {
        return this._authService.isLoggedIn();
    }
}

MenuController.$inject = [ '$location', '$authService', '$rootScope' ];

export default MenuController;
