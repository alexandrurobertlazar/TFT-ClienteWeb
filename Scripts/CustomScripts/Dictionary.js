class Dictionary {
    contents = {}
    add(key, value) {
        if (!this.contents[key]) {
            this.contents[key] = value
            return true
        }
        return false
    }
    remove(key) {
        if (!this.contents[key]) {
            return false
        }
        return delete this.contents[key];
    }
    get(key) {
        if (!this.contents[key]) {
            return null
        }
        return this.contents[key]
    }
    containsValue(val) {
        if (Object.values(this.contents).indexOf(val) > -1) return true
        return false
    }
    clone(dict) {
        this.contents = {...dict.contents}
    }
}

var dict = new Dictionary()