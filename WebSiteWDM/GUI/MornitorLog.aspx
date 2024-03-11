<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="MornitorLog.aspx.cs" Inherits="GUI_MornitorLog" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceBody" runat="Server">
    <div class="page-Monitor" data-ng-app="app">
        <div data-ng-controller="mornitorController">
            <div class="div-Button">
                <input type="button" value="Search" class="button-1" data-ng-click="search()" />
            </div>

            <div class="div-info" data-ng-show="arrayBatchLog.length > 0">
                Total records: {{arrayBatchLog.length}}
            </div>

            <div class="div-table">
                <table id="tableBatchLog" class="table table-borderless">
                    <thead>
                        <tr>
                            <td>No.</td>
                            <td class="index">ID</td>
                            <td class="date">Start Date</td>
                            <td class="date">Start End</td>
                            <td class="title">Title</td>
                            <td class="number">Info</td>
                            <td class="number">Warning</td>
                            <td class="number">Error</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr data-ng-show="arrayBatchLog.length == 0">
                            <td class="col-norecord" colspan="10">No record found.</td>
                        </tr>
                        <tr data-ng-repeat="x in arrayBatchLog" data-ng-show="arrayBatchLog.length > 0">
                            <td>
                                <p>{{$index + 1 + ((pageIndex - 1) * recordPerPage)}}</p>
                            </td>

                            <td class="log_id">
                                <p>{{x.log_id}}</p>
                            </td>

                            <td class="date">
                                <p>{{x.dt_start | date : 'yyyy/MM/dd HH:hh:ss'}}</p>
                            </td>

                            <td class="date">
                                <p>{{x.dt_end | date : 'yyyy/MM/dd HH:hh:ss'}}</p>
                            </td>

                            <td>
                                <div class="title">{{x.title}}</div>
                            </td>

                            <td class="number">
                                <p class="h-link" data-ng-click="searchDetail(1, x)">{{x.info_count}}</p>
                            </td>

                            <td class="number">
                                <p class="h-link" data-ng-click="searchDetail(2, x)">{{x.warn_count}}</p>
                            </td>

                            <td class="number">
                                <p class="h-link" data-ng-click="searchDetail(3, x)">{{x.error_count}}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="ContentPlaceBodyFooter" runat="Server">
    <script src="<%=ResolveUrl("~/Scripts/mornitorPage.js?ver=1.0.0.0")%>"></script>
</asp:Content>


