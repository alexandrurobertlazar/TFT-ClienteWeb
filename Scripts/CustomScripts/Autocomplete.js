lastInsertedNumber = {
    index: -1
}
filterPlurals = false
filterFeminines = false
filterSingulars = false
filterMasculines = false
filterYSeparator = false
excessDecimalSeparators = false
separatorInserted = false
showNumbersAboveThousands = true
wasLastNumberSeparator = false
maxLengthInText = 0

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
    if (key !== 'tercero') dict.add(key, val)
    if (key.includes('illón')) {
        pluralKey = key.replace('illón', 'illones')
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
            if (!key.includes('terci') && !key.includes('medi')) {
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
    if (key === 'mitad') {
        dict.add('mitades', val)
    }
    if (key === 'tercera') {
        dict.add('terceras', val)
    }
    if (val.length >= 4 && val.includes('1000') && key !== 'millardo') {
        dict.add(normalizedKey + 'ésima', '/' + val)
        dict.add(normalizedKey + 'ésimo', '/' + val)
        dict.add(normalizedKey + 'ésimas', '/' + val)
        dict.add(normalizedKey + 'ésimos', '/' + val)
    }
}
/** Function that checks if the last number is still complete (in case of deletion) */
function isLastNumberStillComplete() {
    if (!lastInsertedNumber.text) return true
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
async function reloadAllNumbers() {
    if (Object.keys(dict.contents).length === 0) {
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
    fracNum = separateValidNumbers(num)
    similarNumbers = []
    // this works in case the last number was deleted using the mouse
    if (num === '' || !isLastNumberStillComplete()) {
        document.getElementById('number-options').innerHTML = ''
        restoreNumbersUntilLastClicked()
        return
    }
    for (let [key, val] of Object.entries(dict.contents)) {
        if (searchQuery !== '' && key.search('\\b' + num.trim() + '.*') === 0) {
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
        if (index === splitWordsFromSeparator.length - 1) return
        if ((numericNum = dict.get(word)) !== null) {
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
        if ((numericNum = dict.get(splitWordsFromSeparator[i])) !== null) {
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
    if (excessDecimalSeparators) {
        if (wasLastNumberSeparator && val.length >= 2) return
    }
    if (val.length >= 6 && val.length >= maxLengthInText && maxLengthInText !== 0 && !val.includes('/')) return
    if (val.length >= 4 && !showNumbersAboveThousands) {
        return
    }
    if (lastInsertedNumber.text) {
        if (key === "menos") return
        if (lastInsertedNumber.text.substr(lastInsertedNumber.text.length - 3) == 'uno' && val !== ',') return
        if (lastInsertedNumber.text.substr(lastInsertedNumber.text.length - 3) == 'una' && !val.includes('/') && val !== ',') return
        if (!val.includes('/') && lastInsertedNumber.value.length <= 3 && val.length <= 3 && val.length >= lastInsertedNumber.value.length && val !== ',') return
        if (lastInsertedNumber.value.includes('/') && (val.includes('/') || val === ',')) return
        if (lastInsertedNumber.value.length >= 6 && val.includes('/')) return
    }
    if (!lastInsertedNumber.text) {
        if (val.includes('/')) return
        if (val.length > 4) return
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
    if (filterFeminines) {
        if (val === '1' && key !== 'una' && key !== 'un') return
        if (key.includes('uno')) return
        if (key.includes('medio')) return
        // "Ciento" y "cien" are special cases that should not be filtered down.
        if ((val.length === 3 || val.includes('/')) && key !== 'cien' && key !== 'ciento') {
            if (filterPlurals && !key.includes('as')) return
            if (filterSingulars && key.includes('as')) return
            if (key.substr(key.length - 2) == 'os' || key.substr(key.length - 1) == 'o') return
        }
        if (lastInsertedNumber.value === '1' && (key === 'mil' || val.length >= 6)) return
    }
    if (filterMasculines) {
        if (key.includes('una')) return
        if (key.includes('mitad')) return
        if ((val.length === 3 || val.includes('/')) && key !== 'cien' && key !== 'ciento') {
            if (filterPlurals && !key.includes('os')) return
            if (filterSingulars && key.includes('os')) return
            if (key.substr(key.length - 2) == 'as' || key.substr(key.length - 1) == 'a') return
        }
    }
    if (filterPlurals) {
        if (val.length >= 6 || val.includes('/')) {
            if (key.substr(key.length - 2) !== 'as' && key.substr(key.length - 2) !== 'os' && key.substr(key.length - 2) !== 'es') return
        }        
    }
    if (filterSingulars) {
        if (val.length >= 6 || val.includes('/')) {
            if (key.substr(key.length - 2) === 'as' || key.substr(key.length - 2) === 'os' || key.substr(key.length - 2) === 'es') return
        }
    }
    if (separatorInserted) {
        if (val.includes('/') && !val.includes('/10')) return
        if (key.includes('avo') || key.includes('ava')) return
        if (val === ',') {
            if (key !== 'y') return
            if (key === 'y' && filterYSeparator && lastInsertedNumber.value.length !== 2) return
        }
        if (val.includes('/')) {
            var minUnits = getMaxUnitsFromText()
            if (val.length - 2 < minUnits) return
        }
    }
    if (lastInsertedNumber.text == "ciento") {
        if (val.length <= 2) similarNumbers.push(key)
        return
    } else if (lastInsertedNumber.text == "cien") {
        if (val.length > 3) similarNumbers.push(key)
        return
    }
    similarNumbers.push(key)
}
/*
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
}*/
/** Function that restores the status of the autocomplete until the last clicked number. */
async function restoreNumbersUntilLastClicked() {
    lastInsertedNumber = {};
    lastInsertedNumber.index = -1;
    filterPlurals = false
    filterFeminines = false
    filterSingulars = false
    filterMasculines = false
    filterYSeparator = false
    excessDecimalSeparators = false
    separatorInserted = false
    showNumbersAboveThousands = true
    maxLengthInText = 0
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
    // reset suggestions
    document.getElementById('number-options').innerHTML = ''
    searchQuery = ""
    // if number is a decimal, reset everything
    if (num === 'con' || num === 'coma' || num === 'y') {
        wasLastNumberSeparator = true
        if (separatorInserted) {
            if (num !== 'y') excessDecimalSeparators = true
            if (num === 'y' && filterYSeparator) excessDecimalSeparators = true
        }
        if (!filterYSeparator) {
            if (lastInsertedNumber.value.length !== 2) filterYSeparator = true
            filterPlurals = false
            filterFeminines = true
            filterSingulars = false
            filterMasculines = false
            separatorInserted = true
            showNumbersAboveThousands = true
            lastInsertedNumber.text = null
            lastInsertedNumber.value = null
            lastInsertedNumber.index += 1
            maxLengthInText = 0
        }
        return
    }
    wasLastNumberSeparator = false
    var numericNum = dict.get(num)
    if (numericNum && numericNum !== '1') {
        filterPlurals = true
        filterSingulars = false
        if (num.lastIndexOf("as") == num.length - 2) {
            filterFeminines = true
            filterMasculines = false
        } else if (num.lastIndexOf("os") == num.length - 2 && numericNum.length >= 2) {
            filterMasculines = true
            filterFeminines = false
        }
        if (!num.includes('/') && num.length >= 6) {
            filterPlurals = false
            filterSingulars = false
        }
    } else if (numericNum && !lastInsertedNumber.text) {
        filterSingulars = true
        filterPlurals = false
        if (num.lastIndexOf("a") == num.length - 1 && dict.get(num) && dict.get(num).lastIndexOf("0") !== dict.get(num).length - 1) {
            filterFeminines = true
            filterMasculines = false
        } else if (num.lastIndexOf("a") == num.length - 1 && dict.get(num) && dict.get(num).lastIndexOf("0") !== dict.get(num).length - 1) {
            filterMasculines = true
            filterFeminines = false
        }
    }
    if (num.includes('un')) {
        if (num.includes('a') && !num.includes('as')) {
            filterSingulars = true
            filterFeminines = true
            filterPlurals = false
            filterMasculines = false
        } else if (num.includes('as')) {
            filterMasculines = false
            filterSingulars = false
            filterPlurals = true
            filterFeminines = true
        } else {
            filterMasculines = true
            filterSingulars = true
            filterPlurals = false
            filterFeminines = false
        }
    }
    lastInsertedNumber.text = num
    lastInsertedNumber.value = numericNum
    lastInsertedNumber.index = textValue.split(" ").lastIndexOf(num)
    if (numericNum.length >= 6) maxLengthInText = numericNum.length
    document.getElementById('number-options').innerHTML = ''
}

/** Event that handles pressing "Enter" on the keyboard to be interpreted as a click to the search button. */
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault()
        $('#MainContent_Button1').click()
    }
})