import './style.css';
import * as $ from './lib';
import { mount } from './lib';

const root = $.template('<div><p> </p></div>');
const but = $.template('<button> </button>');
const but2 = $.template('<button>+</button><button>-</button>', true);
const p = $.template('<p>Other branch</p><p>Other branch</p>', true);
const li = $.template('<li>Item</li>')

function increment(_, $_count) {
    $.set($_count, $_count.v + 1);
}

function decrement(_, $_count) {
    $.set($_count, $_count.v - 1);
}

function Counter($_anchor, $_config) {
    $.component_effect(() => console.log('I got destroyed'));
    let a = but();
    let count = $_config.count;
    a.__click = [increment, count];
    let text = a.firstChild;
    $.immediate_effect(() => text.nodeValue = `Count is ${count.v}`, [ count ]);
    $.append($_anchor, a);
    return $.pop_effect();
}

function Counter2($_anchor, $_config) {
    $.component_effect();
    let a = but2();
    let count = $_config.count;
    let b = a.firstChild;
    let c = a.lastChild;
    b.__click = [increment, count];
    c.__click = [decrement, count];
    $.append($_anchor, a);
    return $.pop_effect();
}


function remove(_, show) {
    $.set(show, !show.v);
}

function App($_anchor, $_config) {
    $.component_effect();
    let a = root();

    let width = $.state(1);
    let height = $.state(1);
    let area = $.derived(() => width.v * height.v, [width, height]);

    let text = a.firstChild.firstChild;
    $.immediate_effect(() => text.nodeValue = `Area: ${$.get(area)}`, [area]);

    $.effect(() => console.log(`New lengths are ${width.v}x${height.v}`), [width, height])

    Counter2(a, { count: width });
    Counter2(a, { count: height });

    $.append($_anchor, a);
    return $.pop_effect();
}


mount(App, document.getElementById('app'));
