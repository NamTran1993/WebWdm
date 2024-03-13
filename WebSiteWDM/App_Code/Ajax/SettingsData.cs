using System.Web;

public class SettingsData : IHttpHandler
{
    public bool IsReusable { get { return false; } }
    

    public void ProcessRequest(HttpContext context)
    {
        string jsonRes = string.Empty;
        string func = context.Request.QueryString["func"];
        switch (func)
        {
            case "DB-SETTINGS":
                {
                    jsonRes = SettingsBLL.GetDbSettings();
                    break;
                }
            default: break;
        }

        context.Response.ContentType = "text/plain";
        context.Response.Write(jsonRes);
    }
}