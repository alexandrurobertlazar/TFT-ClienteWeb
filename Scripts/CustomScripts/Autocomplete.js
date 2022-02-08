lastInsertedNumber = {}
filterPlurals = false
filterFeminines = false
filterSingulars = false
filterMasculines = false
showDecimals = false
showNumbersAboveThousands = true
// This is used for the case when we insert numbers <100,
// like "un", so that we do not remove numbers like "cien"
// when they might be needed.
var tempRemovedNumbers = []
// Singleton for number reloading
var allNumbers = new Dictionary()
/**
 * Processes the numbers to be added to the autocompleting function.
 * This adds the plurals and feminines.
 * @param {string} key - The text value of the number to be added.
 * @param {string} val - The numerical value of the number to be added.
 */
function treatNumbersToAdd(key, val) {
    dict.add(key, val)
    if (key.includes('illón')) {
        var pluralKey = key.slice(0, -5)
        pluralKey += 'illones'
        dict.add(pluralKey, val)
    }
    if (key === 'millardo') {
        dict.add(key + 's', val)
    }
    if (val.length >= 2 && !val.includes('/') && !dict.containsValue('/' + val)) {
        var normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (key.lastIndexOf("a") == key.length - 1) {
            dict.add(normalizedKey + "vo", '/' + val)
            dict.add(normalizedKey + "vos", '/' + val)
        } else {
            dict.add(normalizedKey + "avo", '/' + val)
            dict.add(normalizedKey + "avos", '/' + val)
        }
    }
    if (val.includes('/') || key === 'uno') {
        if (key.lastIndexOf("o") == key.length - 1) {
            dict.add(key + "s", val)
            dict.add(key.substring(0, key.length - 1) + "a", val)
            dict.add(key.substring(0, key.length - 1) + "as", val)
        }
    }
    else if (key.includes("uno")) {
        dict.add(key.substring(0, key.length - 1) + "a", val)
    }
    if (key.lastIndexOf("os") === key.length - 2 && val.length >= 3) {
        dict.add(key.substring(0, key.length - 2) + "as", val)
    }
    if (key.includes('mitad')) {
        dict.add('mitades', val)
    }
}
/**
 * This method reloads all the numbers.
 * @param {boolean} resetFemininesFilter - Boolean that triggers the feminines filter to become false.
 * @param {boolean} resetPluralsFilter - Boolean that triggers the plurals filter to become false.
 * @param {boolean} resetLastInsertedNumber - Boolean that resets the last inserted number.
 * @param {boolean} resetNumbersAboveThousands - Boolean that triggers the filter that allows showing numbers above 1000 to become false.
 */
async function reloadAllNumbers(resetFemininesFilter = true, resetPluralsFilter = true, resetLastInsertedNumber = false, resetNumbersAboveThousands = true) {
    tempRemovedNumbers = []
    if (resetLastInsertedNumber) lastInsertedNumber = {}
    if (resetFemininesFilter) filterFeminines = false
    if (resetPluralsFilter) filterPlurals = false
    if (resetNumbersAboveThousands) showNumbersAboveThousands = true
    if (Object.keys(allNumbers.contents).length === 0) {
        var response = await $.ajax({
            type: 'GET',
            url: 'Default.aspx/GetNumbers',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json'
        })
        for (let [key, val] of Object.entries(response.d)) {
            treatNumbersToAdd(key, val)
        }
        dict.add("menos", "-")
        dict.add("con", "")
        dict.add("y", "")
        dict.add("coma", "")
        allNumbers.clone(dict)
    } else {
        dict.clone(allNumbers)
    }
}

reloadAllNumbers()
/**
 * Function that fills the autocomplete from an inserted number.
 * @param {string} num - The last inserted number in the textbox.
 */
function getSimilarNumbers(num) {
    similarNumbers = []
    if (num === '') {
        document.getElementById('number-options').innerHTML = ''
        restoreNumbersUntilLastClicked()
        return
    }
    for (let [key, val] of Object.entries(dict.contents)) {
        if (searchQuery !== '' && key.search('\\b' + searchQuery.trim() + '.*') == 0 && !(tempRemovedNumbers.includes(key))) {
            treatAutocompleteNumbers(key, val)
        }
    }
    document.getElementById('number-options').innerHTML = ''
    similarNumbers.forEach((number) => {
        document.getElementById('number-options').innerHTML += `<li tabindex="0" onclick="clickedNumber('${number}')" onkeydown="handlePossibleClick('${number}')" class="even:bg-gray-100 cursor-pointer px-2 hover:font-bold w-auto focus:font-bold">${number}<br></li>`
    })
}
/**
 * This function filters the numbers to be added to the autocomplete.
 * @param {string} key - The text value of the number.
 * @param {string} val - The numerical value of the number.
 */
function treatAutocompleteNumbers(key, val) {
    if (val.length >= 4 && !showNumbersAboveThousands) {
        return
    }
    if (lastInsertedNumber && key === "menos") {
        return
    }
    if (!lastInsertedNumber && val.includes('/')) {
        return
    }
    let splitWords = document.getElementById("MainContent_TextBox1").value.trim().split(" ")
    let indexWhereAdditionShouldBe = splitWords.lastIndexOf(lastInsertedNumber.text) + 1
    // can't insert numbers like "veinte tres": control it here
    if (lastInsertedNumber.value && lastInsertedNumber.value.length == 2 && !val.includes('/')) {
        if (splitWords[indexWhereAdditionShouldBe] !== 'y' && splitWords[indexWhereAdditionShouldBe] !== 'coma' && splitWords[indexWhereAdditionShouldBe] !== 'con') {
            return
        } else {
            filterFeminines = true
        }
    }
    // can't insert numbers like "y décimo": control it here
    if ((splitWords[indexWhereAdditionShouldBe] === 'y' && splitWords[indexWhereAdditionShouldBe] === 'coma' && splitWords[indexWhereAdditionShouldBe] === 'con') && val.includes('/')) {
        return
    }
    if (filterFeminines) {
        if (filterPlurals) {
            if (key.lastIndexOf("os") === key.length - 2 && val.length > 1 || key == "unos" || key.lastIndexOf("as") !== key.length - 2 && (val.length > 4 || val.includes("/")) || val.includes('/') && key.lastIndexOf("o") === key.length-1) {
                return
            }
        } else {
            if (key.lastIndexOf("os") === key.length - 2 && val.length > 1 || key == "un" || key == "uno" || key == "unos" || key.lastIndexOf("a") !== key.length - 1 && val.length > 4 || key.lastIndexOf("as") === key.length - 2 && !key.includes('cient') || val.includes('/') && key.lastIndexOf("o") === key.length - 1) {
                return
            }
        }
    } else if (val.includes('/')) {
        if (!filterPlurals) return
    }
    // treat special case: numbers ending with "uno" (like veintiuno)
    if (lastInsertedNumber.text && lastInsertedNumber.text.includes("uno")) {
        return
    }
    // treat special case: "ciento/cien"
    if (lastInsertedNumber.text == "ciento") {
        if (val.length <= 2) similarNumbers.push(key)
        return
    } else if (lastInsertedNumber.text == "cien") {
        if (val.length > 3) similarNumbers.push(key)
        return
    }
    
    // treat plural numbers
    if (lastInsertedNumber.text !== undefined && lastInsertedNumber.value !== "1" || filterPlurals) {
        if (!key.includes('illón') && !(key === 'millardo') && !(new RegExp(/avo\b/).test(key))) similarNumbers.push(key)
    } else if (lastInsertedNumber.text !== undefined) {
        if (!key.includes('illones') && !(key === 'millardos') && !key.includes('avos')) similarNumbers.push(key)
    } else if (val.length < 7 && !key.includes('avo')) {
        // can't insert numbers like "millón" without putting a number beforehand.
        similarNumbers.push(key)
    }
}
/** Function that restores the status of the autocomplete until the last clicked number. */
async function restoreNumbersUntilLastClicked() {
    await reloadAllNumbers()
    var words = document.getElementById('MainContent_TextBox1').value.trim().split(" ")
    for (i = 0; i < words.length; i++) {
        clickedNumber(words[i], false, false)
    }
}
/**
 * 
 * @param {string} num - The inserted number, as text.
 * @param {boolean} spaceSeparate - Triggers if a space should be inserted after the number (useful for fractions)
 * @param {boolean} insertNumberInTextBox - Triggers if the number should be actually added into the text box.
 */
function clickedNumber(num, spaceSeparate = true, insertNumberInTextBox = true) {
    if (num === '') return
    // reset query on searchbox
    var textValue = document.getElementById('MainContent_TextBox1').value
    if (insertNumberInTextBox) {
        document.getElementById('MainContent_TextBox1').value = textValue.substring(0, textValue.lastIndexOf(searchQuery))
        if (spaceSeparate === true) document.getElementById('MainContent_TextBox1').value += num + " "
        else document.getElementById('MainContent_TextBox1').value += num
    }
    searchQuery = ""
    // if number is a decimal, reset everything
    if (num === 'con' || num === 'coma' || textValue.substring(0, textValue.lastIndexOf(searchQuery)).includes('y')) {
        filterFeminines = true
        reloadAllNumbers(false)
        return
    }
    if (num.lastIndexOf("os") == num.length - 2) {
        filterPlurals = true
    } else if (num.lastIndexOf("as") == num.length - 2) {
        filterPlurals = true
        filterFeminines = true
    } else if (num.lastIndexOf("a") == num.length - 1 && dict.get(num) && dict.get(num).lastIndexOf("0") !== dict.get(num).length - 1) {
        filterFeminines = true
    }
    // Remove numbers from dict
    if (num == "menos") dict.remove("menos")
    var numericNum = dict.get(num)
    if (numericNum !== "1") {
        filterPlurals = true
    } else {
        filterSingulars = true
    }
    for (let [key, val] of Object.entries(dict.contents)) {
        if (numericNum && !val.includes('/') && val.length >= numericNum.length) {
            if (parseInt(numericNum) < 1000) {
                if (parseInt(val) < 1000) {
                    tempRemovedNumbers.push(key)
                }
            } else {
                if (parseInt(numericNum) >= 1000) {
                    tempRemovedNumbers = []
                }
                if ((parseInt(numericNum) && parseInt(numericNum) >= 1000000) || !dict.get("millón")) dict.remove(key)
            }
        }
    }
    if (lastInsertedNumber.text == "mil" && numericNum && numericNum.length < 4) {
        showNumbersAboveThousands = false
    }
    lastInsertedNumber.text = num
    lastInsertedNumber.value = numericNum
    document.getElementById('number-options').innerHTML = ''
}

/** Event that handles pressing "Enter" on the keyboard to be interpreted as a click to the search button. */
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault()
        $('#MainContent_Button1').click()
    }
})