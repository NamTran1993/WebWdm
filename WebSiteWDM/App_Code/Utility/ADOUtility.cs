using System.Data;
using System.Data.SqlClient;

public class ADOUtility
{
    public static DataTable ADOFillDataTable(string strSQL, string connectionString)
    {
        SqlConnection sqlConnection = new SqlConnection() { ConnectionString = connectionString };
        SqlCommand sqlCommand = new SqlCommand(strSQL, sqlConnection) { CommandTimeout = 600 };
        SqlDataAdapter adapter = new SqlDataAdapter(sqlCommand);

        DataTable dataTable = new DataTable();
        adapter.Fill(dataTable);

        adapter.Dispose();
        sqlConnection.Close();

        return dataTable;
    }
}