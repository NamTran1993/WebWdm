using System;
using System.IO;
using System.Web;

public class Globals
{
    public static string GetJsonRequest(HttpContext context)
    {
        try
        {
            StreamReader pipe = new StreamReader(context.Request.InputStream);
            string jsonString = pipe.ReadToEnd();
            if (pipe != null)
            {
                pipe.Close();
                pipe.Dispose();
            }
            return jsonString;
        }
        catch (Exception ex)
        {    
        }
        return string.Empty;
    }

}