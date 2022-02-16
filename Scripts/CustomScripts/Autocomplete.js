lastInsertedNumber = {}
filterPlurals = false
filterFeminines = false
filterSingulars = false
filterMasculines = false
showDecimals = false
separatorInserted = false
showNumbersAboveThousands = true
// This is used for the case when we insert numbers <100,
// like "un", so that we do not remove numbers like "cien"
// when they might be needed.
var tempRemovedNumbers = []
// Singleton for number reloading
var allNumbers = new Dictionary()

function separateValidNumbers(input) {
    input = input.replace('avos', '')
    input = input.replace('avas', '')
    input = input.replace('avo', '')
    input = input.replace('ava', '')
    let lastPos = input.length
    let resultNumbers = []
    let foundValidNumber = false
    let lastPosOfInvalidNumber = 0
    for (let i = input.length - 1; i >= 0; i--) {
        if (!foundValidNumber) {
            let tempValidNumbers = [] // useful for situations like "cien/ciento"
            for (let j = 0; j <= input.length - i; j++) {
                let partNumber = input.substr(i, j)
                if (partNumber.includes('llon') && !partNumber.includes('millones')) {
                    partNumber = partNumber.replace('llon', 'llón')
                }
                if (dict.get(partNumber)) {
                    lastPos = i
                    lastPosOfInvalidNumber = i+j
                    tempValidNumbers.push(partNumber)
                    foundValidNumber = true
                }
            }
            if (tempValidNumbers.length > 0 && !resultNumbers.includes(tempValidNumbers[tempValidNumbers.length - 1])) resultNumbers.push(tempValidNumbers[tempValidNumbers.length-1])
        } else {
            let partNumber = input.substr(i, lastPos - i)
            switch (partNumber) {
                case "i":
                    lastPos = i;
                    break;
                case "veint":
                    partNumber = "veinte";
                    break;
                case "diec":
                    partNumber = "diez";
                    break;
                case "cient":
                    partNumber = "ciento";
                    break;
                case "cent":
                    partNumber = "ciento";
                    break;
            }
            if (partNumber.includes('llon') && !partNumber.includes('millones')) {
                partNumber = partNumber.replace('llon', 'llón')
            }
            if (dict.get(partNumber)) {
                lastPos = i
                resultNumbers.push(partNumber)
            }
        }
    }
    return {
        validNumbers: resultNumbers,
        invalidNum: input.substr(lastPosOfInvalidNumber)
    }
}
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
            dict.add(normalizedKey + "va", '/' + val)
            dict.add(normalizedKey + "vas", '/' + val)
        } else {
            dict.add(normalizedKey + "avo", '/' + val)
            dict.add(normalizedKey + "avos", '/' + val)
            dict.add(normalizedKey + "ava", '/' + val)
            dict.add(normalizedKey + "avas", '/' + val)
        }
    }
    if (val.includes('/') || key === 'uno') {
        if (key.lastIndexOf("o") == key.length - 1) {
            dict.add(key + "s", val)
            if (!key.includes('terci')) {
                dict.add(key.substring(0, key.length - 1) + "a", val)
                dict.add(key.substring(0, key.length - 1) + "as", val)
            }
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
    if (val.length >= 4 && val.includes('1000') && key !== 'millardo') {
        dict.add(normalizedKey + 'ésima', val)
        dict.add(normalizedKey + 'ésimo', val)
        dict.add(normalizedKey + 'ésimas', val)
        dict.add(normalizedKey + 'ésimos', val)
    }
}
/** Function that checks if the last number is still complete (in case of deletion) */
function isLastNumberStillComplete() {
    let splitWords = document.getElementById("MainContent_TextBox1").value.trim().split(" ")
    if (splitWords[lastInsertedNumber.index] !== lastInsertedNumber.text) return false
    return true
}
/**
 * This method reloads all the numbers.
 * @param {boolean} resetFemininesFilter - Boolean that triggers the feminines filter to become false.
 * @param {boolean} resetPluralsFilter - Boolean that triggers the plurals filter to become false.
 * @param {boolean} resetLastInsertedNumber - Boolean that resets the last inserted number.
 * @param {boolean} resetNumbersAboveThousands - Boolean that triggers the filter that allows showing numbers above 1000 to become false.
 */
async function reloadAllNumbers(resetFemininesFilter = true, resetPluralsFilter = true, resetLastInsertedNumber = false, resetNumbersAboveThousands = true, resetSeparatorInsertion = true) {
    tempRemovedNumbers = []
    if (resetLastInsertedNumber) lastInsertedNumber = {}
    if (resetFemininesFilter) filterFeminines = false
    if (resetPluralsFilter) filterPlurals = false
    if (resetNumbersAboveThousands) showNumbersAboveThousands = true
    if (resetSeparatorInsertion) separatorInserted = false
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
        dict.add("con", ",")
        dict.add("y", ",")
        dict.add("coma", ",")
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
    num = num.toLowerCase()
    console.log(num)
    similarNumbers = []
    if (num === '' || !isLastNumberStillComplete()) {
        document.getElementById('number-options').innerHTML = ''
        restoreNumbersUntilLastClicked()
        return
    }
    for (let [key, val] of Object.entries(dict.contents)) {
        if (searchQuery !== '' && key.search('\\b' + num.trim() + '.*') == 0 && !(tempRemovedNumbers.includes(key))) {
            treatAutocompleteNumbers(key, val)
        }
    }
    document.getElementById('number-options').innerHTML = ''
    similarNumbers.forEach((number) => {
        document.getElementById('number-options').innerHTML += `<li tabindex="0" onclick="clickedNumber('${number}')" onkeydown="handlePossibleClick('${number}')" class="even:bg-gray-100 cursor-pointer px-2 hover:font-bold w-auto focus:font-bold">${number}<br></li>`
    })
}
/**
 * This function gets the maximum length of a number after the separator.
*/
function getMaxUnitsFromText() {
    let text = document.getElementById("MainContent_TextBox1").value
    // special separator "y": must be the last one
    let indexOfSeparator = text.indexOf('con')
    if (indexOfSeparator === -1) indexOfSeparator = text.indexOf('coma')
    if (indexOfSeparator === -1) indexOfSeparator = text.lastIndexOf('y')
    if (indexOfSeparator === -1) return
    let splitWordsFromSeparator = text.substr(indexOfSeparator).trim().split(" ")
    splitWordsFromSeparator.shift()
    let firstMaxLength = 0
    let firstMaxLengthIndex = 0
    splitWordsFromSeparator.forEach((word, index) => {
        if ((numericNum = allNumbers.get(word)) !== null) {
            if (!numericNum.includes('/')) {
                if (numericNum.length > 4) {
                    firstMaxLength = numericNum.length
                    firstMaxLengthIndex = index
                    return
                } else {
                    if (numericNum.length > firstMaxLength) {
                        firstMaxLength = numericNum.length
                        firstMaxLengthIndex = index
                    }
                }
            }
        } else {
            if (index < splitWordsFromSeparator.length - 1) firstMaxLength = -1
            return
        }
    })
    if (firstMaxLength == -1) return -1
    let finalLength = firstMaxLength > 4 ? firstMaxLength-1 : firstMaxLength
    // check previous numbers, if length > 1 add it (-1)
    for (i = firstMaxLengthIndex-1; i >= 0; i--) {
        if ((numericNum = allNumbers.get(splitWordsFromSeparator[i])) !== null) {
            if (numericNum.length === 4) finalLength += 4
            else if (i === 0) finalLength += numericNum.length-1
        } else {
            return -1
        }
    }
    return finalLength
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
    if (lastInsertedNumber.text && key === "menos") {
        return
    }
    if (!lastInsertedNumber.text && val.includes('/')) {
        return
    }
    let splitWords = document.getElementById("MainContent_TextBox1").value.trim().split(" ")
    let indexWhereAdditionShouldBe = splitWords.lastIndexOf(lastInsertedNumber.text) + 1
    // can't insert numbers like "veinte tres": control it here
    if (lastInsertedNumber.value && lastInsertedNumber.value.length == 2 && !val.includes('/') && val !== ',' && val.length < 4) {
        if (splitWords[indexWhereAdditionShouldBe] !== 'y' && splitWords[indexWhereAdditionShouldBe] !== 'coma' && splitWords[indexWhereAdditionShouldBe] !== 'con') {
            return
        }
    }
    // can't insert numbers like "y décimo": control it here
    if ((splitWords[indexWhereAdditionShouldBe] === 'y' || splitWords[indexWhereAdditionShouldBe] === 'coma' || splitWords[indexWhereAdditionShouldBe] === 'con') && val.includes('/')) {
        return
    }
    if (filterFeminines && (val.length === 3 || key.includes('os'))) {
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
        if (!filterPlurals) {
            if (key.toLowerCase().substr(key.length - 2) == 'os' || key.toLowerCase().substr(key.length - 2) == 'as') {
                return
            }
        }
    }
    // treat special case: numbers ending with "uno" (like veintiuno)
    if (lastInsertedNumber.text && lastInsertedNumber.text.includes("uno") && val !== ',') {
        return
    }
    if (separatorInserted) {
        if (val.includes('/') && !val.includes('/10')) return
        if (key.includes('avo') || key.includes('ava')) return
        if (val.includes(',') && key !== 'y') return
        if (val.includes('/')) {
            var minUnits = getMaxUnitsFromText()
            if (val.length - 2 < minUnits) return
        }
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
    await reloadAllNumbers(true, true, true)
    var words = document.getElementById('MainContent_TextBox1').value.trim().split(" ")
    for (i = 0; i < words.length; i++) {
        if (dict.get(words[i])) clickedNumber(words[i], false, false)
        else return
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
        reloadAllNumbers(false, true, true)
        filterFeminines = true
        separatorInserted = true
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
    document.getElementById('MainContent_TextBox1').value.split(" ").forEach((word, index) => {
        if (word === num) {
            lastInsertedNumber.index = index
            return
        }
    })
    document.getElementById('number-options').innerHTML = ''
}

/** Event that handles pressing "Enter" on the keyboard to be interpreted as a click to the search button. */
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault()
        $('#MainContent_Button1').click()
    }
})