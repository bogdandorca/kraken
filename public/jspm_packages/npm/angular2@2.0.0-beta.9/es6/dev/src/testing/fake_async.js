/* */ 
"format esm";
import { global } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
var _scheduler;
var _microtasks = [];
var _pendingPeriodicTimers = [];
var _pendingTimers = [];
/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='basic'}
 *
 * @param fn
 * @returns {Function} The function wrapped to be executed in the fakeAsync zone
 */
export function fakeAsync(fn) {
    if (global.zone._inFakeAsyncZone) {
        throw new Error('fakeAsync() calls can not be nested');
    }
    var fakeAsyncZone = global.zone.fork({
        setTimeout: _setTimeout,
        clearTimeout: _clearTimeout,
        setInterval: _setInterval,
        clearInterval: _clearInterval,
        scheduleMicrotask: _scheduleMicrotask,
        _inFakeAsyncZone: true
    });
    return function (...args) {
        // TODO(tbosch): This class should already be part of the jasmine typings but it is not...
        _scheduler = new jasmine.DelayedFunctionScheduler();
        clearPendingTimers();
        let res = fakeAsyncZone.run(() => {
            let res = fn(...args);
            flushMicrotasks();
            return res;
        });
        if (_pendingPeriodicTimers.length > 0) {
            throw new BaseException(`${_pendingPeriodicTimers.length} periodic timer(s) still in the queue.`);
        }
        if (_pendingTimers.length > 0) {
            throw new BaseException(`${_pendingTimers.length} timer(s) still in the queue.`);
        }
        _scheduler = null;
        ListWrapper.clear(_microtasks);
        return res;
    };
}
/**
 * Clear the queue of pending timers and microtasks.
 *
 * Useful for cleaning up after an asynchronous test passes.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='pending'}
 */
export function clearPendingTimers() {
    // TODO we should fix tick to dequeue the failed timer instead of relying on clearPendingTimers
    ListWrapper.clear(_microtasks);
    ListWrapper.clear(_pendingPeriodicTimers);
    ListWrapper.clear(_pendingTimers);
}
/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * ## Example
 *
 * {@example testing/ts/fake_async.ts region='basic'}
 *
 * @param {number} millis Number of millisecond, defaults to 0
 */
export function tick(millis = 0) {
    _assertInFakeAsyncZone();
    flushMicrotasks();
    _scheduler.tick(millis);
}
/**
 * Flush any pending microtasks.
 */
export function flushMicrotasks() {
    _assertInFakeAsyncZone();
    while (_microtasks.length > 0) {
        var microtask = ListWrapper.removeAt(_microtasks, 0);
        microtask();
    }
}
function _setTimeout(fn, delay, ...args) {
    var cb = _fnAndFlush(fn);
    var id = _scheduler.scheduleFunction(cb, delay, args);
    _pendingTimers.push(id);
    _scheduler.scheduleFunction(_dequeueTimer(id), delay);
    return id;
}
function _clearTimeout(id) {
    _dequeueTimer(id);
    return _scheduler.removeFunctionWithId(id);
}
function _setInterval(fn, interval, ...args) {
    var cb = _fnAndFlush(fn);
    var id = _scheduler.scheduleFunction(cb, interval, args, true);
    _pendingPeriodicTimers.push(id);
    return id;
}
function _clearInterval(id) {
    ListWrapper.remove(_pendingPeriodicTimers, id);
    return _scheduler.removeFunctionWithId(id);
}
function _fnAndFlush(fn) {
    return (...args) => {
        fn.apply(global, args);
        flushMicrotasks();
    };
}
function _scheduleMicrotask(microtask) {
    _microtasks.push(microtask);
}
function _dequeueTimer(id) {
    return function () { ListWrapper.remove(_pendingTimers, id); };
}
function _assertInFakeAsyncZone() {
    if (!global.zone || !global.zone._inFakeAsyncZone) {
        throw new Error('The code should be running in the fakeAsync zone to call this function');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZV9hc3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL2Zha2VfYXN5bmMudHMiXSwibmFtZXMiOlsiZmFrZUFzeW5jIiwiY2xlYXJQZW5kaW5nVGltZXJzIiwidGljayIsImZsdXNoTWljcm90YXNrcyIsIl9zZXRUaW1lb3V0IiwiX2NsZWFyVGltZW91dCIsIl9zZXRJbnRlcnZhbCIsIl9jbGVhckludGVydmFsIiwiX2ZuQW5kRmx1c2giLCJfc2NoZWR1bGVNaWNyb3Rhc2siLCJfZGVxdWV1ZVRpbWVyIiwiX2Fzc2VydEluRmFrZUFzeW5jWm9uZSJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSwwQkFBMEI7T0FDeEMsRUFBQyxhQUFhLEVBQW1CLE1BQU0sZ0NBQWdDO09BQ3ZFLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO0FBRzFELElBQUksVUFBVSxDQUFDO0FBQ2YsSUFBSSxXQUFXLEdBQWUsRUFBRSxDQUFDO0FBQ2pDLElBQUksc0JBQXNCLEdBQWEsRUFBRSxDQUFDO0FBQzFDLElBQUksY0FBYyxHQUFhLEVBQUUsQ0FBQztBQU1sQzs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsMEJBQTBCLEVBQVk7SUFDcENBLEVBQUVBLENBQUNBLENBQWlCQSxNQUFNQSxDQUFDQSxJQUFLQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBO1FBQ2xEQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxxQ0FBcUNBLENBQUNBLENBQUNBO0lBQ3pEQSxDQUFDQTtJQUVEQSxJQUFJQSxhQUFhQSxHQUFrQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbERBLFVBQVVBLEVBQUVBLFdBQVdBO1FBQ3ZCQSxZQUFZQSxFQUFFQSxhQUFhQTtRQUMzQkEsV0FBV0EsRUFBRUEsWUFBWUE7UUFDekJBLGFBQWFBLEVBQUVBLGNBQWNBO1FBQzdCQSxpQkFBaUJBLEVBQUVBLGtCQUFr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Q0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNuRUEsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0Esd0VBQXdFQSxDQUFDQSxDQUFDQTtJQUM1RkEsQ0FBQ0E7QUFDSEEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge05nWm9uZVpvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5cbnZhciBfc2NoZWR1bGVyO1xudmFyIF9taWNyb3Rhc2tzOiBGdW5jdGlvbltdID0gW107XG52YXIgX3BlbmRpbmdQZXJpb2RpY1RpbWVyczogbnVtYmVyW10gPSBbXTtcbnZhciBfcGVuZGluZ1RpbWVyczogbnVtYmVyW10gPSBbXTtcblxuaW50ZXJmYWNlIEZha2VBc3luY1pvbmUgZXh0ZW5kcyBOZ1pvbmVab25lIHtcbiAgX2luRmFrZUFzeW5jWm9uZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBXcmFwcyBhIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGluIHRoZSBmYWtlQXN5bmMgem9uZTpcbiAqIC0gbWljcm90YXNrcyBhcmUgbWFudWFsbHkgZXhlY3V0ZWQgYnkgY2FsbGluZyBgZmx1c2hNaWNyb3Rhc2tzKClgLFxuICogLSB0aW1lcnMgYXJlIHN5bmNocm9ub3VzLCBgdGljaygpYCBzaW11bGF0ZXMgdGhlIGFzeW5jaHJvbm91cyBwYXNzYWdlIG9mIHRpbWUuXG4gKlxuICogSWYgdGhlcmUgYXJlIGFueSBwZW5kaW5nIHRpbWVycyBhdCB0aGUgZW5kIG9mIHRoZSBmdW5jdGlvbiwgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLlxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy9mYWtlX2FzeW5jLnRzIHJlZ2lvbj0nYmFzaWMnfVxuICpcbiAqIEBwYXJhbSBmblxuICogQHJldHVybnMge0Z1bmN0aW9ufSBUaGUgZnVuY3Rpb24gd3JhcHBlZCB0byBiZSBleGVjdXRlZCBpbiB0aGUgZmFrZUFzeW5jIHpvbmVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZha2VBc3luYyhmbjogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gIGlmICgoPEZha2VBc3luY1pvbmU+Z2xvYmFsLnpvbmUpLl9pbkZha2VBc3luY1pvbmUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Zha2VBc3luYygpIGNhbGxzIGNhbiBub3QgYmUgbmVzdGVkJyk7XG4gIH1cblxuICB2YXIgZmFrZUFzeW5jWm9uZSA9IDxGYWtlQXN5bmNab25lPmdsb2JhbC56b25lLmZvcmsoe1xuICAgIHNldFRpbWVvdXQ6IF9zZXRUaW1lb3V0LFxuICAgIGNsZWFyVGltZW91dDogX2NsZWFyVGltZW91dCxcbiAgICBzZXRJbnRlcnZhbDogX3NldEludGVydmFsLFxuICAgIGNsZWFySW50ZXJ2YWw6IF9jbGVhckludGVydmFsLFxuICAgIHNjaGVkdWxlTWljcm90YXNrOiBfc2NoZWR1bGVNaWNyb3Rhc2ssXG4gICAgX2luRmFrZUFzeW5jWm9uZTogdHJ1ZVxuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIC8vIFRPRE8odGJvc2NoKTogVGhpcyBjbGFzcyBzaG91bGQgYWxyZWFkeSBiZSBwYXJ0IG9mIHRoZSBqYXNtaW5lIHR5cGluZ3MgYnV0IGl0IGlzIG5vdC4uLlxuICAgIF9zY2hlZHVsZXIgPSBuZXcgKDxhbnk+amFzbWluZSkuRGVsYXllZEZ1bmN0aW9uU2NoZWR1bGVyKCk7XG4gICAgY2xlYXJQZW5kaW5nVGltZXJzKCk7XG5cbiAgICBsZXQgcmVzID0gZmFrZUFzeW5jWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgbGV0IHJlcyA9IGZuKC4uLmFyZ3MpO1xuICAgICAgZmx1c2hNaWNyb3Rhc2tzKCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xuXG4gICAgaWYgKF9wZW5kaW5nUGVyaW9kaWNUaW1lcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYCR7X3BlbmRpbmdQZXJpb2RpY1RpbWVycy5sZW5ndGh9IHBlcmlvZGljIHRpbWVyKHMpIHN0aWxsIGluIHRoZSBxdWV1ZS5gKTtcbiAgICB9XG5cbiAgICBpZiAoX3BlbmRpbmdUaW1lcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYCR7X3BlbmRpbmdUaW1lcnMubGVuZ3RofSB0aW1lcihzKSBzdGlsbCBpbiB0aGUgcXVldWUuYCk7XG4gICAgfVxuXG4gICAgX3NjaGVkdWxlciA9IG51bGw7XG4gICAgTGlzdFdyYXBwZXIuY2xlYXIoX21pY3JvdGFza3MpO1xuXG4gICAgcmV0dXJuIHJlcztcbiAgfVxufVxuXG4vKipcbiAqIENsZWFyIHRoZSBxdWV1ZSBvZiBwZW5kaW5nIHRpbWVycyBhbmQgbWljcm90YXNrcy5cbiAqXG4gKiBVc2VmdWwgZm9yIGNsZWFuaW5nIHVwIGFmdGVyIGFuIGFzeW5jaHJvbm91cyB0ZXN0IHBhc3Nlcy5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvZmFrZV9hc3luYy50cyByZWdpb249J3BlbmRpbmcnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJQZW5kaW5nVGltZXJzKCk6IHZvaWQge1xuICAvLyBUT0RPIHdlIHNob3VsZCBmaXggdGljayB0byBkZXF1ZXVlIHRoZSBmYWlsZWQgdGltZXIgaW5zdGVhZCBvZiByZWx5aW5nIG9uIGNsZWFyUGVuZGluZ1RpbWVyc1xuICBMaXN0V3JhcHBlci5jbGVhcihfbWljcm90YXNrcyk7XG4gIExpc3RXcmFwcGVyLmNsZWFyKF9wZW5kaW5nUGVyaW9kaWNUaW1lcnMpO1xuICBMaXN0V3JhcHBlci5jbGVhcihfcGVuZGluZ1RpbWVycyk7XG59XG5cblxuLyoqXG4gKiBTaW11bGF0ZXMgdGhlIGFzeW5jaHJvbm91cyBwYXNzYWdlIG9mIHRpbWUgZm9yIHRoZSB0aW1lcnMgaW4gdGhlIGZha2VBc3luYyB6b25lLlxuICpcbiAqIFRoZSBtaWNyb3Rhc2tzIHF1ZXVlIGlzIGRyYWluZWQgYXQgdGhlIHZlcnkgc3RhcnQgb2YgdGhpcyBmdW5jdGlvbiBhbmQgYWZ0ZXIgYW55IHRpbWVyIGNhbGxiYWNrXG4gKiBoYXMgYmVlbiBleGVjdXRlZC5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvZmFrZV9hc3luYy50cyByZWdpb249J2Jhc2ljJ31cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbWlsbGlzIE51bWJlciBvZiBtaWxsaXNlY29uZCwgZGVmYXVsdHMgdG8gMFxuICovXG5leHBvcnQgZnVuY3Rpb24gdGljayhtaWxsaXM6IG51bWJlciA9IDApOiB2b2lkIHtcbiAgX2Fzc2VydEluRmFrZUFzeW5jWm9uZSgpO1xuICBmbHVzaE1pY3JvdGFza3MoKTtcbiAgX3NjaGVkdWxlci50aWNrKG1pbGxpcyk7XG59XG5cbi8qKlxuICogRmx1c2ggYW55IHBlbmRpbmcgbWljcm90YXNrcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsdXNoTWljcm90YXNrcygpOiB2b2lkIHtcbiAgX2Fzc2VydEluRmFrZUFzeW5jWm9uZSgpO1xuICB3aGlsZSAoX21pY3JvdGFza3MubGVuZ3RoID4gMCkge1xuICAgIHZhciBtaWNyb3Rhc2sgPSBMaXN0V3JhcHBlci5yZW1vdmVBdChfbWljcm90YXNrcywgMCk7XG4gICAgbWljcm90YXNrKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3NldFRpbWVvdXQoZm46IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCAuLi5hcmdzKTogbnVtYmVyIHtcbiAgdmFyIGNiID0gX2ZuQW5kRmx1c2goZm4pO1xuICB2YXIgaWQgPSBfc2NoZWR1bGVyLnNjaGVkdWxlRnVuY3Rpb24oY2IsIGRlbGF5LCBhcmdzKTtcbiAgX3BlbmRpbmdUaW1lcnMucHVzaChpZCk7XG4gIF9zY2hlZHVsZXIuc2NoZWR1bGVGdW5jdGlvbihfZGVxdWV1ZVRpbWVyKGlkKSwgZGVsYXkpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIF9jbGVhclRpbWVvdXQoaWQ6IG51bWJlcikge1xuICBfZGVxdWV1ZVRpbWVyKGlkKTtcbiAgcmV0dXJuIF9zY2hlZHVsZXIucmVtb3ZlRnVuY3Rpb25XaXRoSWQoaWQpO1xufVxuXG5mdW5jdGlvbiBfc2V0SW50ZXJ2YWwoZm46IEZ1bmN0aW9uLCBpbnRlcnZhbDogbnVtYmVyLCAuLi5hcmdzKSB7XG4gIHZhciBjYiA9IF9mbkFuZEZsdXNoKGZuKTtcbiAgdmFyIGlkID0gX3NjaGVkdWxlci5zY2hlZHVsZUZ1bmN0aW9uKGNiLCBpbnRlcnZhbCwgYXJncywgdHJ1ZSk7XG4gIF9wZW5kaW5nUGVyaW9kaWNUaW1lcnMucHVzaChpZCk7XG4gIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gX2NsZWFySW50ZXJ2YWwoaWQ6IG51bWJlcikge1xuICBMaXN0V3JhcHBlci5yZW1vdmUoX3BlbmRpbmdQZXJpb2RpY1RpbWVycywgaWQpO1xuICByZXR1cm4gX3NjaGVkdWxlci5yZW1vdmVGdW5jdGlvbldpdGhJZChpZCk7XG59XG5cbmZ1bmN0aW9uIF9mbkFuZEZsdXNoKGZuOiBGdW5jdGlvbik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgZm4uYXBwbHkoZ2xvYmFsLCBhcmdzKTtcbiAgICBmbHVzaE1pY3JvdGFza3MoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfc2NoZWR1bGVNaWNyb3Rhc2sobWljcm90YXNrOiBGdW5jdGlvbik6IHZvaWQge1xuICBfbWljcm90YXNrcy5wdXNoKG1pY3JvdGFzayk7XG59XG5cbmZ1bmN0aW9uIF9kZXF1ZXVlVGltZXIoaWQ6IG51bWJlcik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkgeyBMaXN0V3JhcHBlci5yZW1vdmUoX3BlbmRpbmdUaW1lcnMsIGlkKTsgfVxufVxuXG5mdW5jdGlvbiBfYXNzZXJ0SW5GYWtlQXN5bmNab25lKCk6IHZvaWQge1xuICBpZiAoIWdsb2JhbC56b25lIHx8ICEoPEZha2VBc3luY1pvbmU+Z2xvYmFsLnpvbmUpLl9pbkZha2VBc3luY1pvbmUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjb2RlIHNob3VsZCBiZSBydW5uaW5nIGluIHRoZSBmYWtlQXN5bmMgem9uZSB0byBjYWxsIHRoaXMgZnVuY3Rpb24nKTtcbiAgfVxufVxuIl19