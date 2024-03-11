using System.Web;

public class UsedMonthlyLow : IHttpHandler
{
    public bool IsReusable { get { return false; } }
    

    public void ProcessRequest(HttpContext context)
    {
        string jsonRes = string.Empty;
        string func = context.Request.QueryString["func"];
        switch (func)
        {
            case "ADD":
                {
                    var jsonReq = Globals.GetJsonRequest(context);
                    if(!string.IsNullOrEmpty(jsonReq))
                    {
                        var jsonParse = JSONUtility.Parse(jsonReq);


                    }
                    break;
                }
            default: break;
        }

        context.Response.ContentType = "text/plain";
        context.Response.Write(jsonRes);
    }
}