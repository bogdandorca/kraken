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
var source_module_1 = require('./source_module');
var view_1 = require('angular2/src/core/metadata/view');
var xhr_1 = require('angular2/src/compiler/xhr');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var shadow_css_1 = require('angular2/src/compiler/shadow_css');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var style_url_resolver_1 = require('./style_url_resolver');
var util_1 = require('./util');
var di_1 = require('angular2/src/core/di');
var COMPONENT_VARIABLE = '%COMP%';
var HOST_ATTR = "_nghost-" + COMPONENT_VARIABLE;
var CONTENT_ATTR = "_ngcontent-" + COMPONENT_VARIABLE;
var StyleCompiler = (function () {
    function StyleCompiler(_xhr, _urlResolver) {
        this._xhr = _xhr;
        this._urlResolver = _urlResolver;
        this._styleCache = new Map();
        this._shadowCss = new shadow_css_1.ShadowCss();
    }
    StyleCompiler.prototype.compileComponentRuntime = function (template) {
        var styles = template.styles;
        var styleAbsUrls = template.styleUrls;
        return this._loadStyles(styles, styleAbsUrls, template.encapsulation === view_1.ViewEncapsulation.Emulated);
    };
    StyleCompiler.prototype.compileComponentCodeGen = function (template) {
        var shim = template.encapsulation === view_1.ViewEncapsulation.Emulated;
        return this._styleCodeGen(template.styles, template.styleUrls, shim);
    };
    StyleCompiler.prototype.compileStylesheetCodeGen = function (stylesheetUrl, cssText) {
        var styleWithImports = style_url_resolver_1.extractStyleUrls(this._urlResolver, stylesheetUrl, cssText);
        return [
            this._styleModule(stylesheetUrl, false, this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, false)),
            this._styleModule(stylesheetUrl, true, this._styleCodeGen([styleWithImports.style], styleWithImports.styleUrls, true))
        ];
    };
    StyleCompiler.prototype.clearCache = function () { this._styleCache.clear(); };
    StyleCompiler.prototype._loadStyles = function (plainStyles, absUrls, encapsulate) {
        var _this = this;
        var promises = absUrls.map(function (absUrl) {
            var cacheKey = "" + absUrl + (encapsulate ? '.shim' : '');
            var result = _this._styleCache.get(cacheKey);
            if (lang_1.isBlank(result)) {
                result = _this._xhr.get(absUrl).then(function (style) {
                    var styleWithImports = style_url_resolver_1.extractStyleUrls(_this._urlResolver, absUrl, style);
                    return _this._loadStyles([styleWithImports.style], styleWithImports.styleUrls, encapsulate);
                });
                _this._styleCache.set(cacheKey, result);
            }
            return result;
        });
        return async_1.PromiseWrapper.all(promises).then(function (nestedStyles) {
            var result = plainStyles.map(function (plainStyle) { return _this._shimIfNeeded(plainStyle, encapsulate); });
            nestedStyles.forEach(function (styles) { return result.push(styles); });
            return result;
        });
    };
    StyleCompiler.prototype._styleCodeGen = function (plainStyles, absUrls, shim) {
        var _this = this;
        var arrayPrefix = lang_1.IS_DART ? "const" : '';
        var styleExpressions = plainStyles.map(function (plainStyle) { return util_1.escapeSingleQuoteString(_this._shimIfNeeded(plainStyle, shim)); });
        for (var i = 0; i < absUrls.length; i++) {
            var moduleUrl = this._createModuleUrl(absUrls[i], shim);
            styleExpressions.push(source_module_1.moduleRef(moduleUrl) + "STYLES");
        }
        var expressionSource = arrayPrefix + " [" + styleExpressions.join(',') + "]";
        return new source_module_1.SourceExpression([], expressionSource);
    };
    StyleCompiler.prototype._styleModule = function (stylesheetUrl, shim, expression) {
        var moduleSource = "\n      " + expression.declarations.join('\n') + "\n      " + util_1.codeGenExportVariable('STYLES') + expression.expression + ";\n    ";
        return new source_module_1.SourceModule(this._createModuleUrl(stylesheetUrl, shim), moduleSource);
    };
    StyleCompiler.prototype._shimIfNeeded = function (style, shim) {
        return shim ? this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR) : style;
    };
    StyleCompiler.prototype._createModuleUrl = function (stylesheetUrl, shim) {
        return shim ? stylesheetUrl + ".shim" + util_1.MODULE_SUFFIX : "" + stylesheetUrl + util_1.MODULE_SUFFIX;
    };
    StyleCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [xhr_1.XHR, url_resolver_1.UrlResolver])
    ], StyleCompiler);
    return StyleCompiler;
})();
exports.StyleCompiler = StyleCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tcGlsZXIvc3R5bGVfY29tcGlsZXIudHMiXSwibmFtZXMiOlsiU3R5bGVDb21waWxlciIsIlN0eWxlQ29tcGlsZXIuY29uc3RydWN0b3IiLCJTdHlsZUNvbXBpbGVyLmNvbXBpbGVDb21wb25lbnRSdW50aW1lIiwiU3R5bGVDb21waWxlci5jb21waWxlQ29tcG9uZW50Q29kZUdlbiIsIlN0eWxlQ29tcGlsZXIuY29tcGlsZVN0eWxlc2hlZXRDb2RlR2VuIiwiU3R5bGVDb21waWxlci5jbGVhckNhY2hlIiwiU3R5bGVDb21waWxlci5fbG9hZFN0eWxlcyIsIlN0eWxlQ29tcGlsZXIuX3N0eWxlQ29kZUdlbiIsIlN0eWxlQ29tcGlsZXIuX3N0eWxlTW9kdWxlIiwiU3R5bGVDb21waWxlci5fc2hpbUlmTmVlZGVkIiwiU3R5bGVDb21waWxlci5fY3JlYXRlTW9kdWxlVXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFDQSw4QkFBd0QsaUJBQWlCLENBQUMsQ0FBQTtBQUMxRSxxQkFBZ0MsaUNBQWlDLENBQUMsQ0FBQTtBQUNsRSxvQkFBa0IsMkJBQTJCLENBQUMsQ0FBQTtBQUM5QyxxQkFBOEMsMEJBQTBCLENBQUMsQ0FBQTtBQUN6RSxzQkFBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUN6RCwyQkFBd0Isa0NBQWtDLENBQUMsQ0FBQTtBQUMzRCw2QkFBMEIsb0NBQW9DLENBQUMsQ0FBQTtBQUMvRCxtQ0FBK0Isc0JBQXNCLENBQUMsQ0FBQTtBQUN0RCxxQkFLTyxRQUFRLENBQUMsQ0FBQTtBQUNoQixtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRCxJQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQztBQUNwQyxJQUFNLFNBQVMsR0FBRyxhQUFXLGtCQUFvQixDQUFDO0FBQ2xELElBQU0sWUFBWSxHQUFHLGdCQUFjLGtCQUFvQixDQUFDO0FBRXhEO0lBS0VB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QSxnQkFBZ0JBLENBQUNBLGFBQWFBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLFlBQVlBLENBQUNBLENBQUNBO0lBQ3BGQSxDQUFDQTtJQUVPUixxQ0FBYUEsR0FBckJBLFVBQXNCQSxLQUFhQSxFQUFFQSxJQUFhQTtRQUNoRFMsTUFBTUEsQ0FBQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsWUFBWUEsRUFBRUEsU0FBU0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDcEZBLENBQUNBO0lBRU9ULHdDQUFnQkEsR0FBeEJBLFVBQXlCQSxhQUFxQkEsRUFBRUEsSUFBYUE7UUFDM0RVLE1BQU1BLENBQUNBLElBQUlBLEdBQU1BLGFBQWFBLGFBQVFBLG9CQUFlQSxHQUFHQSxLQUFHQSxhQUFhQSxHQUFHQSxvQkFBZUEsQ0FBQ0E7SUFDN0ZBLENBQUNBO0lBbkZIVjtRQUFDQSxlQUFVQSxFQUFFQTs7c0JBb0ZaQTtJQUFEQSxvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFwRkQsSUFvRkM7QUFuRlkscUJBQWEsZ0JBbUZ6QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21waWxlVHlwZU1ldGFkYXRhLCBDb21waWxlVGVtcGxhdGVNZXRhZGF0YX0gZnJvbSAnLi9kaXJlY3RpdmVfbWV0YWRhdGEnO1xuaW1wb3J0IHtTb3VyY2VNb2R1bGUsIFNvdXJjZUV4cHJlc3Npb24sIG1vZHVsZVJlZn0gZnJvbSAnLi9zb3VyY2VfbW9kdWxlJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuaW1wb3J0IHtJU19EQVJULCBTdHJpbmdXcmFwcGVyLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1NoYWRvd0Nzc30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NoYWRvd19jc3MnO1xuaW1wb3J0IHtVcmxSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlcic7XG5pbXBvcnQge2V4dHJhY3RTdHlsZVVybHN9IGZyb20gJy4vc3R5bGVfdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7XG4gIGVzY2FwZVNpbmdsZVF1b3RlU3RyaW5nLFxuICBjb2RlR2VuRXhwb3J0VmFyaWFibGUsXG4gIGNvZGVHZW5Ub1N0cmluZyxcbiAgTU9EVUxFX1NVRkZJWFxufSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbmNvbnN0IENPTVBPTkVOVF9WQVJJQUJMRSA9ICclQ09NUCUnO1xuY29uc3QgSE9TVF9BVFRSID0gYF9uZ2hvc3QtJHtDT01QT05FTlRfVkFSSUFCTEV9YDtcbmNvbnN0IENPTlRFTlRfQVRUUiA9IGBfbmdjb250ZW50LSR7Q09NUE9ORU5UX1ZBUklBQkxFfWA7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdHlsZUNvbXBpbGVyIHtcbiAgcHJpdmF0ZSBfc3R5bGVDYWNoZTogTWFwPHN0cmluZywgUHJvbWlzZTxzdHJpbmdbXT4+ID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2U8c3RyaW5nW10+PigpO1xuICBwcml2YXRlIF9zaGFkb3dDc3M6IFNoYWRvd0NzcyA9IG5ldyBTaGFkb3dDc3MoKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF94aHI6IFhIUiwgcHJpdmF0ZSBfdXJsUmVzb2x2ZXI6IFVybFJlc29sdmVyKSB7fVxuXG4gIGNvbXBpbGVDb21wb25lbnRSdW50aW1lKHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSk6IFByb21pc2U8QXJyYXk8c3RyaW5nIHwgYW55W10+PiB7XG4gICAgdmFyIHN0eWxlcyA9IHRlbXBsYXRlLnN0eWxlcztcbiAgICB2YXIgc3R5bGVBYnNVcmxzID0gdGVtcGxhdGUuc3R5bGVVcmxzO1xuICAgIHJldHVybiB0aGlzLl9sb2FkU3R5bGVzKHN0eWxlcywgc3R5bGVBYnNVcmxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlLmVuY2Fwc3VsYXRpb24gPT09IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkKTtcbiAgfVxuXG4gIGNvbXBpbGVDb21wb25lbnRDb2RlR2VuKHRlbXBsYXRlOiBDb21waWxlVGVtcGxhdGVNZXRhZGF0YSk6IFNvdXJjZUV4cHJlc3Npb24ge1xuICAgIHZhciBzaGltID0gdGVtcGxhdGUuZW5jYXBzdWxhdGlvbiA9PT0gVmlld0VuY2Fwc3VsYXRpb24uRW11bGF0ZWQ7XG4gICAgcmV0dXJuIHRoaXMuX3N0eWxlQ29kZUdlbih0ZW1wbGF0ZS5zdHlsZXMsIHRlbXBsYXRlLnN0eWxlVXJscywgc2hpbSk7XG4gIH1cblxuICBjb21waWxlU3R5bGVzaGVldENvZGVHZW4oc3R5bGVzaGVldFVybDogc3RyaW5nLCBjc3NUZXh0OiBzdHJpbmcpOiBTb3VyY2VNb2R1bGVbXSB7XG4gICAgdmFyIHN0eWxlV2l0aEltcG9ydHMgPSBleHRyYWN0U3R5bGVVcmxzKHRoaXMuX3VybFJlc29sdmVyLCBzdHlsZXNoZWV0VXJsLCBjc3NUZXh0KTtcbiAgICByZXR1cm4gW1xuICAgICAgdGhpcy5fc3R5bGVNb2R1bGUoXG4gICAgICAgICAgc3R5bGVzaGVldFVybCwgZmFsc2UsXG4gICAgICAgICAgdGhpcy5fc3R5bGVDb2RlR2VuKFtzdHlsZVdpdGhJbXBvcnRzLnN0eWxlXSwgc3R5bGVXaXRoSW1wb3J0cy5zdHlsZVVybHMsIGZhbHNlKSksXG4gICAgICB0aGlzLl9zdHlsZU1vZHVsZShzdHlsZXNoZWV0VXJsLCB0cnVlLCB0aGlzLl9zdHlsZUNvZGVHZW4oW3N0eWxlV2l0aEltcG9ydHMuc3R5bGVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlV2l0aEltcG9ydHMuc3R5bGVVcmxzLCB0cnVlKSlcbiAgICBdO1xuICB9XG5cbiAgY2xlYXJDYWNoZSgpIHsgdGhpcy5fc3R5bGVDYWNoZS5jbGVhcigpOyB9XG5cbiAgcHJpdmF0ZSBfbG9hZFN0eWxlcyhwbGFpblN0eWxlczogc3RyaW5nW10sIGFic1VybHM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICAgICAgICAgIGVuY2Fwc3VsYXRlOiBib29sZWFuKTogUHJvbWlzZTxBcnJheTxzdHJpbmcgfCBhbnlbXT4+IHtcbiAgICB2YXIgcHJvbWlzZXMgPSBhYnNVcmxzLm1hcCgoYWJzVXJsKSA9PiB7XG4gICAgICB2YXIgY2FjaGVLZXkgPSBgJHthYnNVcmx9JHtlbmNhcHN1bGF0ZSA/ICcuc2hpbScgOiAnJ31gO1xuICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX3N0eWxlQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5feGhyLmdldChhYnNVcmwpLnRoZW4oKHN0eWxlKSA9PiB7XG4gICAgICAgICAgdmFyIHN0eWxlV2l0aEltcG9ydHMgPSBleHRyYWN0U3R5bGVVcmxzKHRoaXMuX3VybFJlc29sdmVyLCBhYnNVcmwsIHN0eWxlKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fbG9hZFN0eWxlcyhbc3R5bGVXaXRoSW1wb3J0cy5zdHlsZV0sIHN0eWxlV2l0aEltcG9ydHMuc3R5bGVVcmxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY2Fwc3VsYXRlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3N0eWxlQ2FjaGUuc2V0KGNhY2hlS2V5LCByZXN1bHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKHByb21pc2VzKS50aGVuKChuZXN0ZWRTdHlsZXM6IHN0cmluZ1tdW10pID0+IHtcbiAgICAgIHZhciByZXN1bHQ6IEFycmF5PHN0cmluZyB8IGFueVtdPiA9XG4gICAgICAgICAgcGxhaW5TdHlsZXMubWFwKHBsYWluU3R5bGUgPT4gdGhpcy5fc2hpbUlmTmVlZGVkKHBsYWluU3R5bGUsIGVuY2Fwc3VsYXRlKSk7XG4gICAgICBuZXN0ZWRTdHlsZXMuZm9yRWFjaChzdHlsZXMgPT4gcmVzdWx0LnB1c2goc3R5bGVzKSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3R5bGVDb2RlR2VuKHBsYWluU3R5bGVzOiBzdHJpbmdbXSwgYWJzVXJsczogc3RyaW5nW10sIHNoaW06IGJvb2xlYW4pOiBTb3VyY2VFeHByZXNzaW9uIHtcbiAgICB2YXIgYXJyYXlQcmVmaXggPSBJU19EQVJUID8gYGNvbnN0YCA6ICcnO1xuICAgIHZhciBzdHlsZUV4cHJlc3Npb25zID0gcGxhaW5TdHlsZXMubWFwKFxuICAgICAgICBwbGFpblN0eWxlID0+IGVzY2FwZVNpbmdsZVF1b3RlU3RyaW5nKHRoaXMuX3NoaW1JZk5lZWRlZChwbGFpblN0eWxlLCBzaGltKSkpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhYnNVcmxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbW9kdWxlVXJsID0gdGhpcy5fY3JlYXRlTW9kdWxlVXJsKGFic1VybHNbaV0sIHNoaW0pO1xuICAgICAgc3R5bGVFeHByZXNzaW9ucy5wdXNoKGAke21vZHVsZVJlZihtb2R1bGVVcmwpfVNUWUxFU2ApO1xuICAgIH1cbiAgICB2YXIgZXhwcmVzc2lvblNvdXJjZSA9IGAke2FycmF5UHJlZml4fSBbJHtzdHlsZUV4cHJlc3Npb25zLmpvaW4oJywnKX1dYDtcbiAgICByZXR1cm4gbmV3IFNvdXJjZUV4cHJlc3Npb24oW10sIGV4cHJlc3Npb25Tb3VyY2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3R5bGVNb2R1bGUoc3R5bGVzaGVldFVybDogc3RyaW5nLCBzaGltOiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiBTb3VyY2VFeHByZXNzaW9uKTogU291cmNlTW9kdWxlIHtcbiAgICB2YXIgbW9kdWxlU291cmNlID0gYFxuICAgICAgJHtleHByZXNzaW9uLmRlY2xhcmF0aW9ucy5qb2luKCdcXG4nKX1cbiAgICAgICR7Y29kZUdlbkV4cG9ydFZhcmlhYmxlKCdTVFlMRVMnKX0ke2V4cHJlc3Npb24uZXhwcmVzc2lvbn07XG4gICAgYDtcbiAgICByZXR1cm4gbmV3IFNvdXJjZU1vZHVsZSh0aGlzLl9jcmVhdGVNb2R1bGVVcmwoc3R5bGVzaGVldFVybCwgc2hpbSksIG1vZHVsZVNvdXJjZSk7XG4gIH1cblxuICBwcml2YXRlIF9zaGltSWZOZWVkZWQoc3R5bGU6IHN0cmluZywgc2hpbTogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHNoaW0gPyB0aGlzLl9zaGFkb3dDc3Muc2hpbUNzc1RleHQoc3R5bGUsIENPTlRFTlRfQVRUUiwgSE9TVF9BVFRSKSA6IHN0eWxlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlTW9kdWxlVXJsKHN0eWxlc2hlZXRVcmw6IHN0cmluZywgc2hpbTogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgcmV0dXJuIHNoaW0gPyBgJHtzdHlsZXNoZWV0VXJsfS5zaGltJHtNT0RVTEVfU1VGRklYfWAgOiBgJHtzdHlsZXNoZWV0VXJsfSR7TU9EVUxFX1NVRkZJWH1gO1xuICB9XG59XG4iXX0=