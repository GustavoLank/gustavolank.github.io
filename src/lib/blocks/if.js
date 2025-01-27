import { immediate_effect, schedule_effect } from "../reactivity";

export function if_block(sources, blocks) {
    immediate_effect(recalculate, sources);
    let last_branch = 0;
    let unmount_component = null;

    function recalculate() {
        const length = blocks.length / 2;
        
        for (let i = 0; i < length; i++) {
            const cond = blocks[2*i];
            if (cond()) {
                i += 1;
                if (last_branch === i) return;
                last_branch = i;
                if (unmount_component) schedule_effect(unmount_component);
                const render = blocks[2*i - 1];
                unmount_component = render();
                return;
            }
        }

        last_branch = 0;
        if (unmount_component) {
            schedule_effect(unmount_component);
            unmount_component = null;
        }
    };
}
