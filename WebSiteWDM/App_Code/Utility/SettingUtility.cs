using System.Configuration;

public class SettingUtility
{
    public static string ConnectionString
    {
        get
        {
            if (ConfigurationManager.AppSettings["connectionString"] != null)
                return ConfigurationManager.AppSettings["connectionString"];
            return string.Empty;
        }
    }
}