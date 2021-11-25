using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;

namespace WebApplication4
{
    public class Global : HttpApplication
    {
        public static Dictionary<string, string> numberSet = new Dictionary<string, string>();
        void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            LoadNumbers();
        }
        private void LoadNumbers ()
        {
            string numberFilePath = @"C:\Users\Alexandru\source\repos\WebApplication4\Content\assets\numbers.txt";
            try
            {
                if (File.Exists(numberFilePath))
                {
                    using (StreamReader sr = new StreamReader(numberFilePath))
                    {
                        while (sr.Peek() >= 0)
                        {
                            string[] vs = sr.ReadLine().Split(';');
                            numberSet.Add(vs[0], vs[1]);
                        }
                        sr.Close();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }
}