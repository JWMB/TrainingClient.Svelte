export class SignalXBase {
    protected registered: Function[] = [];
    dispose() {
        this.registered = [];
    }
    protected _remove(func: Function) {
        var index = this.registered.indexOf(func);
        if (index >= 0) {
            this.registered.splice(index, 1);
        }
    }
}
export class SignalX0 extends SignalXBase {
    add(func: () => void) {
        this.registered.push(<Function>func);
    }
    remove(func: () => void) {
        this._remove(func);
    }
    dispatch() {
        for (var i: number = 0; i < this.registered.length; i++) {
            (<() => void>this.registered[i])();
        }
    }
}
export class SignalX1<T1> extends SignalXBase {
    add(func: (arg1: T1) => void) {
        this.registered.push(func);
    }
    remove(func: (arg1: T1) => void) {
        this._remove(func);
    }
    dispatch(arg1: T1) {
        for (var i: number = 0; i < this.registered.length; i++) {
            (<(arg1: T1) => void>this.registered[i])(arg1);
        }
    }
}
export class SignalX2<T1, T2> extends SignalXBase {
    add(func: (arg1: T1, arg2: T2) => void) {
        this.registered.push(func);
    }
    remove(func: (arg1: T1, arg2: T2) => void) {
        this._remove(func);
    }
    dispatch(arg1: T1, arg2: T2) {
        for (var i: number = 0; i < this.registered.length; i++) {
            (<(arg1: T1, arg2: T2) => void>this.registered[i])(arg1, arg2);
        }
    }
}