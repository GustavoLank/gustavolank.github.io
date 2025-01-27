import { handle_event, registered_events } from './events.js';

export { template, child, append, anchor, setup_block, setup_block_fragment } from './dom.js';
export * from './reactivity.js';
export { if_block as if } from './blocks/if.js';

function add_event_listeners(target, events) {
    let registered = new Set();

    const length = events.length;
    for (let i = 0; i < length; i++) {
        const name = events[i];
        if (registered.has(name)) continue;
        registered.add(name);
        let passive = name == 'touchstart' || name == 'touchmove';
        target.addEventListener(name, handle_event, { passive });
    }
}

export function mount(comp, target) {
    add_event_listeners(target, Array.from(registered_events));
    comp(target);
}
