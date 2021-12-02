using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Web.Services;
using System.Web.Script.Services;
using System.Text;

namespace WebApplication4
{
    public partial class _Default : Page
    {
        static readonly Dictionary<string, string> numberSet = Global.numberSet;
        private static string prevNumberInserted = "";
        protected void Page_Load(object sender, EventArgs e)
        {
        }
        /**
         * 
         * <summary>Event fired on button click.</summary>
         * <param name="e">The arguments of the event.</param>
         * <param name="sender">The object firing the event.</param>
         * 
         */
        protected void Button1_Click(object sender, EventArgs e)
        {
            Label1.Text = ComputeNumber(TextBox1.Text.ToLower().Trim());
        }

        /**
         * 
         * <summary>Handler launched after button click. Computes number and prints it in "Label1".</summary>
         * 
         */
        public static string ComputeNumber (string input)
        {
            try
            {
                string[] vs = input.Split(' ');
                string finalResult = "";
                for (int i = 0; i < vs.Length; i++)
                {
                    if (numberSet.ContainsKey(vs[i]))
                    {
                        finalResult = JoinNumbersInString(finalResult, numberSet[vs[i]]);
                    }
                    else
                    {
                        if (vs[i] == "y") continue;
                        if (vs[i] == "con")
                        {
                            string decimalResult = "";
                            prevNumberInserted = "";
                            for (int j = i + 1; j < vs.Length; j++)
                            {
                                if (numberSet.ContainsKey(vs[j]) && !vs[j].Contains("ésima") && !vs[j].Contains("écima"))
                                {
                                    decimalResult = JoinNumbersInString(decimalResult, numberSet[vs[j]]);
                                } else
                                {
                                    if (vs[j] == "y") continue;
                                    // This should do the shifting.
                                    if (vs[j].Contains("ésima") || vs[j].Contains("écima")) {
                                        int nShifts = ComputeDecimalShifts(vs[j]);
                                        decimalResult = ShiftDecimalToRightOfNumber(decimalResult, nShifts);
                                        break;
                                    }
                                    else throw new Exception("Error: Número inválido");
                                }
                                
                            }
                            finalResult += "." + decimalResult;
                            break;
                        }
                        if (vs[i].Contains("avo") || vs[i].Contains("ava") || vs[i].Contains("ésimo") || vs[i].Contains("ésima"))
                        {
                            finalResult = finalResult.Trim();
                            string numbers = ComputeFractionNumbers(vs[i]);
                            finalResult += "/" + ComputeNumber(numbers);
                            break;
                        }
                        throw new Exception("Error: Número inválido");
                    }
                }
                // Separate cardinals.
                string[] parts = finalResult.Split('.');
                string[] fractionParts = finalResult.Split('/');
                if (fractionParts.Length > 1 && parts.Length > 1) throw new Exception("Error: Número inválido");
                if (fractionParts.Length > 1)
                {
                    return fractionParts[0].Trim() + "/" + fractionParts[1].Trim();
                }
                finalResult = SeparateNumbers(parts[0], "left").Trim();
                if (parts.Length > 1)
                {
                    finalResult += "." + SeparateNumbers(parts[1], "right").Trim();
                }
                return finalResult.Trim();
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
        /**
         * 
         * <summary>Method that extracts numbers from a fraction, ended in "-avo" or "-ava".</summary>
         * <param name="numbers">The fraction numbers.</param> 
         * <returns>A string with the numbers separated by spaces that can be used to be computed.</returns>
         * 
         */
        private static string ComputeFractionNumbers(string numbers)
        {
            List<string> resultNumbers = new List<string>();
            if (numbers.Contains("tavo") || numbers.Contains("tava"))
            {
                numbers = numbers.Replace("vos", String.Empty);
                numbers = numbers.Replace("vas", String.Empty);
                numbers = numbers.Replace("vo", String.Empty);
                numbers = numbers.Replace("va", String.Empty);
            } else if (numbers.Contains("ésimo") || numbers.Contains("ésima"))
            {
                numbers = numbers.Replace("ésimos", String.Empty);
                numbers = numbers.Replace("ésimas", String.Empty);
                numbers = numbers.Replace("ésimo", String.Empty);
                numbers = numbers.Replace("ésima", String.Empty);
            }
            else
            {
                numbers = numbers.Replace("avos", String.Empty);
                numbers = numbers.Replace("avas", String.Empty);
                numbers = numbers.Replace("avo", String.Empty);
                numbers = numbers.Replace("ava", String.Empty);
            }
            int lastPos = numbers.Length;
            for (int i = numbers.Length - 1; i >= 0; i--)
            {
                string partNumber = numbers.Substring(i, lastPos-i);
                switch (partNumber)
                {
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
                }                
                if (partNumber.Contains("llon") && !partNumber.Contains("llones"))
                {
                    partNumber = partNumber.Replace("llon", String.Empty);
                    partNumber += "llón";
                }
                if (numberSet.ContainsKey(partNumber))
                {
                    lastPos = i;
                    resultNumbers.Add(partNumber);
                }
            }
            resultNumbers.Reverse();
            return string.Join(" ", resultNumbers);
        }
        /**
         * 
         * <summary>Method to compute the amount of shits a decimal should go through.</summary>
         * <param name="number">Number ended in '-ésima'.</param>
         * <returns>Amount of shifts a number should go through.</returns>
         * 
         */
        private static int ComputeDecimalShifts(string number)
        {
            if (numberSet.ContainsKey(number))
            {
                return numberSet[number].Length - 1;
            }
            if (number.Contains("ésimas")) number = number.Replace("ésimas", String.Empty);
            else if (number.Contains("ésima")) number = number.Replace("ésima", String.Empty);
            else if (number.Contains("écima")) number = number.Replace("écima", String.Empty);
            else number = number.Replace("écimas", String.Empty);
            if (number.Contains("llon") && !number.Contains("llones"))
            {
                number = number.Replace("llon", "llón");
            }
            if (numberSet.ContainsKey(number))
            {
                return numberSet[number].Length - 1;
            }
            // Special cases like "a hundred millionth"
            for (int i = 0; i < number.Length; i++)
            {
                if (!numberSet.ContainsKey(number.Substring(0, i))) continue;
                string num1 = number.Substring(0, i);
                string num2 = number.Substring(i);
                return JoinNumbersInString(numberSet[num1], numberSet[num2]).Length - 1;
            }
            return 0;
        }
        /**
         * 
         * <summary>Method for separating strings each three characters from right to left.</summary>
         * <param name="str">The string to be separated.</param>
         * <returns>The separated string.</returns>
         * 
         */
        private static string SeparateNumbers(string str, string orientation)
        {
            if (orientation == "left")
            {
                str = ReverseString(str);
            }
            for (int i = 0; i < str.Length; i+=4)
            {
                str = str.Substring(0, i) + " " + str.Substring(i);
            }
            if (orientation == "left") 
            {
                return ReverseString(str);
            } else {
                return str;
            }
        }
        /**
         * <summary>Method to reverse a string easily.</summary>
         * <param name="str">String to be reversed.</param>
         * <returns>The reversed string</returns>
         * 
         */
        private static string ReverseString(string str)
        {
            char[] vs = str.ToCharArray();
            Array.Reverse(vs);
            return new string(vs);
        }
        /**
         * 
         * <summary>Shifts a character to the left in the number (eg., if we wanted to shift "40" two times in "20040", the result would be "24000").</summary>
         * <param name="c">Character to be shifted.</param>
         * <param name="s">String where to shift the character.</param>
         * <param name="nShifts">Amount of positions to be shifted.</param>
         * <returns>The param s with the shifted character.</returns>
         * 
         */
        private static string ShiftCharToLeftOfNumber(char c, string s, int nShifts)
        {
            string result = s;
            StringBuilder sb = new StringBuilder(result);
            for (int i = s.Length-1; i >= 0; i--)
            {
                if (s[i] == c && s[i] != '0')
                {
                    if (i-nShifts <= 0)
                    {
                        return result += "0";
                    } else
                    {
                        sb[i - nShifts] = c;
                        sb[i] = '0';
                    }
                    break;
                }
            }
            result = sb.ToString();
            return result;
        }
        /**
         * 
         * <summary>Function that shifts decimals to the right, if necessary.
         * Used if unit is smaller than the computed number (like 1 millionth).</summary>
         * <param name="convertedNumber">The number to be treated.</param>
         * <param name="nShifts">Number of times to perform shifts.</param>
         * <returns>Computed number.</returns>
         *
         */
        private static string ShiftDecimalToRightOfNumber(string decimalNumber, int nShifts)
        {
            if (decimalNumber.Length >= nShifts) return decimalNumber;
            string result = decimalNumber;
            for (int i = 0; i < nShifts-decimalNumber.Length; i++)
            {
                result = "0" + result;
            }
            return result;
        }
        /**
         * 
         * <summary>Joins two number strings into one.</summary>
         * <param name="num1">Number to be joined.</param>
         * <param name="num2">Number to join.</param>
         * <returns>The joined numbers.</returns>
         * 
        **/
        private static string JoinNumbersInString(string num1, string num2)
        {
            string result = "";
            if (num1 == "y" || num2 == "y") return "";
            if (num2.Contains("/")) return num1 + num2;
            if (num1 == "")
            {
                prevNumberInserted = num2;
                return num2;
            }
            if (prevNumberInserted.Length > num2.Length)
            {
                result = num1;
                StringBuilder sb = new StringBuilder(result);
                int posNum1 = result.Length - 1;
                int posNum2 = num2.Length - 1;
                while (posNum2 >= 0)
                {
                    sb[posNum1] = num2[posNum2];
                    posNum1--;
                    posNum2--;
                }
                result = sb.ToString();
            } else
            {
                result = num1;
                if (num1.Length > num2.Length)
                {
                    string initialString = result.Substring(result.Length - 3);
                    for (int j = 0; j < initialString.Length; j++)
                    {
                        result = ShiftCharToLeftOfNumber(initialString[j], result, num2.Length-1);
                    }
                }
                else
                {
                    for (int i = 1; i < num2.Length; i++)
                    {
                        if (num1.Length < num2.Length) result += "0";
                    }
                }
                                       
            }
            prevNumberInserted = num2;
            return result;
        }
        /**
         * 
         * <summary>Method to get a single number from the number set.</summary>
         * <param name="textNum">Number written as text.</param>
         * <returns>Number written as number.</returns>
         * 
         */
        public static string GetSingleNumber(string textNum)
        {
            if (numberSet.ContainsKey(textNum))
            {
                return numberSet[textNum];
            } else
            {
                throw new Exception("No se pudo encontrar el número " + textNum);
            }
        }
        /**
         * 
         * <summary>Method that removes from the number set the
         * numbers greater than the number passed as parameter.
         * This gets fired on autocomplete click.</summary>
         * <param name="textNum">Number to be used for removal.</param>
         * 
         */
        private static void RemoveAllUnitsAboveNumber(string textNum)
        {
            string num = GetSingleNumber(textNum);
            foreach (KeyValuePair<string, string> keyValuePair in numberSet)
            {
                if (keyValuePair.Value.Length >= Math.Max(4, num.Length))
                {
                    numberSet.Remove(keyValuePair.Key);
                }
            }
        }
        /**
         * 
         * <summary>Method to get the list of words off a file.</summary>
         * <returns>The list containing the words.</returns>
         * 
         */
        [WebMethod]
        [ScriptMethod(UseHttpGet = true)]
        public static List<string> GetWords()
        {
            List<string> result = new List<string>();
            foreach (KeyValuePair<string, string> keyValuePair in numberSet) {
                result.Add(keyValuePair.Key);
            }
            return result;
        }
    }
}