import { remove_range } from './dom';
import { noop } from './util';

let queued_effects = [];

let current_component_effect = null;

const COMPONENT_EFFECT = 0b0001;
const DIRTY = 0b0010;
const DERIVED = 0b0100;

function create_effect(fn, deps) {
    const effect = {
        fn,
        deps,
        flags: 0
    };
    if (current_component_effect !== null) {
        current_component_effect.children.push(effect);
    }
    const length = deps.length;
    for (let i = 0; i < length; i++) {
        deps[i].e.push(effect);
    }
    return effect;
}

export function set_nodes(start, end) {
    if (!current_component_effect) return;
    if (current_component_effect.start_node === null) current_component_effect.start_node = start;
    if (end !== undefined) current_component_effect.end_node = end;
}

export function push_effect(effect) {
    current_component_effect = effect;
}

export function pop_effect() {
    if (current_component_effect !== null) {
        const popped = current_component_effect;
        current_component_effect = current_component_effect.parent;
        return popped;
    }
    return null;
}

export function effect(fn, sources) {
    return create_effect(fn, sources);
}

export function immediate_effect(fn, sources) {
    const effect = create_effect(fn, sources);
    schedule_effect(effect);
    return effect;
}

export function component_effect(fn = undefined) {
    const effect = {
        fn: fn ?? noop,
        children: [],
        start_node: null,
        end_node: null,
        flags: COMPONENT_EFFECT,
        parent: current_component_effect
    };
    current_component_effect = effect;
    return effect;
}

export function destroy_effect(effect) {
    const deps = effect.deps;
    const length = deps.length;
    for (let i = 0; i < length; i++) {
        const effects = deps[i].e;
        const index = effects.indexOf(effect);
        effects[index] = effects.at(-1);
        effects.pop();
    }
}

export function derived(fn, sources) {
    const effect = create_effect(fn, sources);
    effect.flags |= DERIVED | DIRTY;
    effect.e = [];
    return effect;
}

export function state(v) {
    return {
        v,
        e: [],
        parent: current_component_effect
    };
}

export function set(state, value) {
    if (state.v === value) return;
    state.v = value;
    schedule_effects(state.e);
}

export function get(effect) {
    if (effect.flags & DIRTY) effect.v = effect.fn();
    return effect.v;
}

export function schedule_effect(effect) {
    if (queued_effects.length === 0) queueMicrotask(process_effects);
    queued_effects.push(effect);
}

function schedule_effects(effects) {
    if (queued_effects.length === 0) queueMicrotask(process_effects);
    const length = effects.length;
    for (let i = 0; i < length; i++) {
        const effect = effects[i];
        if (effect.flags & DERIVED) {
            schedule_effects(effect.e);
            effect.flags |= DIRTY;
            continue;
        }
        if (effect.flags & DIRTY) continue;
        effect.flags |= DIRTY;
        queued_effects.push(effect);
    }
}

function process_effects() {
    const effects = queued_effects;
    queued_effects = [];
    const length = effects.length;

    for (let i = 0; i < length; i++) {
        const effect = effects[i];
        if (effect.flags & DIRTY) effect.flags ^= DIRTY;
        const fn = effect.fn;
        fn();
        const flags = effect.flags;
        if (flags & COMPONENT_EFFECT) {
            remove_range(effect.start_node, effect.end_node);

            for (let j = 0; j < effect.children.length; j++) {
                destroy_effect(effect.children[j]);
            }
        }
    }
}
