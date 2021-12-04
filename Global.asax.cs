﻿using System;
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
        public static void errorLog(string error)
        {
            string errorFile = @"C:\Users\Alexandru\source\repos\WebApplication4\error.log";
            FileStream fs;
            if (!File.Exists(errorFile))
            {
                fs = File.Create(errorFile);
            } else
            {
                fs = File.Open(errorFile, FileMode.Append, FileAccess.Write);
            }
            using (StreamWriter stream = new StreamWriter(fs))
            {
                stream.WriteLine(DateTime.Now + " - " + error);
            }
        }
        private static void LoadNumbers ()
        {
            string numberFilePath = @"C:\Users\Alexandru\source\repos\WebApplication4\Content\assets\numbers.txt";
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
            } else
            {
                errorLog("Fichero de números no encontrado.");
                // throw new Exception("Fichero de números no encontrado.");
            }
            runUnitTests();
        }

        private static void runUnitTests ()
        {
            string testFilePath = @"C:\Users\Alexandru\source\repos\WebApplication4\Content\assets\tests cardinales.txt";
            try
            {
                if (File.Exists(testFilePath))
                {
                    using (StreamReader sr = new StreamReader(testFilePath))
                    {
                        while (sr.Peek() >= 0)
                        {
                            string[] vs = sr.ReadLine().Split(';');
                            if (_Default.ComputeNumber(vs[0]).Replace(" ", String.Empty) != vs[1])
                            {
                                throw new Exception("Test with number " + vs[1] + "failed.");
                            }
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