'use strict';

/*
 * Class DAFSM implementation by ES6 for node.js / client browser
 */

class Dafsm {
    /* Constructor */
    constructor(path){
        this._path_ = path;
    }

    /** Implementation required */
    trigger(fname, cntx) {
        throw new Error('You have to implement the method doSomething!');
    }
    call(fname, cntx) {
        throw new Error('You have to implement the method doSomething!');
    }
    queuecall(cntx) {
        throw new Error('You have to implement the method doSomething!');
    }
    switch(cntx, sstate, name) {
        throw new Error('You have to implement the method doSomething!');
    }
    unswitch(cntx) {
        throw new Error('You have to implement the method doSomething!');
    }
    /* Private methods */
    getByKey(obj, key, value) {
        if (typeof Array.isArray === 'undefined') {
            Array.isArray = function(obj) {
                return Object.prototype.toString.call(obj) === '[object Array]';
            }
        }
        if (Array.isArray(obj)) {
            let item = null
            for (let i=0; i<obj.length; i++) {
                item = obj[i]
                if (item[key] === value)
                    break
            }
            return item
        } else {
            return obj[value]
        }
    }
    eventListener(cntx) {
        let trn = null, trans = null
        //let state = this.getByKey(cntx.logic.states, "key", cntx.keystate)
        let state = cntx.get()['keystate']
        if (state && state.hasOwnProperty("transitions")) {
            for (let i=0; i<state.transitions.length; i++) {
                trans = state.transitions[i]
                if (trans.hasOwnProperty("triggers")) {
                    for(let j=0; j<trans.triggers.length; j++) {
                        if (this.trigger(trans.triggers[j].name, cntx))
                            return trn = trans
                    }
                }
            }
        }
        return trn
    }    
    gotoNextstate(trans,fsm) {
        return this.getByKey(fsm.states, "key", trans.nextstatename)
    }
    stayAction(cntx) {
        //let state = this.getByKey(cntx.logic.states, "key", cntx.keystate)
        let state = cntx.get()['keystate']
        if (state && state.hasOwnProperty("stays")) {
            state.stays.forEach(action => {
                this.call(action.name,cntx)
            })
        }
    }
    exitAction(cntx) {
        //let state = this.getByKey(cntx.logic.states, "key", cntx.keystate)
        let state = cntx.get()['keystate']
        if (state && state.hasOwnProperty("exits")) {
            state.exits.forEach(action => {
                this.call(action.name,cntx)
            })
        }
    }
    effectAction(trans,cntx) {
        if (trans.hasOwnProperty("effects")) {
            trans.effects.forEach(action => {
                this.call(action.name,cntx)
            })
        }
    }
    entryAction(cntx) {
        //let state = this.getByKey(cntx.logic.states, "key", cntx.keystate)
        let state = cntx.get()['keystate']
        if (state && state.hasOwnProperty("entries")) {
            state.entries.forEach(action => {
                this.call(action.name,cntx)
            })
        }
    }
    fsmError(message, cause) {
        this.message = message;
        this.cause = cause;
        this.name = 'fsmError';
        this.stack = cause.stack;
    }
    /**
     * Public Implementation fsm single step
     */
    event(cntx) {
        try {
            const keystate = cntx.get()['keystate']
            if (!keystate)
                throw this.fsmError("FSM error: missing current state", e)
            let trans = this.eventListener(cntx)
            if (trans) {
                let nextstate = this.gotoNextstate(trans,cntx.get()['logic'])
                if (nextstate) {
                    this.exitAction(cntx)
                    this.effectAction(trans,cntx)
                    cntx.set('keystate',nextstate)
                    this.entryAction(cntx)
                    if(nextstate.hasOwnProperty("superstate")) {
                        this.switch(cntx, nextstate.superstate, nextstate.name)
                    }              
                    this.queuecall(cntx)  
                } else {
                    throw new fsmError("FSM error: next state missing", e);
                }
            } else {
                this.stayAction(cntx)
                this.queuecall(cntx)
            }
        } catch(e) {
            console.log('Error: ' + e.name + ":" + e.message + "\n" + e.stack);
        } finally {
            //let state = cntx.logic.states[cntx.keystate]
            let state = cntx.get()['keystate']
            if (state &&
                (!state.hasOwnProperty("transitions") ||
                    state.transitions.length == 0)) {
                cntx.complete = true
                this.unswitch(cntx)
            }
            return cntx
        }
    }
}

class Content {
    /* Constructor */
    constructor(text){
        this._name_ = text;
        this._status_ = [];
        this._engine_ = null;
        this._arg_ = {
            "logic": null,
            "keystate": null,
            "complete": true
        }
    }

    engine(engine) {
        this._engine_ = engine
        return this._engine_
    }    
    bios() {
        throw new Error('You have to implement the method doSomething!');
    }
    get() {
        return this._arg_
    }
    set(name, value) {
        this._arg_[name] = value
        return this._arg_
    }
    shift(logic, istate) {
        if (!logic || !istate) return null
        /* Update status list */
        let item = this._status_[this._status_.length-1]
        item['keystate'] = this._arg_['keystate']['key']
        item['complete'] = this._arg_['complete']
        
        this.set("logic", logic)
        this.set("complete", false)
        this.set("keystate", istate)
        this._status_.push({'logic': logic["id"], 'keystate': istate['key'], 'complete': false})
        return this
    }
    unshift(manager) {
        // remove incapsulated child logic
        this._status_.pop()
        // restore parent logic
        const item = this._status_[this._status_.length-1]
        const logic = manager._logics_[item['logic']]
        this.set("logic", logic)
        this.set("complete", item['complete'])
        let istate = manager.getByKey(logic['states'], 'key', item['keystate'])
        this.set("keystate", istate)
        return this
    }
    emit() {
        if (this._engine_) 
            this._engine_.event(this)
        return this
    }
}
 
class Wrapper extends Dafsm {
    /* Constructor */
    constructor(path){
        super(path)
        this._logics_   = {}
        this._seqfuncs_ = []
    }

    trigger(fname, cntx) {
        const bios = cntx.bios()
        if(bios.hasOwnProperty(fname)) {
            return bios[fname](cntx)
        } else {
            console.error(`The function reference key: ${fname} not exist`)
            return null
        }
    }
    call(fname, cntx) {
        const bios = cntx.bios()
        this._seqfuncs_.push(bios[fname])
        console.debug('Accelerate functions seq')
    }
    queuecall(cntx) {
        this._seqfuncs_.forEach(func => {
            func(cntx)
        })
        this._seqfuncs_= []
        console.debug('Execute Queue calls')
    }
    switch(cntx, sstate, name) {
        let logic = null
        if (name != '*') {
            if (this._logics_.hasOwnProperty(name))
                logic = this._logics_[name]
            else
                logic = this.load(this.read(sstate["link"]))
            cntx.shift(logic, super.getByKey(logic['states'], 'key', 'init'))
        } else {
            logic = this.load(this.read(sstate["link"]))
            cntx.shift(logic, super.getByKey(logic['states'], 'key', 'init'))
        }
        return  
    }
    unswitch(cntx) {
        cntx.unshift(this)
        return  
    }
    read(link) {
        //console.debug(`Current directory: ${__dirname}`)
        return require(`${this._path_}${link}`)
    }
    load(json) {
        let logic = null
        if (typeof json === 'string' || json instanceof String)
            logic = JSON.parse(json)
        else
            logic = json
        this._logics_[logic["id"]] = logic
        return logic
    }
    init(logic, cntx) {
        const iState = super.getByKey(logic['states'], 'key', 'init')
        if (iState) {
            cntx.set("logic", logic)
            cntx.set("complete", false)
            cntx.set("keystate", iState)
            cntx._status_.push({'logic': logic["id"], 'keystate': iState['key'], 'complete': false})
            console.debug(`Initialization completed: ${logic["prj"]} ${logic["id"]}`)
            return cntx
        } else 
            console.error("Error: cannot find init state")
        return null
    }
}

class AsyncWrapper extends Wrapper {
    /* Constructor */
    constructor(path){
        super(path)
    }

    async runcall(func, cntx) {
        return (func.constructor.name === 'AsyncFunction')
            ? await func(cntx)
            : func(cntx);
    } 
    async seqcall(funcs, cntx) {
        let data = cntx
        await funcs.reduce( 
            (p, func) => p.then(
                () => this.runcall(func, data).then(
                    result => {
                        funcs.shift()
                })
            ), Promise.resolve(cntx)
        )
    }
    async queuecall(cntx) {
        await this.seqcall(this._seqfuncs_,cntx)
        console.debug('Execute Queue calls')
    }
}

if (typeof module !== 'undefined' &&
    typeof module.exports !== 'undefined') {
    module.exports.DAFSM = Dafsm
    module.exports.CONTENT = Content
    module.exports.WRAPPER = Wrapper
    module.exports.ASYNCWRAPPER = AsyncWrapper
}