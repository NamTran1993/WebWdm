using Newtonsoft.Json.Linq;
using System;

public class JSONUtility
{
    public static JObject Parse(string json)
    {
        try
        {
            JObject jResult = JObject.Parse(json);
            if (jResult == null) return new JObject();
            return jResult;
        }
        catch (Exception ex)
        {
        }
        return new JObject();
    }

}