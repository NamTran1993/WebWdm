using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;

public partial class BatchLogBLL
{
    protected class SqlHelper : IDisposable
    {
        private SqlConnection _con = null;
        private SqlTransaction _transaction = null;

        private Dictionary<string, SqlCommand> _sqlCommands = new Dictionary<string, SqlCommand>();
        private Dictionary<string, SqlDataAdapter> _adapters = new Dictionary<string, SqlDataAdapter>();

        public SqlHelper()
        {
            this._con = new SqlConnection(SettingUtility.ConnectionString + ";Connection Timeout=300");
            this._con.Open();
            try
            {
                this.CreateCommandFindBatchLog();
            }
            catch (Exception e)
            {
                this.Dispose();
                throw e;
            }
        }

        ~SqlHelper()
        {
            this.Dispose();
        }

        public void Dispose()
        {
            try
            {
                foreach (SqlCommand cmd in _sqlCommands.Values)
                {
                    cmd.Dispose();
                }
                _sqlCommands.Clear();
            }
            finally
            {
                try
                {
                    if (this._transaction != null)
                    {
                        this._transaction.Dispose();
                        this._transaction = null;
                    }
                }
                finally
                {
                    if (this._con != null)
                    {
                        this._con.Dispose();
                        this._con = null;
                    }
                }
            }
        }

        public void BeginTransaction()
        {
            this._transaction = _con.BeginTransaction();
            foreach (SqlCommand cmd in this._sqlCommands.Values)
            {
                cmd.Transaction = this._transaction;
            }
            foreach (SqlDataAdapter adapter in this._adapters.Values)
            {
                adapter.UpdateCommand.Transaction = this._transaction;
                adapter.InsertCommand.Transaction = this._transaction;
                adapter.DeleteCommand.Transaction = this._transaction;
            }
        }

        public void Commit()
        {
            this._transaction.Commit();
        }

        public void Rollback()
        {
            this._transaction.Rollback();
        }

        private void CreateCommandFindBatchLog()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("SELECT TOP (500) * ");
            sb.AppendLine("FROM");
            sb.AppendLine("   t_batch_log ");
            sb.AppendLine("ORDER BY");
            sb.AppendLine(" dt_start DESC ");

            SqlCommand cmd = new SqlCommand(sb.ToString(), this._con);
            this._sqlCommands["FindBatchLog"] = cmd;
        }

        public DataTable FindBatchLog()
        {
            SqlCommand cmd = this._sqlCommands["FindBatchLog"];
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            DataTable batchLog = new DataTable();
            da.Fill(batchLog);

            return batchLog;
        }
    }

    public static string SearchLog()
    {
        try
        {
            using (SqlHelper sqlHelper = new SqlHelper())
            {
                DataTable batchLog = sqlHelper.FindBatchLog();
                if (batchLog != null && 0 < batchLog.Rows.Count)
                {
                    string res = JsonConvert.SerializeObject(batchLog);
                    return res;
                }
            };
        }
        catch (Exception ex)
        {
        }
        return string.Empty;
    }
}


