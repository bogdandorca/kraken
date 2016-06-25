/* */ 
"format cjs";
'use strict';function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/**
 * This is a set of classes and objects that can be used both in the browser and on the server.
 */
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
exports.DOM = dom_adapter_1.DOM;
exports.setRootDomAdapter = dom_adapter_1.setRootDomAdapter;
exports.DomAdapter = dom_adapter_1.DomAdapter;
var dom_renderer_1 = require('angular2/src/platform/dom/dom_renderer');
exports.DomRenderer = dom_renderer_1.DomRenderer;
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
exports.DOCUMENT = dom_tokens_1.DOCUMENT;
var shared_styles_host_1 = require('angular2/src/platform/dom/shared_styles_host');
exports.SharedStylesHost = shared_styles_host_1.SharedStylesHost;
exports.DomSharedStylesHost = shared_styles_host_1.DomSharedStylesHost;
var dom_events_1 = require('angular2/src/platform/dom/events/dom_events');
exports.DomEventsPlugin = dom_events_1.DomEventsPlugin;
var event_manager_1 = require('angular2/src/platform/dom/events/event_manager');
exports.EVENT_MANAGER_PLUGINS = event_manager_1.EVENT_MANAGER_PLUGINS;
exports.EventManager = event_manager_1.EventManager;
exports.EventManagerPlugin = event_manager_1.EventManagerPlugin;
__export(require('angular2/src/platform/dom/debug/by'));
__export(require('angular2/src/platform/dom/debug/ng_probe'));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX2RvbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbl9kb20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7O0dBRUc7QUFDSCw0QkFBaUQsdUNBQXVDLENBQUM7QUFBakYsZ0NBQUc7QUFBRSw0REFBaUI7QUFBRSw4Q0FBeUQ7QUFDekYsNkJBQTBCLHdDQUF3QyxDQUFDO0FBQTNELGlEQUEyRDtBQUNuRSwyQkFBdUIsc0NBQXNDLENBQUM7QUFBdEQseUNBQXNEO0FBQzlELG1DQUFvRCw4Q0FBOEMsQ0FBQztBQUEzRixpRUFBZ0I7QUFBRSx1RUFBeUU7QUFDbkcsMkJBQThCLDZDQUE2QyxDQUFDO0FBQXBFLHVEQUFvRTtBQUM1RSw4QkFJTyxnREFBZ0QsQ0FBQztBQUh0RCxzRUFBcUI7QUFDckIsb0RBQVk7QUFDWixnRUFDc0Q7QUFDeEQsaUJBQWMsb0NBQW9DLENBQUMsRUFBQTtBQUNuRCxpQkFBYywwQ0FBMEMsQ0FBQyxFQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGlzIGEgc2V0IG9mIGNsYXNzZXMgYW5kIG9iamVjdHMgdGhhdCBjYW4gYmUgdXNlZCBib3RoIGluIHRoZSBicm93c2VyIGFuZCBvbiB0aGUgc2VydmVyLlxuICovXG5leHBvcnQge0RPTSwgc2V0Um9vdERvbUFkYXB0ZXIsIERvbUFkYXB0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuZXhwb3J0IHtEb21SZW5kZXJlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fcmVuZGVyZXInO1xuZXhwb3J0IHtET0NVTUVOVH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fdG9rZW5zJztcbmV4cG9ydCB7U2hhcmVkU3R5bGVzSG9zdCwgRG9tU2hhcmVkU3R5bGVzSG9zdH0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9zaGFyZWRfc3R5bGVzX2hvc3QnO1xuZXhwb3J0IHtEb21FdmVudHNQbHVnaW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2RvbV9ldmVudHMnO1xuZXhwb3J0IHtcbiAgRVZFTlRfTUFOQUdFUl9QTFVHSU5TLFxuICBFdmVudE1hbmFnZXIsXG4gIEV2ZW50TWFuYWdlclBsdWdpblxufSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2V2ZW50cy9ldmVudF9tYW5hZ2VyJztcbmV4cG9ydCAqIGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZGVidWcvYnknO1xuZXhwb3J0ICogZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kZWJ1Zy9uZ19wcm9iZSc7XG4iXX0=