/* */ 
"format cjs";
'use strict';/**
 * @module
 * @description
 * The `di` module provides dependency injection container services.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var metadata_1 = require('./di/metadata');
exports.InjectMetadata = metadata_1.InjectMetadata;
exports.OptionalMetadata = metadata_1.OptionalMetadata;
exports.InjectableMetadata = metadata_1.InjectableMetadata;
exports.SelfMetadata = metadata_1.SelfMetadata;
exports.HostMetadata = metadata_1.HostMetadata;
exports.SkipSelfMetadata = metadata_1.SkipSelfMetadata;
exports.DependencyMetadata = metadata_1.DependencyMetadata;
// we have to reexport * because Dart and TS export two different sets of types
__export(require('./di/decorators'));
var forward_ref_1 = require('./di/forward_ref');
exports.forwardRef = forward_ref_1.forwardRef;
exports.resolveForwardRef = forward_ref_1.resolveForwardRef;
var injector_1 = require('./di/injector');
exports.Injector = injector_1.Injector;
var provider_1 = require('./di/provider');
exports.Binding = provider_1.Binding;
exports.ProviderBuilder = provider_1.ProviderBuilder;
exports.ResolvedFactory = provider_1.ResolvedFactory;
exports.Dependency = provider_1.Dependency;
exports.bind = provider_1.bind;
exports.Provider = provider_1.Provider;
exports.provide = provider_1.provide;
var key_1 = require('./di/key');
exports.Key = key_1.Key;
var exceptions_1 = require('./di/exceptions');
exports.NoProviderError = exceptions_1.NoProviderError;
exports.AbstractProviderError = exceptions_1.AbstractProviderError;
exports.CyclicDependencyError = exceptions_1.CyclicDependencyError;
exports.InstantiationError = exceptions_1.InstantiationError;
exports.InvalidProviderError = exceptions_1.InvalidProviderError;
exports.NoAnnotationError = exceptions_1.NoAnnotationError;
exports.OutOfBoundsError = exceptions_1.OutOfBoundsError;
var opaque_token_1 = require('./di/opaque_token');
exports.OpaqueToken = opaque_token_1.OpaqueToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9kaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHOzs7O0FBRUgseUJBUU8sZUFBZSxDQUFDO0FBUHJCLG1EQUFjO0FBQ2QsdURBQWdCO0FBQ2hCLDJEQUFrQjtBQUNsQiwrQ0FBWTtBQUNaLCtDQUFZO0FBQ1osdURBQWdCO0FBQ2hCLDJEQUNxQjtBQUV2QiwrRUFBK0U7QUFDL0UsaUJBQWMsaUJBQWlCLENBQUMsRUFBQTtBQUVoQyw0QkFBMEQsa0JBQWtCLENBQUM7QUFBckUsOENBQVU7QUFBRSw0REFBeUQ7QUFDN0UseUJBQXVCLGVBQWUsQ0FBQztBQUEvQix1Q0FBK0I7QUFDdkMseUJBV08sZUFBZSxDQUFDO0FBVnJCLHFDQUFPO0FBQ1AscURBQWU7QUFFZixxREFBZTtBQUNmLDJDQUFVO0FBQ1YsK0JBQUk7QUFFSix1Q0FBUTtBQUVSLHFDQUNxQjtBQUN2QixvQkFBa0IsVUFBVSxDQUFDO0FBQXJCLHdCQUFxQjtBQUM3QiwyQkFRTyxpQkFBaUIsQ0FBQztBQVB2Qix1REFBZTtBQUNmLG1FQUFxQjtBQUNyQixtRUFBcUI7QUFDckIsNkRBQWtCO0FBQ2xCLGlFQUFvQjtBQUNwQiwyREFBaUI7QUFDakIseURBQ3VCO0FBQ3pCLDZCQUEwQixtQkFBbUIsQ0FBQztBQUF0QyxpREFBc0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIGBkaWAgbW9kdWxlIHByb3ZpZGVzIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGNvbnRhaW5lciBzZXJ2aWNlcy5cbiAqL1xuXG5leHBvcnQge1xuICBJbmplY3RNZXRhZGF0YSxcbiAgT3B0aW9uYWxNZXRhZGF0YSxcbiAgSW5qZWN0YWJsZU1ldGFkYXRhLFxuICBTZWxmTWV0YWRhdGEsXG4gIEhvc3RNZXRhZGF0YSxcbiAgU2tpcFNlbGZNZXRhZGF0YSxcbiAgRGVwZW5kZW5jeU1ldGFkYXRhXG59IGZyb20gJy4vZGkvbWV0YWRhdGEnO1xuXG4vLyB3ZSBoYXZlIHRvIHJlZXhwb3J0ICogYmVjYXVzZSBEYXJ0IGFuZCBUUyBleHBvcnQgdHdvIGRpZmZlcmVudCBzZXRzIG9mIHR5cGVzXG5leHBvcnQgKiBmcm9tICcuL2RpL2RlY29yYXRvcnMnO1xuXG5leHBvcnQge2ZvcndhcmRSZWYsIHJlc29sdmVGb3J3YXJkUmVmLCBGb3J3YXJkUmVmRm59IGZyb20gJy4vZGkvZm9yd2FyZF9yZWYnO1xuZXhwb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi9kaS9pbmplY3Rvcic7XG5leHBvcnQge1xuICBCaW5kaW5nLFxuICBQcm92aWRlckJ1aWxkZXIsXG4gIFJlc29sdmVkQmluZGluZyxcbiAgUmVzb2x2ZWRGYWN0b3J5LFxuICBEZXBlbmRlbmN5LFxuICBiaW5kLFxuXG4gIFByb3ZpZGVyLFxuICBSZXNvbHZlZFByb3ZpZGVyLFxuICBwcm92aWRlXG59IGZyb20gJy4vZGkvcHJvdmlkZXInO1xuZXhwb3J0IHtLZXl9IGZyb20gJy4vZGkva2V5JztcbmV4cG9ydCB7XG4gIE5vUHJvdmlkZXJFcnJvcixcbiAgQWJzdHJhY3RQcm92aWRlckVycm9yLFxuICBDeWNsaWNEZXBlbmRlbmN5RXJyb3IsXG4gIEluc3RhbnRpYXRpb25FcnJvcixcbiAgSW52YWxpZFByb3ZpZGVyRXJyb3IsXG4gIE5vQW5ub3RhdGlvbkVycm9yLFxuICBPdXRPZkJvdW5kc0Vycm9yXG59IGZyb20gJy4vZGkvZXhjZXB0aW9ucyc7XG5leHBvcnQge09wYXF1ZVRva2VufSBmcm9tICcuL2RpL29wYXF1ZV90b2tlbic7XG4iXX0=