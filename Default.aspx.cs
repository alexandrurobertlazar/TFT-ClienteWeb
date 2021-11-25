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
        static Dictionary<string, string> numberSet = new Dictionary<string, string>();
        private static string prevNumberInserted = "";
        protected void Page_Load(object sender, EventArgs e)
        {
            numberSet = Global.numberSet;
        }
        protected void Button1_Click(object sender, EventArgs e)
        {
            try
            {
                string[] vs = TextBox1.Text.Split(' ');
                string finalResult = "";
                foreach (string number in vs)
                {
                    if (numberSet.ContainsKey(number))
                    {
                        if (finalResult == "")
                        {
                            prevNumberInserted = numberSet[number];
                            finalResult = numberSet[number];
                        }
                        else finalResult = JoinNumbersInString(finalResult, numberSet[number]);
                    }
                    else
                    {
                        if (number == "y") continue;
                        throw new Exception("Error: Número inválido");
                    }
                }
                // Separate each three from right to left.
                finalResult = separateNumbers(finalResult);
                Label1.Text = "Resultado: " + "\"" + finalResult.Trim() + "\"";
            }
            catch (Exception ex)
            {
                Label1.Text = ex.Message;
            }
        }
        /**
         * 
         * <summary>Method for separating strings each three characters from right to left.</summary>
         * <param name="str">The string to be separated.</param>
         * <returns>The separated string.</returns>
         * 
         */
        private string separateNumbers(string str)
        {
            string reversedString = reverseString(str);
            for (int i = 0; i < reversedString.Length; i++)
            {
                if (i%4 == 0)
                {
                    reversedString = reversedString.Substring(0, i) + " " + reversedString.Substring(i);
                }
            }
            return reverseString(reversedString);        
        }
        /**
         * <summary>Method to reverse a string easily.</summary>
         * <param name="str">String to be reversed.</param>
         * <returns>The reversed string</returns>
         * 
         */
        private string reverseString(string str)
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
        private string shiftCharToLeftOfNumber(char c, string s, int nShifts)
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
         * <summary>Joins two number strings into one.</summary>
         * <param name="num1">Number to be joined.</param>
         * <param name="num2">Number to join.</param>
         * <returns>The joined numbers.</returns>
         * 
        **/
        private string JoinNumbersInString(string num1, string num2)
        {
            string result = "";
            if (num1 == "y" || num2 == "y") return "";
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
                        result = shiftCharToLeftOfNumber(initialString[j], result, num2.Length-1);
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
        public string GetSingleNumber(string textNum)
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
        private void RemoveAllUnitsAboveNumber(string textNum)
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