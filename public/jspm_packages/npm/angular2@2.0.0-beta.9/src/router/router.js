/* */ 
"format cjs";
'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var core_1 = require('angular2/core');
var route_registry_1 = require('./route_registry');
var location_1 = require('./location/location');
var route_lifecycle_reflector_1 = require('./lifecycle/route_lifecycle_reflector');
var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
var _resolveToFalse = async_1.PromiseWrapper.resolve(false);
/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 *
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of {@link RouterOutlet}.
 * An outlet is a placeholder that the router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognize it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 */
var Router = (function () {
    function Router(registry, parent, hostComponent, root) {
        this.registry = registry;
        this.parent = parent;
        this.hostComponent = hostComponent;
        this.root = root;
        this.navigating = false;
        /**
         * The current `Instruction` for the router
         */
        this.currentInstruction = null;
        this._currentNavigation = _resolveToTrue;
        this._outlet = null;
        this._auxRouters = new collection_1.Map();
        this._subject = new async_1.EventEmitter();
    }
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    Router.prototype.childRouter = function (hostComponent) {
        return this._childRouter = new ChildRouter(this, hostComponent);
    };
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    Router.prototype.auxRouter = function (hostComponent) { return new ChildRouter(this, hostComponent); };
    /**
     * Register an outlet to be notified of primary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    Router.prototype.registerPrimaryOutlet = function (outlet) {
        if (lang_1.isPresent(outlet.name)) {
            throw new exceptions_1.BaseException("registerPrimaryOutlet expects to be called with an unnamed outlet.");
        }
        if (lang_1.isPresent(this._outlet)) {
            throw new exceptions_1.BaseException("Primary outlet is already registered.");
        }
        this._outlet = outlet;
        if (lang_1.isPresent(this.currentInstruction)) {
            return this.commit(this.currentInstruction, false);
        }
        return _resolveToTrue;
    };
    /**
     * Unregister an outlet (because it was destroyed, etc).
     *
     * You probably don't need to use this unless you're writing a custom outlet implementation.
     */
    Router.prototype.unregisterPrimaryOutlet = function (outlet) {
        if (lang_1.isPresent(outlet.name)) {
            throw new exceptions_1.BaseException("registerPrimaryOutlet expects to be called with an unnamed outlet.");
        }
        this._outlet = null;
    };
    /**
     * Register an outlet to notified of auxiliary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    Router.prototype.registerAuxOutlet = function (outlet) {
        var outletName = outlet.name;
        if (lang_1.isBlank(outletName)) {
            throw new exceptions_1.BaseException("registerAuxOutlet expects to be called with an outlet with a name.");
        }
        var router = this.auxRouter(this.hostComponent);
        this._auxRouters.set(outletName, router);
        router._outlet = outlet;
        var auxInstruction;
        if (lang_1.isPresent(this.currentInstruction) &&
            lang_1.isPresent(auxInstruction = this.currentInstruction.auxInstruction[outletName])) {
            return router.commit(auxInstruction);
        }
        return _resolveToTrue;
    };
    /**
     * Given an instruction, returns `true` if the instruction is currently active,
     * otherwise `false`.
     */
    Router.prototype.isRouteActive = function (instruction) {
        var router = this;
        while (lang_1.isPresent(router.parent) && lang_1.isPresent(instruction.child)) {
            router = router.parent;
            instruction = instruction.child;
        }
        return lang_1.isPresent(this.currentInstruction) &&
            this.currentInstruction.component == instruction.component;
    };
    /**
     * Dynamically update the routing configuration and trigger a navigation.
     *
     * ### Usage
     *
     * ```
     * router.config([
     *   { 'path': '/', 'component': IndexComp },
     *   { 'path': '/user/:id', 'component': UserComp },
     * ]);
     * ```
     */
    Router.prototype.config = function (definitions) {
        var _this = this;
        definitions.forEach(function (routeDefinition) { _this.registry.config(_this.hostComponent, routeDefinition); });
        return this.renavigate();
    };
    /**
     * Navigate based on the provided Route Link DSL. It's preferred to navigate with this method
     * over `navigateByUrl`.
     *
     * ### Usage
     *
     * This method takes an array representing the Route Link DSL:
     * ```
     * ['./MyCmp', {param: 3}]
     * ```
     * See the {@link RouterLink} directive for more.
     */
    Router.prototype.navigate = function (linkParams) {
        var instruction = this.generate(linkParams);
        return this.navigateByInstruction(instruction, false);
    };
    /**
     * Navigate to a URL. Returns a promise that resolves when navigation is complete.
     * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
     *
     * If the given URL begins with a `/`, router will navigate absolutely.
     * If the given URL does not begin with `/`, the router will navigate relative to this component.
     */
    Router.prototype.navigateByUrl = function (url, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        return this._currentNavigation = this._currentNavigation.then(function (_) {
            _this.lastNavigationAttempt = url;
            _this._startNavigating();
            return _this._afterPromiseFinishNavigating(_this.recognize(url).then(function (instruction) {
                if (lang_1.isBlank(instruction)) {
                    return false;
                }
                return _this._navigate(instruction, _skipLocationChange);
            }));
        });
    };
    /**
     * Navigate via the provided instruction. Returns a promise that resolves when navigation is
     * complete.
     */
    Router.prototype.navigateByInstruction = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        if (lang_1.isBlank(instruction)) {
            return _resolveToFalse;
        }
        return this._currentNavigation = this._currentNavigation.then(function (_) {
            _this._startNavigating();
            return _this._afterPromiseFinishNavigating(_this._navigate(instruction, _skipLocationChange));
        });
    };
    /** @internal */
    Router.prototype._settleInstruction = function (instruction) {
        var _this = this;
        return instruction.resolveComponent().then(function (_) {
            var unsettledInstructions = [];
            if (lang_1.isPresent(instruction.component)) {
                instruction.component.reuse = false;
            }
            if (lang_1.isPresent(instruction.child)) {
                unsettledInstructions.push(_this._settleInstruction(instruction.child));
            }
            collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function (instruction, _) {
                unsettledInstructions.push(_this._settleInstruction(instruction));
            });
            return async_1.PromiseWrapper.all(unsettledInstructions);
        });
    };
    /** @internal */
    Router.prototype._navigate = function (instruction, _skipLocationChange) {
        var _this = this;
        return this._settleInstruction(instruction)
            .then(function (_) { return _this._routerCanReuse(instruction); })
            .then(function (_) { return _this._canActivate(instruction); })
            .then(function (result) {
            if (!result) {
                return false;
            }
            return _this._routerCanDeactivate(instruction)
                .then(function (result) {
                if (result) {
                    return _this.commit(instruction, _skipLocationChange)
                        .then(function (_) {
                        _this._emitNavigationFinish(instruction.toRootUrl());
                        return true;
                    });
                }
            });
        });
    };
    Router.prototype._emitNavigationFinish = function (url) { async_1.ObservableWrapper.callEmit(this._subject, url); };
    Router.prototype._afterPromiseFinishNavigating = function (promise) {
        var _this = this;
        return async_1.PromiseWrapper.catchError(promise.then(function (_) { return _this._finishNavigating(); }), function (err) {
            _this._finishNavigating();
            throw err;
        });
    };
    /*
     * Recursively set reuse flags
     */
    /** @internal */
    Router.prototype._routerCanReuse = function (instruction) {
        var _this = this;
        if (lang_1.isBlank(this._outlet)) {
            return _resolveToFalse;
        }
        if (lang_1.isBlank(instruction.component)) {
            return _resolveToTrue;
        }
        return this._outlet.routerCanReuse(instruction.component)
            .then(function (result) {
            instruction.component.reuse = result;
            if (result && lang_1.isPresent(_this._childRouter) && lang_1.isPresent(instruction.child)) {
                return _this._childRouter._routerCanReuse(instruction.child);
            }
        });
    };
    Router.prototype._canActivate = function (nextInstruction) {
        return canActivateOne(nextInstruction, this.currentInstruction);
    };
    Router.prototype._routerCanDeactivate = function (instruction) {
        var _this = this;
        if (lang_1.isBlank(this._outlet)) {
            return _resolveToTrue;
        }
        var next;
        var childInstruction = null;
        var reuse = false;
        var componentInstruction = null;
        if (lang_1.isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
            reuse = lang_1.isBlank(instruction.component) || instruction.component.reuse;
        }
        if (reuse) {
            next = _resolveToTrue;
        }
        else {
            next = this._outlet.routerCanDeactivate(componentInstruction);
        }
        // TODO: aux route lifecycle hooks
        return next.then(function (result) {
            if (result == false) {
                return false;
            }
            if (lang_1.isPresent(_this._childRouter)) {
                return _this._childRouter._routerCanDeactivate(childInstruction);
            }
            return true;
        });
    };
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    Router.prototype.commit = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        this.currentInstruction = instruction;
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._outlet) && lang_1.isPresent(instruction.component)) {
            var componentInstruction = instruction.component;
            if (componentInstruction.reuse) {
                next = this._outlet.reuse(componentInstruction);
            }
            else {
                next =
                    this.deactivate(instruction).then(function (_) { return _this._outlet.activate(componentInstruction); });
            }
            if (lang_1.isPresent(instruction.child)) {
                next = next.then(function (_) {
                    if (lang_1.isPresent(_this._childRouter)) {
                        return _this._childRouter.commit(instruction.child);
                    }
                });
            }
        }
        var promises = [];
        this._auxRouters.forEach(function (router, name) {
            if (lang_1.isPresent(instruction.auxInstruction[name])) {
                promises.push(router.commit(instruction.auxInstruction[name]));
            }
        });
        return next.then(function (_) { return async_1.PromiseWrapper.all(promises); });
    };
    /** @internal */
    Router.prototype._startNavigating = function () { this.navigating = true; };
    /** @internal */
    Router.prototype._finishNavigating = function () { this.navigating = false; };
    /**
     * Subscribe to URL updates from the router
     */
    Router.prototype.subscribe = function (onNext) {
        return async_1.ObservableWrapper.subscribe(this._subject, onNext);
    };
    /**
     * Removes the contents of this router's outlet and all descendant outlets
     */
    Router.prototype.deactivate = function (instruction) {
        var _this = this;
        var childInstruction = null;
        var componentInstruction = null;
        if (lang_1.isPresent(instruction)) {
            childInstruction = instruction.child;
            componentInstruction = instruction.component;
        }
        var next = _resolveToTrue;
        if (lang_1.isPresent(this._childRouter)) {
            next = this._childRouter.deactivate(childInstruction);
        }
        if (lang_1.isPresent(this._outlet)) {
            next = next.then(function (_) { return _this._outlet.deactivate(componentInstruction); });
        }
        // TODO: handle aux routes
        return next;
    };
    /**
     * Given a URL, returns an instruction representing the component graph
     */
    Router.prototype.recognize = function (url) {
        var ancestorComponents = this._getAncestorInstructions();
        return this.registry.recognize(url, ancestorComponents);
    };
    Router.prototype._getAncestorInstructions = function () {
        var ancestorInstructions = [this.currentInstruction];
        var ancestorRouter = this;
        while (lang_1.isPresent(ancestorRouter = ancestorRouter.parent)) {
            ancestorInstructions.unshift(ancestorRouter.currentInstruction);
        }
        return ancestorInstructions;
    };
    /**
     * Navigates to either the last URL successfully navigated to, or the last URL requested if the
     * router has yet to successfully navigate.
     */
    Router.prototype.renavigate = function () {
        if (lang_1.isBlank(this.lastNavigationAttempt)) {
            return this._currentNavigation;
        }
        return this.navigateByUrl(this.lastNavigationAttempt);
    };
    /**
     * Generate an `Instruction` based on the provided Route Link DSL.
     */
    Router.prototype.generate = function (linkParams) {
        var ancestorInstructions = this._getAncestorInstructions();
        return this.registry.generate(linkParams, ancestorInstructions);
    };
    Router = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [route_registry_1.RouteRegistry, Router, Object, Router])
    ], Router);
    return Router;
})();
exports.Router = Router;
var RootRouter = (function (_super) {
    __extends(RootRouter, _super);
    function RootRouter(registry, location, primaryComponent) {
        var _this = this;
        _super.call(this, registry, null, primaryComponent);
        this.root = this;
        this._location = location;
        this._locationSub = this._location.subscribe(function (change) {
            // we call recognize ourselves
            _this.recognize(change['url'])
                .then(function (instruction) {
                _this.navigateByInstruction(instruction, lang_1.isPresent(change['pop']))
                    .then(function (_) {
                    // this is a popstate event; no need to change the URL
                    if (lang_1.isPresent(change['pop']) && change['type'] != 'hashchange') {
                        return;
                    }
                    var emitPath = instruction.toUrlPath();
                    var emitQuery = instruction.toUrlQuery();
                    if (emitPath.length > 0 && emitPath[0] != '/') {
                        emitPath = '/' + emitPath;
                    }
                    // Because we've opted to use All hashchange events occur outside Angular.
                    // However, apps that are migrating might have hash links that operate outside
                    // angular to which routing must respond.
                    // To support these cases where we respond to hashchanges and redirect as a
                    // result, we need to replace the top item on the stack.
                    if (change['type'] == 'hashchange') {
                        if (instruction.toRootUrl() != _this._location.path()) {
                            _this._location.replaceState(emitPath, emitQuery);
                        }
                    }
                    else {
                        _this._location.go(emitPath, emitQuery);
                    }
                });
            });
        });
        this.registry.configFromComponent(primaryComponent);
        this.navigateByUrl(location.path());
    }
    RootRouter.prototype.commit = function (instruction, _skipLocationChange) {
        var _this = this;
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        var emitPath = instruction.toUrlPath();
        var emitQuery = instruction.toUrlQuery();
        if (emitPath.length > 0 && emitPath[0] != '/') {
            emitPath = '/' + emitPath;
        }
        var promise = _super.prototype.commit.call(this, instruction);
        if (!_skipLocationChange) {
            promise = promise.then(function (_) { _this._location.go(emitPath, emitQuery); });
        }
        return promise;
    };
    RootRouter.prototype.dispose = function () {
        if (lang_1.isPresent(this._locationSub)) {
            async_1.ObservableWrapper.dispose(this._locationSub);
            this._locationSub = null;
        }
    };
    RootRouter = __decorate([
        core_1.Injectable(),
        __param(2, core_1.Inject(route_registry_1.ROUTER_PRIMARY_COMPONENT)), 
        __metadata('design:paramtypes', [route_registry_1.RouteRegistry, location_1.Location, lang_1.Type])
    ], RootRouter);
    return RootRouter;
})(Router);
exports.RootRouter = RootRouter;
var ChildRouter = (function (_super) {
    __extends(ChildRouter, _super);
    function ChildRouter(parent, hostComponent) {
        _super.call(this, parent.registry, parent, hostComponent, parent.root);
        this.parent = parent;
    }
    ChildRouter.prototype.navigateByUrl = function (url, _skipLocationChange) {
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        // Delegate navigation to the root router
        return this.parent.navigateByUrl(url, _skipLocationChange);
    };
    ChildRouter.prototype.navigateByInstruction = function (instruction, _skipLocationChange) {
        if (_skipLocationChange === void 0) { _skipLocationChange = false; }
        // Delegate navigation to the root router
        return this.parent.navigateByInstruction(instruction, _skipLocationChange);
    };
    return ChildRouter;
})(Router);
function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (lang_1.isBlank(nextInstruction.component)) {
        return next;
    }
    if (lang_1.isPresent(nextInstruction.child)) {
        next = canActivateOne(nextInstruction.child, lang_1.isPresent(prevInstruction) ? prevInstruction.child : null);
    }
    return next.then(function (result) {
        if (result == false) {
            return false;
        }
        if (nextInstruction.component.reuse) {
            return true;
        }
        var hook = route_lifecycle_reflector_1.getCanActivateHook(nextInstruction.component.componentType);
        if (lang_1.isPresent(hook)) {
            return hook(nextInstruction.component, lang_1.isPresent(prevInstruction) ? prevInstruction.component : null);
        }
        return true;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3JvdXRlci9yb3V0ZXIudHMiXSwibmFtZXMiOlsiUm91dGVyIiwiUm91dGVyLmNvbnN0cnVjdG9yIiwiUm91dGVyLmNoaWxkUm91dGVyIiwiUm91dGVyLmF1eFJvdXRlciIsIlJvdXRlci5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIudW5yZWdpc3RlclByaW1hcnlPdXRsZXQiLCJSb3V0ZXIucmVnaXN0ZXJBdXhPdXRsZXQiLCJSb3V0ZXIuaXNSb3V0ZUFjdGl2ZSIsIlJvdXRlci5jb25maWciLCJSb3V0ZXIubmF2aWdhdGUiLCJSb3V0ZXIubmF2aWdhdGVCeVVybCIsIlJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24iLCJSb3V0ZXIuX3NldHRsZUluc3RydWN0aW9uIiwiUm91dGVyLl9uYXZpZ2F0ZSIsIlJvdXRlci5fZW1pdE5hdmlnYXRpb25GaW5pc2giLCJSb3V0ZXIuX2FmdGVyUHJvbWlzZUZpbmlzaE5hdmlnYXRpbmciLCJSb3V0ZXIuX3JvdXRlckNhblJldXNlIiwiUm91dGVyLl9jYW5BY3RpdmF0ZSIsIlJvdXRlci5fcm91dGVyQ2FuRGVhY3RpdmF0ZSIsIlJvdXRlci5jb21taXQiLCJSb3V0ZXIuX3N0YXJ0TmF2aWdhdGluZyIsIlJvdXRlci5fZmluaXNoTmF2aWdhdGluZyIsIlJvdXRlci5zdWJzY3JpYmUiLCJSb3V0ZXIuZGVhY3RpdmF0ZSIsIlJvdXRlci5yZWNvZ25pemUiLCJSb3V0ZXIuX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zIiwiUm91dGVyLnJlbmF2aWdhdGUiLCJSb3V0ZXIuZ2VuZXJhdGUiLCJSb290Um91dGVyIiwiUm9vdFJvdXRlci5jb25zdHJ1Y3RvciIsIlJvb3RSb3V0ZXIuY29tbWl0IiwiUm9vdFJvdXRlci5kaXNwb3NlIiwiQ2hpbGRSb3V0ZXIiLCJDaGlsZFJvdXRlci5jb25zdHJ1Y3RvciIsIkNoaWxkUm91dGVyLm5hdmlnYXRlQnlVcmwiLCJDaGlsZFJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24iLCJjYW5BY3RpdmF0ZU9uZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzQkFBOEQsMkJBQTJCLENBQUMsQ0FBQTtBQUMxRiwyQkFBNkQsZ0NBQWdDLENBQUMsQ0FBQTtBQUM5RixxQkFBMEQsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRiwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSxxQkFBaUMsZUFBZSxDQUFDLENBQUE7QUFFakQsK0JBQXNELGtCQUFrQixDQUFDLENBQUE7QUFNekUseUJBQXVCLHFCQUFxQixDQUFDLENBQUE7QUFDN0MsMENBQWlDLHVDQUF1QyxDQUFDLENBQUE7QUFHekUsSUFBSSxjQUFjLEdBQUcsc0JBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEQsSUFBSSxlQUFlLEdBQUcsc0JBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFcEQ7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSDtJQWtCRUEsZ0JBQW1CQSxRQUF1QkEsRUFBU0EsTUFBY0EsRUFBU0EsYUFBa0JBLEVBQ3pFQSxJQUFhQTtRQURiQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFlQTtRQUFTQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFRQTtRQUFTQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBS0E7UUFDekVBLFNBQUlBLEdBQUpBLElBQUlBLENBQVNBO1FBakJoQ0EsZUFBVUEsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFFNUJBOztXQUVHQTtRQUNJQSx1QkFBa0JBLEdBQWdCQSxJQUFJQSxDQUFDQTtRQUV0Q0EsdUJBQWtCQSxHQUFpQkEsY0FBY0EsQ0FBQ0E7UUFDbERBLFlBQU9BLEdBQWlCQSxJQUFJQSxDQUFDQTtRQUU3QkEsZ0JBQVdBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUFrQkEsQ0FBQ0E7UUFHeENBLGFBQVFBLEdBQXNCQSxJQUFJQSxvQkFBWUEsRUFBRUEsQ0FBQ0E7SUFJdEJBLENBQUNBO0lBRXBDRDs7O09BR0dBO0lBQ0hBLDRCQUFXQSxHQUFYQSxVQUFZQSxhQUFrQkE7UUFDNUJFLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLEVBQUVBLGFBQWFBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtJQUdERjs7O09BR0dBO0lBQ0hBLDBCQUFTQSxHQUFUQSxVQUFVQSxhQUFrQkEsSUFBWUcsTUFBTUEsQ0FBQ0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsRUFBRUEsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFdEZIOzs7O09BSUdBO0lBQ0hBLHNDQUFxQkEsR0FBckJBLFVBQXNCQSxNQUFvQkE7UUFDeENJLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLG9FQUFvRUEsQ0FBQ0EsQ0FBQ0E7UUFDaEdBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLHVDQUF1Q0EsQ0FBQ0EsQ0FBQ0E7UUFDbkVBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3RCQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNyREEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBRURKOzs7O09BSUdBO0lBQ0hBLHdDQUF1QkEsR0FBdkJBLFVBQXdCQSxNQUFvQkE7UUFDMUNLLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLG9FQUFvRUEsQ0FBQ0EsQ0FBQ0E7UUFDaEdBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO0lBQ3RCQSxDQUFDQTtJQUdETDs7OztPQUlHQTtJQUNIQSxrQ0FBaUJBLEdBQWpCQSxVQUFrQkEsTUFBb0JBO1FBQ3BDTSxJQUFJQSxVQUFVQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSxvRUFBb0VBLENBQUNBLENBQUNBO1FBQ2hHQSxDQUFDQTtRQUVEQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUVoREEsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDekNBLE1BQU1BLENBQUNBLE9BQU9BLEdBQUdBLE1BQU1BLENBQUNBO1FBRXhCQSxJQUFJQSxjQUFjQSxDQUFDQTtRQUNuQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7WUFDbENBLGdCQUFTQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLGNBQWNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ25GQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUN2Q0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBR0ROOzs7T0FHR0E7SUFDSEEsOEJBQWFBLEdBQWJBLFVBQWNBLFdBQXdCQTtRQUNwQ08sSUFBSUEsTUFBTUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDMUJBLE9BQU9BLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDaEVBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO1lBQ3ZCQSxXQUFXQSxHQUFHQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNsQ0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7WUFDbENBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsU0FBU0EsSUFBSUEsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7SUFDcEVBLENBQUNBO0lBR0RQOzs7Ozs7Ozs7OztPQVdHQTtJQUNIQSx1QkFBTUEsR0FBTkEsVUFBT0EsV0FBOEJBO1FBQXJDUSxpQkFJQ0E7UUFIQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FDZkEsVUFBQ0EsZUFBZUEsSUFBT0EsS0FBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDekZBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO0lBQzNCQSxDQUFDQTtJQUdEUjs7Ozs7Ozs7Ozs7T0FXR0E7SUFDSEEseUJBQVFBLEdBQVJBLFVBQVNBLFVBQWlCQTtRQUN4QlMsSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsV0FBV0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDeERBLENBQUNBO0lBR0RUOzs7Ozs7T0FNR0E7SUFDSEEsOEJBQWFBLEdBQWJBLFVBQWNBLEdBQVdBLEVBQUVBLG1CQUFvQ0E7UUFBL0RVLGlCQVdDQTtRQVgwQkEsbUNBQW9DQSxHQUFwQ0EsMkJBQW9DQTtRQUM3REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLENBQUNBO1lBQzlEQSxLQUFJQSxDQUFDQSxxQkFBcUJBLEdBQUdBLEdBQUdBLENBQUNBO1lBQ2pDQSxLQUFJQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLENBQUNBO1lBQ3hCQSxNQUFNQSxDQUFDQSxLQUFJQSxDQUFDQSw2QkFBNkJBLENBQUNBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLFdBQVdBO2dCQUM3RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3pCQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtnQkFDZkEsQ0FBQ0E7Z0JBQ0RBLE1BQU1BLENBQUNBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0E7WUFDMURBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ05BLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBR0RWOzs7T0FHR0E7SUFDSEEsc0NBQXFCQSxHQUFyQkEsVUFBc0JBLFdBQXdCQSxFQUN4QkEsbUJBQW9DQTtRQUQxRFcsaUJBU0NBO1FBUnFCQSxtQ0FBb0NBLEdBQXBDQSwyQkFBb0NBO1FBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7UUFDekJBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxDQUFDQTtZQUM5REEsS0FBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtZQUN4QkEsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBO1FBQzlGQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUVEWCxnQkFBZ0JBO0lBQ2hCQSxtQ0FBa0JBLEdBQWxCQSxVQUFtQkEsV0FBd0JBO1FBQTNDWSxpQkFpQkNBO1FBaEJDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLENBQUNBO1lBQzNDQSxJQUFJQSxxQkFBcUJBLEdBQXdCQSxFQUFFQSxDQUFDQTtZQUVwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNyQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDdENBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDakNBLHFCQUFxQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxXQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6RUEsQ0FBQ0E7WUFFREEsNkJBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxjQUFjQSxFQUFFQSxVQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtnQkFDbEVBLHFCQUFxQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDSEEsTUFBTUEsQ0FBQ0Esc0JBQWNBLENBQUNBLEdBQUdBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURaLGdCQUFnQkE7SUFDaEJBLDBCQUFTQSxHQUFUQSxVQUFVQSxXQUF3QkEsRUFBRUEsbUJBQTRCQTtRQUFoRWEsaUJBbUJDQTtRQWxCQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxXQUFXQSxDQUFDQTthQUN0Q0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsQ0FBQ0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsRUFBakNBLENBQWlDQSxDQUFDQTthQUM5Q0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsQ0FBQ0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsRUFBOUJBLENBQThCQSxDQUFDQTthQUMzQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsTUFBZUE7WUFDcEJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO2dCQUNaQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUNmQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxLQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLFdBQVdBLENBQUNBO2lCQUN4Q0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsTUFBZUE7Z0JBQ3BCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDWEEsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsRUFBRUEsbUJBQW1CQSxDQUFDQTt5QkFDL0NBLElBQUlBLENBQUNBLFVBQUNBLENBQUNBO3dCQUNOQSxLQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBO3dCQUNwREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7b0JBQ2RBLENBQUNBLENBQUNBLENBQUNBO2dCQUNUQSxDQUFDQTtZQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNUQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNUQSxDQUFDQTtJQUVPYixzQ0FBcUJBLEdBQTdCQSxVQUE4QkEsR0FBR0EsSUFBVWMseUJBQWlCQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVwRmQsOENBQTZCQSxHQUFyQ0EsVUFBc0NBLE9BQXFCQTtRQUEzRGUsaUJBS0NBO1FBSkNBLE1BQU1BLENBQUNBLHNCQUFjQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxDQUFDQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLEVBQXhCQSxDQUF3QkEsQ0FBQ0EsRUFBRUEsVUFBQ0EsR0FBR0E7WUFDbEZBLEtBQUlBLENBQUNBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7WUFDekJBLE1BQU1BLEdBQUdBLENBQUNBO1FBQ1pBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURmOztPQUVHQTtJQUNIQSxnQkFBZ0JBO0lBQ2hCQSxnQ0FBZUEsR0FBZkEsVUFBZ0JBLFdBQXdCQTtRQUF4Q2dCLGlCQWNDQTtRQWJDQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsTUFBTUEsQ0FBQ0EsZUFBZUEsQ0FBQ0E7UUFDekJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ25DQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7YUFDcERBLElBQUlBLENBQUNBLFVBQUNBLE1BQU1BO1lBQ1hBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBO1lBQ3JDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzRUEsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDOURBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLENBQUNBO0lBQ1RBLENBQUNBO0lBRU9oQiw2QkFBWUEsR0FBcEJBLFVBQXFCQSxlQUE0QkE7UUFDL0NpQixNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxlQUFlQSxFQUFFQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO0lBQ2xFQSxDQUFDQTtJQUVPakIscUNBQW9CQSxHQUE1QkEsVUFBNkJBLFdBQXdCQTtRQUFyRGtCLGlCQTRCQ0E7UUEzQkNBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFDREEsSUFBSUEsSUFBc0JBLENBQUNBO1FBQzNCQSxJQUFJQSxnQkFBZ0JBLEdBQWdCQSxJQUFJQSxDQUFDQTtRQUN6Q0EsSUFBSUEsS0FBS0EsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFDM0JBLElBQUlBLG9CQUFvQkEsR0FBeUJBLElBQUlBLENBQUNBO1FBQ3REQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLGdCQUFnQkEsR0FBR0EsV0FBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDckNBLG9CQUFvQkEsR0FBR0EsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0E7WUFDN0NBLEtBQUtBLEdBQUdBLGNBQU9BLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBO1FBQ3hFQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNWQSxJQUFJQSxHQUFHQSxjQUFjQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO1FBQ2hFQSxDQUFDQTtRQUNEQSxrQ0FBa0NBO1FBQ2xDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxNQUFNQTtZQUN0QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BCQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUNmQSxDQUFDQTtZQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pDQSxNQUFNQSxDQUFDQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxvQkFBb0JBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7WUFDbEVBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURsQjs7T0FFR0E7SUFDSEEsdUJBQU1BLEdBQU5BLFVBQU9BLFdBQXdCQSxFQUFFQSxtQkFBb0NBO1FBQXJFbUIsaUJBNkJDQTtRQTdCZ0NBLG1DQUFvQ0EsR0FBcENBLDJCQUFvQ0E7UUFDbkVBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsV0FBV0EsQ0FBQ0E7UUFFdENBLElBQUlBLElBQUlBLEdBQWlCQSxjQUFjQSxDQUFDQTtRQUN4Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLGdCQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoRUEsSUFBSUEsb0JBQW9CQSxHQUFHQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQTtZQUNqREEsRUFBRUEsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0JBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7WUFDbERBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxJQUFJQTtvQkFDQUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsQ0FBQ0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxFQUEzQ0EsQ0FBMkNBLENBQUNBLENBQUNBO1lBQzVGQSxDQUFDQTtZQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxDQUFDQTtvQkFDakJBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxLQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDakNBLE1BQU1BLENBQUNBLEtBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO29CQUNyREEsQ0FBQ0E7Z0JBQ0hBLENBQUNBLENBQUNBLENBQUNBO1lBQ0xBLENBQUNBO1FBQ0hBLENBQUNBO1FBRURBLElBQUlBLFFBQVFBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2xCQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFDQSxNQUFNQSxFQUFFQSxJQUFJQTtZQUNwQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNoREEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakVBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLENBQUNBO1FBRUhBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLENBQUNBLElBQUtBLE9BQUFBLHNCQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUE1QkEsQ0FBNEJBLENBQUNBLENBQUNBO0lBQ3hEQSxDQUFDQTtJQUdEbkIsZ0JBQWdCQTtJQUNoQkEsaUNBQWdCQSxHQUFoQkEsY0FBMkJvQixJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVwRHBCLGdCQUFnQkE7SUFDaEJBLGtDQUFpQkEsR0FBakJBLGNBQTRCcUIsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFHdERyQjs7T0FFR0E7SUFDSEEsMEJBQVNBLEdBQVRBLFVBQVVBLE1BQTRCQTtRQUNwQ3NCLE1BQU1BLENBQUNBLHlCQUFpQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDNURBLENBQUNBO0lBR0R0Qjs7T0FFR0E7SUFDSEEsMkJBQVVBLEdBQVZBLFVBQVdBLFdBQXdCQTtRQUFuQ3VCLGlCQWtCQ0E7UUFqQkNBLElBQUlBLGdCQUFnQkEsR0FBZ0JBLElBQUlBLENBQUNBO1FBQ3pDQSxJQUFJQSxvQkFBb0JBLEdBQXlCQSxJQUFJQSxDQUFDQTtRQUN0REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxnQkFBZ0JBLEdBQUdBLFdBQVdBLENBQUNBLEtBQUtBLENBQUNBO1lBQ3JDQSxvQkFBb0JBLEdBQUdBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBO1FBQy9DQSxDQUFDQTtRQUNEQSxJQUFJQSxJQUFJQSxHQUFpQkEsY0FBY0EsQ0FBQ0E7UUFDeENBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQTtRQUN4REEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVCQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxDQUFDQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxVQUFVQSxDQUFDQSxvQkFBb0JBLENBQUNBLEVBQTdDQSxDQUE2Q0EsQ0FBQ0EsQ0FBQ0E7UUFDekVBLENBQUNBO1FBRURBLDBCQUEwQkE7UUFFMUJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBR0R2Qjs7T0FFR0E7SUFDSEEsMEJBQVNBLEdBQVRBLFVBQVVBLEdBQVdBO1FBQ25Cd0IsSUFBSUEsa0JBQWtCQSxHQUFHQSxJQUFJQSxDQUFDQSx3QkFBd0JBLEVBQUVBLENBQUNBO1FBQ3pEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxFQUFFQSxrQkFBa0JBLENBQUNBLENBQUNBO0lBQzFEQSxDQUFDQTtJQUVPeEIseUNBQXdCQSxHQUFoQ0E7UUFDRXlCLElBQUlBLG9CQUFvQkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQTtRQUNyREEsSUFBSUEsY0FBY0EsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDbENBLE9BQU9BLGdCQUFTQSxDQUFDQSxjQUFjQSxHQUFHQSxjQUFjQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUN6REEsb0JBQW9CQSxDQUFDQSxPQUFPQSxDQUFDQSxjQUFjQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBO1FBQ2xFQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxvQkFBb0JBLENBQUNBO0lBQzlCQSxDQUFDQTtJQUdEekI7OztPQUdHQTtJQUNIQSwyQkFBVUEsR0FBVkE7UUFDRTBCLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7UUFDakNBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0E7SUFDeERBLENBQUNBO0lBR0QxQjs7T0FFR0E7SUFDSEEseUJBQVFBLEdBQVJBLFVBQVNBLFVBQWlCQTtRQUN4QjJCLElBQUlBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxFQUFFQSxDQUFDQTtRQUMzREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsVUFBVUEsRUFBRUEsb0JBQW9CQSxDQUFDQSxDQUFDQTtJQUNsRUEsQ0FBQ0E7SUE5WUgzQjtRQUFDQSxpQkFBVUEsRUFBRUE7O2VBK1laQTtJQUFEQSxhQUFDQTtBQUFEQSxDQUFDQSxBQS9ZRCxJQStZQztBQTlZWSxjQUFNLFNBOFlsQixDQUFBO0FBRUQ7SUFDZ0M0Qiw4QkFBTUE7SUFNcENBLG9CQUFZQSxRQUF1QkEsRUFBRUEsUUFBa0JBLEVBQ1RBLGdCQUFzQkE7UUFSdEVDLGlCQW1FQ0E7UUExREdBLGtCQUFNQSxRQUFRQSxFQUFFQSxJQUFJQSxFQUFFQSxnQkFBZ0JBLENBQUNBLENBQUNBO1FBQ3hDQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDMUJBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLFVBQUNBLE1BQU1BO1lBQ2xEQSw4QkFBOEJBO1lBQzlCQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtpQkFDeEJBLElBQUlBLENBQUNBLFVBQUNBLFdBQVdBO2dCQUNoQkEsS0FBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxXQUFXQSxFQUFFQSxnQkFBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7cUJBQzVEQSxJQUFJQSxDQUFDQSxVQUFDQSxDQUFDQTtvQkFDTkEsc0RBQXNEQTtvQkFDdERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxJQUFJQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDL0RBLE1BQU1BLENBQUNBO29CQUNUQSxDQUFDQTtvQkFDREEsSUFBSUEsUUFBUUEsR0FBR0EsV0FBV0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7b0JBQ3ZDQSxJQUFJQSxTQUFTQSxHQUFHQSxXQUFXQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtvQkFDekNBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO3dCQUM5Q0EsUUFBUUEsR0FBR0EsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBQ0E7b0JBQzVCQSxDQUFDQTtvQkFFREEsMEVBQTBFQTtvQkFDMUVBLDhFQUE4RUE7b0JBQzlFQSx5Q0FBeUNBO29CQUN6Q0EsMkVBQTJFQTtvQkFDM0VBLHdEQUF3REE7b0JBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDbkNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLElBQUlBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBOzRCQUNyREEsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsUUFBUUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7d0JBQ25EQSxDQUFDQTtvQkFDSEEsQ0FBQ0E7b0JBQUNBLElBQUlBLENBQUNBLENBQUNBO3dCQUNOQSxLQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxRQUFRQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQTtvQkFDekNBLENBQUNBO2dCQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNUQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNUQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVIQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxtQkFBbUJBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7UUFDcERBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3RDQSxDQUFDQTtJQUVERCwyQkFBTUEsR0FBTkEsVUFBT0EsV0FBd0JBLEVBQUVBLG1CQUFvQ0E7UUFBckVFLGlCQVdDQTtRQVhnQ0EsbUNBQW9DQSxHQUFwQ0EsMkJBQW9DQTtRQUNuRUEsSUFBSUEsUUFBUUEsR0FBR0EsV0FBV0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDdkNBLElBQUlBLFNBQVNBLEdBQUdBLFdBQVdBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1FBQ3pDQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5Q0EsUUFBUUEsR0FBR0EsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBQ0RBLElBQUlBLE9BQU9BLEdBQUdBLGdCQUFLQSxDQUFDQSxNQUFNQSxZQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUN4Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN6QkEsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsQ0FBQ0EsSUFBT0EsS0FBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsUUFBUUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0VBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO0lBQ2pCQSxDQUFDQTtJQUVERiw0QkFBT0EsR0FBUEE7UUFDRUcsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSx5QkFBaUJBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFsRUhIO1FBQUNBLGlCQUFVQSxFQUFFQTtRQVFDQSxXQUFDQSxhQUFNQSxDQUFDQSx5Q0FBd0JBLENBQUNBLENBQUFBOzttQkEyRDlDQTtJQUFEQSxpQkFBQ0E7QUFBREEsQ0FBQ0EsQUFuRUQsRUFDZ0MsTUFBTSxFQWtFckM7QUFsRVksa0JBQVUsYUFrRXRCLENBQUE7QUFFRDtJQUEwQkksK0JBQU1BO0lBQzlCQSxxQkFBWUEsTUFBY0EsRUFBRUEsYUFBYUE7UUFDdkNDLGtCQUFNQSxNQUFNQSxDQUFDQSxRQUFRQSxFQUFFQSxNQUFNQSxFQUFFQSxhQUFhQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMzREEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7SUFDdkJBLENBQUNBO0lBR0RELG1DQUFhQSxHQUFiQSxVQUFjQSxHQUFXQSxFQUFFQSxtQkFBb0NBO1FBQXBDRSxtQ0FBb0NBLEdBQXBDQSwyQkFBb0NBO1FBQzdEQSx5Q0FBeUNBO1FBQ3pDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxHQUFHQSxFQUFFQSxtQkFBbUJBLENBQUNBLENBQUNBO0lBQzdEQSxDQUFDQTtJQUVERiwyQ0FBcUJBLEdBQXJCQSxVQUFzQkEsV0FBd0JBLEVBQ3hCQSxtQkFBb0NBO1FBQXBDRyxtQ0FBb0NBLEdBQXBDQSwyQkFBb0NBO1FBQ3hEQSx5Q0FBeUNBO1FBQ3pDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxxQkFBcUJBLENBQUNBLFdBQVdBLEVBQUVBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0E7SUFDN0VBLENBQUNBO0lBQ0hILGtCQUFDQTtBQUFEQSxDQUFDQSxBQWpCRCxFQUEwQixNQUFNLEVBaUIvQjtBQUdELHdCQUF3QixlQUE0QixFQUM1QixlQUE0QjtJQUNsREksSUFBSUEsSUFBSUEsR0FBR0EsY0FBY0EsQ0FBQ0E7SUFDMUJBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLGVBQWVBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3ZDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckNBLElBQUlBLEdBQUdBLGNBQWNBLENBQUNBLGVBQWVBLENBQUNBLEtBQUtBLEVBQ3JCQSxnQkFBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsR0FBR0EsZUFBZUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLE1BQU1BO1FBQ3RCQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcENBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBQ0RBLElBQUlBLElBQUlBLEdBQUdBLDhDQUFrQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsRUFDekJBLGdCQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFHQSxlQUFlQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3RUEsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDTEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb21pc2VXcmFwcGVyLCBFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TWFwLCBTdHJpbmdNYXBXcmFwcGVyLCBNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNTdHJpbmcsIGlzUHJlc2VudCwgVHlwZSwgaXNBcnJheX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtSb3V0ZVJlZ2lzdHJ5LCBST1VURVJfUFJJTUFSWV9DT01QT05FTlR9IGZyb20gJy4vcm91dGVfcmVnaXN0cnknO1xuaW1wb3J0IHtcbiAgQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gIEluc3RydWN0aW9uLFxufSBmcm9tICcuL2luc3RydWN0aW9uJztcbmltcG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldCc7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICcuL2xvY2F0aW9uL2xvY2F0aW9uJztcbmltcG9ydCB7Z2V0Q2FuQWN0aXZhdGVIb29rfSBmcm9tICcuL2xpZmVjeWNsZS9yb3V0ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7Um91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfaW1wbCc7XG5cbmxldCBfcmVzb2x2ZVRvVHJ1ZSA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUodHJ1ZSk7XG5sZXQgX3Jlc29sdmVUb0ZhbHNlID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShmYWxzZSk7XG5cbi8qKlxuICogVGhlIGBSb3V0ZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBtYXBwaW5nIFVSTHMgdG8gY29tcG9uZW50cy5cbiAqXG4gKiBZb3UgY2FuIHNlZSB0aGUgc3RhdGUgb2YgdGhlIHJvdXRlciBieSBpbnNwZWN0aW5nIHRoZSByZWFkLW9ubHkgZmllbGQgYHJvdXRlci5uYXZpZ2F0aW5nYC5cbiAqIFRoaXMgbWF5IGJlIHVzZWZ1bCBmb3Igc2hvd2luZyBhIHNwaW5uZXIsIGZvciBpbnN0YW5jZS5cbiAqXG4gKiAjIyBDb25jZXB0c1xuICpcbiAqIFJvdXRlcnMgYW5kIGNvbXBvbmVudCBpbnN0YW5jZXMgaGF2ZSBhIDE6MSBjb3JyZXNwb25kZW5jZS5cbiAqXG4gKiBUaGUgcm91dGVyIGhvbGRzIHJlZmVyZW5jZSB0byBhIG51bWJlciBvZiB7QGxpbmsgUm91dGVyT3V0bGV0fS5cbiAqIEFuIG91dGxldCBpcyBhIHBsYWNlaG9sZGVyIHRoYXQgdGhlIHJvdXRlciBkeW5hbWljYWxseSBmaWxscyBpbiBkZXBlbmRpbmcgb24gdGhlIGN1cnJlbnQgVVJMLlxuICpcbiAqIFdoZW4gdGhlIHJvdXRlciBuYXZpZ2F0ZXMgZnJvbSBhIFVSTCwgaXQgbXVzdCBmaXJzdCByZWNvZ25pemUgaXQgYW5kIHNlcmlhbGl6ZSBpdCBpbnRvIGFuXG4gKiBgSW5zdHJ1Y3Rpb25gLlxuICogVGhlIHJvdXRlciB1c2VzIHRoZSBgUm91dGVSZWdpc3RyeWAgdG8gZ2V0IGFuIGBJbnN0cnVjdGlvbmAuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZXIge1xuICBuYXZpZ2F0aW5nOiBib29sZWFuID0gZmFsc2U7XG4gIGxhc3ROYXZpZ2F0aW9uQXR0ZW1wdDogc3RyaW5nO1xuICAvKipcbiAgICogVGhlIGN1cnJlbnQgYEluc3RydWN0aW9uYCBmb3IgdGhlIHJvdXRlclxuICAgKi9cbiAgcHVibGljIGN1cnJlbnRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuXG4gIHByaXZhdGUgX2N1cnJlbnROYXZpZ2F0aW9uOiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgcHJpdmF0ZSBfb3V0bGV0OiBSb3V0ZXJPdXRsZXQgPSBudWxsO1xuXG4gIHByaXZhdGUgX2F1eFJvdXRlcnMgPSBuZXcgTWFwPHN0cmluZywgUm91dGVyPigpO1xuICBwcml2YXRlIF9jaGlsZFJvdXRlcjogUm91dGVyO1xuXG4gIHByaXZhdGUgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBwdWJsaWMgcGFyZW50OiBSb3V0ZXIsIHB1YmxpYyBob3N0Q29tcG9uZW50OiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyByb290PzogUm91dGVyKSB7fVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgY2hpbGQgcm91dGVyLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZVxuICAgKiBjb21wb25lbnQuXG4gICAqL1xuICBjaGlsZFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIge1xuICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlciA9IG5ldyBDaGlsZFJvdXRlcih0aGlzLCBob3N0Q29tcG9uZW50KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSBjaGlsZCByb3V0ZXIuIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlXG4gICAqIGNvbXBvbmVudC5cbiAgICovXG4gIGF1eFJvdXRlcihob3N0Q29tcG9uZW50OiBhbnkpOiBSb3V0ZXIgeyByZXR1cm4gbmV3IENoaWxkUm91dGVyKHRoaXMsIGhvc3RDb21wb25lbnQpOyB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIG91dGxldCB0byBiZSBub3RpZmllZCBvZiBwcmltYXJ5IHJvdXRlIGNoYW5nZXMuXG4gICAqXG4gICAqIFlvdSBwcm9iYWJseSBkb24ndCBuZWVkIHRvIHVzZSB0aGlzIHVubGVzcyB5b3UncmUgd3JpdGluZyBhIHJldXNhYmxlIGNvbXBvbmVudC5cbiAgICovXG4gIHJlZ2lzdGVyUHJpbWFyeU91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChpc1ByZXNlbnQob3V0bGV0Lm5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgcmVnaXN0ZXJQcmltYXJ5T3V0bGV0IGV4cGVjdHMgdG8gYmUgY2FsbGVkIHdpdGggYW4gdW5uYW1lZCBvdXRsZXQuYCk7XG4gICAgfVxuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgUHJpbWFyeSBvdXRsZXQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLmApO1xuICAgIH1cblxuICAgIHRoaXMuX291dGxldCA9IG91dGxldDtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY3VycmVudEluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tbWl0KHRoaXMuY3VycmVudEluc3RydWN0aW9uLCBmYWxzZSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnJlZ2lzdGVyIGFuIG91dGxldCAoYmVjYXVzZSBpdCB3YXMgZGVzdHJveWVkLCBldGMpLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSBjdXN0b20gb3V0bGV0IGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgdW5yZWdpc3RlclByaW1hcnlPdXRsZXQob3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KG91dGxldC5uYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYHJlZ2lzdGVyUHJpbWFyeU91dGxldCBleHBlY3RzIHRvIGJlIGNhbGxlZCB3aXRoIGFuIHVubmFtZWQgb3V0bGV0LmApO1xuICAgIH1cbiAgICB0aGlzLl9vdXRsZXQgPSBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gb3V0bGV0IHRvIG5vdGlmaWVkIG9mIGF1eGlsaWFyeSByb3V0ZSBjaGFuZ2VzLlxuICAgKlxuICAgKiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcyB1bmxlc3MgeW91J3JlIHdyaXRpbmcgYSByZXVzYWJsZSBjb21wb25lbnQuXG4gICAqL1xuICByZWdpc3RlckF1eE91dGxldChvdXRsZXQ6IFJvdXRlck91dGxldCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHZhciBvdXRsZXROYW1lID0gb3V0bGV0Lm5hbWU7XG4gICAgaWYgKGlzQmxhbmsob3V0bGV0TmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGByZWdpc3RlckF1eE91dGxldCBleHBlY3RzIHRvIGJlIGNhbGxlZCB3aXRoIGFuIG91dGxldCB3aXRoIGEgbmFtZS5gKTtcbiAgICB9XG5cbiAgICB2YXIgcm91dGVyID0gdGhpcy5hdXhSb3V0ZXIodGhpcy5ob3N0Q29tcG9uZW50KTtcblxuICAgIHRoaXMuX2F1eFJvdXRlcnMuc2V0KG91dGxldE5hbWUsIHJvdXRlcik7XG4gICAgcm91dGVyLl9vdXRsZXQgPSBvdXRsZXQ7XG5cbiAgICB2YXIgYXV4SW5zdHJ1Y3Rpb247XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgaXNQcmVzZW50KGF1eEluc3RydWN0aW9uID0gdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb25bb3V0bGV0TmFtZV0pKSB7XG4gICAgICByZXR1cm4gcm91dGVyLmNvbW1pdChhdXhJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGluc3RydWN0aW9uLCByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaW5zdHJ1Y3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZSxcbiAgICogb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAqL1xuICBpc1JvdXRlQWN0aXZlKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IGJvb2xlYW4ge1xuICAgIHZhciByb3V0ZXI6IFJvdXRlciA9IHRoaXM7XG4gICAgd2hpbGUgKGlzUHJlc2VudChyb3V0ZXIucGFyZW50KSAmJiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICByb3V0ZXIgPSByb3V0ZXIucGFyZW50O1xuICAgICAgaW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICB9XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbikgJiZcbiAgICAgICAgICAgdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50ID09IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIER5bmFtaWNhbGx5IHVwZGF0ZSB0aGUgcm91dGluZyBjb25maWd1cmF0aW9uIGFuZCB0cmlnZ2VyIGEgbmF2aWdhdGlvbi5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIGBgYFxuICAgKiByb3V0ZXIuY29uZmlnKFtcbiAgICogICB7ICdwYXRoJzogJy8nLCAnY29tcG9uZW50JzogSW5kZXhDb21wIH0sXG4gICAqICAgeyAncGF0aCc6ICcvdXNlci86aWQnLCAnY29tcG9uZW50JzogVXNlckNvbXAgfSxcbiAgICogXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY29uZmlnKGRlZmluaXRpb25zOiBSb3V0ZURlZmluaXRpb25bXSk6IFByb21pc2U8YW55PiB7XG4gICAgZGVmaW5pdGlvbnMuZm9yRWFjaChcbiAgICAgICAgKHJvdXRlRGVmaW5pdGlvbikgPT4geyB0aGlzLnJlZ2lzdHJ5LmNvbmZpZyh0aGlzLmhvc3RDb21wb25lbnQsIHJvdXRlRGVmaW5pdGlvbik7IH0pO1xuICAgIHJldHVybiB0aGlzLnJlbmF2aWdhdGUoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBSb3V0ZSBMaW5rIERTTC4gSXQncyBwcmVmZXJyZWQgdG8gbmF2aWdhdGUgd2l0aCB0aGlzIG1ldGhvZFxuICAgKiBvdmVyIGBuYXZpZ2F0ZUJ5VXJsYC5cbiAgICpcbiAgICogIyMjIFVzYWdlXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIHRha2VzIGFuIGFycmF5IHJlcHJlc2VudGluZyB0aGUgUm91dGUgTGluayBEU0w6XG4gICAqIGBgYFxuICAgKiBbJy4vTXlDbXAnLCB7cGFyYW06IDN9XVxuICAgKiBgYGBcbiAgICogU2VlIHRoZSB7QGxpbmsgUm91dGVyTGlua30gZGlyZWN0aXZlIGZvciBtb3JlLlxuICAgKi9cbiAgbmF2aWdhdGUobGlua1BhcmFtczogYW55W10pOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBpbnN0cnVjdGlvbiA9IHRoaXMuZ2VuZXJhdGUobGlua1BhcmFtcyk7XG4gICAgcmV0dXJuIHRoaXMubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uLCBmYWxzZSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB0byBhIFVSTC4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIG5hdmlnYXRpb24gaXMgY29tcGxldGUuXG4gICAqIEl0J3MgcHJlZmVycmVkIHRvIG5hdmlnYXRlIHdpdGggYG5hdmlnYXRlYCBpbnN0ZWFkIG9mIHRoaXMgbWV0aG9kLCBzaW5jZSBVUkxzIGFyZSBtb3JlIGJyaXR0bGUuXG4gICAqXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgYmVnaW5zIHdpdGggYSBgL2AsIHJvdXRlciB3aWxsIG5hdmlnYXRlIGFic29sdXRlbHkuXG4gICAqIElmIHRoZSBnaXZlbiBVUkwgZG9lcyBub3QgYmVnaW4gd2l0aCBgL2AsIHRoZSByb3V0ZXIgd2lsbCBuYXZpZ2F0ZSByZWxhdGl2ZSB0byB0aGlzIGNvbXBvbmVudC5cbiAgICovXG4gIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmcsIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uID0gdGhpcy5fY3VycmVudE5hdmlnYXRpb24udGhlbigoXykgPT4ge1xuICAgICAgdGhpcy5sYXN0TmF2aWdhdGlvbkF0dGVtcHQgPSB1cmw7XG4gICAgICB0aGlzLl9zdGFydE5hdmlnYXRpbmcoKTtcbiAgICAgIHJldHVybiB0aGlzLl9hZnRlclByb21pc2VGaW5pc2hOYXZpZ2F0aW5nKHRoaXMucmVjb2duaXplKHVybCkudGhlbigoaW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgaWYgKGlzQmxhbmsoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9uYXZpZ2F0ZShpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBOYXZpZ2F0ZSB2aWEgdGhlIHByb3ZpZGVkIGluc3RydWN0aW9uLiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gbmF2aWdhdGlvbiBpc1xuICAgKiBjb21wbGV0ZS5cbiAgICovXG4gIG5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBfc2tpcExvY2F0aW9uQ2hhbmdlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9GYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnROYXZpZ2F0aW9uID0gdGhpcy5fY3VycmVudE5hdmlnYXRpb24udGhlbigoXykgPT4ge1xuICAgICAgdGhpcy5fc3RhcnROYXZpZ2F0aW5nKCk7XG4gICAgICByZXR1cm4gdGhpcy5fYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyh0aGlzLl9uYXZpZ2F0ZShpbnN0cnVjdGlvbiwgX3NraXBMb2NhdGlvbkNoYW5nZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc2V0dGxlSW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCgpLnRoZW4oKF8pID0+IHtcbiAgICAgIHZhciB1bnNldHRsZWRJbnN0cnVjdGlvbnM6IEFycmF5PFByb21pc2U8YW55Pj4gPSBbXTtcblxuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICAgIGluc3RydWN0aW9uLmNvbXBvbmVudC5yZXVzZSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNQcmVzZW50KGluc3RydWN0aW9uLmNoaWxkKSkge1xuICAgICAgICB1bnNldHRsZWRJbnN0cnVjdGlvbnMucHVzaCh0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbi5jaGlsZCkpO1xuICAgICAgfVxuXG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24sIChpbnN0cnVjdGlvbiwgXykgPT4ge1xuICAgICAgICB1bnNldHRsZWRJbnN0cnVjdGlvbnMucHVzaCh0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbikpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKHVuc2V0dGxlZEluc3RydWN0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9uYXZpZ2F0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9zZXR0bGVJbnN0cnVjdGlvbihpbnN0cnVjdGlvbilcbiAgICAgICAgLnRoZW4oKF8pID0+IHRoaXMuX3JvdXRlckNhblJldXNlKGluc3RydWN0aW9uKSlcbiAgICAgICAgLnRoZW4oKF8pID0+IHRoaXMuX2NhbkFjdGl2YXRlKGluc3RydWN0aW9uKSlcbiAgICAgICAgLnRoZW4oKHJlc3VsdDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLl9yb3V0ZXJDYW5EZWFjdGl2YXRlKGluc3RydWN0aW9uKVxuICAgICAgICAgICAgICAudGhlbigocmVzdWx0OiBib29sZWFuKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29tbWl0KGluc3RydWN0aW9uLCBfc2tpcExvY2F0aW9uQ2hhbmdlKVxuICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbWl0TmF2aWdhdGlvbkZpbmlzaChpbnN0cnVjdGlvbi50b1Jvb3RVcmwoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2VtaXROYXZpZ2F0aW9uRmluaXNoKHVybCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5jYWxsRW1pdCh0aGlzLl9zdWJqZWN0LCB1cmwpOyB9XG5cbiAgcHJpdmF0ZSBfYWZ0ZXJQcm9taXNlRmluaXNoTmF2aWdhdGluZyhwcm9taXNlOiBQcm9taXNlPGFueT4pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5jYXRjaEVycm9yKHByb21pc2UudGhlbigoXykgPT4gdGhpcy5fZmluaXNoTmF2aWdhdGluZygpKSwgKGVycikgPT4ge1xuICAgICAgdGhpcy5fZmluaXNoTmF2aWdhdGluZygpO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xuICB9XG5cbiAgLypcbiAgICogUmVjdXJzaXZlbHkgc2V0IHJldXNlIGZsYWdzXG4gICAqL1xuICAvKiogQGludGVybmFsICovXG4gIF9yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX291dGxldCkpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvRmFsc2U7XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKGluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX291dGxldC5yb3V0ZXJDYW5SZXVzZShpbnN0cnVjdGlvbi5jb21wb25lbnQpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBpbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UgPSByZXN1bHQ7XG4gICAgICAgICAgaWYgKHJlc3VsdCAmJiBpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpICYmIGlzUHJlc2VudChpbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jaGlsZFJvdXRlci5fcm91dGVyQ2FuUmV1c2UoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jYW5BY3RpdmF0ZShuZXh0SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGNhbkFjdGl2YXRlT25lKG5leHRJbnN0cnVjdGlvbiwgdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBfcm91dGVyQ2FuRGVhY3RpdmF0ZShpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb1RydWU7XG4gICAgfVxuICAgIHZhciBuZXh0OiBQcm9taXNlPGJvb2xlYW4+O1xuICAgIHZhciBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgdmFyIHJldXNlOiBib29sZWFuID0gZmFsc2U7XG4gICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbikpIHtcbiAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbi5jaGlsZDtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgICAgcmV1c2UgPSBpc0JsYW5rKGluc3RydWN0aW9uLmNvbXBvbmVudCkgfHwgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnJldXNlO1xuICAgIH1cbiAgICBpZiAocmV1c2UpIHtcbiAgICAgIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCA9IHRoaXMuX291dGxldC5yb3V0ZXJDYW5EZWFjdGl2YXRlKGNvbXBvbmVudEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgLy8gVE9ETzogYXV4IHJvdXRlIGxpZmVjeWNsZSBob29rc1xuICAgIHJldHVybiBuZXh0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgaWYgKHJlc3VsdCA9PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2hpbGRSb3V0ZXIuX3JvdXRlckNhbkRlYWN0aXZhdGUoY2hpbGRJbnN0cnVjdGlvbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoaXMgcm91dGVyIGFuZCBhbGwgZGVzY2VuZGFudCByb3V0ZXJzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gaW5zdHJ1Y3Rpb25cbiAgICovXG4gIGNvbW1pdChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgdGhpcy5jdXJyZW50SW5zdHJ1Y3Rpb24gPSBpbnN0cnVjdGlvbjtcblxuICAgIHZhciBuZXh0OiBQcm9taXNlPGFueT4gPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX291dGxldCkgJiYgaXNQcmVzZW50KGluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICAgIGlmIChjb21wb25lbnRJbnN0cnVjdGlvbi5yZXVzZSkge1xuICAgICAgICBuZXh0ID0gdGhpcy5fb3V0bGV0LnJldXNlKGNvbXBvbmVudEluc3RydWN0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHQgPVxuICAgICAgICAgICAgdGhpcy5kZWFjdGl2YXRlKGluc3RydWN0aW9uKS50aGVuKChfKSA9PiB0aGlzLl9vdXRsZXQuYWN0aXZhdGUoY29tcG9uZW50SW5zdHJ1Y3Rpb24pKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24uY2hpbGQpKSB7XG4gICAgICAgIG5leHQgPSBuZXh0LnRoZW4oKF8pID0+IHtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2NoaWxkUm91dGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkUm91dGVyLmNvbW1pdChpbnN0cnVjdGlvbi5jaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZXMgPSBbXTtcbiAgICB0aGlzLl9hdXhSb3V0ZXJzLmZvckVhY2goKHJvdXRlciwgbmFtZSkgPT4ge1xuICAgICAgaWYgKGlzUHJlc2VudChpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbltuYW1lXSkpIHtcbiAgICAgICAgcHJvbWlzZXMucHVzaChyb3V0ZXIuY29tbWl0KGluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uW25hbWVdKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV4dC50aGVuKChfKSA9PiBQcm9taXNlV3JhcHBlci5hbGwocHJvbWlzZXMpKTtcbiAgfVxuXG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RhcnROYXZpZ2F0aW5nKCk6IHZvaWQgeyB0aGlzLm5hdmlnYXRpbmcgPSB0cnVlOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZmluaXNoTmF2aWdhdGluZygpOiB2b2lkIHsgdGhpcy5uYXZpZ2F0aW5nID0gZmFsc2U7IH1cblxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gVVJMIHVwZGF0ZXMgZnJvbSB0aGUgcm91dGVyXG4gICAqL1xuICBzdWJzY3JpYmUob25OZXh0OiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl9zdWJqZWN0LCBvbk5leHQpO1xuICB9XG5cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgY29udGVudHMgb2YgdGhpcyByb3V0ZXIncyBvdXRsZXQgYW5kIGFsbCBkZXNjZW5kYW50IG91dGxldHNcbiAgICovXG4gIGRlYWN0aXZhdGUoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICBjaGlsZEluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb24uY2hpbGQ7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICB9XG4gICAgdmFyIG5leHQ6IFByb21pc2U8YW55PiA9IF9yZXNvbHZlVG9UcnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fY2hpbGRSb3V0ZXIpKSB7XG4gICAgICBuZXh0ID0gdGhpcy5fY2hpbGRSb3V0ZXIuZGVhY3RpdmF0ZShjaGlsZEluc3RydWN0aW9uKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9vdXRsZXQpKSB7XG4gICAgICBuZXh0ID0gbmV4dC50aGVuKChfKSA9PiB0aGlzLl9vdXRsZXQuZGVhY3RpdmF0ZShjb21wb25lbnRJbnN0cnVjdGlvbikpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IGhhbmRsZSBhdXggcm91dGVzXG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgVVJMLCByZXR1cm5zIGFuIGluc3RydWN0aW9uIHJlcHJlc2VudGluZyB0aGUgY29tcG9uZW50IGdyYXBoXG4gICAqL1xuICByZWNvZ25pemUodXJsOiBzdHJpbmcpOiBQcm9taXNlPEluc3RydWN0aW9uPiB7XG4gICAgdmFyIGFuY2VzdG9yQ29tcG9uZW50cyA9IHRoaXMuX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zKCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cnkucmVjb2duaXplKHVybCwgYW5jZXN0b3JDb21wb25lbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zKCk6IEluc3RydWN0aW9uW10ge1xuICAgIHZhciBhbmNlc3Rvckluc3RydWN0aW9ucyA9IFt0aGlzLmN1cnJlbnRJbnN0cnVjdGlvbl07XG4gICAgdmFyIGFuY2VzdG9yUm91dGVyOiBSb3V0ZXIgPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoYW5jZXN0b3JSb3V0ZXIgPSBhbmNlc3RvclJvdXRlci5wYXJlbnQpKSB7XG4gICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy51bnNoaWZ0KGFuY2VzdG9yUm91dGVyLmN1cnJlbnRJbnN0cnVjdGlvbik7XG4gICAgfVxuICAgIHJldHVybiBhbmNlc3Rvckluc3RydWN0aW9ucztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyB0byBlaXRoZXIgdGhlIGxhc3QgVVJMIHN1Y2Nlc3NmdWxseSBuYXZpZ2F0ZWQgdG8sIG9yIHRoZSBsYXN0IFVSTCByZXF1ZXN0ZWQgaWYgdGhlXG4gICAqIHJvdXRlciBoYXMgeWV0IHRvIHN1Y2Nlc3NmdWxseSBuYXZpZ2F0ZS5cbiAgICovXG4gIHJlbmF2aWdhdGUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLmxhc3ROYXZpZ2F0aW9uQXR0ZW1wdCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50TmF2aWdhdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubmF2aWdhdGVCeVVybCh0aGlzLmxhc3ROYXZpZ2F0aW9uQXR0ZW1wdCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhbiBgSW5zdHJ1Y3Rpb25gIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBSb3V0ZSBMaW5rIERTTC5cbiAgICovXG4gIGdlbmVyYXRlKGxpbmtQYXJhbXM6IGFueVtdKTogSW5zdHJ1Y3Rpb24ge1xuICAgIHZhciBhbmNlc3Rvckluc3RydWN0aW9ucyA9IHRoaXMuX2dldEFuY2VzdG9ySW5zdHJ1Y3Rpb25zKCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cnkuZ2VuZXJhdGUobGlua1BhcmFtcywgYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb290Um91dGVyIGV4dGVuZHMgUm91dGVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbG9jYXRpb246IExvY2F0aW9uO1xuICAvKiogQGludGVybmFsICovXG4gIF9sb2NhdGlvblN1YjogT2JqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHJlZ2lzdHJ5OiBSb3V0ZVJlZ2lzdHJ5LCBsb2NhdGlvbjogTG9jYXRpb24sXG4gICAgICAgICAgICAgIEBJbmplY3QoUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UKSBwcmltYXJ5Q29tcG9uZW50OiBUeXBlKSB7XG4gICAgc3VwZXIocmVnaXN0cnksIG51bGwsIHByaW1hcnlDb21wb25lbnQpO1xuICAgIHRoaXMucm9vdCA9IHRoaXM7XG4gICAgdGhpcy5fbG9jYXRpb24gPSBsb2NhdGlvbjtcbiAgICB0aGlzLl9sb2NhdGlvblN1YiA9IHRoaXMuX2xvY2F0aW9uLnN1YnNjcmliZSgoY2hhbmdlKSA9PiB7XG4gICAgICAvLyB3ZSBjYWxsIHJlY29nbml6ZSBvdXJzZWx2ZXNcbiAgICAgIHRoaXMucmVjb2duaXplKGNoYW5nZVsndXJsJ10pXG4gICAgICAgICAgLnRoZW4oKGluc3RydWN0aW9uKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbiwgaXNQcmVzZW50KGNoYW5nZVsncG9wJ10pKVxuICAgICAgICAgICAgICAgIC50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGEgcG9wc3RhdGUgZXZlbnQ7IG5vIG5lZWQgdG8gY2hhbmdlIHRoZSBVUkxcbiAgICAgICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQoY2hhbmdlWydwb3AnXSkgJiYgY2hhbmdlWyd0eXBlJ10gIT0gJ2hhc2hjaGFuZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHZhciBlbWl0UGF0aCA9IGluc3RydWN0aW9uLnRvVXJsUGF0aCgpO1xuICAgICAgICAgICAgICAgICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgIGlmIChlbWl0UGF0aC5sZW5ndGggPiAwICYmIGVtaXRQYXRoWzBdICE9ICcvJykge1xuICAgICAgICAgICAgICAgICAgICBlbWl0UGF0aCA9ICcvJyArIGVtaXRQYXRoO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIHdlJ3ZlIG9wdGVkIHRvIHVzZSBBbGwgaGFzaGNoYW5nZSBldmVudHMgb2NjdXIgb3V0c2lkZSBBbmd1bGFyLlxuICAgICAgICAgICAgICAgICAgLy8gSG93ZXZlciwgYXBwcyB0aGF0IGFyZSBtaWdyYXRpbmcgbWlnaHQgaGF2ZSBoYXNoIGxpbmtzIHRoYXQgb3BlcmF0ZSBvdXRzaWRlXG4gICAgICAgICAgICAgICAgICAvLyBhbmd1bGFyIHRvIHdoaWNoIHJvdXRpbmcgbXVzdCByZXNwb25kLlxuICAgICAgICAgICAgICAgICAgLy8gVG8gc3VwcG9ydCB0aGVzZSBjYXNlcyB3aGVyZSB3ZSByZXNwb25kIHRvIGhhc2hjaGFuZ2VzIGFuZCByZWRpcmVjdCBhcyBhXG4gICAgICAgICAgICAgICAgICAvLyByZXN1bHQsIHdlIG5lZWQgdG8gcmVwbGFjZSB0aGUgdG9wIGl0ZW0gb24gdGhlIHN0YWNrLlxuICAgICAgICAgICAgICAgICAgaWYgKGNoYW5nZVsndHlwZSddID09ICdoYXNoY2hhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdHJ1Y3Rpb24udG9Sb290VXJsKCkgIT0gdGhpcy5fbG9jYXRpb24ucGF0aCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9jYXRpb24ucmVwbGFjZVN0YXRlKGVtaXRQYXRoLCBlbWl0UXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2NhdGlvbi5nbyhlbWl0UGF0aCwgZW1pdFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVnaXN0cnkuY29uZmlnRnJvbUNvbXBvbmVudChwcmltYXJ5Q29tcG9uZW50KTtcbiAgICB0aGlzLm5hdmlnYXRlQnlVcmwobG9jYXRpb24ucGF0aCgpKTtcbiAgfVxuXG4gIGNvbW1pdChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2U6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8YW55PiB7XG4gICAgdmFyIGVtaXRQYXRoID0gaW5zdHJ1Y3Rpb24udG9VcmxQYXRoKCk7XG4gICAgdmFyIGVtaXRRdWVyeSA9IGluc3RydWN0aW9uLnRvVXJsUXVlcnkoKTtcbiAgICBpZiAoZW1pdFBhdGgubGVuZ3RoID4gMCAmJiBlbWl0UGF0aFswXSAhPSAnLycpIHtcbiAgICAgIGVtaXRQYXRoID0gJy8nICsgZW1pdFBhdGg7XG4gICAgfVxuICAgIHZhciBwcm9taXNlID0gc3VwZXIuY29tbWl0KGluc3RydWN0aW9uKTtcbiAgICBpZiAoIV9za2lwTG9jYXRpb25DaGFuZ2UpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oKF8pID0+IHsgdGhpcy5fbG9jYXRpb24uZ28oZW1pdFBhdGgsIGVtaXRRdWVyeSk7IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9sb2NhdGlvblN1YikpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fbG9jYXRpb25TdWIpO1xuICAgICAgdGhpcy5fbG9jYXRpb25TdWIgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDaGlsZFJvdXRlciBleHRlbmRzIFJvdXRlciB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudDogUm91dGVyLCBob3N0Q29tcG9uZW50KSB7XG4gICAgc3VwZXIocGFyZW50LnJlZ2lzdHJ5LCBwYXJlbnQsIGhvc3RDb21wb25lbnQsIHBhcmVudC5yb290KTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgfVxuXG5cbiAgbmF2aWdhdGVCeVVybCh1cmw6IHN0cmluZywgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBEZWxlZ2F0ZSBuYXZpZ2F0aW9uIHRvIHRoZSByb290IHJvdXRlclxuICAgIHJldHVybiB0aGlzLnBhcmVudC5uYXZpZ2F0ZUJ5VXJsKHVybCwgX3NraXBMb2NhdGlvbkNoYW5nZSk7XG4gIH1cblxuICBuYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgX3NraXBMb2NhdGlvbkNoYW5nZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAvLyBEZWxlZ2F0ZSBuYXZpZ2F0aW9uIHRvIHRoZSByb290IHJvdXRlclxuICAgIHJldHVybiB0aGlzLnBhcmVudC5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24sIF9za2lwTG9jYXRpb25DaGFuZ2UpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdmFyIG5leHQgPSBfcmVzb2x2ZVRvVHJ1ZTtcbiAgaWYgKGlzQmxhbmsobmV4dEluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICByZXR1cm4gbmV4dDtcbiAgfVxuICBpZiAoaXNQcmVzZW50KG5leHRJbnN0cnVjdGlvbi5jaGlsZCkpIHtcbiAgICBuZXh0ID0gY2FuQWN0aXZhdGVPbmUobmV4dEluc3RydWN0aW9uLmNoaWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jaGlsZCA6IG51bGwpO1xuICB9XG4gIHJldHVybiBuZXh0LnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgIGlmIChyZXN1bHQgPT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQucmV1c2UpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgaG9vayA9IGdldENhbkFjdGl2YXRlSG9vayhuZXh0SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGUpO1xuICAgIGlmIChpc1ByZXNlbnQoaG9vaykpIHtcbiAgICAgIHJldHVybiBob29rKG5leHRJbnN0cnVjdGlvbi5jb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICBpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSA/IHByZXZJbnN0cnVjdGlvbi5jb21wb25lbnQgOiBudWxsKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuIl19