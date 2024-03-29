/* */ 
"format esm";
import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import * as cd from 'angular2/src/core/change_detection/pipes';
export class ProtoPipes {
    constructor(
        /**
        * Map of {@link PipeMetadata} names to {@link PipeMetadata} implementations.
        */
        config) {
        this.config = config;
        this.config = config;
    }
    static fromProviders(providers) {
        var config = {};
        providers.forEach(b => config[b.name] = b);
        return new ProtoPipes(config);
    }
    get(name) {
        var provider = this.config[name];
        if (isBlank(provider))
            throw new BaseException(`Cannot find pipe '${name}'.`);
        return provider;
    }
}
export class Pipes {
    constructor(proto, injector) {
        this.proto = proto;
        this.injector = injector;
        /** @internal */
        this._config = {};
    }
    get(name) {
        var cached = StringMapWrapper.get(this._config, name);
        if (isPresent(cached))
            return cached;
        var p = this.proto.get(name);
        var transform = this.injector.instantiateResolved(p);
        var res = new cd.SelectedPipe(transform, p.pure);
        if (p.pure) {
            StringMapWrapper.set(this._config, name, res);
        }
        return res;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9waXBlcy9waXBlcy50cyJdLCJuYW1lcyI6WyJQcm90b1BpcGVzIiwiUHJvdG9QaXBlcy5jb25zdHJ1Y3RvciIsIlByb3RvUGlwZXMuZnJvbVByb3ZpZGVycyIsIlByb3RvUGlwZXMuZ2V0IiwiUGlwZXMiLCJQaXBlcy5jb25zdHJ1Y3RvciIsIlBpcGVzLmdldCJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFjLE1BQU0sMEJBQTBCO09BQ2pFLEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUN2RSxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BVXhELEtBQUssRUFBRSxNQUFNLDBDQUEwQztBQUU5RDtJQU9FQTtRQUNJQTs7VUFFRUE7UUFDS0EsTUFBcUNBO1FBQXJDQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUErQkE7UUFDOUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO0lBQ3ZCQSxDQUFDQTtJQVpERCxPQUFPQSxhQUFhQSxDQUFDQSxTQUF5QkE7UUFDNUNFLElBQUlBLE1BQU1BLEdBQWtDQSxFQUFFQSxDQUFDQTtRQUMvQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLE1BQU1BLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ2hDQSxDQUFDQTtJQVVERixHQUFHQSxDQUFDQSxJQUFZQTtRQUNkRyxJQUFJQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNqQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0EscUJBQXFCQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM5RUEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7SUFDbEJBLENBQUNBO0FBQ0hILENBQUNBO0FBSUQ7SUFJRUksWUFBbUJBLEtBQWlCQSxFQUFTQSxRQUFrQkE7UUFBNUNDLFVBQUtBLEdBQUxBLEtBQUtBLENBQVlBO1FBQVNBLGFBQVFBLEdBQVJBLFFBQVFBLENBQVVBO1FBSC9EQSxnQkFBZ0JBO1FBQ2hCQSxZQUFPQSxHQUFxQ0EsRUFBRUEsQ0FBQ0E7SUFFbUJBLENBQUNBO0lBRW5FRCxHQUFHQSxDQUFDQSxJQUFZQTtRQUNkRSxJQUFJQSxNQUFNQSxHQUFHQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3REQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNyQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLElBQUlBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckRBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLEVBQUVBLENBQUNBLFlBQVlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBRWpEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNYQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQ2hEQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtJQUNiQSxDQUFDQTtBQUNIRixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc0JsYW5rLCBpc1ByZXNlbnQsIENPTlNULCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgSW5qZWN0YWJsZSxcbiAgT3B0aW9uYWxNZXRhZGF0YSxcbiAgU2tpcFNlbGZNZXRhZGF0YSxcbiAgUHJvdmlkZXIsXG4gIEluamVjdG9yLFxuICBiaW5kXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7UGlwZVByb3ZpZGVyfSBmcm9tICcuL3BpcGVfcHJvdmlkZXInO1xuaW1wb3J0ICogYXMgY2QgZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9waXBlcyc7XG5cbmV4cG9ydCBjbGFzcyBQcm90b1BpcGVzIHtcbiAgc3RhdGljIGZyb21Qcm92aWRlcnMocHJvdmlkZXJzOiBQaXBlUHJvdmlkZXJbXSk6IFByb3RvUGlwZXMge1xuICAgIHZhciBjb25maWc6IHtba2V5OiBzdHJpbmddOiBQaXBlUHJvdmlkZXJ9ID0ge307XG4gICAgcHJvdmlkZXJzLmZvckVhY2goYiA9PiBjb25maWdbYi5uYW1lXSA9IGIpO1xuICAgIHJldHVybiBuZXcgUHJvdG9QaXBlcyhjb25maWcpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKipcbiAgICAgICogTWFwIG9mIHtAbGluayBQaXBlTWV0YWRhdGF9IG5hbWVzIHRvIHtAbGluayBQaXBlTWV0YWRhdGF9IGltcGxlbWVudGF0aW9ucy5cbiAgICAgICovXG4gICAgICBwdWJsaWMgY29uZmlnOiB7W2tleTogc3RyaW5nXTogUGlwZVByb3ZpZGVyfSkge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IFBpcGVQcm92aWRlciB7XG4gICAgdmFyIHByb3ZpZGVyID0gdGhpcy5jb25maWdbbmFtZV07XG4gICAgaWYgKGlzQmxhbmsocHJvdmlkZXIpKSB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgcGlwZSAnJHtuYW1lfScuYCk7XG4gICAgcmV0dXJuIHByb3ZpZGVyO1xuICB9XG59XG5cblxuXG5leHBvcnQgY2xhc3MgUGlwZXMgaW1wbGVtZW50cyBjZC5QaXBlcyB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2NvbmZpZzoge1trZXk6IHN0cmluZ106IGNkLlNlbGVjdGVkUGlwZX0gPSB7fTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdG86IFByb3RvUGlwZXMsIHB1YmxpYyBpbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IGNkLlNlbGVjdGVkUGlwZSB7XG4gICAgdmFyIGNhY2hlZCA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KHRoaXMuX2NvbmZpZywgbmFtZSk7XG4gICAgaWYgKGlzUHJlc2VudChjYWNoZWQpKSByZXR1cm4gY2FjaGVkO1xuICAgIHZhciBwID0gdGhpcy5wcm90by5nZXQobmFtZSk7XG4gICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMuaW5qZWN0b3IuaW5zdGFudGlhdGVSZXNvbHZlZChwKTtcbiAgICB2YXIgcmVzID0gbmV3IGNkLlNlbGVjdGVkUGlwZSh0cmFuc2Zvcm0sIHAucHVyZSk7XG5cbiAgICBpZiAocC5wdXJlKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLnNldCh0aGlzLl9jb25maWcsIG5hbWUsIHJlcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbiAgfVxufVxuIl19