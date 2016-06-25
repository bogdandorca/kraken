/* */ 
"format cjs";
'use strict';var lang_1 = require('angular2/src/facade/lang');
// This is here only so that after TS transpilation the file is not empty.
// TODO(rado): find a better way to fix this, or remove if likely culprit
// https://github.com/systemjs/systemjs/issues/487 gets closed.
var __ignore_me = lang_1.global;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9yb3V0ZXIvaW50ZXJmYWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxxQkFBcUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVoRCwwRUFBMEU7QUFDMUUseUVBQXlFO0FBQ3pFLCtEQUErRDtBQUMvRCxJQUFJLFdBQVcsR0FBRyxhQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudEluc3RydWN0aW9ufSBmcm9tICcuL2luc3RydWN0aW9uJztcbmltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vLyBUaGlzIGlzIGhlcmUgb25seSBzbyB0aGF0IGFmdGVyIFRTIHRyYW5zcGlsYXRpb24gdGhlIGZpbGUgaXMgbm90IGVtcHR5LlxuLy8gVE9ETyhyYWRvKTogZmluZCBhIGJldHRlciB3YXkgdG8gZml4IHRoaXMsIG9yIHJlbW92ZSBpZiBsaWtlbHkgY3VscHJpdFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3N5c3RlbWpzL3N5c3RlbWpzL2lzc3Vlcy80ODcgZ2V0cyBjbG9zZWQuXG52YXIgX19pZ25vcmVfbWUgPSBnbG9iYWw7XG5cblxuLyoqXG4gKiBEZWZpbmVzIHJvdXRlIGxpZmVjeWNsZSBtZXRob2QgYHJvdXRlck9uQWN0aXZhdGVgLCB3aGljaCBpcyBjYWxsZWQgYnkgdGhlIHJvdXRlciBhdCB0aGUgZW5kIG9mIGFcbiAqIHN1Y2Nlc3NmdWwgcm91dGUgbmF2aWdhdGlvbi5cbiAqXG4gKiBGb3IgYSBzaW5nbGUgY29tcG9uZW50J3MgbmF2aWdhdGlvbiwgb25seSBvbmUgb2YgZWl0aGVyIHtAbGluayBPbkFjdGl2YXRlfSBvciB7QGxpbmsgT25SZXVzZX1cbiAqIHdpbGwgYmUgY2FsbGVkIGRlcGVuZGluZyBvbiB0aGUgcmVzdWx0IG9mIHtAbGluayBDYW5SZXVzZX0uXG4gKlxuICogVGhlIGByb3V0ZXJPbkFjdGl2YXRlYCBob29rIGlzIGNhbGxlZCB3aXRoIHR3byB7QGxpbmsgQ29tcG9uZW50SW5zdHJ1Y3Rpb259cyBhcyBwYXJhbWV0ZXJzLCB0aGVcbiAqIGZpcnN0XG4gKiByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgcm91dGUgYmVpbmcgbmF2aWdhdGVkIHRvLCBhbmQgdGhlIHNlY29uZCBwYXJhbWV0ZXIgcmVwcmVzZW50aW5nIHRoZVxuICogcHJldmlvdXMgcm91dGUgb3IgYG51bGxgLlxuICpcbiAqIElmIGByb3V0ZXJPbkFjdGl2YXRlYCByZXR1cm5zIGEgcHJvbWlzZSwgdGhlIHJvdXRlIGNoYW5nZSB3aWxsIHdhaXQgdW50aWwgdGhlIHByb21pc2Ugc2V0dGxlcyB0b1xuICogaW5zdGFudGlhdGUgYW5kIGFjdGl2YXRlIGNoaWxkIGNvbXBvbmVudHMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIHtAZXhhbXBsZSByb3V0ZXIvdHMvb25fYWN0aXZhdGUvb25fYWN0aXZhdGVfZXhhbXBsZS50cyByZWdpb249J3JvdXRlck9uQWN0aXZhdGUnfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE9uQWN0aXZhdGUge1xuICByb3V0ZXJPbkFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgcHJldkluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IGFueTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIHJvdXRlIGxpZmVjeWNsZSBtZXRob2QgYHJvdXRlck9uUmV1c2VgLCB3aGljaCBpcyBjYWxsZWQgYnkgdGhlIHJvdXRlciBhdCB0aGUgZW5kIG9mIGFcbiAqIHN1Y2Nlc3NmdWwgcm91dGUgbmF2aWdhdGlvbiB3aGVuIHtAbGluayBDYW5SZXVzZX0gaXMgaW1wbGVtZW50ZWQgYW5kIHJldHVybnMgb3IgcmVzb2x2ZXMgdG8gdHJ1ZS5cbiAqXG4gKiBGb3IgYSBzaW5nbGUgY29tcG9uZW50J3MgbmF2aWdhdGlvbiwgb25seSBvbmUgb2YgZWl0aGVyIHtAbGluayBPbkFjdGl2YXRlfSBvciB7QGxpbmsgT25SZXVzZX1cbiAqIHdpbGwgYmUgY2FsbGVkLCBkZXBlbmRpbmcgb24gdGhlIHJlc3VsdCBvZiB7QGxpbmsgQ2FuUmV1c2V9LlxuICpcbiAqIFRoZSBgcm91dGVyT25SZXVzZWAgaG9vayBpcyBjYWxsZWQgd2l0aCB0d28ge0BsaW5rIENvbXBvbmVudEluc3RydWN0aW9ufXMgYXMgcGFyYW1ldGVycywgdGhlXG4gKiBmaXJzdFxuICogcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IHJvdXRlIGJlaW5nIG5hdmlnYXRlZCB0bywgYW5kIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyB0aGVcbiAqIHByZXZpb3VzIHJvdXRlIG9yIGBudWxsYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICoge0BleGFtcGxlIHJvdXRlci90cy9yZXVzZS9yZXVzZV9leGFtcGxlLnRzIHJlZ2lvbj0ncmV1c2VDbXAnfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE9uUmV1c2Uge1xuICByb3V0ZXJPblJldXNlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHByZXZJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBhbnk7XG59XG5cbi8qKlxuICogRGVmaW5lcyByb3V0ZSBsaWZlY3ljbGUgbWV0aG9kIGByb3V0ZXJPbkRlYWN0aXZhdGVgLCB3aGljaCBpcyBjYWxsZWQgYnkgdGhlIHJvdXRlciBiZWZvcmVcbiAqIGRlc3Ryb3lpbmdcbiAqIGEgY29tcG9uZW50IGFzIHBhcnQgb2YgYSByb3V0ZSBjaGFuZ2UuXG4gKlxuICogVGhlIGByb3V0ZXJPbkRlYWN0aXZhdGVgIGhvb2sgaXMgY2FsbGVkIHdpdGggdHdvIHtAbGluayBDb21wb25lbnRJbnN0cnVjdGlvbn1zIGFzIHBhcmFtZXRlcnMsIHRoZVxuICogZmlyc3RcbiAqIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCByb3V0ZSBiZWluZyBuYXZpZ2F0ZWQgdG8sIGFuZCB0aGUgc2Vjb25kIHBhcmFtZXRlciByZXByZXNlbnRpbmcgdGhlXG4gKiBwcmV2aW91cyByb3V0ZS5cbiAqXG4gKiBJZiBgcm91dGVyT25EZWFjdGl2YXRlYCByZXR1cm5zIGEgcHJvbWlzZSwgdGhlIHJvdXRlIGNoYW5nZSB3aWxsIHdhaXQgdW50aWwgdGhlIHByb21pc2Ugc2V0dGxlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICoge0BleGFtcGxlIHJvdXRlci90cy9vbl9kZWFjdGl2YXRlL29uX2RlYWN0aXZhdGVfZXhhbXBsZS50cyByZWdpb249J3JvdXRlck9uRGVhY3RpdmF0ZSd9XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT25EZWFjdGl2YXRlIHtcbiAgcm91dGVyT25EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb246IENvbXBvbmVudEluc3RydWN0aW9uKTogYW55O1xufVxuXG4vKipcbiAqIERlZmluZXMgcm91dGUgbGlmZWN5Y2xlIG1ldGhvZCBgcm91dGVyQ2FuUmV1c2VgLCB3aGljaCBpcyBjYWxsZWQgYnkgdGhlIHJvdXRlciB0byBkZXRlcm1pbmVcbiAqIHdoZXRoZXIgYVxuICogY29tcG9uZW50IHNob3VsZCBiZSByZXVzZWQgYWNyb3NzIHJvdXRlcywgb3Igd2hldGhlciB0byBkZXN0cm95IGFuZCBpbnN0YW50aWF0ZSBhIG5ldyBjb21wb25lbnQuXG4gKlxuICogVGhlIGByb3V0ZXJDYW5SZXVzZWAgaG9vayBpcyBjYWxsZWQgd2l0aCB0d28ge0BsaW5rIENvbXBvbmVudEluc3RydWN0aW9ufXMgYXMgcGFyYW1ldGVycywgdGhlXG4gKiBmaXJzdFxuICogcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IHJvdXRlIGJlaW5nIG5hdmlnYXRlZCB0bywgYW5kIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyB0aGVcbiAqIHByZXZpb3VzIHJvdXRlLlxuICpcbiAqIElmIGByb3V0ZXJDYW5SZXVzZWAgcmV0dXJucyBvciByZXNvbHZlcyB0byBgdHJ1ZWAsIHRoZSBjb21wb25lbnQgaW5zdGFuY2Ugd2lsbCBiZSByZXVzZWQgYW5kIHRoZVxuICoge0BsaW5rIE9uRGVhY3RpdmF0ZX0gaG9vayB3aWxsIGJlIHJ1bi4gSWYgYHJvdXRlckNhblJldXNlYCByZXR1cm5zIG9yIHJlc29sdmVzIHRvIGBmYWxzZWAsIGEgbmV3XG4gKiBjb21wb25lbnQgd2lsbCBiZSBpbnN0YW50aWF0ZWQsIGFuZCB0aGUgZXhpc3RpbmcgY29tcG9uZW50IHdpbGwgYmUgZGVhY3RpdmF0ZWQgYW5kIHJlbW92ZWQgYXNcbiAqIHBhcnQgb2YgdGhlIG5hdmlnYXRpb24uXG4gKlxuICogSWYgYHJvdXRlckNhblJldXNlYCB0aHJvd3Mgb3IgcmVqZWN0cywgdGhlIG5hdmlnYXRpb24gd2lsbCBiZSBjYW5jZWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIHtAZXhhbXBsZSByb3V0ZXIvdHMvcmV1c2UvcmV1c2VfZXhhbXBsZS50cyByZWdpb249J3JldXNlQ21wJ31cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYW5SZXVzZSB7XG4gIHJvdXRlckNhblJldXNlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHByZXZJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24pOiBhbnk7XG59XG5cbi8qKlxuICogRGVmaW5lcyByb3V0ZSBsaWZlY3ljbGUgbWV0aG9kIGByb3V0ZXJDYW5EZWFjdGl2YXRlYCwgd2hpY2ggaXMgY2FsbGVkIGJ5IHRoZSByb3V0ZXIgdG8gZGV0ZXJtaW5lXG4gKiBpZiBhIGNvbXBvbmVudCBjYW4gYmUgcmVtb3ZlZCBhcyBwYXJ0IG9mIGEgbmF2aWdhdGlvbi5cbiAqXG4gKiBUaGUgYHJvdXRlckNhbkRlYWN0aXZhdGVgIGhvb2sgaXMgY2FsbGVkIHdpdGggdHdvIHtAbGluayBDb21wb25lbnRJbnN0cnVjdGlvbn1zIGFzIHBhcmFtZXRlcnMsXG4gKiB0aGVcbiAqIGZpcnN0IHJlcHJlc2VudGluZyB0aGUgY3VycmVudCByb3V0ZSBiZWluZyBuYXZpZ2F0ZWQgdG8sIGFuZCB0aGUgc2Vjb25kIHBhcmFtZXRlclxuICogcmVwcmVzZW50aW5nIHRoZSBwcmV2aW91cyByb3V0ZS5cbiAqXG4gKiBJZiBgcm91dGVyQ2FuRGVhY3RpdmF0ZWAgcmV0dXJucyBvciByZXNvbHZlcyB0byBgZmFsc2VgLCB0aGUgbmF2aWdhdGlvbiBpcyBjYW5jZWxsZWQuIElmIGl0XG4gKiByZXR1cm5zIG9yXG4gKiByZXNvbHZlcyB0byBgdHJ1ZWAsIHRoZW4gdGhlIG5hdmlnYXRpb24gY29udGludWVzLCBhbmQgdGhlIGNvbXBvbmVudCB3aWxsIGJlIGRlYWN0aXZhdGVkXG4gKiAodGhlIHtAbGluayBPbkRlYWN0aXZhdGV9IGhvb2sgd2lsbCBiZSBydW4pIGFuZCByZW1vdmVkLlxuICpcbiAqIElmIGByb3V0ZXJDYW5EZWFjdGl2YXRlYCB0aHJvd3Mgb3IgcmVqZWN0cywgdGhlIG5hdmlnYXRpb24gaXMgYWxzbyBjYW5jZWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIHtAZXhhbXBsZSByb3V0ZXIvdHMvY2FuX2RlYWN0aXZhdGUvY2FuX2RlYWN0aXZhdGVfZXhhbXBsZS50cyByZWdpb249J3JvdXRlckNhbkRlYWN0aXZhdGUnfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIENhbkRlYWN0aXZhdGUge1xuICByb3V0ZXJDYW5EZWFjdGl2YXRlKG5leHRJbnN0cnVjdGlvbjogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgcHJldkluc3RydWN0aW9uOiBDb21wb25lbnRJbnN0cnVjdGlvbik6IGFueTtcbn1cbiJdfQ==