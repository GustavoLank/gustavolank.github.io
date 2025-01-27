import { component_effect, set_nodes } from "./reactivity";

let append_mode = false;

export function template(content, fragment = false) {
    let node;

    return () => {
        if (node === undefined) {
            let elem = document.createElement('template');
            elem.innerHTML = content;
            if (fragment) node = elem.content;
            else node = elem.content.firstChild;
        }

        const clone = node.cloneNode(true);
        if (fragment) set_nodes(clone.firstChild, clone.lastChild);
        else set_nodes(clone, clone);

        return clone;
    };
}

export function anchor() {
    const frag = document.createDocumentFragment();
    const start = document.createComment('');
    frag.append(start);
    return frag;
}

export function child(node, count = 1) {
    node = node.firstChild;
    while (count--) {
		node = node.nextSibling;
	}
    return node;
}

export function append(anchor, node) {
    return append_mode ? anchor.before(node) : anchor.appendChild(node);
}

export function remove_range(start, end) {
    let current = start;
    while (current !== null) {
        const next = current === end ? null : current.nextSibling;
        current.remove();
        current = next;
    }
}

export function setup_block(fn) {
    return () => {
        const old = append_mode;
        append_mode = true;
        const result = fn();
        append_mode = old;
        return result;
    }
}

export function setup_block_fragment(anchor, templ) {
    return () => {
        const old = append_mode;
        append_mode = true;

        const unmount = component_effect();
        const frag = templ();
        append(anchor, frag);

        return unmount;
    }
}
