Engine.SyncPromise = class SyncPromise
{
    static resolve(value = null)
    {
        return new SyncPromise(resolve => {
            resolve(value);
        });
    }
    constructor(fn)
    {
        let state = 'pending';
        let value;
        const deferred = [];

        function resolve(newValue) {
          if(newValue && typeof newValue.then === 'function') {
            newValue.then(resolve);
            return;
          }
          value = newValue;
          state = 'resolved';

          deferred.forEach(handle);
        }

        function handle(handler) {
          if(state === 'pending') {
            deferred.push(handler);
            return;
          }

          if(!handler.onResolved) {
            handler.resolve(value);
            return;
          }

          const ret = handler.onResolved(value);
          handler.resolve(ret);
        }

        this.then = function(onResolved) {
          return new SyncPromise(resolve => {
            handle({
              onResolved: onResolved,
              resolve: resolve
            });
          });
        };

        fn(resolve);
    }
}
