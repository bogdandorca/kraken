/* */ 
"format esm";
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { Provider } from 'angular2/src/core/di';
import { Console } from 'angular2/src/core/console';
import { Reflector, reflector } from './reflection/reflection';
import { TestabilityRegistry } from 'angular2/src/core/testability/testability';
function _reflector() {
    return reflector;
}
/**
 * A default set of providers which should be included in any Angular platform.
 */
export const PLATFORM_COMMON_PROVIDERS = CONST_EXPR([new Provider(Reflector, { useFactory: _reflector, deps: [] }), TestabilityRegistry, Console]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fY29tbW9uX3Byb3ZpZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL3BsYXRmb3JtX2NvbW1vbl9wcm92aWRlcnMudHMiXSwibmFtZXMiOlsiX3JlZmxlY3RvciJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBOEMsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQ3pGLEVBQVUsUUFBUSxFQUF3QixNQUFNLHNCQUFzQjtPQUN0RSxFQUFDLE9BQU8sRUFBQyxNQUFNLDJCQUEyQjtPQUMxQyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSx5QkFBeUI7T0FDckQsRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDJDQUEyQztBQUU3RTtJQUNFQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQTtBQUNuQkEsQ0FBQ0E7QUFFRDs7R0FFRztBQUNILGFBQWEseUJBQXlCLEdBQW1DLFVBQVUsQ0FDL0UsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIGlzQmxhbmssIGlzUHJlc2VudCwgYXNzZXJ0aW9uc0VuYWJsZWQsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3Byb3ZpZGUsIFByb3ZpZGVyLCBJbmplY3RvciwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7Q29uc29sZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY29uc29sZSc7XG5pbXBvcnQge1JlZmxlY3RvciwgcmVmbGVjdG9yfSBmcm9tICcuL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge1Rlc3RhYmlsaXR5UmVnaXN0cnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3Rlc3RhYmlsaXR5L3Rlc3RhYmlsaXR5JztcblxuZnVuY3Rpb24gX3JlZmxlY3RvcigpOiBSZWZsZWN0b3Ige1xuICByZXR1cm4gcmVmbGVjdG9yO1xufVxuXG4vKipcbiAqIEEgZGVmYXVsdCBzZXQgb2YgcHJvdmlkZXJzIHdoaWNoIHNob3VsZCBiZSBpbmNsdWRlZCBpbiBhbnkgQW5ndWxhciBwbGF0Zm9ybS5cbiAqL1xuZXhwb3J0IGNvbnN0IFBMQVRGT1JNX0NPTU1PTl9QUk9WSURFUlM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPiA9IENPTlNUX0VYUFIoXG4gICAgW25ldyBQcm92aWRlcihSZWZsZWN0b3IsIHt1c2VGYWN0b3J5OiBfcmVmbGVjdG9yLCBkZXBzOiBbXX0pLCBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBDb25zb2xlXSk7XG4iXX0=