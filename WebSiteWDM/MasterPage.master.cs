using System;

public partial class MasterPage : System.Web.UI.MasterPage
{
    protected void Page_Load(object sender, EventArgs e)
    {
        //this._info_header.InnerText = string.Format("Server connection information. {0}", SettingUtility.ConnectionString);
    }
}
