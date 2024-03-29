/* */ 
"format cjs";
'use strict';var iterable_differs_1 = require('./differs/iterable_differs');
var default_iterable_differ_1 = require('./differs/default_iterable_differ');
var keyvalue_differs_1 = require('./differs/keyvalue_differs');
var default_keyvalue_differ_1 = require('./differs/default_keyvalue_differ');
var lang_1 = require('angular2/src/facade/lang');
var default_keyvalue_differ_2 = require('./differs/default_keyvalue_differ');
exports.DefaultKeyValueDifferFactory = default_keyvalue_differ_2.DefaultKeyValueDifferFactory;
exports.KeyValueChangeRecord = default_keyvalue_differ_2.KeyValueChangeRecord;
var default_iterable_differ_2 = require('./differs/default_iterable_differ');
exports.DefaultIterableDifferFactory = default_iterable_differ_2.DefaultIterableDifferFactory;
exports.CollectionChangeRecord = default_iterable_differ_2.CollectionChangeRecord;
var ast_1 = require('./parser/ast');
exports.ASTWithSource = ast_1.ASTWithSource;
exports.AST = ast_1.AST;
exports.AstTransformer = ast_1.AstTransformer;
exports.PropertyRead = ast_1.PropertyRead;
exports.LiteralArray = ast_1.LiteralArray;
exports.ImplicitReceiver = ast_1.ImplicitReceiver;
var lexer_1 = require('./parser/lexer');
exports.Lexer = lexer_1.Lexer;
var parser_1 = require('./parser/parser');
exports.Parser = parser_1.Parser;
var locals_1 = require('./parser/locals');
exports.Locals = locals_1.Locals;
var exceptions_1 = require('./exceptions');
exports.DehydratedException = exceptions_1.DehydratedException;
exports.ExpressionChangedAfterItHasBeenCheckedException = exceptions_1.ExpressionChangedAfterItHasBeenCheckedException;
exports.ChangeDetectionError = exceptions_1.ChangeDetectionError;
var interfaces_1 = require('./interfaces');
exports.ChangeDetectorDefinition = interfaces_1.ChangeDetectorDefinition;
exports.DebugContext = interfaces_1.DebugContext;
exports.ChangeDetectorGenConfig = interfaces_1.ChangeDetectorGenConfig;
var constants_1 = require('./constants');
exports.ChangeDetectionStrategy = constants_1.ChangeDetectionStrategy;
exports.CHANGE_DETECTION_STRATEGY_VALUES = constants_1.CHANGE_DETECTION_STRATEGY_VALUES;
var proto_change_detector_1 = require('./proto_change_detector');
exports.DynamicProtoChangeDetector = proto_change_detector_1.DynamicProtoChangeDetector;
var jit_proto_change_detector_1 = require('./jit_proto_change_detector');
exports.JitProtoChangeDetector = jit_proto_change_detector_1.JitProtoChangeDetector;
var binding_record_1 = require('./binding_record');
exports.BindingRecord = binding_record_1.BindingRecord;
exports.BindingTarget = binding_record_1.BindingTarget;
var directive_record_1 = require('./directive_record');
exports.DirectiveIndex = directive_record_1.DirectiveIndex;
exports.DirectiveRecord = directive_record_1.DirectiveRecord;
var dynamic_change_detector_1 = require('./dynamic_change_detector');
exports.DynamicChangeDetector = dynamic_change_detector_1.DynamicChangeDetector;
var change_detector_ref_1 = require('./change_detector_ref');
exports.ChangeDetectorRef = change_detector_ref_1.ChangeDetectorRef;
var iterable_differs_2 = require('./differs/iterable_differs');
exports.IterableDiffers = iterable_differs_2.IterableDiffers;
var keyvalue_differs_2 = require('./differs/keyvalue_differs');
exports.KeyValueDiffers = keyvalue_differs_2.KeyValueDiffers;
var change_detection_util_1 = require('./change_detection_util');
exports.WrappedValue = change_detection_util_1.WrappedValue;
exports.SimpleChange = change_detection_util_1.SimpleChange;
/**
 * Structural diffing for `Object`s and `Map`s.
 */
exports.keyValDiff = lang_1.CONST_EXPR([lang_1.CONST_EXPR(new default_keyvalue_differ_1.DefaultKeyValueDifferFactory())]);
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 */
exports.iterableDiff = lang_1.CONST_EXPR([lang_1.CONST_EXPR(new default_iterable_differ_1.DefaultIterableDifferFactory())]);
exports.defaultIterableDiffers = lang_1.CONST_EXPR(new iterable_differs_1.IterableDiffers(exports.iterableDiff));
exports.defaultKeyValueDiffers = lang_1.CONST_EXPR(new keyvalue_differs_1.KeyValueDiffers(exports.keyValDiff));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlX2RldGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxpQ0FBcUQsNEJBQTRCLENBQUMsQ0FBQTtBQUNsRix3Q0FBMkMsbUNBQW1DLENBQUMsQ0FBQTtBQUMvRSxpQ0FBcUQsNEJBQTRCLENBQUMsQ0FBQTtBQUNsRix3Q0FHTyxtQ0FBbUMsQ0FBQyxDQUFBO0FBQzNDLHFCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBRXBELHdDQUdPLG1DQUFtQyxDQUFDO0FBRnpDLDhGQUE0QjtBQUM1Qiw4RUFDeUM7QUFDM0Msd0NBR08sbUNBQW1DLENBQUM7QUFGekMsOEZBQTRCO0FBQzVCLGtGQUN5QztBQUMzQyxvQkFPTyxjQUFjLENBQUM7QUFOcEIsNENBQWE7QUFDYix3QkFBRztBQUNILDhDQUFjO0FBQ2QsMENBQVk7QUFDWiwwQ0FBWTtBQUNaLGtEQUNvQjtBQUV0QixzQkFBb0IsZ0JBQWdCLENBQUM7QUFBN0IsOEJBQTZCO0FBQ3JDLHVCQUFxQixpQkFBaUIsQ0FBQztBQUEvQixpQ0FBK0I7QUFDdkMsdUJBQXFCLGlCQUFpQixDQUFDO0FBQS9CLGlDQUErQjtBQUV2QywyQkFJTyxjQUFjLENBQUM7QUFIcEIsK0RBQW1CO0FBQ25CLHVIQUErQztBQUMvQyxpRUFDb0I7QUFDdEIsMkJBT08sY0FBYyxDQUFDO0FBSHBCLHlFQUF3QjtBQUN4QixpREFBWTtBQUNaLHVFQUNvQjtBQUN0QiwwQkFBd0UsYUFBYSxDQUFDO0FBQTlFLHNFQUF1QjtBQUFFLHdGQUFxRDtBQUN0RixzQ0FBeUMseUJBQXlCLENBQUM7QUFBM0Qsd0ZBQTJEO0FBQ25FLDBDQUFxQyw2QkFBNkIsQ0FBQztBQUEzRCxvRkFBMkQ7QUFDbkUsK0JBQTJDLGtCQUFrQixDQUFDO0FBQXRELHVEQUFhO0FBQUUsdURBQXVDO0FBQzlELGlDQUE4QyxvQkFBb0IsQ0FBQztBQUEzRCwyREFBYztBQUFFLDZEQUEyQztBQUNuRSx3Q0FBb0MsMkJBQTJCLENBQUM7QUFBeEQsZ0ZBQXdEO0FBQ2hFLG9DQUFnQyx1QkFBdUIsQ0FBQztBQUFoRCxvRUFBZ0Q7QUFDeEQsaUNBS08sNEJBQTRCLENBQUM7QUFKbEMsNkRBSWtDO0FBQ3BDLGlDQUFxRSw0QkFBNEIsQ0FBQztBQUExRiw2REFBMEY7QUFFbEcsc0NBQXlDLHlCQUF5QixDQUFDO0FBQTNELDREQUFZO0FBQUUsNERBQTZDO0FBRW5FOztHQUVHO0FBQ1Usa0JBQVUsR0FDbkIsaUJBQVUsQ0FBQyxDQUFDLGlCQUFVLENBQUMsSUFBSSxzREFBNEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWpFOztHQUVHO0FBQ1Usb0JBQVksR0FDckIsaUJBQVUsQ0FBQyxDQUFDLGlCQUFVLENBQUMsSUFBSSxzREFBNEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRXBELDhCQUFzQixHQUFHLGlCQUFVLENBQUMsSUFBSSxrQ0FBZSxDQUFDLG9CQUFZLENBQUMsQ0FBQyxDQUFDO0FBRXZFLDhCQUFzQixHQUFHLGlCQUFVLENBQUMsSUFBSSxrQ0FBZSxDQUFDLGtCQUFVLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJdGVyYWJsZURpZmZlcnMsIEl0ZXJhYmxlRGlmZmVyRmFjdG9yeX0gZnJvbSAnLi9kaWZmZXJzL2l0ZXJhYmxlX2RpZmZlcnMnO1xuaW1wb3J0IHtEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5fSBmcm9tICcuL2RpZmZlcnMvZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXInO1xuaW1wb3J0IHtLZXlWYWx1ZURpZmZlcnMsIEtleVZhbHVlRGlmZmVyRmFjdG9yeX0gZnJvbSAnLi9kaWZmZXJzL2tleXZhbHVlX2RpZmZlcnMnO1xuaW1wb3J0IHtcbiAgRGVmYXVsdEtleVZhbHVlRGlmZmVyRmFjdG9yeSxcbiAgS2V5VmFsdWVDaGFuZ2VSZWNvcmRcbn0gZnJvbSAnLi9kaWZmZXJzL2RlZmF1bHRfa2V5dmFsdWVfZGlmZmVyJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuZXhwb3J0IHtcbiAgRGVmYXVsdEtleVZhbHVlRGlmZmVyRmFjdG9yeSxcbiAgS2V5VmFsdWVDaGFuZ2VSZWNvcmRcbn0gZnJvbSAnLi9kaWZmZXJzL2RlZmF1bHRfa2V5dmFsdWVfZGlmZmVyJztcbmV4cG9ydCB7XG4gIERlZmF1bHRJdGVyYWJsZURpZmZlckZhY3RvcnksXG4gIENvbGxlY3Rpb25DaGFuZ2VSZWNvcmRcbn0gZnJvbSAnLi9kaWZmZXJzL2RlZmF1bHRfaXRlcmFibGVfZGlmZmVyJztcbmV4cG9ydCB7XG4gIEFTVFdpdGhTb3VyY2UsXG4gIEFTVCxcbiAgQXN0VHJhbnNmb3JtZXIsXG4gIFByb3BlcnR5UmVhZCxcbiAgTGl0ZXJhbEFycmF5LFxuICBJbXBsaWNpdFJlY2VpdmVyXG59IGZyb20gJy4vcGFyc2VyL2FzdCc7XG5cbmV4cG9ydCB7TGV4ZXJ9IGZyb20gJy4vcGFyc2VyL2xleGVyJztcbmV4cG9ydCB7UGFyc2VyfSBmcm9tICcuL3BhcnNlci9wYXJzZXInO1xuZXhwb3J0IHtMb2NhbHN9IGZyb20gJy4vcGFyc2VyL2xvY2Fscyc7XG5cbmV4cG9ydCB7XG4gIERlaHlkcmF0ZWRFeGNlcHRpb24sXG4gIEV4cHJlc3Npb25DaGFuZ2VkQWZ0ZXJJdEhhc0JlZW5DaGVja2VkRXhjZXB0aW9uLFxuICBDaGFuZ2VEZXRlY3Rpb25FcnJvclxufSBmcm9tICcuL2V4Y2VwdGlvbnMnO1xuZXhwb3J0IHtcbiAgUHJvdG9DaGFuZ2VEZXRlY3RvcixcbiAgQ2hhbmdlRGV0ZWN0b3IsXG4gIENoYW5nZURpc3BhdGNoZXIsXG4gIENoYW5nZURldGVjdG9yRGVmaW5pdGlvbixcbiAgRGVidWdDb250ZXh0LFxuICBDaGFuZ2VEZXRlY3RvckdlbkNvbmZpZ1xufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuZXhwb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ0hBTkdFX0RFVEVDVElPTl9TVFJBVEVHWV9WQUxVRVN9IGZyb20gJy4vY29uc3RhbnRzJztcbmV4cG9ydCB7RHluYW1pY1Byb3RvQ2hhbmdlRGV0ZWN0b3J9IGZyb20gJy4vcHJvdG9fY2hhbmdlX2RldGVjdG9yJztcbmV4cG9ydCB7Sml0UHJvdG9DaGFuZ2VEZXRlY3Rvcn0gZnJvbSAnLi9qaXRfcHJvdG9fY2hhbmdlX2RldGVjdG9yJztcbmV4cG9ydCB7QmluZGluZ1JlY29yZCwgQmluZGluZ1RhcmdldH0gZnJvbSAnLi9iaW5kaW5nX3JlY29yZCc7XG5leHBvcnQge0RpcmVjdGl2ZUluZGV4LCBEaXJlY3RpdmVSZWNvcmR9IGZyb20gJy4vZGlyZWN0aXZlX3JlY29yZCc7XG5leHBvcnQge0R5bmFtaWNDaGFuZ2VEZXRlY3Rvcn0gZnJvbSAnLi9keW5hbWljX2NoYW5nZV9kZXRlY3Rvcic7XG5leHBvcnQge0NoYW5nZURldGVjdG9yUmVmfSBmcm9tICcuL2NoYW5nZV9kZXRlY3Rvcl9yZWYnO1xuZXhwb3J0IHtcbiAgSXRlcmFibGVEaWZmZXJzLFxuICBJdGVyYWJsZURpZmZlcixcbiAgSXRlcmFibGVEaWZmZXJGYWN0b3J5LFxuICBUcmFja0J5Rm5cbn0gZnJvbSAnLi9kaWZmZXJzL2l0ZXJhYmxlX2RpZmZlcnMnO1xuZXhwb3J0IHtLZXlWYWx1ZURpZmZlcnMsIEtleVZhbHVlRGlmZmVyLCBLZXlWYWx1ZURpZmZlckZhY3Rvcnl9IGZyb20gJy4vZGlmZmVycy9rZXl2YWx1ZV9kaWZmZXJzJztcbmV4cG9ydCB7UGlwZVRyYW5zZm9ybX0gZnJvbSAnLi9waXBlX3RyYW5zZm9ybSc7XG5leHBvcnQge1dyYXBwZWRWYWx1ZSwgU2ltcGxlQ2hhbmdlfSBmcm9tICcuL2NoYW5nZV9kZXRlY3Rpb25fdXRpbCc7XG5cbi8qKlxuICogU3RydWN0dXJhbCBkaWZmaW5nIGZvciBgT2JqZWN0YHMgYW5kIGBNYXBgcy5cbiAqL1xuZXhwb3J0IGNvbnN0IGtleVZhbERpZmY6IEtleVZhbHVlRGlmZmVyRmFjdG9yeVtdID1cbiAgICBDT05TVF9FWFBSKFtDT05TVF9FWFBSKG5ldyBEZWZhdWx0S2V5VmFsdWVEaWZmZXJGYWN0b3J5KCkpXSk7XG5cbi8qKlxuICogU3RydWN0dXJhbCBkaWZmaW5nIGZvciBgSXRlcmFibGVgIHR5cGVzIHN1Y2ggYXMgYEFycmF5YHMuXG4gKi9cbmV4cG9ydCBjb25zdCBpdGVyYWJsZURpZmY6IEl0ZXJhYmxlRGlmZmVyRmFjdG9yeVtdID1cbiAgICBDT05TVF9FWFBSKFtDT05TVF9FWFBSKG5ldyBEZWZhdWx0SXRlcmFibGVEaWZmZXJGYWN0b3J5KCkpXSk7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0SXRlcmFibGVEaWZmZXJzID0gQ09OU1RfRVhQUihuZXcgSXRlcmFibGVEaWZmZXJzKGl0ZXJhYmxlRGlmZikpO1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdEtleVZhbHVlRGlmZmVycyA9IENPTlNUX0VYUFIobmV3IEtleVZhbHVlRGlmZmVycyhrZXlWYWxEaWZmKSk7XG4iXX0=