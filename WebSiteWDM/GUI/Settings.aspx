<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Settings.aspx.cs" Inherits="GUI_Settings" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceBody" runat="Server">
    <div class="page-Monitor" data-ng-app="app">
        <div data-ng-controller="settingsController">
            <div class="div-Button">
                <input type="button" value="Search" class="button-1" data-ng-click="search()" />
            </div>

            <div class="div-info" data-ng-show="dbSettings.length > 0">
                Total records: {{dbSettings.length}}
            </div>

            <div class="div-table">
                <table id="tableBatchLog" class="table table-borderless">
                    <thead>
                        <tr>
                            <td>No.</td>
                            <td class="index">Server/IP</td>
                            <td class="date">User</td>
                            <td class="date">Pass</td>
                            <td class="title">Database</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr data-ng-show="dbSettings.length == 0">
                            <td class="col-norecord" colspan="10">No record found.</td>
                        </tr>
                        <tr  data-ng-show="dbSettings.length > 0" class="tr-filter">
                            <td></td>
                            <td><i class="fas fa-filter"></i><input ng-model="filter.SQLServerIP" class="input-filter" type="text" id="SQLServerIP" name ="SQLServerIP" placeholder="Search..."  /></td>
                            <td><i class="fas fa-filter"></i><input ng-model="filter.User"  class="input-filter" type="text" id="User" name ="User" placeholder="Search..."  /></td>
                            <td><i class="fas fa-filter"></i><input ng-model="filter.Password" class="input-filter" type="text" id="Password" name ="Password" placeholder="Search..."  /></td>
                            <td><i class="fas fa-filter"></i><input ng-model="filter.Database" class="input-filter" type="text" id="Database" name ="Database" placeholder="Search..." /></td>
                        </tr>
                        <tr data-ng-repeat="x in dbSettings | filter:filter" data-ng-show="dbSettings.length > 0">
                            <td>
                                <p>{{$index + 1 + ((pageIndex - 1) * recordPerPage)}}</p>
                            </td>

                            <td class="log_id">
                                <p>{{x.SQLServerIP}}</p>
                            </td>

                            <td class="date">
                                <p>{{x.User}}</p>
                            </td>

                            <td class="date">
                                <p>{{x.Password}}</p>
                            </td>

                            <td>
                                <div class="title">{{x.Database}}</div>
                            </td>                            
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="div-header" id="_divheader">
                    <marquee width="100%" direction="right">
                        <p id="_info_header" runat="server"></p>
                    </marquee>
                </div>

        </div>
    </div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="ContentPlaceBodyFooter" runat="Server">
     <script src="<%=ResolveUrl("~/Scripts/settingsPage.js?ver=1.0.0.0")%>"></script>
</asp:Content>