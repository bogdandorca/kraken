/* */ 
"format cjs";
'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var Locals = (function () {
    function Locals(parent, current) {
        this.parent = parent;
        this.current = current;
    }
    Locals.prototype.contains = function (name) {
        if (this.current.has(name)) {
            return true;
        }
        if (lang_1.isPresent(this.parent)) {
            return this.parent.contains(name);
        }
        return false;
    };
    Locals.prototype.get = function (name) {
        if (this.current.has(name)) {
            return this.current.get(name);
        }
        if (lang_1.isPresent(this.parent)) {
            return this.parent.get(name);
        }
        throw new exceptions_1.BaseException("Cannot find '" + name + "'");
    };
    Locals.prototype.set = function (name, value) {
        // TODO(rado): consider removing this check if we can guarantee this is not
        // exposed to the public API.
        // TODO: vsavkin maybe it should check only the local map
        if (this.current.has(name)) {
            this.current.set(name, value);
        }
        else {
            throw new exceptions_1.BaseException("Setting of new keys post-construction is not supported. Key: " + name + ".");
        }
    };
    Locals.prototype.clearLocalValues = function () { collection_1.MapWrapper.clearValues(this.current); };
    return Locals;
})();
exports.Locals = Locals;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvbG9jYWxzLnRzIl0sIm5hbWVzIjpbIkxvY2FscyIsIkxvY2Fscy5jb25zdHJ1Y3RvciIsIkxvY2Fscy5jb250YWlucyIsIkxvY2Fscy5nZXQiLCJMb2NhbHMuc2V0IiwiTG9jYWxzLmNsZWFyTG9jYWxWYWx1ZXMiXSwibWFwcGluZ3MiOiJBQUFBLHFCQUF3QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ25ELDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUFzQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRXZFO0lBQ0VBLGdCQUFtQkEsTUFBY0EsRUFBU0EsT0FBc0JBO1FBQTdDQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUFRQTtRQUFTQSxZQUFPQSxHQUFQQSxPQUFPQSxDQUFlQTtJQUFHQSxDQUFDQTtJQUVwRUQseUJBQVFBLEdBQVJBLFVBQVNBLElBQVlBO1FBQ25CRSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMzQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQ0EsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7SUFDZkEsQ0FBQ0E7SUFFREYsb0JBQUdBLEdBQUhBLFVBQUlBLElBQVlBO1FBQ2RHLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNoQ0EsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7UUFFREEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLGtCQUFnQkEsSUFBSUEsTUFBR0EsQ0FBQ0EsQ0FBQ0E7SUFDbkRBLENBQUNBO0lBRURILG9CQUFHQSxHQUFIQSxVQUFJQSxJQUFZQSxFQUFFQSxLQUFVQTtRQUMxQkksMkVBQTJFQTtRQUMzRUEsNkJBQTZCQTtRQUM3QkEseURBQXlEQTtRQUN6REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2hDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FDbkJBLGtFQUFnRUEsSUFBSUEsTUFBR0EsQ0FBQ0EsQ0FBQ0E7UUFDL0VBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURKLGlDQUFnQkEsR0FBaEJBLGNBQTJCSyx1QkFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcEVMLGFBQUNBO0FBQURBLENBQUNBLEFBeENELElBd0NDO0FBeENZLGNBQU0sU0F3Q2xCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBMb2NhbHMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50OiBMb2NhbHMsIHB1YmxpYyBjdXJyZW50OiBNYXA8YW55LCBhbnk+KSB7fVxuXG4gIGNvbnRhaW5zKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmN1cnJlbnQuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucGFyZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmNvbnRhaW5zKG5hbWUpO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldChuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIGlmICh0aGlzLmN1cnJlbnQuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50LmdldChuYW1lKTtcbiAgICB9XG5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucGFyZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldChuYW1lKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgJyR7bmFtZX0nYCk7XG4gIH1cblxuICBzZXQobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gVE9ETyhyYWRvKTogY29uc2lkZXIgcmVtb3ZpbmcgdGhpcyBjaGVjayBpZiB3ZSBjYW4gZ3VhcmFudGVlIHRoaXMgaXMgbm90XG4gICAgLy8gZXhwb3NlZCB0byB0aGUgcHVibGljIEFQSS5cbiAgICAvLyBUT0RPOiB2c2F2a2luIG1heWJlIGl0IHNob3VsZCBjaGVjayBvbmx5IHRoZSBsb2NhbCBtYXBcbiAgICBpZiAodGhpcy5jdXJyZW50LmhhcyhuYW1lKSkge1xuICAgICAgdGhpcy5jdXJyZW50LnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBTZXR0aW5nIG9mIG5ldyBrZXlzIHBvc3QtY29uc3RydWN0aW9uIGlzIG5vdCBzdXBwb3J0ZWQuIEtleTogJHtuYW1lfS5gKTtcbiAgICB9XG4gIH1cblxuICBjbGVhckxvY2FsVmFsdWVzKCk6IHZvaWQgeyBNYXBXcmFwcGVyLmNsZWFyVmFsdWVzKHRoaXMuY3VycmVudCk7IH1cbn1cbiJdfQ==