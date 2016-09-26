
class ReceiptRefresher {

    dispatch = null
    timer = null

    constructor(dispatch) {
        this.dispatch = dispatch
    }

    _tick() {

    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    }

    start() {
        this.timer = setInterval(()=> this._tick(), 10000)
    }
}

export default ReceiptRefresher
