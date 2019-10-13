'use strict';

const wrapper  = require('./src/dafsm').WRAPPER

class Cntn extends require('./src/dafsm').CONTENT {

    /* Constructor */
    constructor(){
        super('MyCntn');
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
    fn_reqPrepare(cntx) {
        console.debug(`: Run fn_reqPrepare:" ${cntx.counter++}`)
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

const engine = new wrapper('.././json/')
engine.init(engine.load(engine.read('mainloop.json')), myCntn)
myCntn.engine(engine)

while(myCntn.get()['complete'] != true)
    myCntn.emit(data)
/*
const bios = myCntn.bios()
bios['ev_reqComplete'](data)
bios['fnGoto'](data)
*/