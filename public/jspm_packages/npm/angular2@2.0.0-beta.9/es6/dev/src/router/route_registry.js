/* */ 
"format esm";
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
import { ListWrapper, Map, StringMapWrapper } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { isPresent, isArray, isBlank, isType, isString, isStringMap, Type, StringWrapper, Math, getTypeNameForDebugging, CONST_EXPR } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Injectable, Inject, OpaqueToken } from 'angular2/core';
import { RouteConfig, Route, AuxRoute } from './route_config/route_config_impl';
import { PathMatch, RedirectMatch } from './rules/rules';
import { RuleSet } from './rules/rule_set';
import { ResolvedInstruction, RedirectInstruction, UnresolvedInstruction, DefaultInstruction } from './instruction';
import { normalizeRouteConfig, assertComponentExists } from './route_config/route_config_normalizer';
import { parser, convertUrlParamsToArray } from './url_parser';
var _resolveToNull = PromiseWrapper.resolve(null);
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
export const ROUTER_PRIMARY_COMPONENT = CONST_EXPR(new OpaqueToken('RouterPrimaryComponent'));
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
export let RouteRegistry = class {
    constructor(_rootComponent) {
        this._rootComponent = _rootComponent;
        this._rules = new Map();
    }
    /**
     * Given a component and a configuration object, add the route to this registry
     */
    config(parentComponent, config) {
        config = normalizeRouteConfig(config, this);
        // this is here because Dart type guard reasons
        if (config instanceof Route) {
            assertComponentExists(config.component, config.path);
        }
        else if (config instanceof AuxRoute) {
            assertComponentExists(config.component, config.path);
        }
        var rules = this._rules.get(parentComponent);
        if (isBlank(rules)) {
            rules = new RuleSet();
            this._rules.set(parentComponent, rules);
        }
        var terminal = rules.config(config);
        if (config instanceof Route) {
            if (terminal) {
                assertTerminalComponent(config.component, config.path);
            }
            else {
                this.configFromComponent(config.component);
            }
        }
    }
    /**
     * Reads the annotations of a component and configures the registry based on them
     */
    configFromComponent(component) {
        if (!isType(component)) {
            return;
        }
        // Don't read the annotations from a type more than once –
        // this prevents an infinite loop if a component routes recursively.
        if (this._rules.has(component)) {
            return;
        }
        var annotations = reflector.annotations(component);
        if (isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof RouteConfig) {
                    let routeCfgs = annotation.configs;
                    routeCfgs.forEach(config => this.config(component, config));
                }
            }
        }
    }
    /**
     * Given a URL and a parent component, return the most specific instruction for navigating
     * the application into the state specified by the url
     */
    recognize(url, ancestorInstructions) {
        var parsedUrl = parser.parse(url);
        return this._recognize(parsedUrl, []);
    }
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    _recognize(parsedUrl, ancestorInstructions, _aux = false) {
        var parentInstruction = ListWrapper.last(ancestorInstructions);
        var parentComponent = isPresent(parentInstruction) ? parentInstruction.component.componentType :
            this._rootComponent;
        var rules = this._rules.get(parentComponent);
        if (isBlank(rules)) {
            return _resolveToNull;
        }
        // Matches some beginning part of the given URL
        var possibleMatches = _aux ? rules.recognizeAuxiliary(parsedUrl) : rules.recognize(parsedUrl);
        var matchPromises = possibleMatches.map((candidate) => candidate.then((candidate) => {
            if (candidate instanceof PathMatch) {
                var auxParentInstructions = ancestorInstructions.length > 0 ? [ListWrapper.last(ancestorInstructions)] : [];
                var auxInstructions = this._auxRoutesToUnresolved(candidate.remainingAux, auxParentInstructions);
                var instruction = new ResolvedInstruction(candidate.instruction, null, auxInstructions);
                if (isBlank(candidate.instruction) || candidate.instruction.terminal) {
                    return instruction;
                }
                var newAncestorInstructions = ancestorInstructions.concat([instruction]);
                return this._recognize(candidate.remaining, newAncestorInstructions)
                    .then((childInstruction) => {
                    if (isBlank(childInstruction)) {
                        return null;
                    }
                    // redirect instructions are already absolute
                    if (childInstruction instanceof RedirectInstruction) {
                        return childInstruction;
                    }
                    instruction.child = childInstruction;
                    return instruction;
                });
            }
            if (candidate instanceof RedirectMatch) {
                var instruction = this.generate(candidate.redirectTo, ancestorInstructions.concat([null]));
                return new RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction, candidate.specificity);
            }
        }));
        if ((isBlank(parsedUrl) || parsedUrl.path == '') && possibleMatches.length == 0) {
            return PromiseWrapper.resolve(this.generateDefault(parentComponent));
        }
        return PromiseWrapper.all(matchPromises).then(mostSpecific);
    }
    _auxRoutesToUnresolved(auxRoutes, parentInstructions) {
        var unresolvedAuxInstructions = {};
        auxRoutes.forEach((auxUrl) => {
            unresolvedAuxInstructions[auxUrl.path] = new UnresolvedInstruction(() => { return this._recognize(auxUrl, parentInstructions, true); });
        });
        return unresolvedAuxInstructions;
    }
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     *
     * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
     * route boundary.
     */
    generate(linkParams, ancestorInstructions, _aux = false) {
        var params = splitAndFlattenLinkParams(linkParams);
        var prevInstruction;
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (ListWrapper.first(params) == '') {
            params.shift();
            prevInstruction = ListWrapper.first(ancestorInstructions);
            ancestorInstructions = [];
        }
        else {
            prevInstruction = ancestorInstructions.length > 0 ? ancestorInstructions.pop() : null;
            if (ListWrapper.first(params) == '.') {
                params.shift();
            }
            else if (ListWrapper.first(params) == '..') {
                while (ListWrapper.first(params) == '..') {
                    if (ancestorInstructions.length <= 0) {
                        throw new BaseException(`Link "${ListWrapper.toJSON(linkParams)}" has too many "../" segments.`);
                    }
                    prevInstruction = ancestorInstructions.pop();
                    params = ListWrapper.slice(params, 1);
                }
            }
            else {
                // we must only peak at the link param, and not consume it
                let routeName = ListWrapper.first(params);
                let parentComponentType = this._rootComponent;
                let grandparentComponentType = null;
                if (ancestorInstructions.length > 1) {
                    let parentComponentInstruction = ancestorInstructions[ancestorInstructions.length - 1];
                    let grandComponentInstruction = ancestorInstructions[ancestorInstructions.length - 2];
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
                var parentRouteExists = isPresent(grandparentComponentType) &&
                    this.hasRoute(routeName, grandparentComponentType);
                if (parentRouteExists && childRouteExists) {
                    let msg = `Link "${ListWrapper.toJSON(linkParams)}" is ambiguous, use "./" or "../" to disambiguate.`;
                    throw new BaseException(msg);
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
            let msg = `Link "${ListWrapper.toJSON(linkParams)}" must include a route name.`;
            throw new BaseException(msg);
        }
        var generatedInstruction = this._generate(params, ancestorInstructions, prevInstruction, _aux, linkParams);
        // we don't clone the first (root) element
        for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
            let ancestorInstruction = ancestorInstructions[i];
            if (isBlank(ancestorInstruction)) {
                break;
            }
            generatedInstruction = ancestorInstruction.replaceChild(generatedInstruction);
        }
        return generatedInstruction;
    }
    /*
     * Internal helper that does not make any assertions about the beginning of the link DSL.
     * `ancestorInstructions` are parents that will be cloned.
     * `prevInstruction` is the existing instruction that would be replaced, but which might have
     * aux routes that need to be cloned.
     */
    _generate(linkParams, ancestorInstructions, prevInstruction, _aux = false, _originalLink) {
        let parentComponentType = this._rootComponent;
        let componentInstruction = null;
        let auxInstructions = {};
        let parentInstruction = ListWrapper.last(ancestorInstructions);
        if (isPresent(parentInstruction) && isPresent(parentInstruction.component)) {
            parentComponentType = parentInstruction.component.componentType;
        }
        if (linkParams.length == 0) {
            let defaultInstruction = this.generateDefault(parentComponentType);
            if (isBlank(defaultInstruction)) {
                throw new BaseException(`Link "${ListWrapper.toJSON(_originalLink)}" does not resolve to a terminal instruction.`);
            }
            return defaultInstruction;
        }
        // for non-aux routes, we want to reuse the predecessor's existing primary and aux routes
        // and only override routes for which the given link DSL provides
        if (isPresent(prevInstruction) && !_aux) {
            auxInstructions = StringMapWrapper.merge(prevInstruction.auxInstruction, auxInstructions);
            componentInstruction = prevInstruction.component;
        }
        var rules = this._rules.get(parentComponentType);
        if (isBlank(rules)) {
            throw new BaseException(`Component "${getTypeNameForDebugging(parentComponentType)}" has no route config.`);
        }
        let linkParamIndex = 0;
        let routeParams = {};
        // first, recognize the primary route if one is provided
        if (linkParamIndex < linkParams.length && isString(linkParams[linkParamIndex])) {
            let routeName = linkParams[linkParamIndex];
            if (routeName == '' || routeName == '.' || routeName == '..') {
                throw new BaseException(`"${routeName}/" is only allowed at the beginning of a link DSL.`);
            }
            linkParamIndex += 1;
            if (linkParamIndex < linkParams.length) {
                let linkParam = linkParams[linkParamIndex];
                if (isStringMap(linkParam) && !isArray(linkParam)) {
                    routeParams = linkParam;
                    linkParamIndex += 1;
                }
            }
            var routeRecognizer = (_aux ? rules.auxRulesByName : rules.rulesByName).get(routeName);
            if (isBlank(routeRecognizer)) {
                throw new BaseException(`Component "${getTypeNameForDebugging(parentComponentType)}" has no route named "${routeName}".`);
            }
            // Create an "unresolved instruction" for async routes
            // we'll figure out the rest of the route when we resolve the instruction and
            // perform a navigation
            if (isBlank(routeRecognizer.handler.componentType)) {
                var generatedUrl = routeRecognizer.generateComponentPathValues(routeParams);
                return new UnresolvedInstruction(() => {
                    return routeRecognizer.handler.resolveComponentType().then((_) => {
                        return this._generate(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink);
                    });
                }, generatedUrl.urlPath, convertUrlParamsToArray(generatedUrl.urlParams));
            }
            componentInstruction = _aux ? rules.generateAuxiliary(routeName, routeParams) :
                rules.generate(routeName, routeParams);
        }
        // Next, recognize auxiliary instructions.
        // If we have an ancestor instruction, we preserve whatever aux routes are active from it.
        while (linkParamIndex < linkParams.length && isArray(linkParams[linkParamIndex])) {
            let auxParentInstruction = [parentInstruction];
            let auxInstruction = this._generate(linkParams[linkParamIndex], auxParentInstruction, null, true, _originalLink);
            // TODO: this will not work for aux routes with parameters or multiple segments
            auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
            linkParamIndex += 1;
        }
        var instruction = new ResolvedInstruction(componentInstruction, null, auxInstructions);
        // If the component is sync, we can generate resolved child route instructions
        // If not, we'll resolve the instructions at navigation time
        if (isPresent(componentInstruction) && isPresent(componentInstruction.componentType)) {
            let childInstruction = null;
            if (componentInstruction.terminal) {
                if (linkParamIndex >= linkParams.length) {
                }
            }
            else {
                let childAncestorComponents = ancestorInstructions.concat([instruction]);
                let remainingLinkParams = linkParams.slice(linkParamIndex);
                childInstruction = this._generate(remainingLinkParams, childAncestorComponents, null, false, _originalLink);
            }
            instruction.child = childInstruction;
        }
        return instruction;
    }
    hasRoute(name, parentComponent) {
        var rules = this._rules.get(parentComponent);
        if (isBlank(rules)) {
            return false;
        }
        return rules.hasRoute(name);
    }
    generateDefault(componentCursor) {
        if (isBlank(componentCursor)) {
            return null;
        }
        var rules = this._rules.get(componentCursor);
        if (isBlank(rules) || isBlank(rules.defaultRule)) {
            return null;
        }
        var defaultChild = null;
        if (isPresent(rules.defaultRule.handler.componentType)) {
            var componentInstruction = rules.defaultRule.generate({});
            if (!rules.defaultRule.terminal) {
                defaultChild = this.generateDefault(rules.defaultRule.handler.componentType);
            }
            return new DefaultInstruction(componentInstruction, defaultChild);
        }
        return new UnresolvedInstruction(() => {
            return rules.defaultRule.handler.resolveComponentType().then((_) => this.generateDefault(componentCursor));
        });
    }
};
RouteRegistry = __decorate([
    Injectable(),
    __param(0, Inject(ROUTER_PRIMARY_COMPONENT)), 
    __metadata('design:paramtypes', [Type])
], RouteRegistry);
/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
function splitAndFlattenLinkParams(linkParams) {
    var accumulation = [];
    linkParams.forEach(function (item) {
        if (isString(item)) {
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
    instructions = instructions.filter((instruction) => isPresent(instruction));
    if (instructions.length == 0) {
        return null;
    }
    if (instructions.length == 1) {
        return instructions[0];
    }
    var first = instructions[0];
    var rest = instructions.slice(1);
    return rest.reduce((instruction, contender) => {
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
    var l = Math.min(a.length, b.length);
    for (var i = 0; i < l; i += 1) {
        var ai = StringWrapper.charCodeAt(a, i);
        var bi = StringWrapper.charCodeAt(b, i);
        var difference = bi - ai;
        if (difference != 0) {
            return difference;
        }
    }
    return a.length - b.length;
}
function assertTerminalComponent(component, path) {
    if (!isType(component)) {
        return;
    }
    var annotations = reflector.annotations(component);
    if (isPresent(annotations)) {
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof RouteConfig) {
                throw new BaseException(`Child routes are not allowed for "${path}". Use "..." on the parent's route path.`);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbIlJvdXRlUmVnaXN0cnkiLCJSb3V0ZVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUm91dGVSZWdpc3RyeS5jb25maWciLCJSb3V0ZVJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQiLCJSb3V0ZVJlZ2lzdHJ5LnJlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX3JlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZCIsIlJvdXRlUmVnaXN0cnkuZ2VuZXJhdGUiLCJSb3V0ZVJlZ2lzdHJ5Ll9nZW5lcmF0ZSIsIlJvdXRlUmVnaXN0cnkuaGFzUm91dGUiLCJSb3V0ZVJlZ2lzdHJ5LmdlbmVyYXRlRGVmYXVsdCIsInNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMiLCJtb3N0U3BlY2lmaWMiLCJjb21wYXJlU3BlY2lmaWNpdHlTdHJpbmdzIiwiYXNzZXJ0VGVybWluYWxDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztPQUFPLEVBQUMsV0FBVyxFQUFFLEdBQUcsRUFBYyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUN0RixFQUFDLGNBQWMsRUFBQyxNQUFNLDJCQUEyQjtPQUNqRCxFQUNMLFNBQVMsRUFDVCxPQUFPLEVBQ1AsT0FBTyxFQUNQLE1BQU0sRUFDTixRQUFRLEVBQ1IsV0FBVyxFQUNYLElBQUksRUFDSixhQUFhLEVBQ2IsSUFBSSxFQUNKLHVCQUF1QixFQUN2QixVQUFVLEVBQ1gsTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDO09BQzFELEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUMsTUFBTSxlQUFlO09BRXRELEVBQ0wsV0FBVyxF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QUVEQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUM3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLElBQUlBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2REEsSUFBSUEsb0JBQW9CQSxHQUFHQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQSxRQUFRQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUMxREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtZQUMvRUEsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsa0JBQWtCQSxDQUFDQSxvQkFBb0JBLEVBQUVBLFlBQVlBLENBQUNBLENBQUNBO1FBQ3BFQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxJQUFJQSxxQkFBcUJBLENBQUNBO1lBQy9CQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxvQkFBb0JBLEVBQUVBLENBQUNBLElBQUlBLENBQ3hEQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxlQUFlQSxDQUFD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dHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQXJyYXksXG4gIGlzQmxhbmssXG4gIGlzVHlwZSxcbiAgaXNTdHJpbmcsXG4gIGlzU3RyaW5nTWFwLFxuICBUeXBlLFxuICBTdHJpbmdXcmFwcGVyLFxuICBNYXRoLFxuICBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyxcbiAgQ09OU1RfRVhQUlxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBSb3V0ZUNvbmZpZyxcbiAgQXN5bmNSb3V0ZSxcbiAgUm91dGUsXG4gIEF1eFJvdXRlLFxuICBSZWRpcmVjdCxcbiAgUm91dGVEZWZpbml0aW9uXG59IGZyb20gJy4vcm91dGVfY29uZmlnL3JvdXRlX2NvbmZpZ19pbXBsJztcbmltcG9ydCB7UGF0aE1hdGNoLCBSZWRpcmVjdE1hdGNoLCBSb3V0ZU1hdGNofSBmcm9tICcuL3J1bGVzL3J1bGVzJztcbmltcG9ydCB7UnVsZVNldH0gZnJvbSAnLi9ydWxlcy9ydWxlX3NldCc7XG5pbXBvcnQge1xuICBJbnN0cnVjdGlvbixcbiAgUmVzb2x2ZWRJbnN0cnVjdGlvbixcbiAgUmVkaXJlY3RJbnN0cnVjdGlvbixcbiAgVW5yZXNvbHZlZEluc3RydWN0aW9uLFxuICBEZWZhdWx0SW5zdHJ1Y3Rpb25cbn0gZnJvbSAnLi9pbnN0cnVjdGlvbic7XG5cbmltcG9ydCB7bm9ybWFsaXplUm91dGVDb25maWcsIGFzc2VydENvbXBvbmVudEV4aXN0c30gZnJvbSAnLi9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtwYXJzZXIsIFVybCwgY29udmVydFVybFBhcmFtc1RvQXJyYXksIHBhdGhTZWdtZW50c1RvVXJsfSBmcm9tICcuL3VybF9wYXJzZXInO1xuXG52YXIgX3Jlc29sdmVUb051bGwgPSBQcm9taXNlV3JhcHBlci5yZXNvbHZlKG51bGwpO1xuXG4vLyBBIExpbmtJdGVtQXJyYXkgaXMgYW4gYXJyYXksIHdoaWNoIGRlc2NyaWJlcyBhIHNldCBvZiByb3V0ZXNcbi8vIFRoZSBpdGVtcyBpbiB0aGUgYXJyYXkgYXJlIGZvdW5kIGluIGdyb3Vwczpcbi8vIC0gdGhlIGZpcnN0IGl0ZW0gaXMgdGhlIG5hbWUgb2YgdGhlIHJvdXRlXG4vLyAtIHRoZSBuZXh0IGl0ZW1zIGFyZTpcbi8vICAgLSBhbiBvYmplY3QgY29udGFpbmluZyBwYXJhbWV0ZXJzXG4vLyAgIC0gb3IgYW4gYXJyYXkgZGVzY3JpYmluZyBhbiBhdXggcm91dGVcbi8vIGV4cG9ydCB0eXBlIExpbmtSb3V0ZUl0ZW0gPSBzdHJpbmcgfCBPYmplY3Q7XG4vLyBleHBvcnQgdHlwZSBMaW5rSXRlbSA9IExpbmtSb3V0ZUl0ZW0gfCBBcnJheTxMaW5rUm91dGVJdGVtPjtcbi8vIGV4cG9ydCB0eXBlIExpbmtJdGVtQXJyYXkgPSBBcnJheTxMaW5rSXRlbT47XG5cbi8qKlxuICogVG9rZW4gdXNlZCB0byBiaW5kIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgdG9wLWxldmVsIHtAbGluayBSb3V0ZUNvbmZpZ31zIGZvciB0aGVcbiAqIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWdcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UOiBPcGFxdWVUb2tlbiA9XG4gICAgQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oJ1JvdXRlclByaW1hcnlDb21wb25lbnQnKSk7XG5cblxuLyoqXG4gKiBUaGUgUm91dGVSZWdpc3RyeSBob2xkcyByb3V0ZSBjb25maWd1cmF0aW9ucyBmb3IgZWFjaCBjb21wb25lbnQgaW4gYW4gQW5ndWxhciBhcHAuXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgSW5zdHJ1Y3Rpb25zIGZyb20gVVJMcywgYW5kIGdlbmVyYXRpbmcgVVJMcyBiYXNlZCBvbiByb3V0ZSBhbmRcbiAqIHBhcmFtZXRlcnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfcnVsZXMgPSBuZXcgTWFwPGFueSwgUnVsZVNldD4oKTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpdmF0ZSBfcm9vdENvbXBvbmVudDogVHlwZSkge31cblxuICAvKipcbiAgICogR2l2ZW4gYSBjb21wb25lbnQgYW5kIGEgY29uZmlndXJhdGlvbiBvYmplY3QsIGFkZCB0aGUgcm91dGUgdG8gdGhpcyByZWdpc3RyeVxuICAgKi9cbiAgY29uZmlnKHBhcmVudENvbXBvbmVudDogYW55LCBjb25maWc6IFJvdXRlRGVmaW5pdGlvbik6IHZvaWQge1xuICAgIGNvbmZpZyA9IG5vcm1hbGl6ZVJvdXRlQ29uZmlnKGNvbmZpZywgdGhpcyk7XG5cbiAgICAvLyB0aGlzIGlzIGhlcmUgYmVjYXVzZSBEYXJ0IHR5cGUgZ3VhcmQgcmVhc29uc1xuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgYXNzZXJ0Q29tcG9uZW50RXhpc3RzKGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEF1eFJvdXRlKSB7XG4gICAgICBhc3NlcnRDb21wb25lbnRFeGlzdHMoY29uZmlnLmNvbXBvbmVudCwgY29uZmlnLnBhdGgpO1xuICAgIH1cblxuICAgIHZhciBydWxlcyA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICBydWxlcyA9IG5ldyBSdWxlU2V0KCk7XG4gICAgICB0aGlzLl9ydWxlcy5zZXQocGFyZW50Q29tcG9uZW50LCBydWxlcyk7XG4gICAgfVxuXG4gICAgdmFyIHRlcm1pbmFsID0gcnVsZXMuY29uZmlnKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGlmICh0ZXJtaW5hbCkge1xuICAgICAgICBhc3NlcnRUZXJtaW5hbENvbXBvbmVudChjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbmZpZ0Zyb21Db21wb25lbnQoY29uZmlnLmNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBhbm5vdGF0aW9ucyBvZiBhIGNvbXBvbmVudCBhbmQgY29uZmlndXJlcyB0aGUgcmVnaXN0cnkgYmFzZWQgb24gdGhlbVxuICAgKi9cbiAgY29uZmlnRnJvbUNvbXBvbmVudChjb21wb25lbnQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghaXNUeXBlKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEb24ndCByZWFkIHRoZSBhbm5vdGF0aW9ucyBmcm9tIGEgdHlwZSBtb3JlIHRoYW4gb25jZSDigJNcbiAgICAvLyB0aGlzIHByZXZlbnRzIGFuIGluZmluaXRlIGxvb3AgaWYgYSBjb21wb25lbnQgcm91dGVzIHJlY3Vyc2l2ZWx5LlxuICAgIGlmICh0aGlzLl9ydWxlcy5oYXMoY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYW5ub3RhdGlvbnMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KGFubm90YXRpb25zKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYW5ub3RhdGlvbiA9IGFubm90YXRpb25zW2ldO1xuXG4gICAgICAgIGlmIChhbm5vdGF0aW9uIGluc3RhbmNlb2YgUm91dGVDb25maWcpIHtcbiAgICAgICAgICBsZXQgcm91dGVDZmdzOiBSb3V0ZURlZmluaXRpb25bXSA9IGFubm90YXRpb24uY29uZmlncztcbiAgICAgICAgICByb3V0ZUNmZ3MuZm9yRWFjaChjb25maWcgPT4gdGhpcy5jb25maWcoY29tcG9uZW50LCBjb25maWcpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgVVJMIGFuZCBhIHBhcmVudCBjb21wb25lbnQsIHJldHVybiB0aGUgbW9zdCBzcGVjaWZpYyBpbnN0cnVjdGlvbiBmb3IgbmF2aWdhdGluZ1xuICAgKiB0aGUgYXBwbGljYXRpb24gaW50byB0aGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSB1cmxcbiAgICovXG4gIHJlY29nbml6ZSh1cmw6IHN0cmluZywgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBQcm9taXNlPEluc3RydWN0aW9uPiB7XG4gICAgdmFyIHBhcnNlZFVybCA9IHBhcnNlci5wYXJzZSh1cmwpO1xuICAgIHJldHVybiB0aGlzLl9yZWNvZ25pemUocGFyc2VkVXJsLCBbXSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWNvZ25pemVzIGFsbCBwYXJlbnQtY2hpbGQgcm91dGVzLCBidXQgY3JlYXRlcyB1bnJlc29sdmVkIGF1eGlsaWFyeSByb3V0ZXNcbiAgICovXG4gIHByaXZhdGUgX3JlY29nbml6ZShwYXJzZWRVcmw6IFVybCwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sXG4gICAgICAgICAgICAgICAgICAgICBfYXV4ID0gZmFsc2UpOiBQcm9taXNlPEluc3RydWN0aW9uPiB7XG4gICAgdmFyIHBhcmVudEluc3RydWN0aW9uID0gTGlzdFdyYXBwZXIubGFzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgdmFyIHBhcmVudENvbXBvbmVudCA9IGlzUHJlc2VudChwYXJlbnRJbnN0cnVjdGlvbikgPyBwYXJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yb290Q29tcG9uZW50O1xuXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb051bGw7XG4gICAgfVxuXG4gICAgLy8gTWF0Y2hlcyBzb21lIGJlZ2lubmluZyBwYXJ0IG9mIHRoZSBnaXZlbiBVUkxcbiAgICB2YXIgcG9zc2libGVNYXRjaGVzOiBQcm9taXNlPFJvdXRlTWF0Y2g+W10gPVxuICAgICAgICBfYXV4ID8gcnVsZXMucmVjb2duaXplQXV4aWxpYXJ5KHBhcnNlZFVybCkgOiBydWxlcy5yZWNvZ25pemUocGFyc2VkVXJsKTtcblxuICAgIHZhciBtYXRjaFByb21pc2VzOiBQcm9taXNlPEluc3RydWN0aW9uPltdID0gcG9zc2libGVNYXRjaGVzLm1hcChcbiAgICAgICAgKGNhbmRpZGF0ZTogUHJvbWlzZTxSb3V0ZU1hdGNoPikgPT4gY2FuZGlkYXRlLnRoZW4oKGNhbmRpZGF0ZTogUm91dGVNYXRjaCkgPT4ge1xuXG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFBhdGhNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGF1eFBhcmVudEluc3RydWN0aW9ucyA9XG4gICAgICAgICAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/IFtMaXN0V3JhcHBlci5sYXN0KGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKV0gOiBbXTtcbiAgICAgICAgICAgIHZhciBhdXhJbnN0cnVjdGlvbnMgPVxuICAgICAgICAgICAgICAgIHRoaXMuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZChjYW5kaWRhdGUucmVtYWluaW5nQXV4LCBhdXhQYXJlbnRJbnN0cnVjdGlvbnMpO1xuXG4gICAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbihjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24sIG51bGwsIGF1eEluc3RydWN0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmIChpc0JsYW5rKGNhbmRpZGF0ZS5pbnN0cnVjdGlvbikgfHwgY2FuZGlkYXRlLmluc3RydWN0aW9uLnRlcm1pbmFsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5ld0FuY2VzdG9ySW5zdHJ1Y3Rpb25zID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtpbnN0cnVjdGlvbl0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVjb2duaXplKGNhbmRpZGF0ZS5yZW1haW5pbmcsIG5ld0FuY2VzdG9ySW5zdHJ1Y3Rpb25zKVxuICAgICAgICAgICAgICAgIC50aGVuKChjaGlsZEluc3RydWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNCbGFuayhjaGlsZEluc3RydWN0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gcmVkaXJlY3QgaW5zdHJ1Y3Rpb25zIGFyZSBhbHJlYWR5IGFic29sdXRlXG4gICAgICAgICAgICAgICAgICBpZiAoY2hpbGRJbnN0cnVjdGlvbiBpbnN0YW5jZW9mIFJlZGlyZWN0SW5zdHJ1Y3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbi5jaGlsZCA9IGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFJlZGlyZWN0TWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBpbnN0cnVjdGlvbiA9XG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZShjYW5kaWRhdGUucmVkaXJlY3RUbywgYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtudWxsXSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWRpcmVjdEluc3RydWN0aW9uKGluc3RydWN0aW9uLmNvbXBvbmVudCwgaW5zdHJ1Y3Rpb24uY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24sIGNhbmRpZGF0ZS5zcGVjaWZpY2l0eSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICBpZiAoKGlzQmxhbmsocGFyc2VkVXJsKSB8fCBwYXJzZWRVcmwucGF0aCA9PSAnJykgJiYgcG9zc2libGVNYXRjaGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmdlbmVyYXRlRGVmYXVsdChwYXJlbnRDb21wb25lbnQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKG1hdGNoUHJvbWlzZXMpLnRoZW4obW9zdFNwZWNpZmljKTtcbiAgfVxuXG4gIHByaXZhdGUgX2F1eFJvdXRlc1RvVW5yZXNvbHZlZChhdXhSb3V0ZXM6IFVybFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdKToge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSB7XG4gICAgdmFyIHVucmVzb2x2ZWRBdXhJbnN0cnVjdGlvbnM6IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0gPSB7fTtcblxuICAgIGF1eFJvdXRlcy5mb3JFYWNoKChhdXhVcmw6IFVybCkgPT4ge1xuICAgICAgdW5yZXNvbHZlZEF1eEluc3RydWN0aW9uc1thdXhVcmwucGF0aF0gPSBuZXcgVW5yZXNvbHZlZEluc3RydWN0aW9uKFxuICAgICAgICAgICgpID0+IHsgcmV0dXJuIHRoaXMuX3JlY29nbml6ZShhdXhVcmwsIHBhcmVudEluc3RydWN0aW9ucywgdHJ1ZSk7IH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVucmVzb2x2ZWRBdXhJbnN0cnVjdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIG5vcm1hbGl6ZWQgbGlzdCB3aXRoIGNvbXBvbmVudCBuYW1lcyBhbmQgcGFyYW1zIGxpa2U6IGBbJ3VzZXInLCB7aWQ6IDMgfV1gXG4gICAqIGdlbmVyYXRlcyBhIHVybCB3aXRoIGEgbGVhZGluZyBzbGFzaCByZWxhdGl2ZSB0byB0aGUgcHJvdmlkZWQgYHBhcmVudENvbXBvbmVudGAuXG4gICAqXG4gICAqIElmIHRoZSBvcHRpb25hbCBwYXJhbSBgX2F1eGAgaXMgYHRydWVgLCB0aGVuIHdlIGdlbmVyYXRlIHN0YXJ0aW5nIGF0IGFuIGF1eGlsaWFyeVxuICAgKiByb3V0ZSBib3VuZGFyeS5cbiAgICovXG4gIGdlbmVyYXRlKGxpbmtQYXJhbXM6IGFueVtdLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSwgX2F1eCA9IGZhbHNlKTogSW5zdHJ1Y3Rpb24ge1xuICAgIHZhciBwYXJhbXMgPSBzcGxpdEFuZEZsYXR0ZW5MaW5rUGFyYW1zKGxpbmtQYXJhbXMpO1xuICAgIHZhciBwcmV2SW5zdHJ1Y3Rpb247XG5cbiAgICAvLyBUaGUgZmlyc3Qgc2VnbWVudCBzaG91bGQgYmUgZWl0aGVyICcuJyAoZ2VuZXJhdGUgZnJvbSBwYXJlbnQpIG9yICcnIChnZW5lcmF0ZSBmcm9tIHJvb3QpLlxuICAgIC8vIFdoZW4gd2Ugbm9ybWFsaXplIGFib3ZlLCB3ZSBzdHJpcCBhbGwgdGhlIHNsYXNoZXMsICcuLycgYmVjb21lcyAnLicgYW5kICcvJyBiZWNvbWVzICcnLlxuICAgIGlmIChMaXN0V3JhcHBlci5maXJzdChwYXJhbXMpID09ICcnKSB7XG4gICAgICBwYXJhbXMuc2hpZnQoKTtcbiAgICAgIHByZXZJbnN0cnVjdGlvbiA9IExpc3RXcmFwcGVyLmZpcnN0KGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDAgPyBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKSA6IG51bGw7XG5cbiAgICAgIGlmIChMaXN0V3JhcHBlci5maXJzdChwYXJhbXMpID09ICcuJykge1xuICAgICAgICBwYXJhbXMuc2hpZnQoKTtcbiAgICAgIH0gZWxzZSBpZiAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnLi4nKSB7XG4gICAgICAgIHdoaWxlIChMaXN0V3JhcHBlci5maXJzdChwYXJhbXMpID09ICcuLicpIHtcbiAgICAgICAgICBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgICAgIGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgaGFzIHRvbyBtYW55IFwiLi4vXCIgc2VnbWVudHMuYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByZXZJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLnBvcCgpO1xuICAgICAgICAgIHBhcmFtcyA9IExpc3RXcmFwcGVyLnNsaWNlKHBhcmFtcywgMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSdyZSBvbiB0byBpbXBsaWNpdCBjaGlsZC9zaWJsaW5nIHJvdXRlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB3ZSBtdXN0IG9ubHkgcGVhayBhdCB0aGUgbGluayBwYXJhbSwgYW5kIG5vdCBjb25zdW1lIGl0XG4gICAgICAgIGxldCByb3V0ZU5hbWUgPSBMaXN0V3JhcHBlci5maXJzdChwYXJhbXMpO1xuICAgICAgICBsZXQgcGFyZW50Q29tcG9uZW50VHlwZSA9IHRoaXMuX3Jvb3RDb21wb25lbnQ7XG4gICAgICAgIGxldCBncmFuZHBhcmVudENvbXBvbmVudFR5cGUgPSBudWxsO1xuXG4gICAgICAgIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgbGV0IHBhcmVudENvbXBvbmVudEluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgbGV0IGdyYW5kQ29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAyXTtcblxuICAgICAgICAgIHBhcmVudENvbXBvbmVudFR5cGUgPSBwYXJlbnRDb21wb25lbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgICBncmFuZHBhcmVudENvbXBvbmVudFR5cGUgPSBncmFuZENvbXBvbmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgICAgICB9IGVsc2UgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgcGFyZW50Q29tcG9uZW50VHlwZSA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zWzBdLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgICAgICAgIGdyYW5kcGFyZW50Q29tcG9uZW50VHlwZSA9IHRoaXMuX3Jvb3RDb21wb25lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3IgYSBsaW5rIHdpdGggbm8gbGVhZGluZyBgLi9gLCBgL2AsIG9yIGAuLi9gLCB3ZSBsb29rIGZvciBhIHNpYmxpbmcgYW5kIGNoaWxkLlxuICAgICAgICAvLyBJZiBib3RoIGV4aXN0LCB3ZSB0aHJvdy4gT3RoZXJ3aXNlLCB3ZSBwcmVmZXIgd2hpY2hldmVyIGV4aXN0cy5cbiAgICAgICAgdmFyIGNoaWxkUm91dGVFeGlzdHMgPSB0aGlzLmhhc1JvdXRlKHJvdXRlTmFtZSwgcGFyZW50Q29tcG9uZW50VHlwZSk7XG4gICAgICAgIHZhciBwYXJlbnRSb3V0ZUV4aXN0cyA9IGlzUHJlc2VudChncmFuZHBhcmVudENvbXBvbmVudFR5cGUpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFzUm91dGUocm91dGVOYW1lLCBncmFuZHBhcmVudENvbXBvbmVudFR5cGUpO1xuXG4gICAgICAgIGlmIChwYXJlbnRSb3V0ZUV4aXN0cyAmJiBjaGlsZFJvdXRlRXhpc3RzKSB7XG4gICAgICAgICAgbGV0IG1zZyA9XG4gICAgICAgICAgICAgIGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgaXMgYW1iaWd1b3VzLCB1c2UgXCIuL1wiIG9yIFwiLi4vXCIgdG8gZGlzYW1iaWd1YXRlLmA7XG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24obXNnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJlbnRSb3V0ZUV4aXN0cykge1xuICAgICAgICAgIHByZXZJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLnBvcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtc1twYXJhbXMubGVuZ3RoIC0gMV0gPT0gJycpIHtcbiAgICAgIHBhcmFtcy5wb3AoKTtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLmxlbmd0aCA+IDAgJiYgcGFyYW1zWzBdID09ICcnKSB7XG4gICAgICBwYXJhbXMuc2hpZnQoKTtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLmxlbmd0aCA8IDEpIHtcbiAgICAgIGxldCBtc2cgPSBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIG11c3QgaW5jbHVkZSBhIHJvdXRlIG5hbWUuYDtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKG1zZyk7XG4gICAgfVxuXG4gICAgdmFyIGdlbmVyYXRlZEluc3RydWN0aW9uID1cbiAgICAgICAgdGhpcy5fZ2VuZXJhdGUocGFyYW1zLCBhbmNlc3Rvckluc3RydWN0aW9ucywgcHJldkluc3RydWN0aW9uLCBfYXV4LCBsaW5rUGFyYW1zKTtcblxuICAgIC8vIHdlIGRvbid0IGNsb25lIHRoZSBmaXJzdCAocm9vdCkgZWxlbWVudFxuICAgIGZvciAodmFyIGkgPSBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IGFuY2VzdG9ySW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9uc1tpXTtcbiAgICAgIGlmIChpc0JsYW5rKGFuY2VzdG9ySW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9uLnJlcGxhY2VDaGlsZChnZW5lcmF0ZWRJbnN0cnVjdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdlbmVyYXRlZEluc3RydWN0aW9uO1xuICB9XG5cblxuICAvKlxuICAgKiBJbnRlcm5hbCBoZWxwZXIgdGhhdCBkb2VzIG5vdCBtYWtlIGFueSBhc3NlcnRpb25zIGFib3V0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmsgRFNMLlxuICAgKiBgYW5jZXN0b3JJbnN0cnVjdGlvbnNgIGFyZSBwYXJlbnRzIHRoYXQgd2lsbCBiZSBjbG9uZWQuXG4gICAqIGBwcmV2SW5zdHJ1Y3Rpb25gIGlzIHRoZSBleGlzdGluZyBpbnN0cnVjdGlvbiB0aGF0IHdvdWxkIGJlIHJlcGxhY2VkLCBidXQgd2hpY2ggbWlnaHQgaGF2ZVxuICAgKiBhdXggcm91dGVzIHRoYXQgbmVlZCB0byBiZSBjbG9uZWQuXG4gICAqL1xuICBwcml2YXRlIF9nZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sXG4gICAgICAgICAgICAgICAgICAgIHByZXZJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIF9hdXggPSBmYWxzZSwgX29yaWdpbmFsTGluazogYW55W10pOiBJbnN0cnVjdGlvbiB7XG4gICAgbGV0IHBhcmVudENvbXBvbmVudFR5cGUgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgIGxldCBjb21wb25lbnRJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgbGV0IGF1eEluc3RydWN0aW9uczoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSA9IHt9O1xuXG4gICAgbGV0IHBhcmVudEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IExpc3RXcmFwcGVyLmxhc3QoYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICAgIGlmIChpc1ByZXNlbnQocGFyZW50SW5zdHJ1Y3Rpb24pICYmIGlzUHJlc2VudChwYXJlbnRJbnN0cnVjdGlvbi5jb21wb25lbnQpKSB7XG4gICAgICBwYXJlbnRDb21wb25lbnRUeXBlID0gcGFyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgfVxuXG4gICAgaWYgKGxpbmtQYXJhbXMubGVuZ3RoID09IDApIHtcbiAgICAgIGxldCBkZWZhdWx0SW5zdHJ1Y3Rpb24gPSB0aGlzLmdlbmVyYXRlRGVmYXVsdChwYXJlbnRDb21wb25lbnRUeXBlKTtcbiAgICAgIGlmIChpc0JsYW5rKGRlZmF1bHRJbnN0cnVjdGlvbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKF9vcmlnaW5hbExpbmspfVwiIGRvZXMgbm90IHJlc29sdmUgdG8gYSB0ZXJtaW5hbCBpbnN0cnVjdGlvbi5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZhdWx0SW5zdHJ1Y3Rpb247XG4gICAgfVxuXG4gICAgLy8gZm9yIG5vbi1hdXggcm91dGVzLCB3ZSB3YW50IHRvIHJldXNlIHRoZSBwcmVkZWNlc3NvcidzIGV4aXN0aW5nIHByaW1hcnkgYW5kIGF1eCByb3V0ZXNcbiAgICAvLyBhbmQgb25seSBvdmVycmlkZSByb3V0ZXMgZm9yIHdoaWNoIHRoZSBnaXZlbiBsaW5rIERTTCBwcm92aWRlc1xuICAgIGlmIChpc1ByZXNlbnQocHJldkluc3RydWN0aW9uKSAmJiAhX2F1eCkge1xuICAgICAgYXV4SW5zdHJ1Y3Rpb25zID0gU3RyaW5nTWFwV3JhcHBlci5tZXJnZShwcmV2SW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24sIGF1eEluc3RydWN0aW9ucyk7XG4gICAgICBjb21wb25lbnRJbnN0cnVjdGlvbiA9IHByZXZJbnN0cnVjdGlvbi5jb21wb25lbnQ7XG4gICAgfVxuXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudFR5cGUpO1xuICAgIGlmIChpc0JsYW5rKHJ1bGVzKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYENvbXBvbmVudCBcIiR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcocGFyZW50Q29tcG9uZW50VHlwZSl9XCIgaGFzIG5vIHJvdXRlIGNvbmZpZy5gKTtcbiAgICB9XG5cbiAgICBsZXQgbGlua1BhcmFtSW5kZXggPSAwO1xuICAgIGxldCByb3V0ZVBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcblxuICAgIC8vIGZpcnN0LCByZWNvZ25pemUgdGhlIHByaW1hcnkgcm91dGUgaWYgb25lIGlzIHByb3ZpZGVkXG4gICAgaWYgKGxpbmtQYXJhbUluZGV4IDwgbGlua1BhcmFtcy5sZW5ndGggJiYgaXNTdHJpbmcobGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF0pKSB7XG4gICAgICBsZXQgcm91dGVOYW1lID0gbGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF07XG4gICAgICBpZiAocm91dGVOYW1lID09ICcnIHx8IHJvdXRlTmFtZSA9PSAnLicgfHwgcm91dGVOYW1lID09ICcuLicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFwiJHtyb3V0ZU5hbWV9L1wiIGlzIG9ubHkgYWxsb3dlZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGEgbGluayBEU0wuYCk7XG4gICAgICB9XG4gICAgICBsaW5rUGFyYW1JbmRleCArPSAxO1xuICAgICAgaWYgKGxpbmtQYXJhbUluZGV4IDwgbGlua1BhcmFtcy5sZW5ndGgpIHtcbiAgICAgICAgbGV0IGxpbmtQYXJhbSA9IGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdO1xuICAgICAgICBpZiAoaXNTdHJpbmdNYXAobGlua1BhcmFtKSAmJiAhaXNBcnJheShsaW5rUGFyYW0pKSB7XG4gICAgICAgICAgcm91dGVQYXJhbXMgPSBsaW5rUGFyYW07XG4gICAgICAgICAgbGlua1BhcmFtSW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHJvdXRlUmVjb2duaXplciA9IChfYXV4ID8gcnVsZXMuYXV4UnVsZXNCeU5hbWUgOiBydWxlcy5ydWxlc0J5TmFtZSkuZ2V0KHJvdXRlTmFtZSk7XG5cbiAgICAgIGlmIChpc0JsYW5rKHJvdXRlUmVjb2duaXplcikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgQ29tcG9uZW50IFwiJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyhwYXJlbnRDb21wb25lbnRUeXBlKX1cIiBoYXMgbm8gcm91dGUgbmFtZWQgXCIke3JvdXRlTmFtZX1cIi5gKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIGFuIFwidW5yZXNvbHZlZCBpbnN0cnVjdGlvblwiIGZvciBhc3luYyByb3V0ZXNcbiAgICAgIC8vIHdlJ2xsIGZpZ3VyZSBvdXQgdGhlIHJlc3Qgb2YgdGhlIHJvdXRlIHdoZW4gd2UgcmVzb2x2ZSB0aGUgaW5zdHJ1Y3Rpb24gYW5kXG4gICAgICAvLyBwZXJmb3JtIGEgbmF2aWdhdGlvblxuICAgICAgaWYgKGlzQmxhbmsocm91dGVSZWNvZ25pemVyLmhhbmRsZXIuY29tcG9uZW50VHlwZSkpIHtcbiAgICAgICAgdmFyIGdlbmVyYXRlZFVybCA9IHJvdXRlUmVjb2duaXplci5nZW5lcmF0ZUNvbXBvbmVudFBhdGhWYWx1ZXMocm91dGVQYXJhbXMpO1xuICAgICAgICByZXR1cm4gbmV3IFVucmVzb2x2ZWRJbnN0cnVjdGlvbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJvdXRlUmVjb2duaXplci5oYW5kbGVyLnJlc29sdmVDb21wb25lbnRUeXBlKCkudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLCBwcmV2SW5zdHJ1Y3Rpb24sIF9hdXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX29yaWdpbmFsTGluayk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIGdlbmVyYXRlZFVybC51cmxQYXRoLCBjb252ZXJ0VXJsUGFyYW1zVG9BcnJheShnZW5lcmF0ZWRVcmwudXJsUGFyYW1zKSk7XG4gICAgICB9XG5cbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gX2F1eCA/IHJ1bGVzLmdlbmVyYXRlQXV4aWxpYXJ5KHJvdXRlTmFtZSwgcm91dGVQYXJhbXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVzLmdlbmVyYXRlKHJvdXRlTmFtZSwgcm91dGVQYXJhbXMpO1xuICAgIH1cblxuICAgIC8vIE5leHQsIHJlY29nbml6ZSBhdXhpbGlhcnkgaW5zdHJ1Y3Rpb25zLlxuICAgIC8vIElmIHdlIGhhdmUgYW4gYW5jZXN0b3IgaW5zdHJ1Y3Rpb24sIHdlIHByZXNlcnZlIHdoYXRldmVyIGF1eCByb3V0ZXMgYXJlIGFjdGl2ZSBmcm9tIGl0LlxuICAgIHdoaWxlIChsaW5rUGFyYW1JbmRleCA8IGxpbmtQYXJhbXMubGVuZ3RoICYmIGlzQXJyYXkobGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF0pKSB7XG4gICAgICBsZXQgYXV4UGFyZW50SW5zdHJ1Y3Rpb24gPSBbcGFyZW50SW5zdHJ1Y3Rpb25dO1xuICAgICAgbGV0IGF1eEluc3RydWN0aW9uID0gdGhpcy5fZ2VuZXJhdGUobGlua1BhcmFtc1tsaW5rUGFyYW1JbmRleF0sIGF1eFBhcmVudEluc3RydWN0aW9uLCBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSwgX29yaWdpbmFsTGluayk7XG5cbiAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBub3Qgd29yayBmb3IgYXV4IHJvdXRlcyB3aXRoIHBhcmFtZXRlcnMgb3IgbXVsdGlwbGUgc2VnbWVudHNcbiAgICAgIGF1eEluc3RydWN0aW9uc1thdXhJbnN0cnVjdGlvbi5jb21wb25lbnQudXJsUGF0aF0gPSBhdXhJbnN0cnVjdGlvbjtcbiAgICAgIGxpbmtQYXJhbUluZGV4ICs9IDE7XG4gICAgfVxuXG4gICAgdmFyIGluc3RydWN0aW9uID0gbmV3IFJlc29sdmVkSW5zdHJ1Y3Rpb24oY29tcG9uZW50SW5zdHJ1Y3Rpb24sIG51bGwsIGF1eEluc3RydWN0aW9ucyk7XG5cbiAgICAvLyBJZiB0aGUgY29tcG9uZW50IGlzIHN5bmMsIHdlIGNhbiBnZW5lcmF0ZSByZXNvbHZlZCBjaGlsZCByb3V0ZSBpbnN0cnVjdGlvbnNcbiAgICAvLyBJZiBub3QsIHdlJ2xsIHJlc29sdmUgdGhlIGluc3RydWN0aW9ucyBhdCBuYXZpZ2F0aW9uIHRpbWVcbiAgICBpZiAoaXNQcmVzZW50KGNvbXBvbmVudEluc3RydWN0aW9uKSAmJiBpc1ByZXNlbnQoY29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIGxldCBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgICBpZiAoY29tcG9uZW50SW5zdHJ1Y3Rpb24udGVybWluYWwpIHtcbiAgICAgICAgaWYgKGxpbmtQYXJhbUluZGV4ID49IGxpbmtQYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gVE9ETzogdGhyb3cgdGhhdCB0aGVyZSBhcmUgZXh0cmEgbGluayBwYXJhbXMgYmV5b25kIHRoZSB0ZXJtaW5hbCBjb21wb25lbnRcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNoaWxkQW5jZXN0b3JDb21wb25lbnRzID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtpbnN0cnVjdGlvbl0pO1xuICAgICAgICBsZXQgcmVtYWluaW5nTGlua1BhcmFtcyA9IGxpbmtQYXJhbXMuc2xpY2UobGlua1BhcmFtSW5kZXgpO1xuICAgICAgICBjaGlsZEluc3RydWN0aW9uID0gdGhpcy5fZ2VuZXJhdGUocmVtYWluaW5nTGlua1BhcmFtcywgY2hpbGRBbmNlc3RvckNvbXBvbmVudHMsIG51bGwsIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX29yaWdpbmFsTGluayk7XG4gICAgICB9XG4gICAgICBpbnN0cnVjdGlvbi5jaGlsZCA9IGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICB9XG5cbiAgcHVibGljIGhhc1JvdXRlKG5hbWU6IHN0cmluZywgcGFyZW50Q29tcG9uZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICB2YXIgcnVsZXMgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50KTtcbiAgICBpZiAoaXNCbGFuayhydWxlcykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHJ1bGVzLmhhc1JvdXRlKG5hbWUpO1xuICB9XG5cbiAgcHVibGljIGdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRDdXJzb3I6IFR5cGUpOiBJbnN0cnVjdGlvbiB7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50Q3Vyc29yKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHJ1bGVzID0gdGhpcy5fcnVsZXMuZ2V0KGNvbXBvbmVudEN1cnNvcik7XG4gICAgaWYgKGlzQmxhbmsocnVsZXMpIHx8IGlzQmxhbmsocnVsZXMuZGVmYXVsdFJ1bGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgZGVmYXVsdENoaWxkID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KHJ1bGVzLmRlZmF1bHRSdWxlLmhhbmRsZXIuY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbiA9IHJ1bGVzLmRlZmF1bHRSdWxlLmdlbmVyYXRlKHt9KTtcbiAgICAgIGlmICghcnVsZXMuZGVmYXVsdFJ1bGUudGVybWluYWwpIHtcbiAgICAgICAgZGVmYXVsdENoaWxkID0gdGhpcy5nZW5lcmF0ZURlZmF1bHQocnVsZXMuZGVmYXVsdFJ1bGUuaGFuZGxlci5jb21wb25lbnRUeXBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRGVmYXVsdEluc3RydWN0aW9uKGNvbXBvbmVudEluc3RydWN0aW9uLCBkZWZhdWx0Q2hpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgVW5yZXNvbHZlZEluc3RydWN0aW9uKCgpID0+IHtcbiAgICAgIHJldHVybiBydWxlcy5kZWZhdWx0UnVsZS5oYW5kbGVyLnJlc29sdmVDb21wb25lbnRUeXBlKCkudGhlbihcbiAgICAgICAgICAoXykgPT4gdGhpcy5nZW5lcmF0ZURlZmF1bHQoY29tcG9uZW50Q3Vyc29yKSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLypcbiAqIEdpdmVuOiBbJy9hL2InLCB7YzogMn1dXG4gKiBSZXR1cm5zOiBbJycsICdhJywgJ2InLCB7YzogMn1dXG4gKi9cbmZ1bmN0aW9uIHNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMobGlua1BhcmFtczogYW55W10pIHtcbiAgdmFyIGFjY3VtdWxhdGlvbiA9IFtdO1xuICBsaW5rUGFyYW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbTogYW55KSB7XG4gICAgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICB2YXIgc3RySXRlbTogc3RyaW5nID0gPHN0cmluZz5pdGVtO1xuICAgICAgYWNjdW11bGF0aW9uID0gYWNjdW11bGF0aW9uLmNvbmNhdChzdHJJdGVtLnNwbGl0KCcvJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhY2N1bXVsYXRpb24ucHVzaChpdGVtKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYWNjdW11bGF0aW9uO1xufVxuXG5cbi8qXG4gKiBHaXZlbiBhIGxpc3Qgb2YgaW5zdHJ1Y3Rpb25zLCByZXR1cm5zIHRoZSBtb3N0IHNwZWNpZmljIGluc3RydWN0aW9uXG4gKi9cbmZ1bmN0aW9uIG1vc3RTcGVjaWZpYyhpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBJbnN0cnVjdGlvbiB7XG4gIGluc3RydWN0aW9ucyA9IGluc3RydWN0aW9ucy5maWx0ZXIoKGluc3RydWN0aW9uKSA9PiBpc1ByZXNlbnQoaW5zdHJ1Y3Rpb24pKTtcbiAgaWYgKGluc3RydWN0aW9ucy5sZW5ndGggPT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChpbnN0cnVjdGlvbnMubGVuZ3RoID09IDEpIHtcbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb25zWzBdO1xuICB9XG4gIHZhciBmaXJzdCA9IGluc3RydWN0aW9uc1swXTtcbiAgdmFyIHJlc3QgPSBpbnN0cnVjdGlvbnMuc2xpY2UoMSk7XG4gIHJldHVybiByZXN0LnJlZHVjZSgoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBjb250ZW5kZXI6IEluc3RydWN0aW9uKSA9PiB7XG4gICAgaWYgKGNvbXBhcmVTcGVjaWZpY2l0eVN0cmluZ3MoY29udGVuZGVyLnNwZWNpZmljaXR5LCBpbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSkgPT0gLTEpIHtcbiAgICAgIHJldHVybiBjb250ZW5kZXI7XG4gICAgfVxuICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgfSwgZmlyc3QpO1xufVxuXG4vKlxuICogRXhwZWN0cyBzdHJpbmdzIHRvIGJlIGluIHRoZSBmb3JtIG9mIFwiWzAtMl0rXCJcbiAqIFJldHVybnMgLTEgaWYgc3RyaW5nIEEgc2hvdWxkIGJlIHNvcnRlZCBhYm92ZSBzdHJpbmcgQiwgMSBpZiBpdCBzaG91bGQgYmUgc29ydGVkIGFmdGVyLFxuICogb3IgMCBpZiB0aGV5IGFyZSB0aGUgc2FtZS5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZVNwZWNpZmljaXR5U3RyaW5ncyhhOiBzdHJpbmcsIGI6IHN0cmluZyk6IG51bWJlciB7XG4gIHZhciBsID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpICs9IDEpIHtcbiAgICB2YXIgYWkgPSBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoYSwgaSk7XG4gICAgdmFyIGJpID0gU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGIsIGkpO1xuICAgIHZhciBkaWZmZXJlbmNlID0gYmkgLSBhaTtcbiAgICBpZiAoZGlmZmVyZW5jZSAhPSAwKSB7XG4gICAgICByZXR1cm4gZGlmZmVyZW5jZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFRlcm1pbmFsQ29tcG9uZW50KGNvbXBvbmVudCwgcGF0aCkge1xuICBpZiAoIWlzVHlwZShjb21wb25lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGFubm90YXRpb25zID0gcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudCk7XG4gIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGFubm90YXRpb24gPSBhbm5vdGF0aW9uc1tpXTtcblxuICAgICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBSb3V0ZUNvbmZpZykge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDaGlsZCByb3V0ZXMgYXJlIG5vdCBhbGxvd2VkIGZvciBcIiR7cGF0aH1cIi4gVXNlIFwiLi4uXCIgb24gdGhlIHBhcmVudCdzIHJvdXRlIHBhdGguYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=