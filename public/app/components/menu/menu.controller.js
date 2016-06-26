class MenuController {
    constructor($location, $authService) {
        this._location = $location;
        this._authService = $authService;

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

        this.currentPage = this._location.path();
        this.underlineIndex = '';
        this.setPageIndex();
    }

    setPageIndex() {
        for(var i=0; i<this.pages.length; i++) {
            if(this.currentPage === this.pages[i].url) {
                this.underlineIndex = `p-${i+1}`;
            }
        }
    }
    goTo(page, index) {
        this.underlineIndex = `p-${index}`;
        console.log(this.underlineIndex);
        this._location.path(`/${page}`);
    }
    isLoggedIn() {
        return this._authService.isLoggedIn();
    }
}

MenuController.$inject = [ '$location', '$authService' ];

export default MenuController;
