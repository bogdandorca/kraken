/* */ 
"format cjs";
'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var core_1 = require('angular2/core');
var route_config_impl_1 = require('./route_config/route_config_impl');
var rules_1 = require('./rules/rules');
var rule_set_1 = require('./rules/rule_set');
var instruction_1 = require('./instruction');
var route_config_normalizer_1 = require('./route_config/route_config_normalizer');
var url_parser_1 = require('./url_parser');
var _resolveToNull = async_1.PromiseWrapper.resolve(null);
// A LinkItemArray is an array, which describes a set of routes
// The items in the array are found in groups:
// - the first item is the name of the route
// - the next items are:
//   - an object containing parameters
//   - or an array describing an aux route
// export type LinkRouteItem = string | Object;
// export type LinkItem = LinkRouteItem | Array<LinkRouteItem>;
// export type LinkItemArray = Array<LinkItem>;
/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
exports.ROUTER_PRIMARY_COMPONENT = lang_1.CONST_EXPR(new core_1.OpaqueToken('RouterPrimaryComponent'));
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
var RouteRegistry = (function () {
    function RouteRegistry(_rootComponent) {
        this._rootComponent = _rootComponent;
        this._rules = new collection_1.Map();
    }
    /**
     * Given a component and a configuration object, add the route to this registry
     */
    RouteRegistry.prototype.config = function (parentComponent, config) {
        config = route_config_normalizer_1.normalizeRouteConfig(config, this);
        // this is here because Dart type guard reasons
        if (config instanceof route_config_impl_1.Route) {
            route_config_normalizer_1.assertComponentExists(config.component, config.path);
        }
        else if (config instanceof route_config_impl_1.AuxRoute) {
            route_config_normalizer_1.assertComponentExists(config.component, config.path);
        }
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            rules = new rule_set_1.RuleSet();
            this._rules.set(parentComponent, rules);
        }
        var terminal = rules.config(config);
        if (config instanceof route_config_impl_1.Route) {
            if (terminal) {
                assertTerminalComponent(config.component, config.path);
            }
            else {
                this.configFromComponent(config.component);
            }
        }
    };
    /**
     * Reads the annotations of a component and configures the registry based on them
     */
    RouteRegistry.prototype.configFromComponent = function (component) {
        var _this = this;
        if (!lang_1.isType(component)) {
            return;
        }
        // Don't read the annotations from a type more than once –
        // this prevents an infinite loop if a component routes recursively.
        if (this._rules.has(component)) {
            return;
        }
        var annotations = reflection_1.reflector.annotations(component);
        if (lang_1.isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof route_config_impl_1.RouteConfig) {
                    var routeCfgs = annotation.configs;
                    routeCfgs.forEach(function (config) { return _this.config(component, config); });
                }
            }
        }
    };
    /**
     * Given a URL and a parent component, return the most specific instruction for navigating
     * the application into the state specified by the url
     */
    RouteRegistry.prototype.recognize = function (url, ancestorInstructions) {
        var parsedUrl = url_parser_1.parser.parse(url);
        return this._recognize(parsedUrl, []);
    };
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    RouteRegistry.prototype._recognize = function (parsedUrl, ancestorInstructions, _aux) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
        var parentComponent = lang_1.isPresent(parentInstruction) ? parentInstruction.component.componentType :
            this._rootComponent;
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            return _resolveToNull;
        }
        // Matches some beginning part of the given URL
        var possibleMatches = _aux ? rules.recognizeAuxiliary(parsedUrl) : rules.recognize(parsedUrl);
        var matchPromises = possibleMatches.map(function (candidate) { return candidate.then(function (candidate) {
            if (candidate instanceof rules_1.PathMatch) {
                var auxParentInstructions = ancestorInstructions.length > 0 ? [collection_1.ListWrapper.last(ancestorInstructions)] : [];
                var auxInstructions = _this._auxRoutesToUnresolved(candidate.remainingAux, auxParentInstructions);
                var instruction = new instruction_1.ResolvedInstruction(candidate.instruction, null, auxInstructions);
                if (lang_1.isBlank(candidate.instruction) || candidate.instruction.terminal) {
                    return instruction;
                }
                var newAncestorInstructions = ancestorInstructions.concat([instruction]);
                return _this._recognize(candidate.remaining, newAncestorInstructions)
                    .then(function (childInstruction) {
                    if (lang_1.isBlank(childInstruction)) {
                        return null;
                    }
                    // redirect instructions are already absolute
                    if (childInstruction instanceof instruction_1.RedirectInstruction) {
                        return childInstruction;
                    }
                    instruction.child = childInstruction;
                    return instruction;
                });
            }
            if (candidate instanceof rules_1.RedirectMatch) {
                var instruction = _this.generate(candidate.redirectTo, ancestorInstructions.concat([null]));
                return new instruction_1.RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction, candidate.specificity);
            }
        }); });
        if ((lang_1.isBlank(parsedUrl) || parsedUrl.path == '') && possibleMatches.length == 0) {
            return async_1.PromiseWrapper.resolve(this.generateDefault(parentComponent));
        }
        return async_1.PromiseWrapper.all(matchPromises).then(mostSpecific);
    };
    RouteRegistry.prototype._auxRoutesToUnresolved = function (auxRoutes, parentInstructions) {
        var _this = this;
        var unresolvedAuxInstructions = {};
        auxRoutes.forEach(function (auxUrl) {
            unresolvedAuxInstructions[auxUrl.path] = new instruction_1.UnresolvedInstruction(function () { return _this._recognize(auxUrl, parentInstructions, true); });
        });
        return unresolvedAuxInstructions;
    };
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     *
     * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
     * route boundary.
     */
    RouteRegistry.prototype.generate = function (linkParams, ancestorInstructions, _aux) {
        if (_aux === void 0) { _aux = false; }
        var params = splitAndFlattenLinkParams(linkParams);
        var prevInstruction;
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (collection_1.ListWrapper.first(params) == '') {
            params.shift();
            prevInstruction = collection_1.ListWrapper.first(ancestorInstructions);
            ancestorInstructions = [];
        }
        else {
            prevInstruction = ancestorInstructions.length > 0 ? ancestorInstructions.pop() : null;
            if (collection_1.ListWrapper.first(params) == '.') {
                params.shift();
            }
            else if (collection_1.ListWrapper.first(params) == '..') {
                while (collection_1.ListWrapper.first(params) == '..') {
                    if (ancestorInstructions.length <= 0) {
                        throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
                    }
                    prevInstruction = ancestorInstructions.pop();
                    params = collection_1.ListWrapper.slice(params, 1);
                }
            }
            else {
                // we must only peak at the link param, and not consume it
                var routeName = collection_1.ListWrapper.first(params);
                var parentComponentType = this._rootComponent;
                var grandparentComponentType = null;
                if (ancestorInstructions.length > 1) {
                    var parentComponentInstruction = ancestorInstructions[ancestorInstructions.length - 1];
                    var grandComponentInstruction = ancestorInstructions[ancestorInstructions.length - 2];
                    parentComponentType = parentComponentInstruction.component.componentType;
                    grandparentComponentType = grandComponentInstruction.component.componentType;
                }
                else if (ancestorInstructions.length == 1) {
                    parentComponentType = ancestorInstructions[0].component.componentType;
                    grandparentComponentType = this._rootComponent;
                }
                // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.
                // If both exist, we throw. Otherwise, we prefer whichever exists.
                var childRouteExists = this.hasRoute(routeName, parentComponentType);
                var parentRouteExists = lang_1.isPresent(grandparentComponentType) &&
                    this.hasRoute(routeName, grandparentComponentType);
                if (parentRouteExists && childRouteExists) {
                    var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.";
                    throw new exceptions_1.BaseException(msg);
                }
                if (parentRouteExists) {
                    prevInstruction = ancestorInstructions.pop();
                }
            }
        }
        if (params[params.length - 1] == '') {
            params.pop();
        }
        if (params.length > 0 && params[0] == '') {
            params.shift();
        }
        if (params.length < 1) {
            var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must include a route name.";
            throw new exceptions_1.BaseException(msg);
        }
        var generatedInstruction = this._generate(params, ancestorInstructions, prevInstruction, _aux, linkParams);
        // we don't clone the first (root) element
        for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
            var ancestorInstruction = ancestorInstructions[i];
            if (lang_1.isBlank(ancestorInstruction)) {
                break;
            }
            generatedInstruction = ancestorInstruction.replaceChild(generatedInstruction);
        }
        return generatedInstruction;
    };
    /*
     * Internal helper that does not make any assertions about the beginning of the link DSL.
     * `ancestorInstructions` are parents that will be cloned.
     * `prevInstruction` is the existing instruction that would be replaced, but which might have
     * aux routes that need to be cloned.
     */
    RouteRegistry.prototype._generate = function (linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentComponentType = this._rootComponent;
        var componentInstruction = null;
        var auxInstructions = {};
        var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
        if (lang_1.isPresent(parentInstruction) && lang_1.isPresent(parentInstruction.component)) {
            parentComponentType = parentInstruction.component.componentType;
        }
        if (linkParams.length == 0) {
            var defaultInstruction = this.generateDefault(parentComponentType);
            if (lang_1.isBlank(defaultInstruction)) {
                throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(_originalLink) + "\" does not resolve to a terminal instruction.");
            }
            return defaultInstruction;
        }
        // for non-aux routes, we want to reuse the predecessor's existing primary and aux routes
        // and only override routes for which the given link DSL provides
        if (lang_1.isPresent(prevInstruction) && !_aux) {
            auxInstructions = collection_1.StringMapWrapper.merge(prevInstruction.auxInstruction, auxInstructions);
            componentInstruction = prevInstruction.component;
        }
        var rules = this._rules.get(parentComponentType);
        if (lang_1.isBlank(rules)) {
            throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponentType) + "\" has no route config.");
        }
        var linkParamIndex = 0;
        var routeParams = {};
        // first, recognize the primary route if one is provided
        if (linkParamIndex < linkParams.length && lang_1.isString(linkParams[linkParamIndex])) {
            var routeName = linkParams[linkParamIndex];
            if (routeName == '' || routeName == '.' || routeName == '..') {
                throw new exceptions_1.BaseException("\"" + routeName + "/\" is only allowed at the beginning of a link DSL.");
            }
            linkParamIndex += 1;
            if (linkParamIndex < linkParams.length) {
                var linkParam = linkParams[linkParamIndex];
                if (lang_1.isStringMap(linkParam) && !lang_1.isArray(linkParam)) {
                    routeParams = linkParam;
                    linkParamIndex += 1;
                }
            }
            var routeRecognizer = (_aux ? rules.auxRulesByName : rules.rulesByName).get(routeName);
            if (lang_1.isBlank(routeRecognizer)) {
                throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponentType) + "\" has no route named \"" + routeName + "\".");
            }
            // Create an "unresolved instruction" for async routes
            // we'll figure out the rest of the route when we resolve the instruction and
            // perform a navigation
            if (lang_1.isBlank(routeRecognizer.handler.componentType)) {
                var generatedUrl = routeRecognizer.generateComponentPathValues(routeParams);
                return new instruction_1.UnresolvedInstruction(function () {
                    return routeRecognizer.handler.resolveComponentType().then(function (_) {
                        return _this._generate(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink);
                    });
                }, generatedUrl.urlPath, url_parser_1.convertUrlParamsToArray(generatedUrl.urlParams));
            }
            componentInstruction = _aux ? rules.generateAuxiliary(routeName, routeParams) :
                rules.generate(routeName, routeParams);
        }
        // Next, recognize auxiliary instructions.
        // If we have an ancestor instruction, we preserve whatever aux routes are active from it.
        while (linkParamIndex < linkParams.length && lang_1.isArray(linkParams[linkParamIndex])) {
            var auxParentInstruction = [parentInstruction];
            var auxInstruction = this._generate(linkParams[linkParamIndex], auxParentInstruction, null, true, _originalLink);
            // TODO: this will not work for aux routes with parameters or multiple segments
            auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
            linkParamIndex += 1;
        }
        var instruction = new instruction_1.ResolvedInstruction(componentInstruction, null, auxInstructions);
        // If the component is sync, we can generate resolved child route instructions
        // If not, we'll resolve the instructions at navigation time
        if (lang_1.isPresent(componentInstruction) && lang_1.isPresent(componentInstruction.componentType)) {
            var childInstruction = null;
            if (componentInstruction.terminal) {
                if (linkParamIndex >= linkParams.length) {
                }
            }
            else {
                var childAncestorComponents = ancestorInstructions.concat([instruction]);
                var remainingLinkParams = linkParams.slice(linkParamIndex);
                childInstruction = this._generate(remainingLinkParams, childAncestorComponents, null, false, _originalLink);
            }
            instruction.child = childInstruction;
        }
        return instruction;
    };
    RouteRegistry.prototype.hasRoute = function (name, parentComponent) {
        var rules = this._rules.get(parentComponent);
        if (lang_1.isBlank(rules)) {
            return false;
        }
        return rules.hasRoute(name);
    };
    RouteRegistry.prototype.generateDefault = function (componentCursor) {
        var _this = this;
        if (lang_1.isBlank(componentCursor)) {
            return null;
        }
        var rules = this._rules.get(componentCursor);
        if (lang_1.isBlank(rules) || lang_1.isBlank(rules.defaultRule)) {
            return null;
        }
        var defaultChild = null;
        if (lang_1.isPresent(rules.defaultRule.handler.componentType)) {
            var componentInstruction = rules.defaultRule.generate({});
            if (!rules.defaultRule.terminal) {
                defaultChild = this.generateDefault(rules.defaultRule.handler.componentType);
            }
            return new instruction_1.DefaultInstruction(componentInstruction, defaultChild);
        }
        return new instruction_1.UnresolvedInstruction(function () {
            return rules.defaultRule.handler.resolveComponentType().then(function (_) { return _this.generateDefault(componentCursor); });
        });
    };
    RouteRegistry = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(exports.ROUTER_PRIMARY_COMPONENT)), 
        __metadata('design:paramtypes', [lang_1.Type])
    ], RouteRegistry);
    return RouteRegistry;
})();
exports.RouteRegistry = RouteRegistry;
/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
function splitAndFlattenLinkParams(linkParams) {
    var accumulation = [];
    linkParams.forEach(function (item) {
        if (lang_1.isString(item)) {
            var strItem = item;
            accumulation = accumulation.concat(strItem.split('/'));
        }
        else {
            accumulation.push(item);
        }
    });
    return accumulation;
}
/*
 * Given a list of instructions, returns the most specific instruction
 */
function mostSpecific(instructions) {
    instructions = instructions.filter(function (instruction) { return lang_1.isPresent(instruction); });
    if (instructions.length == 0) {
        return null;
    }
    if (instructions.length == 1) {
        return instructions[0];
    }
    var first = instructions[0];
    var rest = instructions.slice(1);
    return rest.reduce(function (instruction, contender) {
        if (compareSpecificityStrings(contender.specificity, instruction.specificity) == -1) {
            return contender;
        }
        return instruction;
    }, first);
}
/*
 * Expects strings to be in the form of "[0-2]+"
 * Returns -1 if string A should be sorted above string B, 1 if it should be sorted after,
 * or 0 if they are the same.
 */
function compareSpecificityStrings(a, b) {
    var l = lang_1.Math.min(a.length, b.length);
    for (var i = 0; i < l; i += 1) {
        var ai = lang_1.StringWrapper.charCodeAt(a, i);
        var bi = lang_1.StringWrapper.charCodeAt(b, i);
        var difference = bi - ai;
        if (difference != 0) {
            return difference;
        }
    }
    return a.length - b.length;
}
function assertTerminalComponent(component, path) {
    if (!lang_1.isType(component)) {
        return;
    }
    var annotations = reflection_1.reflector.annotations(component);
    if (lang_1.isPresent(annotations)) {
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof route_config_impl_1.RouteConfig) {
                throw new exceptions_1.BaseException("Child routes are not allowed for \"" + path + "\". Use \"...\" on the parent's route path.");
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbIlJvdXRlUmVnaXN0cnkiLCJSb3V0ZVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUm91dGVSZWdpc3RyeS5jb25maWciLCJSb3V0ZVJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQiLCJSb3V0ZVJlZ2lzdHJ5LnJlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX3JlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZCIsIlJvdXRlUmVnaXN0cnkuZ2VuZXJhdGUiLCJSb3V0ZVJlZ2lzdHJ5Ll9nZW5lcmF0ZSIsIlJvdXRlUmVnaXN0cnkuaGFzUm91dGUiLCJSb3V0ZVJlZ2lzdHJ5LmdlbmVyYXRlRGVmYXVsdCIsInNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMiLCJtb3N0U3BlY2lmaWMiLCJjb21wYXJlU3BlY2lmaWNpdHlTdHJpbmdzIiwiYXNzZXJ0VGVybWluYWxDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJCQUE2RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzlGLHNCQUE2QiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ3pELHFCQVlPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUscUJBQThDLGVBQWUsQ0FBQyxDQUFBO0FBRTlELGtDQU9PLGtDQUFrQyxDQUFDLENBQUE7QUFDMUMsc0JBQW1ELGVBQWUsQ0FBQyxDQUFBO0FBQ25FLHlCQUFzQixrQkFBa0IsQ0FBQyxDQUFBO0FBQ3pDLDRCQU1PLGVBQWUsQ0FBQyxDQUFBO0FBRXZCLHdDQUEwRCx3Q0FBd0MsQ0FBQyxDQUFBO0FBQ25HLDJCQUFzRSxjQUFjLENBQUMsQ0FBQTtBQUVyRixJQUFJ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QUMzRkEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xpc3RXcmFwcGVyLCBNYXAsIE1hcFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNBcnJheSxcbiAgaXNCbGFuayxcbiAgaXNUeXBlLFxuICBpc1N0cmluZyxcbiAgaXNTdHJpbmdNYXAsXG4gIFR5cGUsXG4gIFN0cmluZ1dyYXBwZXIsXG4gIE1hdGgsXG4gIGdldFR5cGVOYW1lRm9yRGVidWdnaW5nLFxuICBDT05TVF9FWFBSXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7XG4gIFJvdXRlQ29uZmlnLFxuICBBc3luY1JvdXRlLFxuICBSb3V0ZSxcbiAgQXV4Um91dGUsXG4gIFJlZGlyZWN0LFxuICBSb3V0ZURlZmluaXRpb25cbn0gZnJvbSAnLi9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX2ltcGwnO1xuaW1wb3J0IHtQYXRoTWF0Y2gsIFJlZGlyZWN0TWF0Y2gsIFJvdXRlTWF0Y2h9IGZyb20gJy4vcnVsZXMvcnVsZXMnO1xuaW1wb3J0IHtSdWxlU2V0fSBmcm9tICcuL3J1bGVzL3J1bGVfc2V0JztcbmltcG9ydCB7XG4gIEluc3RydWN0aW9uLFxuICBSZXNvbHZlZEluc3RydWN0aW9uLFxuICBSZWRpcmVjdEluc3RydWN0aW9uLFxuICBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24sXG4gIERlZmF1bHRJbnN0cnVjdGlvblxufSBmcm9tICcuL2luc3RydWN0aW9uJztcblxuaW1wb3J0IHtub3JtYWxpemVSb3V0ZUNvbmZpZywgYXNzZXJ0Q29tcG9uZW50RXhpc3RzfSBmcm9tICcuL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfbm9ybWFsaXplcic7XG5pbXBvcnQge3BhcnNlciwgVXJsLCBjb252ZXJ0VXJsUGFyYW1zVG9BcnJheSwgcGF0aFNlZ21lbnRzVG9Vcmx9IGZyb20gJy4vdXJsX3BhcnNlcic7XG5cbnZhciBfcmVzb2x2ZVRvTnVsbCA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUobnVsbCk7XG5cbi8vIEEgTGlua0l0ZW1BcnJheSBpcyBhbiBhcnJheSwgd2hpY2ggZGVzY3JpYmVzIGEgc2V0IG9mIHJvdXRlc1xuLy8gVGhlIGl0ZW1zIGluIHRoZSBhcnJheSBhcmUgZm91bmQgaW4gZ3JvdXBzOlxuLy8gLSB0aGUgZmlyc3QgaXRlbSBpcyB0aGUgbmFtZSBvZiB0aGUgcm91dGVcbi8vIC0gdGhlIG5leHQgaXRlbXMgYXJlOlxuLy8gICAtIGFuIG9iamVjdCBjb250YWluaW5nIHBhcmFtZXRlcnNcbi8vICAgLSBvciBhbiBhcnJheSBkZXNjcmliaW5nIGFuIGF1eCByb3V0ZVxuLy8gZXhwb3J0IHR5cGUgTGlua1JvdXRlSXRlbSA9IHN0cmluZyB8IE9iamVjdDtcbi8vIGV4cG9ydCB0eXBlIExpbmtJdGVtID0gTGlua1JvdXRlSXRlbSB8IEFycmF5PExpbmtSb3V0ZUl0ZW0+O1xuLy8gZXhwb3J0IHR5cGUgTGlua0l0ZW1BcnJheSA9IEFycmF5PExpbmtJdGVtPjtcblxuLyoqXG4gKiBUb2tlbiB1c2VkIHRvIGJpbmQgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSB0b3AtbGV2ZWwge0BsaW5rIFJvdXRlQ29uZmlnfXMgZm9yIHRoZVxuICogYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2lSVVA4QjVPVWJ4Q1dRM0FjSURtKSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7XG4gKiAgIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBSb3V0ZUNvbmZpZ1xuICogfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICAvLyAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbUk9VVEVSX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfUFJJTUFSWV9DT01QT05FTlQ6IE9wYXF1ZVRva2VuID1cbiAgICBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignUm91dGVyUHJpbWFyeUNvbXBvbmVudCcpKTtcblxuXG4vKipcbiAqIFRoZSBSb3V0ZVJlZ2lzdHJ5IGhvbGRzIHJvdXRlIGNvbmZpZ3VyYXRpb25zIGZvciBlYWNoIGNvbXBvbmVudCBpbiBhbiBBbmd1bGFyIGFwcC5cbiAqIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyBJbnN0cnVjdGlvbnMgZnJvbSBVUkxzLCBhbmQgZ2VuZXJhdGluZyBVUkxzIGJhc2VkIG9uIHJvdXRlIGFuZFxuICogcGFyYW1ldGVycy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvdXRlUmVnaXN0cnkge1xuICBwcml2YXRlIF9ydWxlcyA9IG5ldyBNYXA8YW55LCBSdWxlU2V0PigpO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UKSBwcml2YXRlIF9yb290Q29tcG9uZW50OiBUeXBlKSB7fVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGNvbXBvbmVudCBhbmQgYSBjb25maWd1cmF0aW9uIG9iamVjdCwgYWRkIHRoZSByb3V0ZSB0byB0aGlzIHJlZ2lzdHJ5XG4gICAqL1xuICBjb25maWcocGFyZW50Q29tcG9uZW50OiBhbnksIGNvbmZpZzogUm91dGVEZWZpbml0aW9uKTogdm9pZCB7XG4gICAgY29uZmlnID0gbm9ybWFsaXplUm91dGVDb25maWcoY29uZmlnLCB0aGlzKTtcblxuICAgIC8vIHRoaXMgaXMgaGVyZSBiZWNhdXNlIERhcnQgdHlwZSBndWFyZCByZWFzb25zXG4gICAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIFJvdXRlKSB7XG4gICAgICBhc3NlcnRDb21wb25lbnRFeGlzdHMoY29uZmlnLmNvbXBvbmVudCwgY29uZmlnLnBhdGgpO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnIGluc3RhbmNlb2YgQXV4Um91dGUpIHtcbiAgICAgIGFzc2VydENvbXBvbmVudEV4aXN0cyhjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgfVxuXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG5cbiAgICBpZiAoaXNCbGFuayhydWxlcykpIHtcbiAgICAgIHJ1bGVzID0gbmV3IFJ1bGVTZXQoKTtcbiAgICAgIHRoaXMuX3J1bGVzLnNldChwYXJlbnRDb21wb25lbnQsIHJ1bGVzKTtcbiAgICB9XG5cbiAgICB2YXIgdGVybWluYWwgPSBydWxlcy5jb25maWcoY29uZmlnKTtcblxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgaWYgKHRlcm1pbmFsKSB7XG4gICAgICAgIGFzc2VydFRlcm1pbmFsQ29tcG9uZW50KGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29uZmlnRnJvbUNvbXBvbmVudChjb25maWcuY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIGFubm90YXRpb25zIG9mIGEgY29tcG9uZW50IGFuZCBjb25maWd1cmVzIHRoZSByZWdpc3RyeSBiYXNlZCBvbiB0aGVtXG4gICAqL1xuICBjb25maWdGcm9tQ29tcG9uZW50KGNvbXBvbmVudDogYW55KTogdm9pZCB7XG4gICAgaWYgKCFpc1R5cGUoY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERvbid0IHJlYWQgdGhlIGFubm90YXRpb25zIGZyb20gYSB0eXBlIG1vcmUgdGhhbiBvbmNlIOKAk1xuICAgIC8vIHRoaXMgcHJldmVudHMgYW4gaW5maW5pdGUgbG9vcCBpZiBhIGNvbXBvbmVudCByb3V0ZXMgcmVjdXJzaXZlbHkuXG4gICAgaWYgKHRoaXMuX3J1bGVzLmhhcyhjb21wb25lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBhbm5vdGF0aW9ucyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wb25lbnQpO1xuICAgIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFubm90YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhbm5vdGF0aW9uID0gYW5ub3RhdGlvbnNbaV07XG5cbiAgICAgICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBSb3V0ZUNvbmZpZykge1xuICAgICAgICAgIGxldCByb3V0ZUNmZ3M6IFJvdXRlRGVmaW5pdGlvbltdID0gYW5ub3RhdGlvbi5jb25maWdzO1xuICAgICAgICAgIHJvdXRlQ2Zncy5mb3JFYWNoKGNvbmZpZyA9PiB0aGlzLmNvbmZpZyhjb21wb25lbnQsIGNvbmZpZykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBVUkwgYW5kIGEgcGFyZW50IGNvbXBvbmVudCwgcmV0dXJuIHRoZSBtb3N0IHNwZWNpZmljIGluc3RydWN0aW9uIGZvciBuYXZpZ2F0aW5nXG4gICAqIHRoZSBhcHBsaWNhdGlvbiBpbnRvIHRoZSBzdGF0ZSBzcGVjaWZpZWQgYnkgdGhlIHVybFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IFByb21pc2U8SW5zdHJ1Y3Rpb24+IHtcbiAgICB2YXIgcGFyc2VkVXJsID0gcGFyc2VyLnBhcnNlKHVybCk7XG4gICAgcmV0dXJuIHRoaXMuX3JlY29nbml6ZShwYXJzZWRVcmwsIFtdKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlY29nbml6ZXMgYWxsIHBhcmVudC1jaGlsZCByb3V0ZXMsIGJ1dCBjcmVhdGVzIHVucmVzb2x2ZWQgYXV4aWxpYXJ5IHJvdXRlc1xuICAgKi9cbiAgcHJpdmF0ZSBfcmVjb2duaXplKHBhcnNlZFVybDogVXJsLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSxcbiAgICAgICAgICAgICAgICAgICAgIF9hdXggPSBmYWxzZSk6IFByb21pc2U8SW5zdHJ1Y3Rpb24+IHtcbiAgICB2YXIgcGFyZW50SW5zdHJ1Y3Rpb24gPSBMaXN0V3JhcHBlci5sYXN0KGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgICB2YXIgcGFyZW50Q29tcG9uZW50ID0gaXNQcmVzZW50KHBhcmVudEluc3RydWN0aW9uKSA/IHBhcmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5jb21wb25lbnRUeXBlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jvb3RDb21wb25lbnQ7XG5cbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50KTtcbiAgICBpZiAoaXNCbGFuayhydWxlcykpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvTnVsbDtcbiAgICB9XG5cbiAgICAvLyBNYXRjaGVzIHNvbWUgYmVnaW5uaW5nIHBhcnQgb2YgdGhlIGdpdmVuIFVSTFxuICAgIHZhciBwb3NzaWJsZU1hdGNoZXM6IFByb21pc2U8Um91dGVNYXRjaD5bXSA9XG4gICAgICAgIF9hdXggPyBydWxlcy5yZWNvZ25pemVBdXhpbGlhcnkocGFyc2VkVXJsKSA6IHJ1bGVzLnJlY29nbml6ZShwYXJzZWRVcmwpO1xuXG4gICAgdmFyIG1hdGNoUHJvbWlzZXM6IFByb21pc2U8SW5zdHJ1Y3Rpb24+W10gPSBwb3NzaWJsZU1hdGNoZXMubWFwKFxuICAgICAgICAoY2FuZGlkYXRlOiBQcm9taXNlPFJvdXRlTWF0Y2g+KSA9PiBjYW5kaWRhdGUudGhlbigoY2FuZGlkYXRlOiBSb3V0ZU1hdGNoKSA9PiB7XG5cbiAgICAgICAgICBpZiAoY2FuZGlkYXRlIGluc3RhbmNlb2YgUGF0aE1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgYXV4UGFyZW50SW5zdHJ1Y3Rpb25zID1cbiAgICAgICAgICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID8gW0xpc3RXcmFwcGVyLmxhc3QoYW5jZXN0b3JJbnN0cnVjdGlvbnMpXSA6IFtdO1xuICAgICAgICAgICAgdmFyIGF1eEluc3RydWN0aW9ucyA9XG4gICAgICAgICAgICAgICAgdGhpcy5fYXV4Um91dGVzVG9VbnJlc29sdmVkKGNhbmRpZGF0ZS5yZW1haW5pbmdBdXgsIGF1eFBhcmVudEluc3RydWN0aW9ucyk7XG5cbiAgICAgICAgICAgIHZhciBpbnN0cnVjdGlvbiA9IG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKGNhbmRpZGF0ZS5pbnN0cnVjdGlvbiwgbnVsbCwgYXV4SW5zdHJ1Y3Rpb25zKTtcblxuICAgICAgICAgICAgaWYgKGlzQmxhbmsoY2FuZGlkYXRlLmluc3RydWN0aW9uKSB8fCBjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24udGVybWluYWwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbmV3QW5jZXN0b3JJbnN0cnVjdGlvbnMgPSBhbmNlc3Rvckluc3RydWN0aW9ucy5jb25jYXQoW2luc3RydWN0aW9uXSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZWNvZ25pemUoY2FuZGlkYXRlLnJlbWFpbmluZywgbmV3QW5jZXN0b3JJbnN0cnVjdGlvbnMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGNoaWxkSW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChpc0JsYW5rKGNoaWxkSW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyByZWRpcmVjdCBpbnN0cnVjdGlvbnMgYXJlIGFscmVhZHkgYWJzb2x1dGVcbiAgICAgICAgICAgICAgICAgIGlmIChjaGlsZEluc3RydWN0aW9uIGluc3RhbmNlb2YgUmVkaXJlY3RJbnN0cnVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRJbnN0cnVjdGlvbjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uLmNoaWxkID0gY2hpbGRJbnN0cnVjdGlvbjtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY2FuZGlkYXRlIGluc3RhbmNlb2YgUmVkaXJlY3RNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGluc3RydWN0aW9uID1cbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlKGNhbmRpZGF0ZS5yZWRpcmVjdFRvLCBhbmNlc3Rvckluc3RydWN0aW9ucy5jb25jYXQoW251bGxdKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZGlyZWN0SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24uY29tcG9uZW50LCBpbnN0cnVjdGlvbi5jaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbiwgY2FuZGlkYXRlLnNwZWNpZmljaXR5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgIGlmICgoaXNCbGFuayhwYXJzZWRVcmwpIHx8IHBhcnNlZFVybC5wYXRoID09ICcnKSAmJiBwb3NzaWJsZU1hdGNoZXMubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuZ2VuZXJhdGVEZWZhdWx0KHBhcmVudENvbXBvbmVudCkpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwobWF0Y2hQcm9taXNlcykudGhlbihtb3N0U3BlY2lmaWMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXV4Um91dGVzVG9VbnJlc29sdmVkKGF1eFJvdXRlczogVXJsW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259IHtcbiAgICB2YXIgdW5yZXNvbHZlZEF1eEluc3RydWN0aW9uczoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSA9IHt9O1xuXG4gICAgYXV4Um91dGVzLmZvckVhY2goKGF1eFVybDogVXJsKSA9PiB7XG4gICAgICB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zW2F1eFVybC5wYXRoXSA9IG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgKCkgPT4geyByZXR1cm4gdGhpcy5fcmVjb2duaXplKGF1eFVybCwgcGFyZW50SW5zdHJ1Y3Rpb25zLCB0cnVlKTsgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdW5yZXNvbHZlZEF1eEluc3RydWN0aW9ucztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbm9ybWFsaXplZCBsaXN0IHdpdGggY29tcG9uZW50IG5hbWVzIGFuZCBwYXJhbXMgbGlrZTogYFsndXNlcicsIHtpZDogMyB9XWBcbiAgICogZ2VuZXJhdGVzIGEgdXJsIHdpdGggYSBsZWFkaW5nIHNsYXNoIHJlbGF0aXZlIHRvIHRoZSBwcm92aWRlZCBgcGFyZW50Q29tcG9uZW50YC5cbiAgICpcbiAgICogSWYgdGhlIG9wdGlvbmFsIHBhcmFtIGBfYXV4YCBpcyBgdHJ1ZWAsIHRoZW4gd2UgZ2VuZXJhdGUgc3RhcnRpbmcgYXQgYW4gYXV4aWxpYXJ5XG4gICAqIHJvdXRlIGJvdW5kYXJ5LlxuICAgKi9cbiAgZ2VuZXJhdGUobGlua1BhcmFtczogYW55W10sIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLCBfYXV4ID0gZmFsc2UpOiBJbnN0cnVjdGlvbiB7XG4gICAgdmFyIHBhcmFtcyA9IHNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMobGlua1BhcmFtcyk7XG4gICAgdmFyIHByZXZJbnN0cnVjdGlvbjtcblxuICAgIC8vIFRoZSBmaXJzdCBzZWdtZW50IHNob3VsZCBiZSBlaXRoZXIgJy4nIChnZW5lcmF0ZSBmcm9tIHBhcmVudCkgb3IgJycgKGdlbmVyYXRlIGZyb20gcm9vdCkuXG4gICAgLy8gV2hlbiB3ZSBub3JtYWxpemUgYWJvdmUsIHdlIHN0cmlwIGFsbCB0aGUgc2xhc2hlcywgJy4vJyBiZWNvbWVzICcuJyBhbmQgJy8nIGJlY29tZXMgJycuXG4gICAgaWYgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJycpIHtcbiAgICAgIHBhcmFtcy5zaGlmdCgpO1xuICAgICAgcHJldkluc3RydWN0aW9uID0gTGlzdFdyYXBwZXIuZmlyc3QoYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldkluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLnBvcCgpIDogbnVsbDtcblxuICAgICAgaWYgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJy4nKSB7XG4gICAgICAgIHBhcmFtcy5zaGlmdCgpO1xuICAgICAgfSBlbHNlIGlmIChMaXN0V3JhcHBlci5maXJzdChwYXJhbXMpID09ICcuLicpIHtcbiAgICAgICAgd2hpbGUgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJy4uJykge1xuICAgICAgICAgIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBoYXMgdG9vIG1hbnkgXCIuLi9cIiBzZWdtZW50cy5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJldkluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCk7XG4gICAgICAgICAgcGFyYW1zID0gTGlzdFdyYXBwZXIuc2xpY2UocGFyYW1zLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlJ3JlIG9uIHRvIGltcGxpY2l0IGNoaWxkL3NpYmxpbmcgcm91dGVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHdlIG11c3Qgb25seSBwZWFrIGF0IHRoZSBsaW5rIHBhcmFtLCBhbmQgbm90IGNvbnN1bWUgaXRcbiAgICAgICAgbGV0IHJvdXRlTmFtZSA9IExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcyk7XG4gICAgICAgIGxldCBwYXJlbnRDb21wb25lbnRUeXBlID0gdGhpcy5fcm9vdENvbXBvbmVudDtcbiAgICAgICAgbGV0IGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBsZXQgcGFyZW50Q29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxXTtcbiAgICAgICAgICBsZXQgZ3JhbmRDb21wb25lbnRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDJdO1xuXG4gICAgICAgICAgcGFyZW50Q29tcG9uZW50VHlwZSA9IHBhcmVudENvbXBvbmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgICAgICAgIGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSA9IGdyYW5kQ29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgIH0gZWxzZSBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICBwYXJlbnRDb21wb25lbnRUeXBlID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbMF0uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgICAgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlID0gdGhpcy5fcm9vdENvbXBvbmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZvciBhIGxpbmsgd2l0aCBubyBsZWFkaW5nIGAuL2AsIGAvYCwgb3IgYC4uL2AsIHdlIGxvb2sgZm9yIGEgc2libGluZyBhbmQgY2hpbGQuXG4gICAgICAgIC8vIElmIGJvdGggZXhpc3QsIHdlIHRocm93LiBPdGhlcndpc2UsIHdlIHByZWZlciB3aGljaGV2ZXIgZXhpc3RzLlxuICAgICAgICB2YXIgY2hpbGRSb3V0ZUV4aXN0cyA9IHRoaXMuaGFzUm91dGUocm91dGVOYW1lLCBwYXJlbnRDb21wb25lbnRUeXBlKTtcbiAgICAgICAgdmFyIHBhcmVudFJvdXRlRXhpc3RzID0gaXNQcmVzZW50KGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNSb3V0ZShyb3V0ZU5hbWUsIGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSk7XG5cbiAgICAgICAgaWYgKHBhcmVudFJvdXRlRXhpc3RzICYmIGNoaWxkUm91dGVFeGlzdHMpIHtcbiAgICAgICAgICBsZXQgbXNnID1cbiAgICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBpcyBhbWJpZ3VvdXMsIHVzZSBcIi4vXCIgb3IgXCIuLi9cIiB0byBkaXNhbWJpZ3VhdGUuYDtcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihtc2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmVudFJvdXRlRXhpc3RzKSB7XG4gICAgICAgICAgcHJldkluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFyYW1zW3BhcmFtcy5sZW5ndGggLSAxXSA9PSAnJykge1xuICAgICAgcGFyYW1zLnBvcCgpO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMubGVuZ3RoID4gMCAmJiBwYXJhbXNbMF0gPT0gJycpIHtcbiAgICAgIHBhcmFtcy5zaGlmdCgpO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMubGVuZ3RoIDwgMSkge1xuICAgICAgbGV0IG1zZyA9IGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgbXVzdCBpbmNsdWRlIGEgcm91dGUgbmFtZS5gO1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24obXNnKTtcbiAgICB9XG5cbiAgICB2YXIgZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24gPVxuICAgICAgICB0aGlzLl9nZW5lcmF0ZShwYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLCBwcmV2SW5zdHJ1Y3Rpb24sIF9hdXgsIGxpbmtQYXJhbXMpO1xuXG4gICAgLy8gd2UgZG9uJ3QgY2xvbmUgdGhlIGZpcnN0IChyb290KSBlbGVtZW50XG4gICAgZm9yICh2YXIgaSA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBsZXQgYW5jZXN0b3JJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2ldO1xuICAgICAgaWYgKGlzQmxhbmsoYW5jZXN0b3JJbnN0cnVjdGlvbikpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBnZW5lcmF0ZWRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkKGdlbmVyYXRlZEluc3RydWN0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2VuZXJhdGVkSW5zdHJ1Y3Rpb247XG4gIH1cblxuXG4gIC8qXG4gICAqIEludGVybmFsIGhlbHBlciB0aGF0IGRvZXMgbm90IG1ha2UgYW55IGFzc2VydGlvbnMgYWJvdXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluayBEU0wuXG4gICAqIGBhbmNlc3Rvckluc3RydWN0aW9uc2AgYXJlIHBhcmVudHMgdGhhdCB3aWxsIGJlIGNsb25lZC5cbiAgICogYHByZXZJbnN0cnVjdGlvbmAgaXMgdGhlIGV4aXN0aW5nIGluc3RydWN0aW9uIHRoYXQgd291bGQgYmUgcmVwbGFjZWQsIGJ1dCB3aGljaCBtaWdodCBoYXZlXG4gICAqIGF1eCByb3V0ZXMgdGhhdCBuZWVkIHRvIGJlIGNsb25lZC5cbiAgICovXG4gIHByaXZhdGUgX2dlbmVyYXRlKGxpbmtQYXJhbXM6IGFueVtdLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSxcbiAgICAgICAgICAgICAgICAgICAgcHJldkluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiwgX2F1eCA9IGZhbHNlLCBfb3JpZ2luYWxMaW5rOiBhbnlbXSk6IEluc3RydWN0aW9uIHtcbiAgICBsZXQgcGFyZW50Q29tcG9uZW50VHlwZSA9IHRoaXMuX3Jvb3RDb21wb25lbnQ7XG4gICAgbGV0IGNvbXBvbmVudEluc3RydWN0aW9uID0gbnVsbDtcbiAgICBsZXQgYXV4SW5zdHJ1Y3Rpb25zOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG5cbiAgICBsZXQgcGFyZW50SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gTGlzdFdyYXBwZXIubGFzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnRJbnN0cnVjdGlvbikgJiYgaXNQcmVzZW50KHBhcmVudEluc3RydWN0aW9uLmNvbXBvbmVudCkpIHtcbiAgICAgIHBhcmVudENvbXBvbmVudFR5cGUgPSBwYXJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICB9XG5cbiAgICBpZiAobGlua1BhcmFtcy5sZW5ndGggPT0gMCkge1xuICAgICAgbGV0IGRlZmF1bHRJbnN0cnVjdGlvbiA9IHRoaXMuZ2VuZXJhdGVEZWZhdWx0KHBhcmVudENvbXBvbmVudFR5cGUpO1xuICAgICAgaWYgKGlzQmxhbmsoZGVmYXVsdEluc3RydWN0aW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04oX29yaWdpbmFsTGluayl9XCIgZG9lcyBub3QgcmVzb2x2ZSB0byBhIHRlcm1pbmFsIGluc3RydWN0aW9uLmApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmF1bHRJbnN0cnVjdGlvbjtcbiAgICB9XG5cbiAgICAvLyBmb3Igbm9uLWF1eCByb3V0ZXMsIHdlIHdhbnQgdG8gcmV1c2UgdGhlIHByZWRlY2Vzc29yJ3MgZXhpc3RpbmcgcHJpbWFyeSBhbmQgYXV4IHJvdXRlc1xuICAgIC8vIGFuZCBvbmx5IG92ZXJyaWRlIHJvdXRlcyBmb3Igd2hpY2ggdGhlIGdpdmVuIGxpbmsgRFNMIHByb3ZpZGVzXG4gICAgaWYgKGlzUHJlc2VudChwcmV2SW5zdHJ1Y3Rpb24pICYmICFfYXV4KSB7XG4gICAgICBhdXhJbnN0cnVjdGlvbnMgPSBTdHJpbmdNYXBXcmFwcGVyLm1lcmdlKHByZXZJbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbiwgYXV4SW5zdHJ1Y3Rpb25zKTtcbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gcHJldkluc3RydWN0aW9uLmNvbXBvbmVudDtcbiAgICB9XG5cbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50VHlwZSk7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgQ29tcG9uZW50IFwiJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyhwYXJlbnRDb21wb25lbnRUeXBlKX1cIiBoYXMgbm8gcm91dGUgY29uZmlnLmApO1xuICAgIH1cblxuICAgIGxldCBsaW5rUGFyYW1JbmRleCA9IDA7XG4gICAgbGV0IHJvdXRlUGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuXG4gICAgLy8gZmlyc3QsIHJlY29nbml6ZSB0aGUgcHJpbWFyeSByb3V0ZSBpZiBvbmUgaXMgcHJvdmlkZWRcbiAgICBpZiAobGlua1BhcmFtSW5kZXggPCBsaW5rUGFyYW1zLmxlbmd0aCAmJiBpc1N0cmluZyhsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XSkpIHtcbiAgICAgIGxldCByb3V0ZU5hbWUgPSBsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XTtcbiAgICAgIGlmIChyb3V0ZU5hbWUgPT0gJycgfHwgcm91dGVOYW1lID09ICcuJyB8fCByb3V0ZU5hbWUgPT0gJy4uJykge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgXCIke3JvdXRlTmFtZX0vXCIgaXMgb25seSBhbGxvd2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5rIERTTC5gKTtcbiAgICAgIH1cbiAgICAgIGxpbmtQYXJhbUluZGV4ICs9IDE7XG4gICAgICBpZiAobGlua1BhcmFtSW5kZXggPCBsaW5rUGFyYW1zLmxlbmd0aCkge1xuICAgICAgICBsZXQgbGlua1BhcmFtID0gbGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF07XG4gICAgICAgIGlmIChpc1N0cmluZ01hcChsaW5rUGFyYW0pICYmICFpc0FycmF5KGxpbmtQYXJhbSkpIHtcbiAgICAgICAgICByb3V0ZVBhcmFtcyA9IGxpbmtQYXJhbTtcbiAgICAgICAgICBsaW5rUGFyYW1JbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgcm91dGVSZWNvZ25pemVyID0gKF9hdXggPyBydWxlcy5hdXhSdWxlc0J5TmFtZSA6IHJ1bGVzLnJ1bGVzQnlOYW1lKS5nZXQocm91dGVOYW1lKTtcblxuICAgICAgaWYgKGlzQmxhbmsocm91dGVSZWNvZ25pemVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDb21wb25lbnQgXCIke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHBhcmVudENvbXBvbmVudFR5cGUpfVwiIGhhcyBubyByb3V0ZSBuYW1lZCBcIiR7cm91dGVOYW1lfVwiLmApO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYW4gXCJ1bnJlc29sdmVkIGluc3RydWN0aW9uXCIgZm9yIGFzeW5jIHJvdXRlc1xuICAgICAgLy8gd2UnbGwgZmlndXJlIG91dCB0aGUgcmVzdCBvZiB0aGUgcm91dGUgd2hlbiB3ZSByZXNvbHZlIHRoZSBpbnN0cnVjdGlvbiBhbmRcbiAgICAgIC8vIHBlcmZvcm0gYSBuYXZpZ2F0aW9uXG4gICAgICBpZiAoaXNCbGFuayhyb3V0ZVJlY29nbml6ZXIuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgICB2YXIgZ2VuZXJhdGVkVXJsID0gcm91dGVSZWNvZ25pemVyLmdlbmVyYXRlQ29tcG9uZW50UGF0aFZhbHVlcyhyb3V0ZVBhcmFtcyk7XG4gICAgICAgIHJldHVybiBuZXcgVW5yZXNvbHZlZEluc3RydWN0aW9uKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gcm91dGVSZWNvZ25pemVyLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKS50aGVuKChfKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZ2VuZXJhdGUobGlua1BhcmFtcywgYW5jZXN0b3JJbnN0cnVjdGlvbnMsIHByZXZJbnN0cnVjdGlvbiwgX2F1eCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfb3JpZ2luYWxMaW5rKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZ2VuZXJhdGVkVXJsLnVybFBhdGgsIGNvbnZlcnRVcmxQYXJhbXNUb0FycmF5KGdlbmVyYXRlZFVybC51cmxQYXJhbXMpKTtcbiAgICAgIH1cblxuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBfYXV4ID8gcnVsZXMuZ2VuZXJhdGVBdXhpbGlhcnkocm91dGVOYW1lLCByb3V0ZVBhcmFtcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVsZXMuZ2VuZXJhdGUocm91dGVOYW1lLCByb3V0ZVBhcmFtcyk7XG4gICAgfVxuXG4gICAgLy8gTmV4dCwgcmVjb2duaXplIGF1eGlsaWFyeSBpbnN0cnVjdGlvbnMuXG4gICAgLy8gSWYgd2UgaGF2ZSBhbiBhbmNlc3RvciBpbnN0cnVjdGlvbiwgd2UgcHJlc2VydmUgd2hhdGV2ZXIgYXV4IHJvdXRlcyBhcmUgYWN0aXZlIGZyb20gaXQuXG4gICAgd2hpbGUgKGxpbmtQYXJhbUluZGV4IDwgbGlua1BhcmFtcy5sZW5ndGggJiYgaXNBcnJheShsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XSkpIHtcbiAgICAgIGxldCBhdXhQYXJlbnRJbnN0cnVjdGlvbiA9IFtwYXJlbnRJbnN0cnVjdGlvbl07XG4gICAgICBsZXQgYXV4SW5zdHJ1Y3Rpb24gPSB0aGlzLl9nZW5lcmF0ZShsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XSwgYXV4UGFyZW50SW5zdHJ1Y3Rpb24sIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlLCBfb3JpZ2luYWxMaW5rKTtcblxuICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIG5vdCB3b3JrIGZvciBhdXggcm91dGVzIHdpdGggcGFyYW1ldGVycyBvciBtdWx0aXBsZSBzZWdtZW50c1xuICAgICAgYXV4SW5zdHJ1Y3Rpb25zW2F1eEluc3RydWN0aW9uLmNvbXBvbmVudC51cmxQYXRoXSA9IGF1eEluc3RydWN0aW9uO1xuICAgICAgbGlua1BhcmFtSW5kZXggKz0gMTtcbiAgICB9XG5cbiAgICB2YXIgaW5zdHJ1Y3Rpb24gPSBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbihjb21wb25lbnRJbnN0cnVjdGlvbiwgbnVsbCwgYXV4SW5zdHJ1Y3Rpb25zKTtcblxuICAgIC8vIElmIHRoZSBjb21wb25lbnQgaXMgc3luYywgd2UgY2FuIGdlbmVyYXRlIHJlc29sdmVkIGNoaWxkIHJvdXRlIGluc3RydWN0aW9uc1xuICAgIC8vIElmIG5vdCwgd2UnbGwgcmVzb2x2ZSB0aGUgaW5zdHJ1Y3Rpb25zIGF0IG5hdmlnYXRpb24gdGltZVxuICAgIGlmIChpc1ByZXNlbnQoY29tcG9uZW50SW5zdHJ1Y3Rpb24pICYmIGlzUHJlc2VudChjb21wb25lbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgbGV0IGNoaWxkSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcbiAgICAgIGlmIChjb21wb25lbnRJbnN0cnVjdGlvbi50ZXJtaW5hbCkge1xuICAgICAgICBpZiAobGlua1BhcmFtSW5kZXggPj0gbGlua1BhcmFtcy5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBUT0RPOiB0aHJvdyB0aGF0IHRoZXJlIGFyZSBleHRyYSBsaW5rIHBhcmFtcyBiZXlvbmQgdGhlIHRlcm1pbmFsIGNvbXBvbmVudFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgY2hpbGRBbmNlc3RvckNvbXBvbmVudHMgPSBhbmNlc3Rvckluc3RydWN0aW9ucy5jb25jYXQoW2luc3RydWN0aW9uXSk7XG4gICAgICAgIGxldCByZW1haW5pbmdMaW5rUGFyYW1zID0gbGlua1BhcmFtcy5zbGljZShsaW5rUGFyYW1JbmRleCk7XG4gICAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSB0aGlzLl9nZW5lcmF0ZShyZW1haW5pbmdMaW5rUGFyYW1zLCBjaGlsZEFuY2VzdG9yQ29tcG9uZW50cywgbnVsbCwgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfb3JpZ2luYWxMaW5rKTtcbiAgICAgIH1cbiAgICAgIGluc3RydWN0aW9uLmNoaWxkID0gY2hpbGRJbnN0cnVjdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gIH1cblxuICBwdWJsaWMgaGFzUm91dGUobmFtZTogc3RyaW5nLCBwYXJlbnRDb21wb25lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIHZhciBydWxlcyA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuICAgIGlmIChpc0JsYW5rKHJ1bGVzKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gcnVsZXMuaGFzUm91dGUobmFtZSk7XG4gIH1cblxuICBwdWJsaWMgZ2VuZXJhdGVEZWZhdWx0KGNvbXBvbmVudEN1cnNvcjogVHlwZSk6IEluc3RydWN0aW9uIHtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRDdXJzb3IpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQoY29tcG9uZW50Q3Vyc29yKTtcbiAgICBpZiAoaXNCbGFuayhydWxlcykgfHwgaXNCbGFuayhydWxlcy5kZWZhdWx0UnVsZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0Q2hpbGQgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQocnVsZXMuZGVmYXVsdFJ1bGUuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gcnVsZXMuZGVmYXVsdFJ1bGUuZ2VuZXJhdGUoe30pO1xuICAgICAgaWYgKCFydWxlcy5kZWZhdWx0UnVsZS50ZXJtaW5hbCkge1xuICAgICAgICBkZWZhdWx0Q2hpbGQgPSB0aGlzLmdlbmVyYXRlRGVmYXVsdChydWxlcy5kZWZhdWx0UnVsZS5oYW5kbGVyLmNvbXBvbmVudFR5cGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0SW5zdHJ1Y3Rpb24oY29tcG9uZW50SW5zdHJ1Y3Rpb24sIGRlZmF1bHRDaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgcmV0dXJuIHJ1bGVzLmRlZmF1bHRSdWxlLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKS50aGVuKFxuICAgICAgICAgIChfKSA9PiB0aGlzLmdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRDdXJzb3IpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKlxuICogR2l2ZW46IFsnL2EvYicsIHtjOiAyfV1cbiAqIFJldHVybnM6IFsnJywgJ2EnLCAnYicsIHtjOiAyfV1cbiAqL1xuZnVuY3Rpb24gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zOiBhbnlbXSkge1xuICB2YXIgYWNjdW11bGF0aW9uID0gW107XG4gIGxpbmtQYXJhbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtOiBhbnkpIHtcbiAgICBpZiAoaXNTdHJpbmcoaXRlbSkpIHtcbiAgICAgIHZhciBzdHJJdGVtOiBzdHJpbmcgPSA8c3RyaW5nPml0ZW07XG4gICAgICBhY2N1bXVsYXRpb24gPSBhY2N1bXVsYXRpb24uY29uY2F0KHN0ckl0ZW0uc3BsaXQoJy8nKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjY3VtdWxhdGlvbi5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhY2N1bXVsYXRpb247XG59XG5cblxuLypcbiAqIEdpdmVuIGEgbGlzdCBvZiBpbnN0cnVjdGlvbnMsIHJldHVybnMgdGhlIG1vc3Qgc3BlY2lmaWMgaW5zdHJ1Y3Rpb25cbiAqL1xuZnVuY3Rpb24gbW9zdFNwZWNpZmljKGluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IEluc3RydWN0aW9uIHtcbiAgaW5zdHJ1Y3Rpb25zID0gaW5zdHJ1Y3Rpb25zLmZpbHRlcigoaW5zdHJ1Y3Rpb24pID0+IGlzUHJlc2VudChpbnN0cnVjdGlvbikpO1xuICBpZiAoaW5zdHJ1Y3Rpb25zLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKGluc3RydWN0aW9ucy5sZW5ndGggPT0gMSkge1xuICAgIHJldHVybiBpbnN0cnVjdGlvbnNbMF07XG4gIH1cbiAgdmFyIGZpcnN0ID0gaW5zdHJ1Y3Rpb25zWzBdO1xuICB2YXIgcmVzdCA9IGluc3RydWN0aW9ucy5zbGljZSgxKTtcbiAgcmV0dXJuIHJlc3QucmVkdWNlKChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIGNvbnRlbmRlcjogSW5zdHJ1Y3Rpb24pID0+IHtcbiAgICBpZiAoY29tcGFyZVNwZWNpZmljaXR5U3RyaW5ncyhjb250ZW5kZXIuc3BlY2lmaWNpdHksIGluc3RydWN0aW9uLnNwZWNpZmljaXR5KSA9PSAtMSkge1xuICAgICAgcmV0dXJuIGNvbnRlbmRlcjtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICB9LCBmaXJzdCk7XG59XG5cbi8qXG4gKiBFeHBlY3RzIHN0cmluZ3MgdG8gYmUgaW4gdGhlIGZvcm0gb2YgXCJbMC0yXStcIlxuICogUmV0dXJucyAtMSBpZiBzdHJpbmcgQSBzaG91bGQgYmUgc29ydGVkIGFib3ZlIHN0cmluZyBCLCAxIGlmIGl0IHNob3VsZCBiZSBzb3J0ZWQgYWZ0ZXIsXG4gKiBvciAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLlxuICovXG5mdW5jdGlvbiBjb21wYXJlU3BlY2lmaWNpdHlTdHJpbmdzKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyIHtcbiAgdmFyIGwgPSBNYXRoLm1pbihhLmxlbmd0aCwgYi5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xuICAgIHZhciBhaSA9IFN0cmluZ1dyYXBwZXIuY2hhckNvZGVBdChhLCBpKTtcbiAgICB2YXIgYmkgPSBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoYiwgaSk7XG4gICAgdmFyIGRpZmZlcmVuY2UgPSBiaSAtIGFpO1xuICAgIGlmIChkaWZmZXJlbmNlICE9IDApIHtcbiAgICAgIHJldHVybiBkaWZmZXJlbmNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0VGVybWluYWxDb21wb25lbnQoY29tcG9uZW50LCBwYXRoKSB7XG4gIGlmICghaXNUeXBlKGNvbXBvbmVudCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgYW5ub3RhdGlvbnMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50KTtcbiAgaWYgKGlzUHJlc2VudChhbm5vdGF0aW9ucykpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFubm90YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYW5ub3RhdGlvbiA9IGFubm90YXRpb25zW2ldO1xuXG4gICAgICBpZiAoYW5ub3RhdGlvbiBpbnN0YW5jZW9mIFJvdXRlQ29uZmlnKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYENoaWxkIHJvdXRlcyBhcmUgbm90IGFsbG93ZWQgZm9yIFwiJHtwYXRofVwiLiBVc2UgXCIuLi5cIiBvbiB0aGUgcGFyZW50J3Mgcm91dGUgcGF0aC5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==