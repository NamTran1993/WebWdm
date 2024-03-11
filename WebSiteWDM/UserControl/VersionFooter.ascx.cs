using System;
using System.Web.UI;


public partial class VersionFooter : System.Web.UI.UserControl
{
    private string _LOG_FILE = "VersionFooter.log";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!Page.IsPostBack)
        {
            try
            {
              
            }
            catch (Exception ex)
            {
                
            }
        }
    }
}
