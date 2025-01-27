export let registered_events = new Set([ "click" ]);

export function handle_event(event) {
    const name = event.type;
    let current_target = event.composedPath?.()[0] ?? event.target;
    Object.defineProperty(event, 'currentTarget', {
        configurable: true,
        get() {
            return current_target || this.ownerDocument;
        }
    });
    while (current_target !== null) {
        const parent_element =
            current_target.assignedSlot ||
            current_target.parentNode ||
            current_target.host ||
            null;

        const delegated = current_target['__' + name];

        if (delegated !== undefined && !(current_target.disabled)) {
            if (Array.isArray(delegated)) {
                const [fn, ...data] = delegated;
                fn.apply(current_target, [event, ...data]);
            } else {
                delegated.call(current_target, event);
            }
        }
        if (event.cancelBubble || parent_element === this || parent_element === null) {
            break;
        }
        current_target = parent_element;
    }
}
