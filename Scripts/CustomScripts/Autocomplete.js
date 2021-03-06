/**
 * Processes the numbers to be added to the autocompleting function.
 * This adds the plurals and feminines.
 * @param {string} key - The text value of the number to be added.
 * @param {string} val - The numerical value of the number to be added.
 */
function treatNumbersToAdd(key, val) {
    var normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (key !== 'tercero') dict.add(key, val)
    if (key.includes('illón')) {
        pluralKey = key.replace('illón', 'illones')
        dict.add(pluralKey, val)
    }
    if (key === 'millardo') {
        dict.add(key + 's', val)
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
        dict.add("diez" + normalizedKey + 'ésima', '/' + val + "0")
        dict.add("diez" + normalizedKey + 'ésimo', '/' + val + "0")
        dict.add("diez" + normalizedKey + 'ésimas', '/' + val + "0")
        dict.add("diez" + normalizedKey + 'ésimos', '/' + val + "0")
        dict.add("cien" + normalizedKey + 'ésima', '/' + val + "00")
        dict.add("cien" + normalizedKey + 'ésimo', '/' + val + "00")
        dict.add("cien" + normalizedKey + 'ésimas', '/' + val + "00")
        dict.add("cien" + normalizedKey + 'ésimos', '/' + val + "00")
    }
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
        dict.add("y", " ")
        dict.add("coma", ",")
    }
}

reloadAllNumbers()
/**
 * Function that fills the autocomplete from an inserted number.
 * @param {string} num - The last inserted number in the textbox.
 */
function getSimilarNumbers(num) {
    // changed to stateless implementation
    lastInsertedNumber = {
        index: -1
    }
    filterPlurals = false
    filterFeminines = false
    filterSingulars = false
    filterMasculines = false
    excessDecimalSeparators = false
    separatorInserted = false
    showThousands = true
    wasLastNumberSeparator = false
    maxLengthInText = 0
    filterFractions = false
    isFractionEnded = false
    wrongNumber = false

    var num = num.toLowerCase()
    similarNumbers = []

    num.split(" ").forEach((word, index) => {
        word = word.trim().toLowerCase()
        if (index < num.split(' ').length - 1) {
            clickedNumber(word, false)
        }        
    })
    num = num.split(" ")[num.split(" ").length - 1]
    for (let [key, val] of Object.entries(dict.contents)) {
        if (num !== '' && key.search('\\b' + num.trim() + '.*') === 0) {
            treatAutocompleteNumbers(key, val)
        }
    }
    document.getElementById('number-options').innerHTML = ''
    similarNumbers.forEach((number) => {
        document.getElementById('number-options').innerHTML += `<li onclick="clickedNumber('${number}')" class="even:bg-gray-100 cursor-pointer p-2 hover:font-bold w-auto" id='auto-${number}'>${number}<br></li>`
    })
}
/**
 * This function gets the maximum length of a number after the separator.
*/
function getMaxUnitsFromText() {
    let text = document.getElementById("MainContent_TextBox1").value
    let indexOfSeparator = text.indexOf('con')
    if (indexOfSeparator === -1) indexOfSeparator = text.indexOf('coma')
    if (indexOfSeparator === -1) {
        var splitWords = text.split(" ")
        for (i = 1; i < splitWords.length; i++) {
            if (!dict.get(splitWords[i - 1]).includes('/') && dict.get(splitWords[i - 1]).length !== 2) {
                indexOfSeparator = i
                break
            }
        }
    }
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
function treatAutocompleteNumbers(key, val, isTestMode = false) {
    if (excessDecimalSeparators) {
        if (val == ",") return false
    }
    if (wrongNumber) return false
    if (val.length >= 6 && val.length >= maxLengthInText && maxLengthInText !== 0 && !val.includes('/')) return false
    if (val.length === 4 && !showThousands) {
        return false
    }
    if (lastInsertedNumber.text) {
        if (key === "y") {
            if (lastInsertedNumber.value.length != 2 || parseInt(lastInsertedNumber.value) % 10 != 0 || lastInsertedNumber.value == "10") return false
        }
        if (key === "menos") return false
        if (lastInsertedNumber.text === "y") {
            if (val.length != 1 || !parseInt(val) || parseInt(val) === 0) return false
        }
        else {
            if (lastInsertedNumber.value && lastInsertedNumber.value.includes('/')) return false
            if (lastInsertedNumber.text.substr(lastInsertedNumber.text.length - 3) == 'uno' && val !== ',') return false
            if (lastInsertedNumber.text.substr(lastInsertedNumber.text.length - 3) == 'una' && val !== ',') return false
            if (!val.includes('/') && val !== '.' && lastInsertedNumber.value.length <= 3 && val.length <= 3 && val.length >= lastInsertedNumber.value.length && val !== ',') return false
            if (lastInsertedNumber.value.includes('/') && (val.includes('/') || val === ',')) return false
            if (lastInsertedNumber.value.length >= 6 && val.includes('/')) return false
        }        
    }
    if (!lastInsertedNumber.text) {
        if (val.includes('/') || val.length > 4) return false
    }
    let splitWords = document.getElementById("MainContent_TextBox1").value.trim().split(" ")
    let indexWhereAdditionShouldBe = splitWords.lastIndexOf(lastInsertedNumber.text) + 1
    // can't insert numbers like "veinte tres": control it here
    if (lastInsertedNumber.value && lastInsertedNumber.value.length == 2 && !val.includes('/') && val !== ',' && key !== 'y' && val.length < 4) {
        if (splitWords[indexWhereAdditionShouldBe] !== 'coma' && splitWords[indexWhereAdditionShouldBe] !== 'con') {
            return false
        }
    }
    // can't insert numbers like "y décimo": control it here
    if ((splitWords[indexWhereAdditionShouldBe] === 'coma' || splitWords[indexWhereAdditionShouldBe] === 'con') && val.includes('/')) {
        return false
    }
    if (filterFeminines) {
        if (val === '1' && key !== 'una' && key !== 'un') return false
        if (key.includes('uno') || key.substr(-2) == "ún") return false
        if (key.includes('medio')) return false
        // "Ciento" y "cien" are special cases that should not be filtered down.
        if ((val.length === 3 || val.includes('/')) && key !== 'cien' && key !== 'ciento') {
            if (filterPlurals && !key.includes('as')) return false
            if (filterSingulars && key.includes('as')) return false
            if (key.substr(key.length - 2) == 'os' || key.substr(key.length - 1) == 'o') return false
        }
        if (lastInsertedNumber.value === '1' && (key === 'mil' || val.length >= 6)) return false
        if (key == "millardos") return false;
    }
    if (filterMasculines) {
        if (key.includes('una')) return false
        if (key.includes('mitad')) return false
        if ((val.length === 3 || val.includes('/')) && key !== 'cien' && key !== 'ciento') {
            if (filterPlurals && !key.includes('os')) return false
            if (filterSingulars && key.includes('os')) return false
            if (key.substr(key.length - 2) == 'as' || key.substr(key.length - 1) == 'a') return false
        }
    }
    if (filterPlurals) {
        if (val.length >= 6 || val.includes('/')) {
            if (key.substr(key.length - 2) !== 'as' && key.substr(key.length - 2) !== 'os' && key.substr(key.length - 2) !== 'es') return false
        }        
    }
    if (filterSingulars) {
        if (val.length >= 6 || val.includes('/')) {
            if (key.substr(key.length - 2) === 'as' || key.substr(key.length - 2) === 'os' || key.substr(key.length - 2) === 'es') return false
        }
    }
    if (separatorInserted) {
        if (val.includes('/') && !val.includes('/10')) return false
        if (key.includes('avo') || key.includes('ava')) return false
        if (val === ',') {
            return false
        }
        if (val.includes('/')) {
            var minUnits = getMaxUnitsFromText()
            if (val.length - 2 < minUnits) return false
        }
    }
    if (lastInsertedNumber.text == "ciento") {
        if (val.length <= 2) similarNumbers.push(key)
        return false
    } else if (lastInsertedNumber.text == "cien") {
        if (val.length > 3) similarNumbers.push(key)
        return false
    } else if (lastInsertedNumber.text == "un" && val == "1000") return false;
    if (isTestMode) return true
    if (!similarNumbers.includes(key)) {
        similarNumbers.push(key)
    }
}
/**
 * 
 * @param {string} num - The inserted number, as text.
 * @param {boolean} insertNumberInTextBox - Triggers if the number should be actually added into the text box.
 */
rightInsertedNumbers = []
function clickedNumber(num, insertNumberInTextBox = true) {
    // test number validity
    if (dict.get(num) === null || !treatAutocompleteNumbers(num, dict.get(num), true)) {
        wrongNumber = true
        return
    }
    rightInsertedNumbers.push(num)
    if (num === "y") {
        if (lastInsertedNumber.value.length != 2 || parseInt(lastInsertedNumber.value) % 10 != 0 || lastInsertedNumber.value == "10") {
            wrongNumber = true
        }
    }
    // reset query on searchbox
    var textValue = document.getElementById('MainContent_TextBox1').value
    if (insertNumberInTextBox) {
        document.getElementById('MainContent_TextBox1').value = textValue.slice(0, -textValue.split(" ")[textValue.split(" ").length - 1].length)
        document.getElementById('MainContent_TextBox1').value += num + " "
    }
    if (!num.includes('illones')) num = num.replace('llon', 'llón')
    // reset suggestions
    document.getElementById('number-options').innerHTML = ''
    // if number is a decimal, reset everything
    if (num === 'con' || num === 'coma') {
        wasLastNumberSeparator = true
        if (separatorInserted) {
            excessDecimalSeparators = true
        }
        lastInsertedNumber = {}
        filterPlurals = false
        filterFeminines = true
        filterSingulars = false
        filterMasculines = false
        return
    }
    wasLastNumberSeparator = false
    var numericNum = dict.get(num)
    if (numericNum && numericNum !== '1') {
        filterPlurals = true
        filterSingulars = false
        if (num.lastIndexOf("as") == num.length - 2 && num.length > 2) {
            filterFeminines = true
            filterMasculines = false
        } else if (num.lastIndexOf("os") == num.length - 2 && numericNum.length >= 2) {
            filterMasculines = true
            filterFeminines = false
        }
        if (!numericNum.includes('/') && numericNum.length >= 6) {
            filterPlurals = false
            filterSingulars = false
        }
    } else if (numericNum && !lastInsertedNumber.text) {
        filterSingulars = true
        filterPlurals = false
        if (num.lastIndexOf("a") == num.length - 1 && dict.get(num) && dict.get(num).lastIndexOf("0") !== dict.get(num).length - 1) {
            filterFeminines = true
            filterMasculines = false
        } else if (num.lastIndexOf("o") == num.length - 1 && dict.get(num) && dict.get(num).lastIndexOf("0") !== dict.get(num).length - 1) {
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
    if (numericNum && numericNum.length === 4) showThousands = false
    if (numericNum && numericNum.length >= 6 && !numericNum.includes('/')) {
        maxLengthInText = numericNum.length
        showThousands = true
    }
    if (insertNumberInTextBox) {
        focusFieldToLastChar()
    }
}