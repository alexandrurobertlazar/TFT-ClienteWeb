using System;
using System.Collections.Generic;
using System.Web.UI;
using System.Web.Services;
using System.Web.Script.Services;

namespace WebApplication4
{
    public partial class _Default : Page
    {
        // Singleton for numberset
        static Dictionary<string, string> numberSet = null;
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
            try
            {
                Label1.Text = ComputeNumber(TextBox1.Text.ToLower().Trim());
                TextBox1.Text = "";
            } catch (Exception ex)
            {
                Label1.Text = ex.Message;
            }
        }

        /**
         * 
         * <summary>Handler launched after button click. Computes number and prints it in "Label1".</summary>
         * 
         */
        public static string ComputeNumber(string input)
        {
            string computedNumber = "";
            ServiceReference1.MainServiceClient client = null;
            try
            {
                client = new ServiceReference1.MainServiceClient();
                computedNumber = client.ComputeNumber(input);
            }
            catch (Exception e)
            {
                computedNumber = e.Message;
            }
            finally
            {
                if (client != null)
                {
                    client.Close();
                }
            }
            return computedNumber;
        }
        /**
         * 
         * <summary>Method to get the list of words off a file.</summary>
         * <returns>The list containing the words.</returns>
         * 
         */
        [WebMethod]
        [ScriptMethod(UseHttpGet = true)]
        public static Dictionary<string, string> GetNumbers()
        {
            if (numberSet == null)
            {
                Dictionary<string, string> numbers;
                ServiceReference1.MainServiceClient client = null;
                try
                {
                    client = new ServiceReference1.MainServiceClient();
                    numbers = client.GetNumbers();
                }
                catch (Exception e)
                {
                    numbers = new Dictionary<string, string>();
                }
                finally
                {
                    if (client != null)
                    {
                        client.Close();
                    }
                }
                numberSet = numbers;
                return numbers;
            }
            return numberSet;
        }
    }
}