/* */ 
"format esm";
export class RenderComponentType {
    constructor(id, encapsulation, styles) {
        this.id = id;
        this.encapsulation = encapsulation;
        this.styles = styles;
    }
}
export class RenderDebugInfo {
    constructor(injector, component, providerTokens, locals) {
        this.injector = injector;
        this.component = component;
        this.providerTokens = providerTokens;
        this.locals = locals;
    }
}
export class Renderer {
}
/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use {@link #setElementProperty} or {@link #setElementAttribute}
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
 */
export class RootRenderer {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaS50cyJdLCJuYW1lcyI6WyJSZW5kZXJDb21wb25lbnRUeXBlIiwiUmVuZGVyQ29tcG9uZW50VHlwZS5jb25zdHJ1Y3RvciIsIlJlbmRlckRlYnVnSW5mbyIsIlJlbmRlckRlYnVnSW5mby5jb25zdHJ1Y3RvciIsIlJlbmRlcmVyIiwiUm9vdFJlbmRlcmVyIl0sIm1hcHBpbmdzIjoiQUFHQTtJQUNFQSxZQUFtQkEsRUFBVUEsRUFBU0EsYUFBZ0NBLEVBQ25EQSxNQUE2QkE7UUFEN0JDLE9BQUVBLEdBQUZBLEVBQUVBLENBQVFBO1FBQVNBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFtQkE7UUFDbkRBLFdBQU1BLEdBQU5BLE1BQU1BLENBQXVCQTtJQUFHQSxDQUFDQTtBQUN0REQsQ0FBQ0E7QUFFRDtJQUNFRSxZQUFtQkEsUUFBa0JBLEVBQVNBLFNBQWNBLEVBQVNBLGNBQXFCQSxFQUN2RUEsTUFBd0JBO1FBRHhCQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFVQTtRQUFTQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFLQTtRQUFTQSxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBT0E7UUFDdkVBLFdBQU1BLEdBQU5BLE1BQU1BLENBQWtCQTtJQUFHQSxDQUFDQTtBQUNqREQsQ0FBQ0E7QUFJRDtBQTRDQUUsQ0FBQ0E7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUVIO0FBRUFDLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7SW5qZWN0b3IsIEluamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuZXhwb3J0IGNsYXNzIFJlbmRlckNvbXBvbmVudFR5cGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaWQ6IHN0cmluZywgcHVibGljIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLFxuICAgICAgICAgICAgICBwdWJsaWMgc3R5bGVzOiBBcnJheTxzdHJpbmcgfCBhbnlbXT4pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJEZWJ1Z0luZm8ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yLCBwdWJsaWMgY29tcG9uZW50OiBhbnksIHB1YmxpYyBwcm92aWRlclRva2VuczogYW55W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBsb2NhbHM6IE1hcDxzdHJpbmcsIGFueT4pIHt9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyZW50UmVuZGVyZXIgeyByZW5kZXJDb21wb25lbnQoY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSk6IFJlbmRlcmVyOyB9XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZW5kZXJlciBpbXBsZW1lbnRzIFBhcmVudFJlbmRlcmVyIHtcbiAgYWJzdHJhY3QgcmVuZGVyQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFJlbmRlckNvbXBvbmVudFR5cGUpOiBSZW5kZXJlcjtcblxuICBhYnN0cmFjdCBzZWxlY3RSb290RWxlbWVudChzZWxlY3Rvcjogc3RyaW5nKTogYW55O1xuXG4gIGFic3RyYWN0IGNyZWF0ZUVsZW1lbnQocGFyZW50RWxlbWVudDogYW55LCBuYW1lOiBzdHJpbmcpOiBhbnk7XG5cbiAgYWJzdHJhY3QgY3JlYXRlVmlld1Jvb3QoaG9zdEVsZW1lbnQ6IGFueSk6IGFueTtcblxuICBhYnN0cmFjdCBjcmVhdGVUZW1wbGF0ZUFuY2hvcihwYXJlbnRFbGVtZW50OiBhbnkpOiBhbnk7XG5cbiAgYWJzdHJhY3QgY3JlYXRlVGV4dChwYXJlbnRFbGVtZW50OiBhbnksIHZhbHVlOiBzdHJpbmcpOiBhbnk7XG5cbiAgYWJzdHJhY3QgcHJvamVjdE5vZGVzKHBhcmVudEVsZW1lbnQ6IGFueSwgbm9kZXM6IGFueVtdKTtcblxuICBhYnN0cmFjdCBhdHRhY2hWaWV3QWZ0ZXIobm9kZTogYW55LCB2aWV3Um9vdE5vZGVzOiBhbnlbXSk7XG5cbiAgYWJzdHJhY3QgZGV0YWNoVmlldyh2aWV3Um9vdE5vZGVzOiBhbnlbXSk7XG5cbiAgYWJzdHJhY3QgZGVzdHJveVZpZXcoaG9zdEVsZW1lbnQ6IGFueSwgdmlld0FsbE5vZGVzOiBhbnlbXSk7XG5cbiAgYWJzdHJhY3QgbGlzdGVuKHJlbmRlckVsZW1lbnQ6IGFueSwgbmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pOiBGdW5jdGlvbjtcblxuICBhYnN0cmFjdCBsaXN0ZW5HbG9iYWwodGFyZ2V0OiBzdHJpbmcsIG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKTogRnVuY3Rpb247XG5cbiAgYWJzdHJhY3Qgc2V0RWxlbWVudFByb3BlcnR5KHJlbmRlckVsZW1lbnQ6IGFueSwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHByb3BlcnR5VmFsdWU6IGFueSk7XG5cbiAgYWJzdHJhY3Qgc2V0RWxlbWVudEF0dHJpYnV0ZShyZW5kZXJFbGVtZW50OiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgYXR0cmlidXRlVmFsdWU6IHN0cmluZyk7XG5cbiAgLyoqXG4gICAqIFVzZWQgb25seSBpbiBkZWJ1ZyBtb2RlIHRvIHNlcmlhbGl6ZSBwcm9wZXJ0eSBjaGFuZ2VzIHRvIGNvbW1lbnQgbm9kZXMsXG4gICAqIHN1Y2ggYXMgPHRlbXBsYXRlPiBwbGFjZWhvbGRlcnMuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRCaW5kaW5nRGVidWdJbmZvKHJlbmRlckVsZW1lbnQ6IGFueSwgcHJvcGVydHlOYW1lOiBzdHJpbmcsIHByb3BlcnR5VmFsdWU6IHN0cmluZyk7XG5cbiAgYWJzdHJhY3Qgc2V0RWxlbWVudERlYnVnSW5mbyhyZW5kZXJFbGVtZW50OiBhbnksIGluZm86IFJlbmRlckRlYnVnSW5mbyk7XG5cbiAgYWJzdHJhY3Qgc2V0RWxlbWVudENsYXNzKHJlbmRlckVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcsIGlzQWRkOiBib29sZWFuKTtcblxuICBhYnN0cmFjdCBzZXRFbGVtZW50U3R5bGUocmVuZGVyRWxlbWVudDogYW55LCBzdHlsZU5hbWU6IHN0cmluZywgc3R5bGVWYWx1ZTogc3RyaW5nKTtcblxuICBhYnN0cmFjdCBpbnZva2VFbGVtZW50TWV0aG9kKHJlbmRlckVsZW1lbnQ6IGFueSwgbWV0aG9kTmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSk7XG5cbiAgYWJzdHJhY3Qgc2V0VGV4dChyZW5kZXJOb2RlOiBhbnksIHRleHQ6IHN0cmluZyk7XG59XG5cbi8qKlxuICogSW5qZWN0YWJsZSBzZXJ2aWNlIHRoYXQgcHJvdmlkZXMgYSBsb3ctbGV2ZWwgaW50ZXJmYWNlIGZvciBtb2RpZnlpbmcgdGhlIFVJLlxuICpcbiAqIFVzZSB0aGlzIHNlcnZpY2UgdG8gYnlwYXNzIEFuZ3VsYXIncyB0ZW1wbGF0aW5nIGFuZCBtYWtlIGN1c3RvbSBVSSBjaGFuZ2VzIHRoYXQgY2FuJ3QgYmVcbiAqIGV4cHJlc3NlZCBkZWNsYXJhdGl2ZWx5LiBGb3IgZXhhbXBsZSBpZiB5b3UgbmVlZCB0byBzZXQgYSBwcm9wZXJ0eSBvciBhbiBhdHRyaWJ1dGUgd2hvc2UgbmFtZSBpc1xuICogbm90IHN0YXRpY2FsbHkga25vd24sIHVzZSB7QGxpbmsgI3NldEVsZW1lbnRQcm9wZXJ0eX0gb3Ige0BsaW5rICNzZXRFbGVtZW50QXR0cmlidXRlfVxuICogcmVzcGVjdGl2ZWx5LlxuICpcbiAqIElmIHlvdSBhcmUgaW1wbGVtZW50aW5nIGEgY3VzdG9tIHJlbmRlcmVyLCB5b3UgbXVzdCBpbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UuXG4gKlxuICogVGhlIGRlZmF1bHQgUmVuZGVyZXIgaW1wbGVtZW50YXRpb24gaXMgYERvbVJlbmRlcmVyYC4gQWxzbyBhdmFpbGFibGUgaXMgYFdlYldvcmtlclJlbmRlcmVyYC5cbiAqL1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUm9vdFJlbmRlcmVyIGltcGxlbWVudHMgUGFyZW50UmVuZGVyZXIge1xuICBhYnN0cmFjdCByZW5kZXJDb21wb25lbnQoY29tcG9uZW50VHlwZTogUmVuZGVyQ29tcG9uZW50VHlwZSk6IFJlbmRlcmVyO1xufVxuIl19