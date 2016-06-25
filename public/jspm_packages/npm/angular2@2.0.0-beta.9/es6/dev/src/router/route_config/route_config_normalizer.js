/* */ 
"format esm";
import { AsyncRoute, AuxRoute, Route, Redirect } from './route_config_decorator';
import { isType } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
/**
 * Given a JS Object that represents a route config, returns a corresponding Route, AsyncRoute,
 * AuxRoute or Redirect object.
 *
 * Also wraps an AsyncRoute's loader function to add the loaded component's route config to the
 * `RouteRegistry`.
 */
export function normalizeRouteConfig(config, registry) {
    if (config instanceof AsyncRoute) {
        var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
        return new AsyncRoute({
            path: config.path,
            loader: wrappedLoader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
        });
    }
    if (config instanceof Route || config instanceof Redirect || config instanceof AuxRoute) {
        return config;
    }
    if ((+!!config.component) + (+!!config.redirectTo) + (+!!config.loader) != 1) {
        throw new BaseException(`Route config should contain exactly one "component", "loader", or "redirectTo" property.`);
    }
    if (config.as && config.name) {
        throw new BaseException(`Route config should contain exactly one "as" or "name" property.`);
    }
    if (config.as) {
        config.name = config.as;
    }
    if (config.loader) {
        var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
        return new AsyncRoute({
            path: config.path,
            loader: wrappedLoader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
        });
    }
    if (config.aux) {
        return new AuxRoute({ path: config.aux, component: config.component, name: config.name });
    }
    if (config.component) {
        if (typeof config.component == 'object') {
            let componentDefinitionObject = config.component;
            if (componentDefinitionObject.type == 'constructor') {
                return new Route({
                    path: config.path,
                    component: componentDefinitionObject.constructor,
                    name: config.name,
                    data: config.data,
                    useAsDefault: config.useAsDefault
                });
            }
            else if (componentDefinitionObject.type == 'loader') {
                return new AsyncRoute({
                    path: config.path,
                    loader: componentDefinitionObject.loader,
                    name: config.name,
                    data: config.data,
                    useAsDefault: config.useAsDefault
                });
            }
            else {
                throw new BaseException(`Invalid component type "${componentDefinitionObject.type}". Valid types are "constructor" and "loader".`);
            }
        }
        return new Route(config);
    }
    if (config.redirectTo) {
        return new Redirect({ path: config.path, redirectTo: config.redirectTo });
    }
    return config;
}
function wrapLoaderToReconfigureRegistry(loader, registry) {
    return () => {
        return loader().then((componentType) => {
            registry.configFromComponent(componentType);
            return componentType;
        });
    };
}
export function assertComponentExists(component, path) {
    if (!isType(component)) {
        throw new BaseException(`Component for route "${path}" is not defined, or is not a class.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfY29uZmlnX25vcm1hbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZy9yb3V0ZV9jb25maWdfbm9ybWFsaXplci50cyJdLCJuYW1lcyI6WyJub3JtYWxpemVSb3V0ZUNvbmZpZyIsIndyYXBMb2FkZXJUb1JlY29uZmlndXJlUmVnaXN0cnkiLCJhc3NlcnRDb21wb25lbnRFeGlzdHMiXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFrQixNQUFNLDBCQUEwQjtPQUV4RixFQUFDLE1BQU0sRUFBTyxNQUFNLDBCQUEwQjtPQUM5QyxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7QUFJOUU7Ozs7OztHQU1HO0FBQ0gscUNBQXFDLE1BQXVCLEVBQ3ZCLFFBQXVCO0lBQzFEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxZQUFZQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqQ0EsSUFBSUEsYUFBYUEsR0FBR0EsK0JBQStCQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUM3RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0E7WUFDcEJBLElBQUlBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBO1lBQ2pCQSxNQUFNQSxFQUFFQSxhQUFhQTtZQUNyQkEsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUE7WUFDakJBLElBQUlBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBO1lBQ2pCQSxZQUFZQSxFQUFFQSxNQUFNQSxDQUFDQSxZQUFZQTtTQUNsQ0EsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsWUFBWUEsS0FBS0EsSUFBSUEsTUFBTUEsWUFBWUEsUUFBUUEsSUFBSUEsTUFBTUEsWUFBWUEsUUFBUUEsQ0FBQ0EsQ0FB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TUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7UUFDdkJBLENBQUNBLENBQUNBLENBQUNBO0lBQ0xBLENBQUNBLENBQUNBO0FBQ0pBLENBQUNBO0FBRUQsc0NBQXNDLFNBQWUsRUFBRSxJQUFZO0lBQ2pFQyxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2QkEsTUFBTUEsSUFBSUEsYUFBYUEsQ0FBQ0Esd0JBQXdCQSxJQUFJQSxzQ0FBc0NBLENBQUNBLENBQUNBO0lBQzlGQSxDQUFDQTtBQUNIQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QXN5bmNSb3V0ZSwgQXV4Um91dGUsIFJvdXRlLCBSZWRpcmVjdCwgUm91dGVEZWZpbml0aW9ufSBmcm9tICcuL3JvdXRlX2NvbmZpZ19kZWNvcmF0b3InO1xuaW1wb3J0IHtDb21wb25lbnREZWZpbml0aW9ufSBmcm9tICcuLi9yb3V0ZV9kZWZpbml0aW9uJztcbmltcG9ydCB7aXNUeXBlLCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtSb3V0ZVJlZ2lzdHJ5fSBmcm9tICcuLi9yb3V0ZV9yZWdpc3RyeSc7XG5cblxuLyoqXG4gKiBHaXZlbiBhIEpTIE9iamVjdCB0aGF0IHJlcHJlc2VudHMgYSByb3V0ZSBjb25maWcsIHJldHVybnMgYSBjb3JyZXNwb25kaW5nIFJvdXRlLCBBc3luY1JvdXRlLFxuICogQXV4Um91dGUgb3IgUmVkaXJlY3Qgb2JqZWN0LlxuICpcbiAqIEFsc28gd3JhcHMgYW4gQXN5bmNSb3V0ZSdzIGxvYWRlciBmdW5jdGlvbiB0byBhZGQgdGhlIGxvYWRlZCBjb21wb25lbnQncyByb3V0ZSBjb25maWcgdG8gdGhlXG4gKiBgUm91dGVSZWdpc3RyeWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVSb3V0ZUNvbmZpZyhjb25maWc6IFJvdXRlRGVmaW5pdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyeTogUm91dGVSZWdpc3RyeSk6IFJvdXRlRGVmaW5pdGlvbiB7XG4gIGlmIChjb25maWcgaW5zdGFuY2VvZiBBc3luY1JvdXRlKSB7XG4gICAgdmFyIHdyYXBwZWRMb2FkZXIgPSB3cmFwTG9hZGVyVG9SZWNvbmZpZ3VyZVJlZ2lzdHJ5KGNvbmZpZy5sb2FkZXIsIHJlZ2lzdHJ5KTtcbiAgICByZXR1cm4gbmV3IEFzeW5jUm91dGUoe1xuICAgICAgcGF0aDogY29uZmlnLnBhdGgsXG4gICAgICBsb2FkZXI6IHdyYXBwZWRMb2FkZXIsXG4gICAgICBuYW1lOiBjb25maWcubmFtZSxcbiAgICAgIGRhdGE6IGNvbmZpZy5kYXRhLFxuICAgICAgdXNlQXNEZWZhdWx0OiBjb25maWcudXNlQXNEZWZhdWx0XG4gICAgfSk7XG4gIH1cbiAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIFJvdXRlIHx8IGNvbmZpZyBpbnN0YW5jZW9mIFJlZGlyZWN0IHx8IGNvbmZpZyBpbnN0YW5jZW9mIEF1eFJvdXRlKSB7XG4gICAgcmV0dXJuIDxSb3V0ZURlZmluaXRpb24+Y29uZmlnO1xuICB9XG5cbiAgaWYgKCgrISFjb25maWcuY29tcG9uZW50KSArICgrISFjb25maWcucmVkaXJlY3RUbykgKyAoKyEhY29uZmlnLmxvYWRlcikgIT0gMSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICBgUm91dGUgY29uZmlnIHNob3VsZCBjb250YWluIGV4YWN0bHkgb25lIFwiY29tcG9uZW50XCIsIFwibG9hZGVyXCIsIG9yIFwicmVkaXJlY3RUb1wiIHByb3BlcnR5LmApO1xuICB9XG4gIGlmIChjb25maWcuYXMgJiYgY29uZmlnLm5hbWUpIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgUm91dGUgY29uZmlnIHNob3VsZCBjb250YWluIGV4YWN0bHkgb25lIFwiYXNcIiBvciBcIm5hbWVcIiBwcm9wZXJ0eS5gKTtcbiAgfVxuICBpZiAoY29uZmlnLmFzKSB7XG4gICAgY29uZmlnLm5hbWUgPSBjb25maWcuYXM7XG4gIH1cbiAgaWYgKGNvbmZpZy5sb2FkZXIpIHtcbiAgICB2YXIgd3JhcHBlZExvYWRlciA9IHdyYXBMb2FkZXJUb1JlY29uZmlndXJlUmVnaXN0cnkoY29uZmlnLmxvYWRlciwgcmVnaXN0cnkpO1xuICAgIHJldHVybiBuZXcgQXN5bmNSb3V0ZSh7XG4gICAgICBwYXRoOiBjb25maWcucGF0aCxcbiAgICAgIGxvYWRlcjogd3JhcHBlZExvYWRlcixcbiAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxuICAgICAgZGF0YTogY29uZmlnLmRhdGEsXG4gICAgICB1c2VBc0RlZmF1bHQ6IGNvbmZpZy51c2VBc0RlZmF1bHRcbiAgICB9KTtcbiAgfVxuICBpZiAoY29uZmlnLmF1eCkge1xuICAgIHJldHVybiBuZXcgQXV4Um91dGUoe3BhdGg6IGNvbmZpZy5hdXgsIGNvbXBvbmVudDo8VHlwZT5jb25maWcuY29tcG9uZW50LCBuYW1lOiBjb25maWcubmFtZX0pO1xuICB9XG4gIGlmIChjb25maWcuY29tcG9uZW50KSB7XG4gICAgaWYgKHR5cGVvZiBjb25maWcuY29tcG9uZW50ID09ICdvYmplY3QnKSB7XG4gICAgICBsZXQgY29tcG9uZW50RGVmaW5pdGlvbk9iamVjdCA9IDxDb21wb25lbnREZWZpbml0aW9uPmNvbmZpZy5jb21wb25lbnQ7XG4gICAgICBpZiAoY29tcG9uZW50RGVmaW5pdGlvbk9iamVjdC50eXBlID09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSb3V0ZSh7XG4gICAgICAgICAgcGF0aDogY29uZmlnLnBhdGgsXG4gICAgICAgICAgY29tcG9uZW50OjxUeXBlPmNvbXBvbmVudERlZmluaXRpb25PYmplY3QuY29uc3RydWN0b3IsXG4gICAgICAgICAgbmFtZTogY29uZmlnLm5hbWUsXG4gICAgICAgICAgZGF0YTogY29uZmlnLmRhdGEsXG4gICAgICAgICAgdXNlQXNEZWZhdWx0OiBjb25maWcudXNlQXNEZWZhdWx0XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChjb21wb25lbnREZWZpbml0aW9uT2JqZWN0LnR5cGUgPT0gJ2xvYWRlcicpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBc3luY1JvdXRlKHtcbiAgICAgICAgICBwYXRoOiBjb25maWcucGF0aCxcbiAgICAgICAgICBsb2FkZXI6IGNvbXBvbmVudERlZmluaXRpb25PYmplY3QubG9hZGVyLFxuICAgICAgICAgIG5hbWU6IGNvbmZpZy5uYW1lLFxuICAgICAgICAgIGRhdGE6IGNvbmZpZy5kYXRhLFxuICAgICAgICAgIHVzZUFzRGVmYXVsdDogY29uZmlnLnVzZUFzRGVmYXVsdFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYEludmFsaWQgY29tcG9uZW50IHR5cGUgXCIke2NvbXBvbmVudERlZmluaXRpb25PYmplY3QudHlwZX1cIi4gVmFsaWQgdHlwZXMgYXJlIFwiY29uc3RydWN0b3JcIiBhbmQgXCJsb2FkZXJcIi5gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSb3V0ZSg8e1xuICAgICAgcGF0aDogc3RyaW5nO1xuICAgICAgY29tcG9uZW50OiBUeXBlO1xuICAgICAgbmFtZT86IHN0cmluZztcbiAgICAgIGRhdGE/OiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgICAgIHVzZUFzRGVmYXVsdD86IGJvb2xlYW47XG4gICAgfT5jb25maWcpO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5yZWRpcmVjdFRvKSB7XG4gICAgcmV0dXJuIG5ldyBSZWRpcmVjdCh7cGF0aDogY29uZmlnLnBhdGgsIHJlZGlyZWN0VG86IGNvbmZpZy5yZWRpcmVjdFRvfSk7XG4gIH1cblxuICByZXR1cm4gY29uZmlnO1xufVxuXG5cbmZ1bmN0aW9uIHdyYXBMb2FkZXJUb1JlY29uZmlndXJlUmVnaXN0cnkobG9hZGVyOiBGdW5jdGlvbiwgcmVnaXN0cnk6IFJvdXRlUmVnaXN0cnkpOiBGdW5jdGlvbiB7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgcmV0dXJuIGxvYWRlcigpLnRoZW4oKGNvbXBvbmVudFR5cGUpID0+IHtcbiAgICAgIHJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQoY29tcG9uZW50VHlwZSk7XG4gICAgICByZXR1cm4gY29tcG9uZW50VHlwZTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENvbXBvbmVudEV4aXN0cyhjb21wb25lbnQ6IFR5cGUsIHBhdGg6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoIWlzVHlwZShjb21wb25lbnQpKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvbXBvbmVudCBmb3Igcm91dGUgXCIke3BhdGh9XCIgaXMgbm90IGRlZmluZWQsIG9yIGlzIG5vdCBhIGNsYXNzLmApO1xuICB9XG59XG4iXX0=