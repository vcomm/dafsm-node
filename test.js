'use strict';

const wrapper  = require('./src/dafsm').WRAPPER
const asyncwrapper  = require('./src/dafsm').ASYNCWRAPPER

class Cntn extends require('./src/dafsm').CONTENT {

    /* Constructor */
    constructor(){
        super('MyCntn');
        this.counter = 0
    }
    bios() {
        return {
            // main loop action
            ev_envComplete: this.ev_envComplete,
            fn_reqPrepare: this.fn_reqPrepare,
            ev_reqComplete: this.ev_reqComplete,
            fn_resPrepare: this.fn_resPrepare,
            fn_initResponse: this.fn_initResponse,
            fn_sendResponse: this.fn_sendResponse,
            ev_resComplete: this.ev_resComplete,
            fn_updateSession: this.fn_updateSession,
            // super state action
            fnLetsgo: this.fnLetsgo,
            evComplete: this.evComplete,
            fnGoto: this.fnGoto,
            fnGoodbye: this.fnGoodbye,
        }
    }
    ev_envComplete(cntx) {
        console.debug(`: Run ev_envComplete:" ${cntx.counter++}`)
        return true
    }
    async fn_reqPrepare(cntx) {
        return (new Promise(resolve => {
            setTimeout(() => resolve(cntx), 1000)
        })).then(data => {
                console.log(`async run fn_reqPrepare: ${cntx.counter++}`);
                return data;
            });
    }
    ev_reqComplete(cntx) {
        console.debug(`: Run ev_reqComplete: ${cntx.counter++}`)
        return true
    }
    fn_resPrepare(cntx) {
        console.debug(`: Run fn_resPrepare:" ${cntx.counter++}`)
    }
    fn_initResponse(cntx) {
        console.debug(`: Run fn_initResponse:" ${cntx.counter++}`)
    }
    fn_sendResponse(cntx) {
        console.debug(`: Run fn_sendResponse:" ${cntx.counter++}`)
    }
    ev_resComplete(cntx) {
        console.debug(`: Run ev_resComplete:" ${cntx.counter++}`)
        return true
    }
    fn_updateSession(cntx) {
        console.debug(`: Run fn_updateSession:" ${cntx.counter++}`)
    }
    fnLetsgo(cntx) {
        console.debug(`: Run fnLetsgo:" ${cntx.counter++}`)
    }
    evComplete(cntx) {
        console.debug(`: Run evComplete:" ${cntx.counter++}`)
        return true
    }
    fnGoto(cntx) {
        console.debug(`: Run fnGoto:" ${cntx.counter++}`)
    }
    fnGoodbye(cntx) {
        console.debug(`: Run fnGoodbye:" ${cntx.counter++}`)
    }
}

let data = { counter: 0 }
const myCntn = new Cntn()
//const main = require('./json/mainloop.json')

const engine = new asyncwrapper('.././json/')
engine.init(engine.load(engine.read('mainloop.json')), myCntn)
myCntn.engine(engine)

console.debug('Validate: ', engine.validate('mainloop', myCntn))

//while(myCntn.get()['complete'] != true)
    myCntn.emit()
    

/*
const bios = myCntn.bios()
bios['ev_reqComplete'](data)
bios['fnGoto'](data)
*/
// ----------------------

function asyncTimeout(delay) {
    return (new Promise(resolve => {setTimeout(() => resolve(delay), delay)}))
        .then(d => `Waited ${d} seconds`);
}

function asyncFetch(url) {
    return fetch(url)
        .then(response => (response.text()))
        .then(text => `Fetched ${url}, and got back ${text}` );
}

const asyncThingsToDo = [
    {task: 'wait', duration: 1000},
    {task: 'wait', duration: 300},
    {task: 'wait', duration: 2000},
    {task: 'wait', duration: 100},
];

function runTask(spec) {
    return (spec.task === 'wait')
        ? asyncTimeout(spec.duration)
        : asyncFetch(spec.url);
}


async function seqCalls() {
    const starterPromise = Promise.resolve(null);
    const log            = result => console.log(result);
    await asyncThingsToDo.reduce(
        (p, spec) => p.then(() => runTask(spec).then(log)),
        starterPromise
    );
}

//seqCalls()

async function parallelCalls() {
    const tasks   = asyncThingsToDo.map(runTask); // Run all our tasks in parallel.
    const results = await Promise.all(tasks);     // Gather up the results.
    results.forEach(x => console.log(x));         // Print them out on the console.
}

//parallelCalls()

async function async1(cntx) {
    return (new Promise(resolve => {
        setTimeout(() => resolve(cntx), 1000)
    })).then(data => {
            data.counter++; 
            console.log(`async1 1000: ${data.counter}`);
            return data;
        });
}

async function async2(cntx) {
    return (new Promise(resolve => {
        setTimeout(() => resolve(cntx), 1500)
    })).then(data => {
        data.counter++; 
        console.log(`async2 1500: ${data.counter}`);
        return data;
    });
}

function sync3(cntx) {
    console.log(`sync2 : ${++cntx.counter}`);
    return (Promise.resolve(cntx));
}

async function runCall(func, cntx) {
    return (func.constructor.name === 'AsyncFunction')
        ? await func(cntx)
        : func(cntx);
}

async function queueCall(funcsList, cntx) {
    let data = cntx
    await funcsList.reduce( 
        (p, func) => p.then(
            () => runCall(func, data).then(
                result => {
                    console.log(`Finish step: ${JSON.stringify(result)}`)
                    funcsList.shift()
            })
        ), Promise.resolve(cntx)
    )
}

let myData = { counter: 0 } 
let funclst = [async2,sync3,async1]

async function asyncSequence(funcs,data) {
    await queueCall(funcs, data)
    console.log(`Finaly: ${JSON.stringify(data)}, funcs: ${funcs.length}`)
}

//asyncSequence(funclst,myData)
