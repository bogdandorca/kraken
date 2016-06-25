/* */ 
"format cjs";
'use strict';var core_1 = require('angular2/core');
var parse5_adapter_1 = require('angular2/src/platform/server/parse5_adapter');
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var animation_builder_mock_1 = require('angular2/src/mock/animation_builder_mock');
var directive_resolver_mock_1 = require('angular2/src/mock/directive_resolver_mock');
var view_resolver_mock_1 = require('angular2/src/mock/view_resolver_mock');
var mock_location_strategy_1 = require('angular2/src/mock/mock_location_strategy');
var location_strategy_1 = require('angular2/src/router/location/location_strategy');
var ng_zone_mock_1 = require('angular2/src/mock/ng_zone_mock');
var test_component_builder_1 = require('angular2/src/testing/test_component_builder');
var xhr_1 = require('angular2/src/compiler/xhr');
var utils_1 = require('angular2/src/testing/utils');
var compiler_1 = require('angular2/src/compiler/compiler');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var api_1 = require('angular2/src/core/render/api');
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
var shared_styles_host_1 = require('angular2/src/platform/dom/shared_styles_host');
var common_dom_1 = require('angular2/platform/common_dom');
var dom_events_1 = require('angular2/src/platform/dom/events/dom_events');
var lang_1 = require('angular2/src/facade/lang');
var utils_2 = require('angular2/src/testing/utils');
function initServerTests() {
    parse5_adapter_1.Parse5DomAdapter.makeCurrent();
    utils_1.BrowserDetection.setup();
}
/**
 * Default patform providers for testing.
 */
exports.TEST_SERVER_PLATFORM_PROVIDERS = lang_1.CONST_EXPR([
    core_1.PLATFORM_COMMON_PROVIDERS,
    new core_1.Provider(core_1.PLATFORM_INITIALIZER, { useValue: initServerTests, multi: true })
]);
function appDoc() {
    try {
        return dom_adapter_1.DOM.defaultDoc();
    }
    catch (e) {
        return null;
    }
}
/**
 * Default application providers for testing.
 */
exports.TEST_SERVER_APPLICATION_PROVIDERS = lang_1.CONST_EXPR([
    // TODO(julie): when angular2/platform/server is available, use that instead of making our own
    // list here.
    core_1.APPLICATION_COMMON_PROVIDERS,
    compiler_1.COMPILER_PROVIDERS,
    new core_1.Provider(dom_tokens_1.DOCUMENT, { useFactory: appDoc }),
    new core_1.Provider(dom_renderer_1.DomRootRenderer, { useClass: dom_renderer_1.DomRootRenderer_ }),
    new core_1.Provider(api_1.RootRenderer, { useExisting: dom_renderer_1.DomRootRenderer }),
    common_dom_1.EventManager,
    new core_1.Provider(common_dom_1.EVENT_MANAGER_PLUGINS, { useClass: dom_events_1.DomEventsPlugin, multi: true }),
    new core_1.Provider(xhr_1.XHR, { useClass: xhr_1.XHR }),
    new core_1.Provider(core_1.APP_ID, { useValue: 'a' }),
    shared_styles_host_1.DomSharedStylesHost,
    common_dom_1.ELEMENT_PROBE_PROVIDERS,
    new core_1.Provider(core_1.DirectiveResolver, { useClass: directive_resolver_mock_1.MockDirectiveResolver }),
    new core_1.Provider(core_1.ViewResolver, { useClass: view_resolver_mock_1.MockViewResolver }),
    utils_2.Log,
    test_component_builder_1.TestComponentBuilder,
    new core_1.Provider(core_1.NgZone, { useClass: ng_zone_mock_1.MockNgZone }),
    new core_1.Provider(location_strategy_1.LocationStrategy, { useClass: mock_location_strategy_1.MockLocationStrategy }),
    new core_1.Provider(animation_builder_1.AnimationBuilder, { useClass: animation_builder_mock_1.MockAnimationBuilder }),
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvcGxhdGZvcm0vdGVzdGluZy9zZXJ2ZXIudHMiXSwibmFtZXMiOlsiaW5pdFNlcnZlclRlc3RzIiwiYXBwRG9jIl0sIm1hcHBpbmdzIjoiQUFBQSxxQkFVTyxlQUFlLENBQUMsQ0FBQTtBQUN2QiwrQkFBK0IsNkNBQTZDLENBQUMsQ0FBQTtBQUU3RSxrQ0FBK0Isd0NBQXdDLENBQUMsQ0FBQTtBQUN4RSx1Q0FBbUMsMENBQTBDLENBQUMsQ0FBQTtBQUM5RSx3Q0FBb0MsMkNBQTJDLENBQUMsQ0FBQTtBQUNoRixtQ0FBK0Isc0NBQXNDLENBQUMsQ0FBQTtBQUN0RSx1Q0FBbUMsMENBQTBDLENBQUMsQ0FBQTtBQUM5RSxrQ0FBK0IsZ0RBQWdELENBQUMsQ0FBQTtBQUNoRiw2QkFBeUIsZ0NBQWdDLENBQUMsQ0FBQTtBQUUxRCx1Q0FBbUMsNkNBQTZDLENBQUMsQ0FBQTtBQUNqRixvQkFBa0IsMkJBQTJCLENBQUMsQ0FBQTtBQUM5QyxzQkFBK0IsNEJBQTRCLENBQUMsQ0FBQTtBQUU1RCx5QkFBaUMsZ0NBQWdDLENBQUMsQ0FBQTtBQUNsRSwyQkFBdUIsc0NBQXNDLENBQUMsQ0FBQTtBQUM5RCw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCxvQkFBMkIsOEJBQThCLENBQUMsQ0FBQTtBQUMxRCw2QkFBZ0Qsd0NBQXdDLENBQUMsQ0FBQTtBQUN6RixtQ0FBa0MsOENBQThDLENBQUMsQ0FBQTtBQUVqRiwyQkFJTyw4QkFBOEIsQ0FBQyxDQUFBO0FBQ3RDLDJCQUE4Qiw2Q0FBNkMsQ0FBQyxDQUFBO0FBRTVFLHFCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBRXBELHNCQUFrQiw0QkFBNEIsQ0FBQyxDQUFBO0FBRS9DO0lBQ0VBLGlDQUFnQkEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7SUFDL0JBLHdCQUFnQkEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7QUFDM0JBLENBQUNBO0FBRUQ7O0dBRUc7QUFDVSxzQ0FBOEIsR0FBMkMsaUJBQVUsQ0FBQztJQUMvRixnQ0FBeUI7SUFDekIsSUFBSSxlQUFRLENBQUMsMkJBQW9CLEVBQUUsRUFBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQztDQUM3RSxDQUFDLENBQUM7QUFFSDtJQUNFQyxJQUFJQSxDQUFDQTtRQUNIQSxNQUFNQSxDQUFDQSxpQkFBR0EsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0E7SUFDMUJBLENBQUVBO0lBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ1hBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0FBQ0hBLENBQUNBO0FBRUQ7O0dBRUc7QUFDVSx5Q0FBaUMsR0FDMUMsaUJBQVUsQ0FBQztJQUNULDhGQUE4RjtJQUM5RixhQUFhO0lBQ2IsbUNBQTRCO0lBQzVCLDZCQUFrQjtJQUNsQixJQUFJLGVBQVEsQ0FBQyxxQkFBUSxFQUFFLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyxDQUFDO0lBQzVDLElBQUksZUFBUSxDQUFDLDhCQUFlLEVBQUUsRUFBQyxRQUFRLEVBQUUsK0JBQWdCLEVBQUMsQ0FBQztJQUMzRCxJQUFJLGVBQVEsQ0FBQyxrQkFBWSxFQUFFLEVBQUMsV0FBVyxFQUFFLDhCQUFlLEVBQUMsQ0FBQztJQUMxRCx5QkFBWTtJQUNaLElBQUksZUFBUSxDQUFDLGtDQUFxQixFQUFFLEVBQUMsUUFBUSxFQUFFLDRCQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDO0lBQzdFLElBQUksZUFBUSxDQUFDLFNBQUcsRUFBRSxFQUFDLFFBQVEsRUFBRSxTQUFHLEVBQUMsQ0FBQztJQUNsQyxJQUFJLGVBQVEsQ0FBQyxhQUFNLEVBQUUsRUFBQyxRQUFRLEVBQUUsR0FBRyxFQUFDLENBQUM7SUFDckMsd0NBQW1CO0lBQ25CLG9DQUF1QjtJQUN2QixJQUFJLGVBQVEsQ0FBQyx3QkFBaUIsRUFBRSxFQUFDLFFBQVEsRUFBRSwrQ0FBcUIsRUFBQyxDQUFDO0lBQ2xFLElBQUksZUFBUSxDQUFDLG1CQUFZLEVBQUUsRUFBQyxRQUFRLEVBQUUscUNBQWdCLEVBQUMsQ0FBQztJQUN4RCxXQUFHO0lBQ0gsNkNBQW9CO0lBQ3BCLElBQUksZUFBUSxDQUFDLGFBQU0sRUFBRSxFQUFDLFFBQVEsRUFBRSx5QkFBVSxFQUFDLENBQUM7SUFDNUMsSUFBSSxlQUFRLENBQUMsb0NBQWdCLEVBQUUsRUFBQyxRQUFRLEVBQUUsNkNBQW9CLEVBQUMsQ0FBQztJQUNoRSxJQUFJLGVBQVEsQ0FBQyxvQ0FBZ0IsRUFBRSxFQUFDLFFBQVEsRUFBRSw2Q0FBb0IsRUFBQyxDQUFDO0NBQ2pFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFQUF9JRCxcbiAgRGlyZWN0aXZlUmVzb2x2ZXIsXG4gIE5nWm9uZSxcbiAgUHJvdmlkZXIsXG4gIFZpZXdSZXNvbHZlcixcbiAgUExBVEZPUk1fQ09NTU9OX1BST1ZJREVSUyxcbiAgUExBVEZPUk1fSU5JVElBTElaRVIsXG4gIEFQUExJQ0FUSU9OX0NPTU1PTl9QUk9WSURFUlMsXG4gIFJlbmRlcmVyXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtQYXJzZTVEb21BZGFwdGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vc2VydmVyL3BhcnNlNV9hZGFwdGVyJztcblxuaW1wb3J0IHtBbmltYXRpb25CdWlsZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlcic7XG5pbXBvcnQge01vY2tBbmltYXRpb25CdWlsZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvbW9jay9hbmltYXRpb25fYnVpbGRlcl9tb2NrJztcbmltcG9ydCB7TW9ja0RpcmVjdGl2ZVJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvbW9jay9kaXJlY3RpdmVfcmVzb2x2ZXJfbW9jayc7XG5pbXBvcnQge01vY2tWaWV3UmVzb2x2ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9tb2NrL3ZpZXdfcmVzb2x2ZXJfbW9jayc7XG5pbXBvcnQge01vY2tMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICdhbmd1bGFyMi9zcmMvbW9jay9tb2NrX2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL3JvdXRlci9sb2NhdGlvbi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge01vY2tOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9tb2NrL25nX3pvbmVfbW9jayc7XG5cbmltcG9ydCB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXInO1xuaW1wb3J0IHtYSFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci94aHInO1xuaW1wb3J0IHtCcm93c2VyRGV0ZWN0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvdGVzdGluZy91dGlscyc7XG5cbmltcG9ydCB7Q09NUElMRVJfUFJPVklERVJTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvY29tcGlsZXInO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fdG9rZW5zJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7Um9vdFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7RG9tUm9vdFJlbmRlcmVyLCBEb21Sb290UmVuZGVyZXJffSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9yZW5kZXJlcic7XG5pbXBvcnQge0RvbVNoYXJlZFN0eWxlc0hvc3R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vc2hhcmVkX3N0eWxlc19ob3N0JztcblxuaW1wb3J0IHtcbiAgRXZlbnRNYW5hZ2VyLFxuICBFVkVOVF9NQU5BR0VSX1BMVUdJTlMsXG4gIEVMRU1FTlRfUFJPQkVfUFJPVklERVJTXG59IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbl9kb20nO1xuaW1wb3J0IHtEb21FdmVudHNQbHVnaW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2RvbV9ldmVudHMnO1xuXG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7TG9nfSBmcm9tICdhbmd1bGFyMi9zcmMvdGVzdGluZy91dGlscyc7XG5cbmZ1bmN0aW9uIGluaXRTZXJ2ZXJUZXN0cygpIHtcbiAgUGFyc2U1RG9tQWRhcHRlci5tYWtlQ3VycmVudCgpO1xuICBCcm93c2VyRGV0ZWN0aW9uLnNldHVwKCk7XG59XG5cbi8qKlxuICogRGVmYXVsdCBwYXRmb3JtIHByb3ZpZGVycyBmb3IgdGVzdGluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFU1RfU0VSVkVSX1BMQVRGT1JNX1BST1ZJREVSUzogQXJyYXk8YW55IC8qVHlwZSB8IFByb3ZpZGVyIHwgYW55W10qLz4gPSBDT05TVF9FWFBSKFtcbiAgUExBVEZPUk1fQ09NTU9OX1BST1ZJREVSUyxcbiAgbmV3IFByb3ZpZGVyKFBMQVRGT1JNX0lOSVRJQUxJWkVSLCB7dXNlVmFsdWU6IGluaXRTZXJ2ZXJUZXN0cywgbXVsdGk6IHRydWV9KVxuXSk7XG5cbmZ1bmN0aW9uIGFwcERvYygpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gRE9NLmRlZmF1bHREb2MoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBhcHBsaWNhdGlvbiBwcm92aWRlcnMgZm9yIHRlc3RpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBURVNUX1NFUlZFUl9BUFBMSUNBVElPTl9QUk9WSURFUlM6IEFycmF5PGFueSAvKlR5cGUgfCBQcm92aWRlciB8IGFueVtdKi8+ID1cbiAgICBDT05TVF9FWFBSKFtcbiAgICAgIC8vIFRPRE8oanVsaWUpOiB3aGVuIGFuZ3VsYXIyL3BsYXRmb3JtL3NlcnZlciBpcyBhdmFpbGFibGUsIHVzZSB0aGF0IGluc3RlYWQgb2YgbWFraW5nIG91ciBvd25cbiAgICAgIC8vIGxpc3QgaGVyZS5cbiAgICAgIEFQUExJQ0FUSU9OX0NPTU1PTl9QUk9WSURFUlMsXG4gICAgICBDT01QSUxFUl9QUk9WSURFUlMsXG4gICAgICBuZXcgUHJvdmlkZXIoRE9DVU1FTlQsIHt1c2VGYWN0b3J5OiBhcHBEb2N9KSxcbiAgICAgIG5ldyBQcm92aWRlcihEb21Sb290UmVuZGVyZXIsIHt1c2VDbGFzczogRG9tUm9vdFJlbmRlcmVyX30pLFxuICAgICAgbmV3IFByb3ZpZGVyKFJvb3RSZW5kZXJlciwge3VzZUV4aXN0aW5nOiBEb21Sb290UmVuZGVyZXJ9KSxcbiAgICAgIEV2ZW50TWFuYWdlcixcbiAgICAgIG5ldyBQcm92aWRlcihFVkVOVF9NQU5BR0VSX1BMVUdJTlMsIHt1c2VDbGFzczogRG9tRXZlbnRzUGx1Z2luLCBtdWx0aTogdHJ1ZX0pLFxuICAgICAgbmV3IFByb3ZpZGVyKFhIUiwge3VzZUNsYXNzOiBYSFJ9KSxcbiAgICAgIG5ldyBQcm92aWRlcihBUFBfSUQsIHt1c2VWYWx1ZTogJ2EnfSksXG4gICAgICBEb21TaGFyZWRTdHlsZXNIb3N0LFxuICAgICAgRUxFTUVOVF9QUk9CRV9QUk9WSURFUlMsXG4gICAgICBuZXcgUHJvdmlkZXIoRGlyZWN0aXZlUmVzb2x2ZXIsIHt1c2VDbGFzczogTW9ja0RpcmVjdGl2ZVJlc29sdmVyfSksXG4gICAgICBuZXcgUHJvdmlkZXIoVmlld1Jlc29sdmVyLCB7dXNlQ2xhc3M6IE1vY2tWaWV3UmVzb2x2ZXJ9KSxcbiAgICAgIExvZyxcbiAgICAgIFRlc3RDb21wb25lbnRCdWlsZGVyLFxuICAgICAgbmV3IFByb3ZpZGVyKE5nWm9uZSwge3VzZUNsYXNzOiBNb2NrTmdab25lfSksXG4gICAgICBuZXcgUHJvdmlkZXIoTG9jYXRpb25TdHJhdGVneSwge3VzZUNsYXNzOiBNb2NrTG9jYXRpb25TdHJhdGVneX0pLFxuICAgICAgbmV3IFByb3ZpZGVyKEFuaW1hdGlvbkJ1aWxkZXIsIHt1c2VDbGFzczogTW9ja0FuaW1hdGlvbkJ1aWxkZXJ9KSxcbiAgICBdKTtcbiJdfQ==