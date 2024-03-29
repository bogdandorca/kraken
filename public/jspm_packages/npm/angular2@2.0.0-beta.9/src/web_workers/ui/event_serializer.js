/* */ 
"format cjs";
'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var MOUSE_EVENT_PROPERTIES = [
    "altKey",
    "button",
    "clientX",
    "clientY",
    "metaKey",
    "movementX",
    "movementY",
    "offsetX",
    "offsetY",
    "region",
    "screenX",
    "screenY",
    "shiftKey"
];
var KEYBOARD_EVENT_PROPERTIES = [
    'altkey',
    'charCode',
    'code',
    'ctrlKey',
    'isComposing',
    'key',
    'keyCode',
    'location',
    'metaKey',
    'repeat',
    'shiftKey',
    'which'
];
var TRANSITION_EVENT_PROPERTIES = ['propertyName', 'elapsedTime', 'pseudoElement'];
var EVENT_PROPERTIES = ['type', 'bubbles', 'cancelable'];
var NODES_WITH_VALUE = new collection_1.Set(["input", "select", "option", "button", "li", "meter", "progress", "param"]);
function serializeGenericEvent(e) {
    return serializeEvent(e, EVENT_PROPERTIES);
}
exports.serializeGenericEvent = serializeGenericEvent;
// TODO(jteplitz602): Allow users to specify the properties they need rather than always
// adding value and files #3374
function serializeEventWithTarget(e) {
    var serializedEvent = serializeEvent(e, EVENT_PROPERTIES);
    return addTarget(e, serializedEvent);
}
exports.serializeEventWithTarget = serializeEventWithTarget;
function serializeMouseEvent(e) {
    return serializeEvent(e, MOUSE_EVENT_PROPERTIES);
}
exports.serializeMouseEvent = serializeMouseEvent;
function serializeKeyboardEvent(e) {
    var serializedEvent = serializeEvent(e, KEYBOARD_EVENT_PROPERTIES);
    return addTarget(e, serializedEvent);
}
exports.serializeKeyboardEvent = serializeKeyboardEvent;
function serializeTransitionEvent(e) {
    var serializedEvent = serializeEvent(e, TRANSITION_EVENT_PROPERTIES);
    return addTarget(e, serializedEvent);
}
exports.serializeTransitionEvent = serializeTransitionEvent;
// TODO(jteplitz602): #3374. See above.
function addTarget(e, serializedEvent) {
    if (NODES_WITH_VALUE.has(e.target.tagName.toLowerCase())) {
        var target = e.target;
        serializedEvent['target'] = { 'value': target.value };
        if (lang_1.isPresent(target.files)) {
            serializedEvent['target']['files'] = target.files;
        }
    }
    return serializedEvent;
}
function serializeEvent(e, properties) {
    var serialized = {};
    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        serialized[prop] = e[prop];
    }
    return serialized;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfc2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9ldmVudF9zZXJpYWxpemVyLnRzIl0sIm5hbWVzIjpbInNlcmlhbGl6ZUdlbmVyaWNFdmVudCIsInNlcmlhbGl6ZUV2ZW50V2l0aFRhcmdldCIsInNlcmlhbGl6ZU1vdXNlRXZlbnQiLCJzZXJpYWxpemVLZXlib2FyZEV2ZW50Iiwic2VyaWFsaXplVHJhbnNpdGlvbkV2ZW50IiwiYWRkVGFyZ2V0Iiwic2VyaWFsaXplRXZlbnQiXSwibWFwcGluZ3MiOiJBQUFBLDJCQUFrQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ25ELHFCQUF3QiwwQkFBMEIsQ0FBQyxDQUFBO0FBRW5ELElBQU0sc0JBQXNCLEdBQUc7SUFDN0IsUUFBUTtJQUNSLFFBQVE7SUFDUixTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxXQUFXO0lBQ1gsV0FBVztJQUNYLFNBQVM7SUFDVCxTQUFTO0lBQ1QsUUFBUTtJQUNSLFNBQVM7SUFDVCxTQUFTO0lBQ1QsVUFBVTtDQUNYLENBQUM7QUFFRixJQUFNLHlCQUF5QixHQUFHO0lBQ2hDLFFBQVE7SUFDUixVQUFVO0lBQ1YsTUFBTTtJQUNOLFNBQVM7SUFDVCxhQUFhO0lBQ2IsS0FBSztJQUNMLFNBQVM7SUFDVCxVQUFVO0lBQ1YsU0FBUztJQUNULFFBQVE7SUFDUixVQUFVO0lBQ1YsT0FBTztDQUNSLENBQUM7QUFFRixJQUFNLDJCQUEyQixHQUFHLENBQUMsY0FBYyxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUVyRixJQUFNLGdCQUFnQixHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUUzRCxJQUFNLGdCQUFnQixHQUNsQixJQUFJLGdCQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFB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ZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5jb25zdCBNT1VTRV9FVkVOVF9QUk9QRVJUSUVTID0gW1xuICBcImFsdEtleVwiLFxuICBcImJ1dHRvblwiLFxuICBcImNsaWVudFhcIixcbiAgXCJjbGllbnRZXCIsXG4gIFwibWV0YUtleVwiLFxuICBcIm1vdmVtZW50WFwiLFxuICBcIm1vdmVtZW50WVwiLFxuICBcIm9mZnNldFhcIixcbiAgXCJvZmZzZXRZXCIsXG4gIFwicmVnaW9uXCIsXG4gIFwic2NyZWVuWFwiLFxuICBcInNjcmVlbllcIixcbiAgXCJzaGlmdEtleVwiXG5dO1xuXG5jb25zdCBLRVlCT0FSRF9FVkVOVF9QUk9QRVJUSUVTID0gW1xuICAnYWx0a2V5JyxcbiAgJ2NoYXJDb2RlJyxcbiAgJ2NvZGUnLFxuICAnY3RybEtleScsXG4gICdpc0NvbXBvc2luZycsXG4gICdrZXknLFxuICAna2V5Q29kZScsXG4gICdsb2NhdGlvbicsXG4gICdtZXRhS2V5JyxcbiAgJ3JlcGVhdCcsXG4gICdzaGlmdEtleScsXG4gICd3aGljaCdcbl07XG5cbmNvbnN0IFRSQU5TSVRJT05fRVZFTlRfUFJPUEVSVElFUyA9IFsncHJvcGVydHlOYW1lJywgJ2VsYXBzZWRUaW1lJywgJ3BzZXVkb0VsZW1lbnQnXTtcblxuY29uc3QgRVZFTlRfUFJPUEVSVElFUyA9IFsndHlwZScsICdidWJibGVzJywgJ2NhbmNlbGFibGUnXTtcblxuY29uc3QgTk9ERVNfV0lUSF9WQUxVRSA9XG4gICAgbmV3IFNldChbXCJpbnB1dFwiLCBcInNlbGVjdFwiLCBcIm9wdGlvblwiLCBcImJ1dHRvblwiLCBcImxpXCIsIFwibWV0ZXJcIiwgXCJwcm9ncmVzc1wiLCBcInBhcmFtXCJdKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUdlbmVyaWNFdmVudChlOiBFdmVudCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgcmV0dXJuIHNlcmlhbGl6ZUV2ZW50KGUsIEVWRU5UX1BST1BFUlRJRVMpO1xufVxuXG4vLyBUT0RPKGp0ZXBsaXR6NjAyKTogQWxsb3cgdXNlcnMgdG8gc3BlY2lmeSB0aGUgcHJvcGVydGllcyB0aGV5IG5lZWQgcmF0aGVyIHRoYW4gYWx3YXlzXG4vLyBhZGRpbmcgdmFsdWUgYW5kIGZpbGVzICMzMzc0XG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplRXZlbnRXaXRoVGFyZ2V0KGU6IEV2ZW50KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICB2YXIgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplRXZlbnQoZSwgRVZFTlRfUFJPUEVSVElFUyk7XG4gIHJldHVybiBhZGRUYXJnZXQoZSwgc2VyaWFsaXplZEV2ZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZU1vdXNlRXZlbnQoZTogTW91c2VFdmVudCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgcmV0dXJuIHNlcmlhbGl6ZUV2ZW50KGUsIE1PVVNFX0VWRU5UX1BST1BFUlRJRVMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplS2V5Ym9hcmRFdmVudChlOiBLZXlib2FyZEV2ZW50KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICB2YXIgc2VyaWFsaXplZEV2ZW50ID0gc2VyaWFsaXplRXZlbnQoZSwgS0VZQk9BUkRfRVZFTlRfUFJPUEVSVElFUyk7XG4gIHJldHVybiBhZGRUYXJnZXQoZSwgc2VyaWFsaXplZEV2ZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVRyYW5zaXRpb25FdmVudChlOiBUcmFuc2l0aW9uRXZlbnQpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gIHZhciBzZXJpYWxpemVkRXZlbnQgPSBzZXJpYWxpemVFdmVudChlLCBUUkFOU0lUSU9OX0VWRU5UX1BST1BFUlRJRVMpO1xuICByZXR1cm4gYWRkVGFyZ2V0KGUsIHNlcmlhbGl6ZWRFdmVudCk7XG59XG5cbi8vIFRPRE8oanRlcGxpdHo2MDIpOiAjMzM3NC4gU2VlIGFib3ZlLlxuZnVuY3Rpb24gYWRkVGFyZ2V0KGU6IEV2ZW50LCBzZXJpYWxpemVkRXZlbnQ6IHtba2V5OiBzdHJpbmddOiBhbnl9KToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICBpZiAoTk9ERVNfV0lUSF9WQUxVRS5oYXMoKDxIVE1MRWxlbWVudD5lLnRhcmdldCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgIHZhciB0YXJnZXQgPSA8SFRNTElucHV0RWxlbWVudD5lLnRhcmdldDtcbiAgICBzZXJpYWxpemVkRXZlbnRbJ3RhcmdldCddID0geyd2YWx1ZSc6IHRhcmdldC52YWx1ZX07XG4gICAgaWYgKGlzUHJlc2VudCh0YXJnZXQuZmlsZXMpKSB7XG4gICAgICBzZXJpYWxpemVkRXZlbnRbJ3RhcmdldCddWydmaWxlcyddID0gdGFyZ2V0LmZpbGVzO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2VyaWFsaXplZEV2ZW50O1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVFdmVudChlOiBhbnksIHByb3BlcnRpZXM6IHN0cmluZ1tdKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICB2YXIgc2VyaWFsaXplZCA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcHJvcCA9IHByb3BlcnRpZXNbaV07XG4gICAgc2VyaWFsaXplZFtwcm9wXSA9IGVbcHJvcF07XG4gIH1cbiAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG59XG4iXX0=