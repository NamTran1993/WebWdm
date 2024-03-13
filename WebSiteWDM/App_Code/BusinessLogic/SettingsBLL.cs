using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for SettingsBLL
/// </summary>
public static class SettingsBLL
{

    public static string GetDbSettings()
    {
        var res = new List<DbSettings>()
        {
            new DbSettings("172.31.44.65","egr","0290147","esp_egr"),
            new DbSettings("172.31.44.65", "egm", "0290147", "esp_egm"),
            new DbSettings("172.31.44.65", "genie", "0290147", "esp_genie"),
            new DbSettings("172.31.44.65", "ognp", "0290147", "smartcis_ognp"),
            new DbSettings("172.31.44.65", "pps", "0290147", "smartpps"),
            new DbSettings("172.31.44.65", "tdash", "0290147", "smartcis_tdash"),
        };

        return JsonConvert.SerializeObject(res); 
    }
}

public class DbSettings
{
    [Description("Server/IP")]
    public string SQLServerIP { get; set; }

    [Description("User")]
    public string User { get; set; }

    [Description("Password")]
    public string Password { get; set; }

    [Description("Database")]
    public string Database { get; set; }



    public DbSettings(string SQLServerIP, string User, string Password, string Database)
    {
        this.SQLServerIP = SQLServerIP;
        this.User = User;
        this.Password = Password;
        this.Database = Database;
    }
}