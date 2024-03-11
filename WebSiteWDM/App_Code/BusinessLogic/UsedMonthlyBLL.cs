using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;

public class UsedMonthlyBLL
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

        private void CreateCommandAddUsedMonthlyLow()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("INSERT INTO");
            sb.AppendLine(" t_used_kwh_monthly_l ");
            sb.AppendLine(" ( ");
            sb.AppendLine("     feed_point_no ");
            sb.AppendLine(",    dt_meter_reading ");
            sb.AppendLine(",    dt_month ");
            sb.AppendLine(",    area ");
            sb.AppendLine(",    dt_start ");
            sb.AppendLine(",    dt_end ");
            sb.AppendLine(",    journal_cd ");
            sb.AppendLine(",    furnishing_cd ");
            sb.AppendLine(",    update_cd ");
            sb.AppendLine(",    kwh_total ");
            sb.AppendLine(",    dt_meter_reading_next ");
            sb.AppendLine(",    dt_import ");
            sb.AppendLine(",    file_name ");
            sb.AppendLine(" ) ");
            sb.AppendLine("VALUES");
            sb.AppendLine(" (");
            sb.AppendLine("    @feed_point_no");
            sb.AppendLine(",   @dt_meter_reading ");
            sb.AppendLine(",   @dt_month ");
            sb.AppendLine(",   @area ");
            sb.AppendLine(",   @dt_start ");
            sb.AppendLine(",   @dt_end ");
            sb.AppendLine(",   @journal_cd ");
            sb.AppendLine(",   @furnishing_cd ");
            sb.AppendLine(",   @update_cd ");
            sb.AppendLine(",   @dt_meter_reading_next ");
            sb.AppendLine(",   @dt_import ");
            sb.AppendLine(",   @file_name ");
            sb.AppendLine(" )");

            SqlCommand cmd = new SqlCommand(sb.ToString(), this._con);
            cmd.Parameters.Add("@feed_point_no", SqlDbType.NVarChar);
            cmd.Parameters.Add("@dt_meter_reading", SqlDbType.DateTime);
            cmd.Parameters.Add("@dt_month", SqlDbType.DateTime);
            cmd.Parameters.Add("@area", SqlDbType.NVarChar);
            cmd.Parameters.Add("@dt_start", SqlDbType.DateTime);
            cmd.Parameters.Add("@dt_end", SqlDbType.DateTime);
            cmd.Parameters.Add("@journal_cd", SqlDbType.Int);
            cmd.Parameters.Add("@furnishing_cd", SqlDbType.Int);
            cmd.Parameters.Add("@update_cd", SqlDbType.Int);
            cmd.Parameters.Add("@kwh_total", SqlDbType.Decimal);
            cmd.Parameters.Add("@dt_meter_reading_next", SqlDbType.DateTime);
            cmd.Parameters.Add("@dt_import", SqlDbType.DateTime);
            cmd.Parameters.Add("@file_name", SqlDbType.NVarChar);

            this._sqlCommands["AddUsedMonthlyLow"] = cmd;
        }

        public DataTable AddUsedMonthlyLow(string feed_point_no, string area)
        {
            DateTime now = DateTime.Now;

            SqlCommand cmd = this._sqlCommands["FindBatchLog"];
            cmd.Parameters["@feed_point_no"].Value = feed_point_no;
            cmd.Parameters["@dt_meter_reading"].Value = now;
            cmd.Parameters["@dt_month"].Value = now;
            cmd.Parameters["@area"].Value = area;


            SqlDataAdapter da = new SqlDataAdapter(cmd);

            DataTable batchLog = new DataTable();
            da.Fill(batchLog);

            return batchLog;
        }
    }


    public UsedMonthlyBLL()
    {

    }
}