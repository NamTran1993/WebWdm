using System.Web;

public class BatchLogData : IHttpHandler
{
    public bool IsReusable { get { return false; } }
    

    public void ProcessRequest(HttpContext context)
    {
        string jsonRes = string.Empty;
        string func = context.Request.QueryString["func"];
        switch (func)
        {
            case "SEARCH-LOG":
                {
                    jsonRes = BatchLogBLL.SearchLog();
                    break;
                }
            default: break;
        }

        context.Response.ContentType = "text/plain";
        context.Response.Write(jsonRes);
    }
}